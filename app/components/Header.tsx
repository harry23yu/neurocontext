import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { getUser } from "@/app/lib/dal";
import { logout } from "@/app/lib/actions/auth";
import { db } from "@/app/lib/db";
import { creditUsage } from "@/app/lib/db/schema";
import { getPlanLimits } from "@/app/lib/plans";
import { getWeekStart } from "@/app/lib/credits";

export default async function Header() {
  const user = await getUser();

  let remaining = 0;
  let limit = 20;

  if (user) {
    const planLimits = getPlanLimits(user.plan);
    limit = planLimits.creditLimit;
    const weekStart = getWeekStart(new Date());

    const usage = await db.query.creditUsage.findFirst({
      where: and(
        eq(creditUsage.ownerType, "user"),
        eq(creditUsage.ownerId, user.id),
        eq(creditUsage.weekStart, weekStart),
      ),
    });

    const used = usage?.used || 0;
    remaining = Math.max(0, limit - used);
  }

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 1.5rem",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <Link
        href="/"
        style={{ color: "var(--color-text)", fontWeight: 600, textDecoration: "none" }}
      >
        NeuroContext
      </Link>

      <nav style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
        {user && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: "150px", paddingTop: "5px"}}>
            <div
              style={{
                display: "flex",
                height: "6px",
                background: "var(--color-border)",
                borderRadius: "3px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${(remaining / limit) * 100}%`,
                  background: "var(--color-accent)",
                  borderRadius: "3px",
                  transition: "width 0.2s ease",
                }}
              />
            </div>
            <span style={{ fontSize: "12px", color: "var(--color-muted)", textAlign: "center"}}>
              {remaining} credits of {limit} remaining
            </span>
          </div>
        )}
        <Link href="/pricing" style={{ color: "var(--color-text)", textDecoration: "none" }}>
          Pricing
        </Link>
        {user ? (
          <>
            <Link href="/history" style={{ color: "var(--color-text)", textDecoration: "none" }}>
              History
            </Link>
            <span style={{ color: "var(--color-muted)", fontSize: 14 }}>{user.email}</span>
            <Link href="/account" style={{ color: "var(--color-text)", textDecoration: "none" }}>
              Account
            </Link>
            <form action={logout}>
              <button
                type="submit"
                style={{
                  appearance: "none",
                  background: "transparent",
                  border: "none",
                  color: "var(--color-text)",
                  cursor: "pointer",
                  font: "inherit",
                  padding: 0,
                }}
              >
                Log out
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" style={{ color: "var(--color-text)", textDecoration: "none" }}>
              Log in
            </Link>
            <Link
              href="/signup"
              style={{
                color: "var(--color-bg)",
                background: "var(--color-accent)",
                padding: "0.5rem 1rem",
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
