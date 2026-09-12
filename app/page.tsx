"use client";

import { useState } from "react";
import styles from "./page.module.css";

type Explanation = {
  phrase: string;
  type: string;
  explanation: string;
};

type Summary = {
  summary: string;
  keyPoints: string[];
};

const MAX_PDF_CHAR_COUNT = 5000;
const MAX_PDF_SIZE_BYTES = 1 * 102400;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function saveHistory(payload: {
  mode: "text" | "context" | "pdf";
  inputText: string;
  inputContext?: string;
  resultSummary?: Summary;
  resultExplanations: Explanation[];
}) {
  fetch("/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

class ApiError extends Error {
  code?: string;
  anonymous?: boolean;

  constructor(message: string, code?: string, anonymous?: boolean) {
    super(message);
    this.code = code;
    this.anonymous = anonymous;
  }
}

export default function Home() {
  const [mode, setMode] = useState<"text" | "pdf" | "context">("text");

  const [text, setText] = useState("");
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outOfCreditsAnonymous, setOutOfCreditsAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfOutOfCreditsAnonymous, setPdfOutOfCreditsAnonymous] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfSummary, setPdfSummary] = useState<Summary | null>(null);
  const [pdfExplanations, setPdfExplanations] = useState<Explanation[]>([]);

  const [contextText, setContextText] = useState("");
  const [contextDescription, setContextDescription] = useState("");
  const [contextExplanations, setContextExplanations] = useState<Explanation[]>([]);
  const [contextSummary, setContextSummary] = useState<Summary | null>(null);
  const [contextLoading, setContextLoading] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);
  const [contextOutOfCreditsAnonymous, setContextOutOfCreditsAnonymous] = useState(false);
  const [contextSubmitted, setContextSubmitted] = useState(false);

  function handleClear() {
    setText("");
    setExplanations([]);
    setError(null);
    setOutOfCreditsAnonymous(false);
    setSubmitted(false);
  }

  function handleContextClear() {
    setContextText("");
    setContextDescription("");
    setContextExplanations([]);
    setContextError(null);
    setContextOutOfCreditsAnonymous(false);
    setContextSummary(null);
    setContextSubmitted(false);
  }

  function handleModeChange(newMode: "text" | "pdf" | "context") {
    if (mode === newMode) return;

    setText("");
    setExplanations([]);
    setError(null);
    setOutOfCreditsAnonymous(false);
    setSubmitted(false);

    setPdfFile(null);
    setPdfError(null);
    setPdfOutOfCreditsAnonymous(false);
    setPdfSummary(null);
    setPdfExplanations([]);

    setContextText("");
    setContextDescription("");
    setContextExplanations([]);
    setContextSummary(null);
    setContextError(null);
    setContextOutOfCreditsAnonymous(false);
    setContextSubmitted(false);

    setMode(newMode);
  }

  function handlePdfChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPdfFile(null);
    setPdfError(null);

    if (!file) return;

    if (file.type !== "application/pdf") {
      setPdfError("Please select a PDF file.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      setPdfError("PDF must be 100 KB or smaller.");
      e.target.value = "";
      return;
    }

    setPdfFile(file);
    setPdfSummary(null);
    setPdfExplanations([]);
  }

  async function handlePdfSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!pdfFile) return;

    setPdfLoading(true);
    setPdfError(null);
    setPdfOutOfCreditsAnonymous(false);
    setPdfSummary(null);
    setPdfExplanations([]);

    try {
      const formData = new FormData();
      formData.append("file", pdfFile);

      const pdfRes = await fetch("/api/pdf", { method: "POST", body: formData });
      const pdfData = await pdfRes.json();

      if (!pdfRes.ok) {
        throw new Error(pdfData.error || "Something went wrong");
      }

      if (pdfData.text.length > MAX_PDF_CHAR_COUNT) {
        throw new Error(`PDF exceeds 5,000 character limit (${pdfData.text.length} characters).`);
      }

      const summarizeRes = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pdfData.text, mode: "pdf" }),
      });
      const summarizeData = await summarizeRes.json();

      if (!summarizeRes.ok) {
        throw new ApiError(summarizeData.error || "Something went wrong", summarizeData.code, summarizeData.anonymous);
      }

      setPdfSummary(summarizeData);

      const explainRes = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pdfData.text, mode: "pdf" }),
      });
      const explainData = await explainRes.json();

      if (!explainRes.ok) {
        throw new ApiError(explainData.error || "Something went wrong", explainData.code, explainData.anonymous);
      }

      setPdfExplanations(explainData.explanations);
      saveHistory({
        mode: "pdf",
        inputText: pdfData.text,
        resultSummary: summarizeData,
        resultExplanations: explainData.explanations,
      });
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : "Something went wrong");
      setPdfOutOfCreditsAnonymous(err instanceof ApiError && err.code === "OUT_OF_CREDITS" && !!err.anonymous);
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOutOfCreditsAnonymous(false);
    setExplanations([]);
    setSubmitted(false);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode: "text" }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new ApiError(data.error || "Something went wrong", data.code, data.anonymous);
      }

      setExplanations(data.explanations);
      setSubmitted(true);
      saveHistory({
        mode: "text",
        inputText: text,
        resultExplanations: data.explanations,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setOutOfCreditsAnonymous(err instanceof ApiError && err.code === "OUT_OF_CREDITS" && !!err.anonymous);
    } finally {
      setLoading(false);
    }
  }

  async function handleContextSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setContextLoading(true);
    setContextError(null);
    setContextOutOfCreditsAnonymous(false);
    setContextSummary(null);
    setContextExplanations([]);
    setContextSubmitted(false);

    try {
      if (contextText.length < 501 || contextText.length > 5000) {
        throw new Error(`Text must be between 501 and 5,000 characters (${contextText.length} characters).`);
      }

      const summarizeRes = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: contextText, context: contextDescription, mode: "context" }),
      });
      const summarizeData = await summarizeRes.json();

      if (!summarizeRes.ok) {
        throw new ApiError(summarizeData.error || "Something went wrong", summarizeData.code, summarizeData.anonymous);
      }

      setContextSummary(summarizeData);

      const explainRes = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: contextText, context: contextDescription, mode: "context" }),
      });
      const explainData = await explainRes.json();

      if (!explainRes.ok) {
        throw new ApiError(explainData.error || "Something went wrong", explainData.code, explainData.anonymous);
      }

      setContextExplanations(explainData.explanations);
      setContextSubmitted(true);
      saveHistory({
        mode: "context",
        inputText: contextText,
        inputContext: contextDescription,
        resultSummary: summarizeData,
        resultExplanations: explainData.explanations,
      });
    } catch (err) {
      setContextError(err instanceof Error ? err.message : "Something went wrong");
      setContextOutOfCreditsAnonymous(err instanceof ApiError && err.code === "OUT_OF_CREDITS" && !!err.anonymous);
    } finally {
      setContextLoading(false);
    }
  }

  return (
    <div className={styles.container}>

      <div className={styles.slogan}>
        <span className={styles.dot}/>
        Implicit language, made literal
      </div>

      <h1 className={styles.headline}>
        <span className={styles.titleFog}>What they meant</span>{" "}
        <span className={styles.titleClear}>vs. what they said.</span>
      </h1>

      <p className={styles.subtitle}>
        Paste a sentence, a chunk of text, or upload a PDF, and NeuroContext will identify implicit language like idioms, sarcasm, and social cues, then explain each one in plain, literal terms.
      </p>

      <div className={styles.modeToggle}>
        <button type="button" className={styles.modeButton} onClick={() => handleModeChange("text")} disabled={loading || contextLoading || pdfLoading} style={mode === "text" ? { background: "#4dd0c4", color: "#14171f", fontWeight: "600" } : {}}>
          Paste text
        </button>
        <button type="button" className={styles.modeButton} onClick={() => handleModeChange("context")} disabled={loading || contextLoading || pdfLoading} style={mode === "context" ? { background: "#4dd0c4", color: "#14171f", fontWeight: "600" } : {}}>
          Paste with context
        </button>
        <button type="button" className={styles.modeButton} onClick={() => handleModeChange("pdf")} disabled={loading || contextLoading || pdfLoading} style={mode === "pdf" ? { background: "#4dd0c4", color: "#14171f", fontWeight: "600" } : {}}>
          Upload PDF
        </button>
      </div>

      {mode === "text" && (
        <form onSubmit={handleSubmit} className={styles.formSection}>
          <textarea
            className={styles.textarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            maxLength={500}
            placeholder="Paste text containing idioms, sarcasm, or social cues..."
          />
          <div className={styles.charCount}>{text.length}/500 characters</div>
          <div className={styles.buttonGroup}>
            <button type="submit" className={`${styles.button} ${styles.submitButton}`} disabled={loading || !text.trim()}>
              Explain
            </button>
            <button type="button" className={`${styles.button} ${styles.clearButton}`} onClick={handleClear} disabled={loading}>
              Clear
            </button>
          </div>
        </form>
      )}

      {mode === "context" && (
        <form onSubmit={handleContextSubmit} className={styles.formSection}>
          <textarea
            className={styles.textarea}
            value={contextText}
            onChange={(e) => setContextText(e.target.value)}
            rows={8}
            maxLength={5000}
            placeholder="Paste text (501-5,000 characters)..."
          />
          <div className={styles.charCount}>{contextText.length}/5,000 characters</div>
          <input
            type="text"
            className={styles.contextInput}
            value={contextDescription}
            onChange={(e) => setContextDescription(e.target.value)}
            placeholder="Where is this from? (e.g., article, cover letter, email)"
          />
          <div className={styles.buttonGroup}>
            <button type="submit" className={`${styles.button} ${styles.submitButton}`} disabled={contextLoading || !contextText.trim()}>
              Analyze
            </button>
            <button type="button" className={`${styles.button} ${styles.clearButton}`} onClick={handleContextClear} disabled={contextLoading}>
              Clear
            </button>
          </div>
        </form>
      )}

      {mode === "pdf" && (
        <form onSubmit={handlePdfSubmit} className={styles.formSection}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <label className={styles.fileLabel}>
              Choose File
              <input type="file" className={styles.fileInput} accept="application/pdf" onChange={handlePdfChange} disabled={pdfLoading} />
            </label>
            <span>{pdfFile?.name || "No file chosen"}</span>
          </div>
          <div className={styles.sizeHint}>PDF can't exceed 5,000 characters or 100 KB.</div>
          {pdfError && (
            <p className={styles.error}>
              {pdfError}
              {pdfOutOfCreditsAnonymous && (
                <>
                  {" "}
                  <a href="/signup" style={{ color: "var(--color-accent)", textDecoration: "underline" }}>
                    Sign up
                  </a>{" "}
                  for more credits.
                </>
              )}
            </p>
          )}
          {pdfFile && !pdfError && <p className={styles.pdfSelected}>PDF file selected.</p>}
          <div className={styles.buttonGroup}>
            <button type="submit" className={`${styles.button} ${styles.submitButton}`} disabled={pdfLoading || !pdfFile || !!pdfError}>
              Analyze
            </button>
          </div>
        </form>
      )}

      {pdfLoading && (
        <div
          role="status"
          aria-label="Loading"
          className={`${styles.spinner} animate-spin`}
        />
      )}

      {pdfSummary && (
        <div className={styles.resultsSection}>
          <h2 className={styles.sectionName}>Summary</h2>
          <p>{pdfSummary.summary}</p>
          <br></br>
          <h2 className={styles.sectionName}>Key Points</h2>
          <ul className={styles.keyPoints}>
            {pdfSummary.keyPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {pdfSummary && pdfExplanations.length === 0 && !pdfLoading && <p className={styles.noImplicit}>No implicit language found.</p>}

      {pdfExplanations.length > 0 && (
        <div className={styles.resultsSection}>
          <h3 className={styles.sectionName}>Implicit Language in the PDF</h3>
          <ul className={styles.resultsList}>
            {pdfExplanations.map((item, i) => (
              <li key={i} className={styles.resultsItem}>
                <span className={styles.phrase}>{item.phrase}</span>
                <span className={styles.type}>{item.type}</span>
                <p className={styles.explanation}>{item.explanation}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {contextLoading && (
        <div
          role="status"
          aria-label="Loading"
          className={`${styles.spinner} animate-spin`}
        />
      )}

      {contextSummary && (
        <div className={styles.resultsSection}>
          <h2 className={styles.sectionName}>Summary</h2>
          <p>{contextSummary.summary}</p>
          <br></br>
          <h2 className={styles.sectionName}>Key Points</h2>
          <ul className={styles.keyPoints}>
            {contextSummary.keyPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {contextSummary && contextExplanations.length === 0 && !contextLoading && <p className={styles.noImplicit}>No implicit language found.</p>}

      {contextExplanations.length > 0 && (
        <div className={styles.resultsSection}>
          <h3 className={styles.sectionName}>Implicit Language in the Text</h3>
          <ul className={styles.resultsList}>
            {contextExplanations.map((item, i) => (
              <li key={i} className={styles.resultsItem}>
                <span className={styles.phrase}>{item.phrase}</span>
                <span className={styles.type}>{item.type}</span>
                <p className={styles.explanation}>{item.explanation}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {contextError && (
        <p className={styles.error}>
          {contextError}
          {contextOutOfCreditsAnonymous && (
            <>
              {" "}
              <a href="/signup" style={{ color: "var(--color-accent)", textDecoration: "underline" }}>
                Sign up
              </a>{" "}
              for more credits.
            </>
          )}
        </p>
      )}

      {loading && (
        <div
          role="status"
          aria-label="Loading"
          className={`${styles.spinner} animate-spin`}
        />
      )}

      {error && (
        <p className={styles.error}>
          {error}
          {outOfCreditsAnonymous && (
            <>
              {" "}
              <a href="/signup" style={{ color: "var(--color-accent)", textDecoration: "underline" }}>
                Sign up
              </a>{" "}
              for more credits.
            </>
          )}
        </p>
      )}

      {submitted && explanations.length === 0 && <p className={styles.noImplicit}>No implicit language found.</p>}

      {explanations.length > 0 && (
        <div className={styles.resultsSection}>
          <h3 className={styles.sectionName}>Implicit Language in the Text</h3>
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
}
