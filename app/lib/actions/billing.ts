"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/app/lib/db";
import { subscriptions } from "@/app/lib/db/schema";
import { getUser } from "@/app/lib/dal";
import { stripe } from "@/app/lib/stripe";
import { PAID_PLAN_PRICE_IDS, type Plan } from "@/app/lib/plans";

const PLAN_RANK: Record<Plan, number> = { free: 0, silver: 1, gold: 2 };

export async function startCheckout(formData: FormData): Promise<void> {
  const user = await getUser();
  if (!user) redirect("/signup?next=/pricing");

  const plan = String(formData.get("plan"));
  if (plan !== "silver" && plan !== "gold") {
    throw new Error("Invalid plan");
  }

  const existing = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, user.id),
  });
  if (existing && existing.status !== "canceled") {
    // Already has an active subscription — plan changes go through /account, not a new Checkout Session.
    redirect("/account");
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    ...(existing
      ? { customer: existing.stripeCustomerId }
      : { customer_email: user.email }),
    client_reference_id: user.id,
    line_items: [{ price: PAID_PLAN_PRICE_IDS[plan], quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  });

  redirect(checkoutSession.url!);
}

export async function changePlan(formData: FormData): Promise<void> {
  const user = await getUser();
  if (!user) redirect("/login");

  const newPlan = String(formData.get("plan"));
  if (newPlan !== "free" && newPlan !== "silver" && newPlan !== "gold") {
    throw new Error("Invalid plan");
  }

  const row = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, user.id),
  });
  if (!row) redirect("/pricing");

  if (row.status === "canceled") {
    throw new Error("Your subscription is cancelled. Please resubscribe to change plans.");
  }

  const currentPlan = row.plan as Plan;
  if (newPlan === currentPlan) redirect("/account");

  if (PLAN_RANK[newPlan] > PLAN_RANK[currentPlan]) {
    // Upgrade: immediate, prorated. Webhook applies the plan change to our DB.
    const sub = await stripe.subscriptions.retrieve(row.stripeSubscriptionId);
    const item = sub.items.data[0];
    await stripe.subscriptions.update(row.stripeSubscriptionId, {
      items: [{ id: item.id, price: PAID_PLAN_PRICE_IDS[newPlan as "silver" | "gold"] }],
      proration_behavior: "create_prorations",
    });
  } else {
    // Downgrade: scheduled for period end via a subscription schedule.
    // users.plan does NOT change until the webhook fires when the schedule advances.
    const schedule = await stripe.subscriptionSchedules.create({
      from_subscription: row.stripeSubscriptionId,
    });
    const currentPhase = schedule.phases[0];

    if (newPlan === "free") {
      await stripe.subscriptionSchedules.update(schedule.id, {
        end_behavior: "cancel",
        phases: [
          {
            items: currentPhase.items.map((i) => ({
              price: i.price as string,
              quantity: i.quantity,
            })),
            start_date: currentPhase.start_date,
            end_date: currentPhase.end_date,
          },
        ],
      });
    } else {
      await stripe.subscriptionSchedules.update(schedule.id, {
        end_behavior: "release",
        phases: [
          {
            items: currentPhase.items.map((i) => ({
              price: i.price as string,
              quantity: i.quantity,
            })),
            start_date: currentPhase.start_date,
            end_date: currentPhase.end_date,
          },
          {
            items: [{ price: PAID_PLAN_PRICE_IDS[newPlan as "silver" | "gold"] }],
          },
        ],
      });
    }

    await db
      .update(subscriptions)
      .set({ stripeScheduleId: schedule.id, pendingPlan: newPlan, updatedAt: new Date() })
      .where(eq(subscriptions.userId, user.id));
  }

  redirect("/account");
}

export async function openBillingPortal(): Promise<void> {
  const user = await getUser();
  if (!user) redirect("/login");

  const row = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, user.id),
  });
  if (!row) redirect("/pricing");

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: row.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
  });

  redirect(portalSession.url);
}
