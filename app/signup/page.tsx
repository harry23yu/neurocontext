import SignupForm from "./SignupForm";

export default function SignupPage() {
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
        Sign up
      </h1>
      <SignupForm />
    </main>
  );
}
