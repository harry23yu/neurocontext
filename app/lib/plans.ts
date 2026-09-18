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
