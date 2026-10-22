import Link from "next/link";
import { getUser } from "@/app/lib/dal";
import { type Plan } from "@/app/lib/plans";
import PricingCards from "./PricingCards";

export default async function PricingPage() {
  const user = await getUser();

  return (
    <main
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "4rem 1rem",
      }}
    >
      <h1
        style={{
          color: "var(--color-text)",
          fontSize: "1.75rem",
          marginBottom: "0.5rem",
          textAlign: "center",
        }}
      >
        Plans
      </h1>
      <p
        style={{
          color: "var(--color-muted)",
          marginBottom: "2.5rem",
          textAlign: "center",
        }}
      >
        More credits per week and longer history, whenever you need them.
      </p>
      <PricingCards currentPlan={(user?.plan as Plan) ?? null} isSignedIn={!!user} />
      <p
        style={{
          color: "var(--color-muted)",
          fontSize: 13,
          lineHeight: 1.6,
          marginTop: "2rem",
          textAlign: "center",
        }}
      >
        Paid plans renew automatically each month until you cancel. Upgrades take effect immediately and are prorated.
        Downgrades and cancellations take effect at the end of your billing period. Cancel anytime from your account
        page. Payments are non-refundable except as required by law. See the{" "}
        <Link href="/terms" style={{ color: "var(--color-accent)", textDecoration: "underline" }}>
          Terms of Service
        </Link>
        .
      </p>
    </main>
  );
}
