"use client";

import { useActionState } from "react";
import { verifyCode, type VerifyState } from "@/app/lib/actions/auth";

const initialState: VerifyState = {};

export default function VerifyForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(verifyCode, initialState);

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

      <input type="hidden" name="email" defaultValue={email} />

      <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <span style={{ color: "var(--color-muted)", fontSize: 14 }}>
          Code sent to {email}
        </span>
        <input
          type="text"
          name="code"
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          style={{
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            color: "var(--color-text)",
            padding: "0.65rem 0.85rem",
          }}
        />
      </label>

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
        {pending ? "Verifying..." : "Verify"}
      </button>
    </form>
  );
}
