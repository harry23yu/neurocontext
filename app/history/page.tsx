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
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "4rem 1rem" }}>
      <h1 style={{ color: "var(--color-text)", fontSize: "1.75rem", marginBottom: "1.5rem" }}>
        History
      </h1>

      {entries.length === 0 && (
        <p style={{ color: "var(--color-muted)" }}>No saved history yet.</p>
      )}

      {entries.map((entry) => {
        const summary = entry.resultSummary as { summary?: string; keyPoints?: string[] } | null;
        const explanations = entry.resultExplanations as
          | { phrase: string; type: string; explanation: string }[]
          | null;

        return (
          <div
            key={entry.id}
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: 16,
              padding: 24,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "var(--color-muted)",
                fontSize: 13,
                marginBottom: 12,
              }}
            >
              <span>{MODE_LABEL[entry.mode] ?? entry.mode}</span>
              <span>{new Date(entry.createdAt).toLocaleString()}</span>
            </div>

            <p style={{ color: "var(--color-text)", marginBottom: 16 }}>{entry.inputText}</p>

            {summary?.summary && (
              <div className={styles.resultsSection}>
                <h2 className={styles.sectionName}>Summary</h2>
                <p>{summary.summary}</p>
                {summary.keyPoints && summary.keyPoints.length > 0 && (
                  <>
                    <h2 className={styles.sectionName}>Key Points</h2>
                    <ul className={styles.keyPoints}>
                      {summary.keyPoints.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            {explanations && explanations.length > 0 && (
              <div className={styles.resultsSection}>
                <h3 className={styles.sectionName}>Implicit Language</h3>
                <ul className={styles.resultsList}>
                  {explanations.map((item, i) => (
                    <li key={i} className={styles.resultsItem}>
                      <span className={styles.phrase}>{item.phrase}</span>
                      <span className={styles.type}>{item.type}</span>
                      <p className={styles.explanation}>{item.explanation}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </main>
  );
}
