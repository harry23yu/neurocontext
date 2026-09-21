import Link from "next/link";
import { startCheckout } from "@/app/lib/actions/billing";
import { PLAN_LIMITS, type Plan } from "@/app/lib/plans";

const CARDS: { plan: Plan; name: string; price: string }[] = [
  { plan: "free", name: "Free", price: "$0/mo" },
  { plan: "silver", name: "Silver", price: "$9/mo" },
  { plan: "gold", name: "Gold", price: "$19/mo" },
];

function historyLabel(historyDays: number): string {
  return historyDays === -1 ? "Unlimited history" : `${historyDays} days of history`;
}

export default function PricingCards({
  currentPlan,
  isSignedIn,
}: {
  currentPlan: Plan | null;
  isSignedIn: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(220px, 260px))",
        gap: "1.25rem",
        justifyContent: "center",
      }}
    >
      {CARDS.map(({ plan, name, price }) => {
        const limits = PLAN_LIMITS[plan];
        const isCurrent = currentPlan === plan;

        return (
          <div
            key={plan}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              background: "var(--color-panel)",
              border: `1px solid ${isCurrent ? "var(--color-accent)" : "var(--color-border)"}`,
              borderRadius: "var(--radius-md)",
              padding: "1.75rem",
            }}
          >
            <div>
              <h2 style={{ color: "var(--color-text)", fontSize: "1.25rem", margin: 0 }}>
                {name}
              </h2>
              <p style={{ color: "var(--color-muted)", margin: "0.25rem 0 0" }}>{price}</p>
            </div>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                color: "var(--color-text)",
                fontSize: 14,
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              <li>{limits.creditLimit} credits/week</li>
              <li>{historyLabel(limits.historyDays)}</li>
            </ul>

            {plan === "free" ? (
              <p style={{ color: "var(--color-muted)", fontSize: 13, margin: 0 }}>
                {isSignedIn ? "Included with every account." : "No sign-up required."}
              </p>
            ) : isCurrent ? (
              <p style={{ color: "var(--color-accent)", fontSize: 13, margin: 0 }}>
                Your current plan
              </p>
            ) : !isSignedIn ? (
              <Link
                href="/signup?next=/pricing"
                style={{
                  textAlign: "center",
                  background: "var(--color-accent)",
                  color: "var(--color-bg)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.7rem 1rem",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Sign up
              </Link>
            ) : (
              <form action={startCheckout}>
                <input type="hidden" name="plan" value={plan} />
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    background: "var(--color-accent)",
                    color: "var(--color-bg)",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    padding: "0.7rem 1rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Upgrade
                </button>
              </form>
            )}
          </div>
        );
      })}
    </div>
  );
}
