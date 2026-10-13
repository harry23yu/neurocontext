import { redirect } from "next/navigation";
import { getUser } from "@/app/lib/dal";
import { HISTORY_PAGE_SIZE, getHistoryPageForUser } from "@/app/lib/history";
import ExpandableText from "./ExpandableText";
import Pagination from "./Pagination";

const MODE_LABEL: Record<string, string> = {
  text: "Paste text",
  context: "Paste with context",
  pdf: "PDF",
};

const INPUT_PREVIEW_CHARS = 500;
const SUMMARY_PREVIEW_CHARS = 300;
const EXPLANATION_PREVIEW_COUNT = 5;

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

  const { entries, total } = await getHistoryPageForUser(user.id, requestedPage);
  const totalPages = Math.max(1, Math.ceil(total / HISTORY_PAGE_SIZE));

  if (requestedPage > totalPages) redirect(`/history?page=${totalPages}`);

  return (
    <main style={{ maxWidth: 1400, margin: "0 auto", padding: "4rem 1rem" }}>
      <h1 style={{ color: "var(--color-text)", fontSize: "1.75rem", marginBottom: "1.5rem" }}>
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

                return (
                  <tr
                    key={entry.id}
                    style={{
                      borderBottom: "1px solid var(--color-border)",
                      backgroundColor: idx % 2 === 0 ? "var(--color-panel)" : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <td style={{ padding: "1rem", color: "var(--color-text)", fontSize: 14 }}>
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
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                  </tr>
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
