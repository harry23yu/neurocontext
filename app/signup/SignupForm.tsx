"use client";

import { useActionState } from "react";
import { signup, type SignupState } from "@/app/lib/actions/auth";

const initialState: SignupState = {};

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <form
      action={formAction}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        background: "var(--color-panel)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "1.75rem",
      }}
    >
      {state.error && (
        <p
          style={{
            background: "var(--color-error-bg)",
            color: "var(--color-error)",
            borderRadius: "var(--radius-sm)",
            padding: "0.75rem 1rem",
            margin: 0,
          }}
        >
          {state.error}
        </p>
      )}

      <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <span style={{ color: "var(--color-muted)", fontSize: 14 }}>Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          style={{
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            color: "var(--color-text)",
            padding: "0.65rem 0.85rem",
          }}
        />
        {state.fieldErrors?.email?.map((msg) => (
          <span key={msg} style={{ color: "var(--color-error)", fontSize: 13 }}>
            {msg}
          </span>
        ))}
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <span style={{ color: "var(--color-muted)", fontSize: 14 }}>Password</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="new-password"
          style={{
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            color: "var(--color-text)",
            padding: "0.65rem 0.85rem",
          }}
        />
        {state.fieldErrors?.password?.map((msg) => (
          <span key={msg} style={{ color: "var(--color-error)", fontSize: 13 }}>
            {msg}
          </span>
        ))}
      </label>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", color: "var(--color-muted)", fontSize: 14, lineHeight: 1.5 }}>
          <input type="checkbox" name="agree" required style={{ marginTop: "0.25rem" }} />
          <span>
            I&rsquo;m 13 or older and I agree to the{" "}
            <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-accent)", textDecoration: "underline" }}>
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-accent)", textDecoration: "underline" }}>
              Privacy Policy
            </a>
            .
          </span>
        </label>
        {state.fieldErrors?.agree?.map((msg) => (
          <span key={msg} style={{ color: "var(--color-error)", fontSize: 13 }}>
            {msg}
          </span>
        ))}
      </div>

      <button
        type="submit"
        disabled={pending}
        style={{
          background: "var(--color-accent)",
          color: "var(--color-bg)",
          border: "none",
          borderRadius: "var(--radius-sm)",
          padding: "0.7rem 1rem",
          fontWeight: 600,
          cursor: pending ? "not-allowed" : "pointer",
          opacity: pending ? 0.7 : 1,
        }}
      >
        {pending ? "Creating account..." : "Sign up"}
      </button>
    </form>
  );
}
