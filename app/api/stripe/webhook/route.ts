import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { db } from "@/app/lib/db";
import { subscriptions, users } from "@/app/lib/db/schema";
import { stripe } from "@/app/lib/stripe";
import { getPlanFromPriceId, getPlanLimits } from "@/app/lib/plans";

async function applyPlanToUser(userId: string, plan: "free" | "silver" | "gold") {
  await db
    .update(users)
    .set({ plan, historyRetentionDays: getPlanLimits(plan).historyDays })
    .where(eq(users.id, userId));
}

async function upsertSubscriptionRow(sub: Stripe.Subscription, userId: string) {
  const item = sub.items.data[0];
  const plan = getPlanFromPriceId(item.price.id);
  if (!plan) return;

  // Attaching a schedule (for a downgrade) also fires this event without the
  // price actually changing yet. Only clear pendingPlan/stripeScheduleId once
  // the schedule has actually advanced — i.e. the current price now matches
  // what was pending. Otherwise preserve whatever is already scheduled.
  const existingRow = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  });
  const scheduleAdvanced = existingRow?.pendingPlan === plan;
  const pendingPlan = scheduleAdvanced ? null : existingRow?.pendingPlan ?? null;
  const stripeScheduleId = scheduleAdvanced
    ? null
    : typeof sub.schedule === "string"
      ? sub.schedule
      : existingRow?.stripeScheduleId ?? null;

  await db
    .insert(subscriptions)
    .values({
      userId,
      stripeCustomerId: sub.customer as string,
      stripeSubscriptionId: sub.id,
      stripeScheduleId,
      plan,
      status: sub.status,
      currentPeriodEnd: new Date(item.current_period_end * 1000),
      pendingPlan,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        stripeCustomerId: sub.customer as string,
        stripeSubscriptionId: sub.id,
        stripeScheduleId,
        plan,
        status: sub.status,
        currentPeriodEnd: new Date(item.current_period_end * 1000),
        pendingPlan,
        updatedAt: new Date(),
      },
    });
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const subscriptionId = session.subscription;
      if (!userId || typeof subscriptionId !== "string") break;

      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      await upsertSubscriptionRow(sub, userId);

      const plan = getPlanFromPriceId(sub.items.data[0].price.id);
      if (plan) await applyPlanToUser(userId, plan);
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const row = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.stripeSubscriptionId, sub.id),
      });
      if (!row) break;

      await upsertSubscriptionRow(sub, row.userId);

      const currentPlan = getPlanFromPriceId(sub.items.data[0].price.id);
      if (currentPlan) await applyPlanToUser(row.userId, currentPlan);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const row = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.stripeSubscriptionId, sub.id),
      });
      if (!row) break;

      await applyPlanToUser(row.userId, "free");
      await db
        .update(subscriptions)
        .set({ status: "canceled", pendingPlan: null, updatedAt: new Date() })
        .where(eq(subscriptions.stripeSubscriptionId, sub.id));
      break;
    }
  }

  return new Response(null, { status: 200 });
}
