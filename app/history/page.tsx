import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/app/lib/dal";
import { HISTORY_PAGE_SIZE, getHistoryPageForUser } from "@/app/lib/history";
import { UNLIMITED_HISTORY_DAYS } from "@/app/lib/plans";
import ExpandableText from "./ExpandableText";
import Pagination from "./Pagination";
import { deleteHistoryEntry } from "./actions";

const MODE_LABEL: Record<string, string> = {
  text: "Paste text",
  context: "Paste with context",
  pdf: "PDF",
};

const upgradeLinkStyle = { color: "var(--color-accent)", textDecoration: "underline" };

const UPGRADE_REMINDER: Record<string, ReactNode> = {
  free: (
    <>
      You are on free plan, which shows 7 days of history.{" "}
      <Link href="/pricing" style={upgradeLinkStyle}>Subscribe</Link>
      {" "}to Silver for 30 days of history, or Gold for unlimited history.
    </>
  ),
  silver: (
    <>
      You are on silver plan, which shows 30 days of history.{" "}
      <Link href="/pricing" style={upgradeLinkStyle}>Subscribe</Link>
      {" "}to Gold for unlimited history.
    </>
  ),
};

const INPUT_PREVIEW_CHARS = 500;
const SUMMARY_PREVIEW_CHARS = 300;
const EXPLANATION_PREVIEW_COUNT = 5;

const blurredCellStyle = {
  filter: "blur(6px)",
  userSelect: "none",
  pointerEvents: "none",
} as const;

function previewText(text: string, limit: number) {
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}

function previewPoints(points: string[], limit: number) {
  const shown: string[] = [];
  let total = 0;
  for (const point of points) {
    if (total + point.length > limit) break;
    shown.push(point);
    total += point.length;
  }
  return shown.length > 0 ? shown : [previewText(points[0], limit)];
}

function pointList(points: string[]) {
  return (
    <ul style={{ margin: "0.25rem 0 0 0", paddingLeft: "1.25rem", listStyleType: "disc" }}>
      {points.map((point, i) => (
        <li key={i}>{point}</li>
      ))}
    </ul>
  );
}

