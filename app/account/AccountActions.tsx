"use client";

import { useActionState } from "react";
import { deleteAccount, type DeleteAccountState } from "@/app/lib/actions/account";

const initialState: DeleteAccountState = {};

export default function AccountActions() {
  const [state, formAction, pending] = useActionState(deleteAccount, initialState);

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
      <p style={{ color: "var(--color-error)", margin: 0, fontSize: 14 }}>
        Deleting your account is permanent. Your history and credit usage will be erased and
        cannot be recovered.
      </p>

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
        <span style={{ color: "var(--color-muted)", fontSize: 14 }}>
          Enter your password to confirm
        </span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
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
          background: "var(--color-error)",
          color: "var(--color-bg)",
          border: "none",
          borderRadius: "var(--radius-sm)",
          padding: "0.7rem 1rem",
          fontWeight: 600,
          cursor: pending ? "not-allowed" : "pointer",
          opacity: pending ? 0.7 : 1,
        }}
      >
        {pending ? "Deleting..." : "Delete account"}
      </button>
    </form>
  );
}
