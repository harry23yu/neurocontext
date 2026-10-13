"use client";

import { useState, type ReactNode } from "react";

export default function ExpandableText({ preview, full }: { preview: ReactNode; full: ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      {expanded ? full : preview}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        style={{
          background: "none",
          border: "none",
          padding: "0.25rem 0 0 0",
          color: "var(--color-accent)",
          fontSize: 12,
          cursor: "pointer",
        }}
      >
        {expanded ? "▾ show less" : "▸ show more"}
      </button>
    </div>
  );
}
