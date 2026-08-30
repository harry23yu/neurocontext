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

const MAX_PDF_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB

export default function Home() {
  const [mode, setMode] = useState<"text" | "pdf">("text");

  const [text, setText] = useState("");
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [pdfSummary, setPdfSummary] = useState<Summary | null>(null);
  const [pdfExplanations, setPdfExplanations] = useState<Explanation[]>([]);

  function handleClear() {
    setText("");
    setExplanations([]);
    setError(null);
    setSubmitted(false);
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
      setPdfError("PDF must be 1 MB or smaller.");
      e.target.value = "";
      return;
    }

    setPdfFile(file);
    setPdfText(null);
    setPdfSummary(null);
    setPdfExplanations([]);
  }

  async function handlePdfSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!pdfFile) return;

    setPdfLoading(true);
    setPdfError(null);
    setPdfText(null);
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

      setPdfText(pdfData.text);

      const summarizeRes = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pdfData.text }),
      });
      const summarizeData = await summarizeRes.json();

      if (!summarizeRes.ok) {
        throw new Error(summarizeData.error || "Something went wrong");
      }

      setPdfSummary(summarizeData);

      const explainRes = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pdfData.text }),
      });
      const explainData = await explainRes.json();

      if (!explainRes.ok) {
        throw new Error(explainData.error || "Something went wrong");
      }

      setPdfExplanations(explainData.explanations);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setExplanations([]);
    setSubmitted(false);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setExplanations(data.explanations);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>NeuroContext</h1>
      </div>

      <div className={styles.modeToggle}>
        <button type="button" className={styles.modeButton} onClick={() => setMode("text")} disabled={mode === "text"}>
          Paste text
        </button>
        <button type="button" className={styles.modeButton} onClick={() => setMode("pdf")} disabled={mode === "pdf"}>
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
            maxLength={200}
            placeholder="Paste text containing idioms, sarcasm, or social cues..."
          />
          <div className={styles.charCount}>{text.length}/200 characters</div>
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

      {mode === "pdf" && (
        <form onSubmit={handlePdfSubmit} className={styles.formSection}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <label className={styles.fileLabel}>
              Choose File
              <input type="file" className={styles.fileInput} accept="application/pdf" onChange={handlePdfChange} />
            </label>
            <span>{pdfFile?.name || "No file chosen"}</span>
          </div>
          <div className={styles.sizeHint}>Max size: 1 MB</div>
          {pdfError && <p className={styles.error}>{pdfError}</p>}
          {pdfFile && !pdfError && <p>PDF file selected</p>}
          <div className={styles.buttonGroup}>
            <button type="submit" className={`${styles.button} ${styles.submitButton}`} disabled={pdfLoading || !pdfFile || !!pdfError}>
              Extract text
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

      {pdfSummary && pdfExplanations.length === 0 && <p className={styles.noImplicit}>No implicit language found.</p>}

      {pdfExplanations.length > 0 && (
        <div className={styles.resultsSection}>
          <h3 className={styles.sectionName}>Implicit Language in the PDF</h3>
          <ul className={styles.resultsList}>
            {pdfExplanations.map((item, i) => (
              <li key={i}>
                <strong>{item.phrase}</strong> ({item.type}): {item.explanation}
              </li>
            ))}
          </ul>
        </div>
      )}

      {pdfText !== null && (
        <pre className={styles.pdfText}>{pdfText}</pre>
      )}

      {loading && (
        <div
          role="status"
          aria-label="Loading"
          className={`${styles.spinner} animate-spin`}
        />
      )}

      {error && <p className={styles.error}>{error}</p>}

      {submitted && explanations.length === 0 && <p className={styles.noImplicit}>No implicit language found.</p>}

      {explanations.length > 0 && (
        <div className={styles.resultsSection}>
          <h3 className={styles.sectionName}>Implicit Language in the Text</h3>
          <ul className={styles.resultsList}>
            {explanations.map((item, i) => (
              <li key={i}>
                <strong>{item.phrase}</strong> ({item.type}): {item.explanation}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
