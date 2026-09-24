import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/app/lib/db";
import { subscriptions } from "@/app/lib/db/schema";
import { getUser } from "@/app/lib/dal";
import AccountActions from "./AccountActions";
import BillingSection from "./BillingSection";

export default async function AccountPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, user.id),
  });

  const renewalDate = subscription
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <main style={{ maxWidth: 420, margin: "0 auto", padding: "4rem 1rem" }}>
      <h1 style={{ color: "var(--color-text)", fontSize: "1.75rem", marginBottom: "0.5rem" }}>
        Account
      </h1>
      <p style={{ color: "var(--color-muted)", marginBottom: "1.5rem" }}>{user.email}</p>
      <BillingSection
        plan={user.plan as "free" | "silver" | "gold"}
        subscription={
          subscription
            ? {
                status: subscription.status,
                renewalDate,
                pendingPlan: subscription.pendingPlan,
              }
            : null
        }
      />
      <div style={{ marginTop: "1.5rem" }}>
        <AccountActions />
      </div>
    </main>
  );
}
