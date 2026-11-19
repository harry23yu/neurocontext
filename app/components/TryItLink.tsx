"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TryItLink() {
  const pathname = usePathname();

  if (pathname === "/app") return null;

  return (
    <Link
      href="/app"
      style={{
        color: "var(--color-bg)",
        background: "var(--color-accent)",
        padding: "0.5rem 1rem",
        borderRadius: "var(--radius-sm)",
        textDecoration: "none",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      Try it here
    </Link>
  );
}