function explanationList(items: { phrase: string; type: string }[]) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: "0.5rem", fontSize: 13 }}>
          <span
            style={{
              backgroundColor: "rgba(77, 208, 196, 0.2)",
              padding: "0.2rem 0.5rem",
              borderRadius: 4,
              marginRight: "0.5rem",
            }}
          >
            {item.phrase}
          </span>
          <span style={{ color: "var(--color-muted)", fontSize: 11 }}>({item.type})</span>
        </div>
      ))}
    </div>
  );
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getUser();
  if (!user) return null;

  const { page: pageParam } = await searchParams;
  const requestedPage = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  const { entries, total, historyRetentionDays } = await getHistoryPageForUser(user.id, requestedPage);
  const totalPages = Math.max(1, Math.ceil(total / HISTORY_PAGE_SIZE));

  if (requestedPage > totalPages) redirect(`/history?page=${totalPages}`);

  const cutoff =
    historyRetentionDays === UNLIMITED_HISTORY_DAYS
      ? null
      : new Date(Date.now() - historyRetentionDays * 24 * 60 * 60 * 1000);
  const isBlurred = (createdAt: Date) => cutoff !== null && createdAt < cutoff;
  const firstBlurredIndex = entries.findIndex((entry) => isBlurred(entry.createdAt));
  const reminder = UPGRADE_REMINDER[user.plan] ?? null;

  return (
    <main style={{ maxWidth: 1400, margin: "0 auto", padding: "4rem 1rem" }}>
      <h1 style={{ color: "var(--color-text)", fontSize: "1.75rem", marginBottom: "1.5rem", textAlign: "center" }}>
        History
      </h1>

      {entries.length === 0 && (
        <p style={{ color: "var(--color-muted)" }}>No saved history yet.</p>
      )}

      {entries.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              tableLayout: "fixed",
              borderCollapse: "collapse",
              backgroundColor: "var(--color-panel)",
              border: "1px solid var(--color-border)",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <colgroup>
              <col style={{ width: "12%" }} />
              <col style={{ width: "26%" }} />
              <col style={{ width: "28%" }} />
              <col style={{ width: "19%" }} />
              <col style={{ width: "12%" }} />
            </colgroup>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    color: "var(--color-text)",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Mode
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    color: "var(--color-text)",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Input
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    color: "var(--color-text)",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Summary & Key Points
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    color: "var(--color-text)",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Implicit Language
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    color: "var(--color-text)",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Timestamp (Pacific Time)
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => {
                const summary = entry.resultSummary as {
                  summary?: string;
                  keyPoints?: string[];
                } | null;
                const explanations = entry.resultExplanations as
                  | { phrase: string; type: string; explanation: string }[]
                  | null;

                const summaryText = summary?.summary ?? "";
                const keyPoints = summary?.keyPoints ?? [];
                const keyPointsLength = keyPoints.reduce((sum, p) => sum + p.length, 0);
                const blurred = isBlurred(entry.createdAt);

                return (
                  <Fragment key={entry.id}>
                    {idx === firstBlurredIndex && reminder && (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: "1rem",
                            textAlign: "center",
                            color: "var(--color-text)",
                            fontSize: 14,
                            backgroundColor: "rgba(77, 208, 196, 0.08)",
                            borderBottom: "1px solid var(--color-border)",
                          }}
                        >
                          {reminder}
                        </td>
                      </tr>
                    )}
                    <tr
                      style={{
                        borderBottom: "1px solid var(--color-border)",
                        backgroundColor: idx % 2 === 0 ? "var(--color-panel)" : "rgba(255,255,255,0.02)",
                      }}
                    >
                      <td
                        style={{
                          padding: "1rem",
                          color: "var(--color-text)",
                          fontSize: 14,
                          ...(blurred ? blurredCellStyle : {}),
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: "var(--color-accent)",
                            color: "var(--color-bg)",
                            padding: "0.25rem 0.75rem",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {MODE_LABEL[entry.mode] ?? entry.mode}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "1rem",
                          color: "var(--color-text)",
                          fontSize: 14,
                          wordBreak: "break-word",
                          ...(blurred ? blurredCellStyle : {}),
                        }}
                      >
                        {entry.inputText.length > INPUT_PREVIEW_CHARS ? (
                          <ExpandableText
                            preview={previewText(entry.inputText, INPUT_PREVIEW_CHARS)}
                            full={entry.inputText}
                          />
                        ) : (
                          entry.inputText
                        )}
                      </td>
                      <td
                        style={{
                          padding: "1rem",
                          color: "var(--color-text)",
                          fontSize: 14,
                          wordBreak: "break-word",
                          ...(blurred ? blurredCellStyle : {}),
                        }}
                      >
                        {summaryText || keyPoints.length > 0 ? (
                          <div>
                            {summaryText && (
                              <div style={{ margin: "0 0 0.5rem 0", fontSize: 13 }}>
                                <strong>Summary:</strong>{" "}
                                {summaryText.length > SUMMARY_PREVIEW_CHARS ? (
                                  <ExpandableText
                                    preview={previewText(summaryText, SUMMARY_PREVIEW_CHARS)}
                                    full={summaryText}
                                  />
                                ) : (
                                  summaryText
                                )}
                              </div>
                            )}
                            {keyPoints.length > 0 && (
                              <div style={{ fontSize: 13, color: "var(--color-text)" }}>
                                <strong>Key Points:</strong>
                                {keyPointsLength > SUMMARY_PREVIEW_CHARS ? (
                                  <ExpandableText
                                    preview={pointList(previewPoints(keyPoints, SUMMARY_PREVIEW_CHARS))}
                                    full={pointList(keyPoints)}
                                  />
                                ) : (
                                  pointList(keyPoints)
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: "var(--color-muted)" }}>—</span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "1rem",
                          color: "var(--color-text)",
                          fontSize: 14,
                          wordBreak: "break-word",
                          ...(blurred ? blurredCellStyle : {}),
                        }}
                      >
                        {explanations && explanations.length > 0 ? (
                          explanations.length > EXPLANATION_PREVIEW_COUNT ? (
                            <ExpandableText
                              preview={explanationList(explanations.slice(0, EXPLANATION_PREVIEW_COUNT))}
                              full={explanationList(explanations)}
                            />
                          ) : (
                            explanationList(explanations)
                          )
                        ) : (
                          <span style={{ color: "var(--color-muted)" }}>—</span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "1rem",
                          color: "var(--color-muted)",
                          fontSize: 13,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                          <span>{new Date(entry.createdAt).toLocaleString()}</span>
                          <form action={deleteHistoryEntry.bind(null, entry.id)}>
                            <button
                              type="submit"
                              aria-label="Delete entry"
                              title="Delete entry"
                              style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                                cursor: "pointer",
                                color: "#ef4444",
                                lineHeight: 0,
                              }}
                            >
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 6h18" />
                                <path d="M8 6V4h8v2" />
                                <path d="M19 6l-1 14H6L5 6" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                              </svg>
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination currentPage={requestedPage} totalPages={totalPages} />
    </main>
  );
}
