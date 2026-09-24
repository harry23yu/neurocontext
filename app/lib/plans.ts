export type Plan = "free" | "silver" | "gold";

export const UNLIMITED_HISTORY_DAYS = -1;

export const PLAN_LIMITS: Record<Plan, { creditLimit: number; historyDays: number }> = {
  free: { creditLimit: 20, historyDays: 7 },
  silver: { creditLimit: 100, historyDays: 30 },
  gold: { creditLimit: 200, historyDays: UNLIMITED_HISTORY_DAYS },
};

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan as Plan] ?? PLAN_LIMITS.free;
}

export const PAID_PLAN_PRICE_IDS: Record<"silver" | "gold", string> = {
  silver: process.env.STRIPE_SILVER_PRICE_ID!,
  gold: process.env.STRIPE_GOLD_PRICE_ID!,
};

export function getPlanFromPriceId(priceId: string): "silver" | "gold" | null {
  if (priceId === PAID_PLAN_PRICE_IDS.silver) return "silver";
  if (priceId === PAID_PLAN_PRICE_IDS.gold) return "gold";
  return null;
}
