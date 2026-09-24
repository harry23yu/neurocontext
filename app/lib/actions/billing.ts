"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/app/lib/db";
import { subscriptions } from "@/app/lib/db/schema";
import { getUser } from "@/app/lib/dal";
import { stripe } from "@/app/lib/stripe";
import { PAID_PLAN_PRICE_IDS } from "@/app/lib/plans";

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
  if (existing) {
    // Already has a subscription — plan changes go through /account, not a new Checkout Session.
    redirect("/account");
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    client_reference_id: user.id,
    line_items: [{ price: PAID_PLAN_PRICE_IDS[plan], quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  });

  redirect(checkoutSession.url!);
}
