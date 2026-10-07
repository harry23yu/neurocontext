"use client";

import { useActionState } from "react";
import { verifyCode, resendCode, type VerifyState, type ResendState } from "@/app/lib/actions/auth";

const initialVerifyState: VerifyState = {};
const initialResendState: ResendState = {};

export default function VerifyForm({ email }: { email: string }) {
  const [verifyState, verifyAction, verifyPending] = useActionState(verifyCode, initialVerifyState);
  const [resendState, resendAction, resendPending] = useActionState(resendCode, initialResendState);

  return (
    <div
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
      <form
        action={verifyAction}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {verifyState.error && (
          <p
            style={{
              background: "var(--color-error-bg)",
              color: "var(--color-error)",
              borderRadius: "var(--radius-sm)",
              padding: "0.75rem 1rem",
              margin: 0,
            }}
          >
            {verifyState.error}
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
          disabled={verifyPending}
          style={{
            background: "var(--color-accent)",
            color: "var(--color-bg)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            padding: "0.7rem 1rem",
            fontWeight: 600,
            cursor: verifyPending ? "not-allowed" : "pointer",
            opacity: verifyPending ? 0.7 : 1,
          }}
        >
          {verifyPending ? "Verifying..." : "Verify"}
        </button>
      </form>

      <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1rem" }}>
        {resendState.error && (
          <p
            style={{
              background: "var(--color-error-bg)",
              color: "var(--color-error)",
              borderRadius: "var(--radius-sm)",
              padding: "0.75rem 1rem",
              margin: "0 0 1rem 0",
            }}
          >
            {resendState.error}
          </p>
        )}
        {resendState.success && (
          <p
            style={{
              background: "#dcfce7",
              color: "#166534",
              borderRadius: "var(--radius-sm)",
              padding: "0.75rem 1rem",
              margin: "0 0 1rem 0",
            }}
          >
            {resendState.success}
          </p>
        )}
        <form action={resendAction} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input type="hidden" name="email" defaultValue={email} />
          <span style={{ color: "var(--color-muted)", fontSize: 14 }}>
            Didn't see your email?
          </span>
          <button
            type="submit"
            disabled={resendPending}
            style={{
              background: "transparent",
              color: "var(--color-accent)",
              border: "none",
              padding: 0,
              fontWeight: 600,
              cursor: resendPending ? "not-allowed" : "pointer",
              textDecoration: "underline",
              opacity: resendPending ? 0.7 : 1,
            }}
          >
            {resendPending ? "Sending..." : "Request a new code"}
          </button>
        </form>
      </div>
    </div>
  );
}
