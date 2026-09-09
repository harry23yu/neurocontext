import { redirect } from "next/navigation";
import { getUser } from "@/app/lib/dal";
import AccountActions from "./AccountActions";

export default async function AccountPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <main style={{ maxWidth: 420, margin: "0 auto", padding: "4rem 1rem" }}>
      <h1 style={{ color: "var(--color-text)", fontSize: "1.75rem", marginBottom: "0.5rem" }}>
        Account
      </h1>
      <p style={{ color: "var(--color-muted)", marginBottom: "1.5rem" }}>{user.email}</p>
      <AccountActions />
    </main>
  );
}
