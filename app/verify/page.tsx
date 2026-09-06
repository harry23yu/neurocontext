import VerifyForm from "./VerifyForm";

export default async function VerifyPage({
  searchParams,
}: PageProps<"/verify">) {
  const params = await searchParams;
  const email = typeof params.email === "string" ? params.email : "";

  return (
    <main
      style={{
        maxWidth: 420,
        margin: "0 auto",
        padding: "4rem 1rem",
      }}
    >
      <h1
        style={{
          color: "var(--color-text)",
          fontSize: "1.75rem",
          marginBottom: "1.5rem",
        }}
      >
        Verify your email
      </h1>
      <VerifyForm email={email} />
    </main>
  );
}
