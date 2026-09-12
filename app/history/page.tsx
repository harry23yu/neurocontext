import { getUser } from "@/app/lib/dal";
import { getHistoryForUser } from "@/app/lib/history";
import styles from "@/app/page.module.css";

const MODE_LABEL: Record<string, string> = {
  text: "Paste text",
  context: "Paste with context",
  pdf: "PDF",
};

export default async function HistoryPage() {
  const user = await getUser();
  if (!user) return null;

  const entries = await getHistoryForUser(user.id);

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
              borderCollapse: "collapse",
              backgroundColor: "var(--color-panel)",
              border: "1px solid var(--color-border)",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
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
                  Timestamp
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
                        maxWidth: 250,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {entry.inputText}
                    </td>
                    <td style={{ padding: "1rem", color: "var(--color-text)", fontSize: 14 }}>
                      {summary?.summary ? (
                        <div>
                          <p style={{ margin: "0 0 0.5rem 0", fontSize: 13 }}>
                            <strong>Summary:</strong> {summary.summary.substring(0, 100)}
                            {summary.summary.length > 100 ? "..." : ""}
                          </p>
                          {summary.keyPoints && summary.keyPoints.length > 0 && (
                            <p style={{ margin: 0, fontSize: 13, color: "var(--color-muted)" }}>
                              <strong>Key Points:</strong> {summary.keyPoints.length} item
                              {summary.keyPoints.length > 1 ? "s" : ""}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "var(--color-muted)" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "1rem", color: "var(--color-text)", fontSize: 14 }}>
                      {explanations && explanations.length > 0 ? (
                        <div>
                          {explanations.slice(0, 5).map((item, i) => (
                            <div key={i} style={{ marginBottom: i < 2 ? "0.5rem" : 0, fontSize: 13 }}>
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
                              <span style={{ color: "var(--color-muted)", fontSize: 11 }}>
                                ({item.type})
                              </span>
                            </div>
                          ))}
                          {explanations.length > 3 && (
                            <p style={{ margin: "0.5rem 0 0 0", color: "var(--color-muted)", fontSize: 12 }}>
                              +{explanations.length - 3} more
                            </p>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "var(--color-muted)" }}>—</span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        color: "var(--color-muted)",
                        fontSize: 13,
                        whiteSpace: "nowrap",
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
    </main>
  );
}
