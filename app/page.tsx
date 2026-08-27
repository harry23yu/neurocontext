"use client";

import { useState } from "react";

type Explanation = {
  phrase: string;
  type: string;
  explanation: string;
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
  }

  async function handlePdfSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!pdfFile) return;

    setPdfLoading(true);
    setPdfError(null);
    setPdfText(null);

    try {
      const formData = new FormData();
      formData.append("file", pdfFile);

      const res = await fetch("/api/pdf", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setPdfText(data.text);
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
    <div>
      <h1>NeuroContext</h1>

      <div>
        <button type="button" onClick={() => setMode("text")} disabled={mode === "text"}>
          Paste text
        </button>
        <button type="button" onClick={() => setMode("pdf")} disabled={mode === "pdf"}>
          Upload PDF
        </button>
      </div>

      {mode === "text" && (
        <form onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            cols={60}
            maxLength={200}
            placeholder="Paste text containing idioms, sarcasm, or social cues..."
          />
          <div>{text.length}/200 characters</div>
          <div>
            <button type="submit" disabled={loading || !text.trim()}>
              Explain
            </button>
            <button type="button" onClick={handleClear} disabled={loading}>
              Clear
            </button>
          </div>
        </form>
      )}

      {mode === "pdf" && (
        <form onSubmit={handlePdfSubmit}>
          <input type="file" accept="application/pdf" onChange={handlePdfChange} />
          <div>Max size: 1 MB</div>
          {pdfError && <p>Error: {pdfError}</p>}
          {pdfFile && !pdfError && <p>PDF file selected</p>}
          <div>
            <button type="submit" disabled={pdfLoading || !pdfFile || !!pdfError}>
              Extract text
            </button>
          </div>
        </form>
      )}

      {pdfLoading && (
        <div
          role="status"
          aria-label="Loading"
          style={{
            width: 24,
            height: 24,
            border: "3px solid #ccc",
            borderTopColor: "#333",
            borderRadius: "50%",
          }}
          className="animate-spin"
        />
      )}

      {pdfText !== null && (
        <pre style={{ whiteSpace: "pre-wrap" }}>{pdfText}</pre>
      )}

      {loading && (
        <div
          role="status"
          aria-label="Loading"
          style={{
            width: 24,
            height: 24,
            border: "3px solid #ccc",
            borderTopColor: "#333",
            borderRadius: "50%",
          }}
          className="animate-spin"
        />
      )}

      {error && <p>Error: {error}</p>}

      {submitted && explanations.length === 0 && <p>No implicit language found.</p>}

      {explanations.length > 0 && (
        <ul>
          {explanations.map((item, i) => (
            <li key={i}>
              <strong>{item.phrase}</strong> ({item.type}): {item.explanation}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
