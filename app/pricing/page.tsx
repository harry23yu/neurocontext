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
    </main>
  );
}
