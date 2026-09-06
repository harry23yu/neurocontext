import LoginForm from "./LoginForm";

export default function LoginPage() {
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
        Log in
      </h1>
      <LoginForm />
    </main>
  );
}
