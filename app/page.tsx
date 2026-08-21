"use client";

import { useState } from "react";

type Explanation = {
  phrase: string;
  type: string;
  explanation: string;
};

export default function Home() {
  const [text, setText] = useState("");
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setExplanations([]);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>NeuroContext</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          cols={60}
          placeholder="Paste text containing idioms, sarcasm, or social cues..."
        />
        <div>
          <button type="submit" disabled={loading || !text.trim()}>
            {loading ? "Explaining..." : "Explain"}
          </button>
        </div>
      </form>

      {error && <p>Error: {error}</p>}

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
