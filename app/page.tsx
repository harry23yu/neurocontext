"use client";

import Link from "next/link";

export default function LandingFull() {
  return (
    <div style={{ width: "100%" }}>
      {/* Hero Section */}
      <section style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "4rem 1.5rem",
        textAlign: "center",
      }}>
        <h1 style={{
          fontSize: "3.5rem",
          fontWeight: "700",
          lineHeight: "1.1",
          marginBottom: "1rem",
          color: "var(--color-text)",
        }}>
          <span style={{ color: "var(--color-text)" }}>Implicit language, </span>
          <span style={{ color: "var(--color-accent)" }}>made literal.</span>
        </h1>

        <p style={{
          fontSize: "1.25rem",
          color: "var(--color-muted)",
          marginBottom: "2rem",
          maxWidth: "700px",
          margin: "0 auto 2rem",
          lineHeight: "1.6",
        }}>
          Paste anything—an email, an excerpt from an article or book, or your choice—or upload a PDF. NeuroContext identifies implicit language like idioms, sarcasm, and social cues, then explains each one in plain, literal terms. Summaries and key points are also included for longer text and PDFs.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3rem" }}>
          <Link href="/signup" style={{
            backgroundColor: "var(--color-accent)",
            color: "var(--color-bg)",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "1rem",
          }}>
            Sign Up Free
          </Link>
          <Link href="/app" style={{
            borderColor: "var(--color-accent)",
            border: "2px solid",
            color: "var(--color-accent)",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "1rem",
            backgroundColor: "transparent",
          }}>
            Try It Now
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "4rem 1.5rem",
      }}>
        <h2 style={{
          fontSize: "2.5rem",
          fontWeight: "700",
          textAlign: "center",
          marginBottom: "3rem",
          color: "var(--color-text)",
        }}>
          Three Ways to Explain
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
          <div style={{
            backgroundColor: "var(--color-border)",
            padding: "2rem",
            borderRadius: "1rem",
            textAlign: "center",
          }}>
            <h3 style={{ color: "var(--color-accent)", marginBottom: "0.5rem", fontSize: "1.25rem" }}>Paste short text</h3>
            <p style={{ color: "var(--color-muted)", lineHeight: "1.6" }}>
              Quick phrases or sentences. Get instant explanations for idioms, sarcasm, and social cues.
            </p>
            <p style={{ color: "var(--color-muted)", fontSize: "0.875rem", marginTop: "1rem" }}>
              Up to 500 characters
            </p>
          </div>
          <div style={{
            backgroundColor: "var(--color-border)",
            padding: "2rem",
            borderRadius: "1rem",
            textAlign: "center",
          }}>
            <h3 style={{ color: "var(--color-accent)", marginBottom: "0.5rem", fontSize: "1.25rem" }}>Paste longer text with context</h3>
            <p style={{ color: "var(--color-muted)", lineHeight: "1.6" }}>
              Longer texts with source context. Get summary, key points, and implicit language breakdown.
            </p>
            <p style={{ color: "var(--color-muted)", fontSize: "0.875rem", marginTop: "1rem" }}>
              501–5,000 characters
            </p>
          </div>
          <div style={{
            backgroundColor: "var(--color-border)",
            padding: "2rem",
            borderRadius: "1rem",
            textAlign: "center",
          }}>
            <h3 style={{ color: "var(--color-accent)", marginBottom: "0.5rem", fontSize: "1.25rem" }}>Upload PDF</h3>
            <p style={{ color: "var(--color-muted)", lineHeight: "1.6" }}>
              Full documents. Get auto-generated summaries, key points, and implicit language analysis.
            </p>
            <p style={{ color: "var(--color-muted)", fontSize: "0.875rem", marginTop: "1rem" }}>
              Up to 5,000 characters or 100 KB
            </p>
          </div>
        </div>
      </section>

      {/* Why NeuroContext */}
      <section style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "4rem 1.5rem",
      }}>
        <h2 style={{
          fontSize: "2.5rem",
          fontWeight: "700",
          textAlign: "center",
          marginBottom: "3rem",
          color: "var(--color-text)",
        }}>
          Built by an Autistic Developer
        </h2>
        <div style={{
          backgroundColor: "var(--color-border)",
          padding: "3rem 2rem",
          borderRadius: "1rem",
          lineHeight: "1.8",
          color: "var(--color-muted)",
        }}>
          <p style={{ marginBottom: "1rem" }}>
            I, <a href="https://www.linkedin.com/in/harry23yu" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-accent)", textDecoration: "underline" }}>Harry Yu</a>, am autistic and struggled with implicit language growing up. I spent years misunderstanding idioms, missing sarcasm, and feeling confused by figurative speech in articles and books.
          </p>
          <p style={{ marginBottom: "1rem" }}>
            This tool exists to make language more accessible. It's designed for neurodivergent users—autistic, ADHD, and others—who think literally and deserve clear, straightforward explanations. People struggling with or learning English will also find this tool helpful.
          </p>
          <p>
            No judgment. No complexity. Just clear answers to "what did they really mean?"
          </p>
        </div>
      </section>

      {/* Who It's For */}
      <section style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "4rem 1.5rem",
      }}>
        <h2 style={{
          fontSize: "2.5rem",
          fontWeight: "700",
          textAlign: "center",
          marginBottom: "3rem",
          color: "var(--color-text)",
        }}>
          Who Uses NeuroContext
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ color: "var(--color-accent)", marginBottom: "0.5rem" }}>Neurodivergent Community</h3>
            <p style={{ color: "var(--color-muted)" }}>Autistic, ADHD, and other neurodivergent individuals who think in literal terms.</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ color: "var(--color-accent)", marginBottom: "0.5rem" }}>Students</h3>
            <p style={{ color: "var(--color-muted)" }}>Understand texts, emails, and assignments better with instant explanations.</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ color: "var(--color-accent)", marginBottom: "0.5rem" }}>Language Learners</h3>
            <p style={{ color: "var(--color-muted)" }}>Master English idioms and social cues with clear, literal explanations.</p>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "4rem 1.5rem",
      }}>
        <h2 style={{
          fontSize: "2.5rem",
          fontWeight: "700",
          textAlign: "center",
          marginBottom: "3rem",
          color: "var(--color-text)",
        }}>
          Plans for Everyone
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem", marginBottom: "3rem" }}>
          <div style={{
            backgroundColor: "var(--color-border)",
            padding: "2rem",
            borderRadius: "1rem",
            textAlign: "center",
          }}>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Free</h3>
            <p style={{ color: "var(--color-accent)", fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem" }}>$0</p>
            <ul style={{ listStyle: "none", padding: 0, color: "var(--color-muted)", textAlign: "left" }}>
              <li>✓ 20 credits/week</li>
              <li>✓ 7-day history</li>
              <li>✓ All three input modes</li>
            </ul>
          </div>
          <div style={{
            backgroundColor: "var(--color-border)",
            padding: "2rem",
            borderRadius: "1rem",
            textAlign: "center",
          }}>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Silver</h3>
            <p style={{ color: "var(--color-accent)", fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem" }}>$9/mo</p>
            <ul style={{ listStyle: "none", padding: 0, color: "var(--color-muted)", textAlign: "left" }}>
              <li>✓ 100 credits/week</li>
              <li>✓ 30-day history</li>
              <li>✓ All three input modes</li>
            </ul>
          </div>
          <div style={{
            backgroundColor: "var(--color-border)",
            padding: "2rem",
            borderRadius: "1rem",
            textAlign: "center",
          }}>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Gold</h3>
            <p style={{ color: "var(--color-accent)", fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem" }}>$16/mo</p>
            <ul style={{ listStyle: "none", padding: 0, color: "var(--color-muted)", textAlign: "left" }}>
              <li>✓ 200 credits/week</li>
              <li>✓ Unlimited history</li>
              <li>✓ All three input modes</li>
            </ul>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <Link href="/pricing" style={{ color: "var(--color-accent)", textDecoration: "underline" }}>
            View full pricing details →
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        backgroundColor: "var(--color-border)",
        padding: "4rem 1.5rem",
        textAlign: "center",
        margin: "4rem 0 0 0",
      }}>
        <h2 style={{
          fontSize: "2rem",
          fontWeight: "700",
          marginBottom: "1rem",
          color: "var(--color-text)",
        }}>
          Ready to Make Language Clear?
        </h2>
        <p style={{
          fontSize: "1.125rem",
          color: "var(--color-muted)",
          marginBottom: "2rem",
          maxWidth: "600px",
          margin: "0 auto 2rem",
        }}>
          Start explaining implicit language today. No credit card required.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/signup" style={{
            backgroundColor: "var(--color-accent)",
            color: "var(--color-bg)",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "1rem",
          }}>
            Sign Up Free
          </Link>
          <Link href="/app" style={{
            borderColor: "var(--color-accent)",
            border: "2px solid",
            color: "var(--color-accent)",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "1rem",
            backgroundColor: "transparent",
          }}>
            Try It Now
          </Link>
        </div>
      </section>

      {/* Footer Links */}
      <section style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "3rem 1.5rem",
        textAlign: "center",
        color: "var(--color-muted)",
        fontSize: "0.875rem",
      }}>
        <p>
          <Link href="/faq" style={{ color: "var(--color-accent)", marginRight: "2rem", textDecoration: "none" }}>
            FAQ
          </Link>
          <Link href="/pricing" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
            Pricing
          </Link>
        </p>
      </section>
    </div>
  );
}
