import Link from "next/link";
import { getUser } from "@/app/lib/dal";
import { logout } from "@/app/lib/actions/auth";

export default async function Header() {
  const user = await getUser();

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
        {user ? (
          <>
            <span style={{ color: "var(--color-muted)", fontSize: 14 }}>{user.email}</span>
            <Link href="/history" style={{ color: "var(--color-text)", textDecoration: "none" }}>
              History
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
