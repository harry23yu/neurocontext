import Link from "next/link";

const WINDOW_RADIUS = 2;
const GO_TO_PAGE_THRESHOLD = 4;

function pageItems(current: number, total: number): (number | "ellipsis")[] {
  const shown = new Set<number>([1, total]);
  for (let p = Math.max(1, current - WINDOW_RADIUS); p <= Math.min(total, current + WINDOW_RADIUS); p++) {
    shown.add(p);
  }
  const sorted = [...shown].sort((a, b) => a - b);

  const items: (number | "ellipsis")[] = [];
  sorted.forEach((page, i) => {
    if (i > 0 && page - sorted[i - 1] > 1) items.push("ellipsis");
    items.push(page);
  });
  return items;
}

const pillStyle = {
  minWidth: 32,
  padding: "0.375rem 0.625rem",
  borderRadius: 6,
  fontSize: 14,
  textAlign: "center" as const,
  textDecoration: "none",
};

export default function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        marginTop: "1.5rem",
      }}
    >
      <nav aria-label="History pages" style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
        {pageItems(currentPage, totalPages).map((item, i) =>
          item === "ellipsis" ? (
            <span key={`e${i}`} style={{ ...pillStyle, color: "var(--color-muted)" }}>
              …
            </span>
          ) : item === currentPage ? (
            <span
              key={item}
              aria-current="page"
              style={{ ...pillStyle, backgroundColor: "var(--color-accent)", color: "var(--color-bg)", fontWeight: 600 }}
            >
              {item}
            </span>
          ) : (
            <Link
              key={item}
              href={`/history?page=${item}`}
              style={{ ...pillStyle, color: "var(--color-text)", border: "1px solid var(--color-border)" }}
            >
              {item}
            </Link>
          )
        )}
      </nav>

      {totalPages > GO_TO_PAGE_THRESHOLD && (
        <form action="/history" method="get" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <label htmlFor="go-to-page" style={{ color: "var(--color-muted)", fontSize: 14 }}>
            Go to page
          </label>
          <input
            id="go-to-page"
            name="page"
            type="number"
            min={1}
            max={totalPages}
            required
            style={{
              width: 72,
              padding: "0.375rem 0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-panel)",
              color: "var(--color-text)",
              fontSize: 14,
            }}
          />
          <button
            type="submit"
            style={{
              padding: "0.375rem 0.75rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-panel)",
              color: "var(--color-text)",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Go
          </button>
        </form>
      )}
    </div>
  );
}
