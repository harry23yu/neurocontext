"use client";

import { changePlan, openBillingPortal, startCheckout } from "@/app/lib/actions/billing";

const PLAN_LABELS: Record<"free" | "silver" | "gold", string> = {
  free: "Free",
  silver: "Silver",
  gold: "Gold",
};

export default function BillingSection({
  plan,
  subscription,
}: {
  plan: "free" | "silver" | "gold";
  subscription: {
    status: string;
    renewalDate: string | null;
    pendingPlan: string | null;
  } | null;
}) {
  const renewalDate = subscription?.renewalDate;

  const upgradeTargets: Array<"silver" | "gold"> =
    plan === "free" ? ["silver", "gold"] : plan === "silver" ? ["gold"] : [];
  const downgradeTargets: Array<"free" | "silver"> =
    plan === "gold" ? ["silver", "free"] : plan === "silver" ? ["free"] : [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        background: "var(--color-panel)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "1.75rem",
      }}
    >
      <div>
        <p style={{ color: "var(--color-muted)", fontSize: 14, margin: 0 }}>Current plan</p>
        <p style={{ color: "var(--color-text)", fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>
          {PLAN_LABELS[plan]}
        </p>
      </div>

      {subscription && renewalDate && (
        <p style={{ color: "var(--color-muted)", fontSize: 14, margin: 0 }}>
          Renews on {renewalDate}
        </p>
      )}

      {subscription?.pendingPlan && renewalDate && (
        <p style={{ color: "var(--color-accent)", fontSize: 14, margin: 0 }}>
          Downgrading to {PLAN_LABELS[subscription.pendingPlan as "free" | "silver" | "gold"]} on{" "}
          {renewalDate}
        </p>
      )}

      {upgradeTargets.length > 0 && (
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {upgradeTargets.map((target) => (
            <form key={target} action={plan === "free" ? startCheckout : changePlan}>
              <input type="hidden" name="plan" value={target} />
              <button
                type="submit"
                style={{
                  background: "var(--color-accent)",
                  color: "var(--color-bg)",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.6rem 1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Upgrade to {PLAN_LABELS[target]}
              </button>
            </form>
          ))}
        </div>
      )}

      {downgradeTargets.length > 0 && !subscription?.pendingPlan && (
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {downgradeTargets.map((target) => (
            <form key={target} action={changePlan}>
              <input type="hidden" name="plan" value={target} />
              <button
                type="submit"
                style={{
                  background: "transparent",
                  color: "var(--color-muted)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.6rem 1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Downgrade to {PLAN_LABELS[target]}
              </button>
            </form>
          ))}
        </div>
      )}

      {subscription && (
        <form action={openBillingPortal}>
          <button
            type="submit"
            style={{
              background: "transparent",
              color: "var(--color-text)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              padding: "0.6rem 1rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Manage billing
          </button>
        </form>
      )}
    </div>
  );
}
