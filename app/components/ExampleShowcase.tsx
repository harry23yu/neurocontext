"use client";

import { useState } from "react";
import Image from "next/image";

const examples = [
  {
    src: "/examples/input.png",
    width: 1728,
    height: 1164,
    title: "Paste your text or upload a PDF.",
    description: `This example shows the "Paste longer text with context" mode (up to 5,000 characters, with an optional note about where it's from).`,
    alt: "NeuroContext input box with an excerpt from To Kill a Mockingbird Chapter 1 pasted in, a context field reading \"To Kill a Mockingbird Chapter 1,\" and an Analyze button",
  },
  {
    src: "/examples/output1.png",
    width: 1730,
    height: 954,
    title: "Get the big picture.",
    description: "A summary and key points for longer text and PDFs.",
    alt: "A summary of the excerpt followed by five key points",
  },
  {
    src: "/examples/output2.png",
    width: 1726,
    height: 820,
    title: "See what it really means.",
    description: "Each example of implicit language (including but not limited to idioms, sarcasm, or figurative language) is explained in plain, literal terms.",
    alt: "Implicit language found in the excerpt: \"run the Creeks up the creek\" and \"paddled up the Alabama,\" each labeled figurative with a plain explanation",
  },
];

export default function ExampleShowcase() {
  const [active, setActive] = useState(0);

  return (
    <div style={{
      display: "flex",
      flexWrap: "wrap",
      backgroundColor: "var(--color-panel)",
      border: "1px solid var(--color-border)",
      borderRadius: "1rem",
      overflow: "hidden",
    }}>
      <div style={{
        flex: "1 1 300px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "2.5rem",
        padding: "2rem",
        backgroundColor: "var(--color-bg)",
      }}>
        <div>
          <div style={{ borderTop: "1px solid var(--color-border)", marginBottom: "1.5rem" }} />
          <h2 style={{
            fontSize: "2rem",
            fontWeight: "600",
            lineHeight: "1.2",
            color: "var(--color-text)",
          }}>
            Understand what they really meant.
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {examples.map((example, index) => {
            const isActive = index === active;
            return (
              <button
                key={example.src}
                type="button"
                onClick={() => setActive(index)}
                aria-pressed={isActive}
                style={{
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  borderLeft: `3px solid ${isActive ? "var(--color-accent)" : "transparent"}`,
                  padding: "0 0 0 0.75rem",
                  cursor: "pointer",
                  lineHeight: "1.5",
                  fontSize: "1rem",
                  color: "var(--color-muted)",
                  opacity: isActive ? 1 : 0.65,
                }}
              >
                <span style={{ color: "var(--color-text)", fontWeight: "600" }}>{example.title}</span>{" "}
                <span>{example.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{
        flex: "2.2 1 480px",
        position: "relative",
        aspectRatio: "1728 / 1164",
      }}>
        {examples.map((example, index) => (
          <Image
            key={example.src}
            src={example.src}
            alt={example.alt}
            fill
            sizes="(max-width: 1200px) 70vw, 840px"
            aria-hidden={index !== active}
            style={{
              objectFit: "contain",
              objectPosition: "center",
              opacity: index === active ? 1 : 0,
              transition: "opacity 0.2s ease",
              pointerEvents: "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
