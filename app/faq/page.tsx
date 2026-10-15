import Link from "next/link";

const faqs: { question: string; answer: string }[] = [
  {
    question: "What is the inspiration behind NeuroContext?",
    answer:
      "I'm autistic, and I struggled with implicit language growing up. I spent years misunderstanding idioms, missing sarcasm, and feeling confused by figurative speech and social cues in articles and books. NeuroContext is the tool I wish I'd had.",
  },
  {
    question: "What does NeuroContext do?",
    answer:
      "It finds implicit language in text, like idioms, sarcasm, slang, figurative speech, and social cues, and explains each one in plain, literal terms. For example, if someone pastes \"Maya knew she had to bite the bullet and finish her science project before the midnight deadline. Even though she felt completely under the weather all week, she stayed up late to get her ducks in a row. When she finally hit submit, it was a total piece of cake compared to the stress she expected, letting her finally call it a day,\" one of the idioms NeuroContext will flag is \"bite the bullet,\" meaning \"To accept or face something difficult or unpleasant that you cannot avoid. It does not involve actual bullets or biting.\"",
  },
  {
    question: "How do I use it?",
    answer:
      "Choose one of three modes: paste short text, paste longer text with context (an optional note about where it's from), or upload a PDF. NeuroContext returns the implicit language it finds, and summaries and key points for longer text and PDFs.",
  },
  {
    question: "What are the text and PDF limits?",
    answer:
      "Paste short text: up to 500 characters. Paste longer text with context: 501 to 5,000 characters. PDF: up to 5,000 characters of text and 100 KB in file size.",
  },
  {
    question: "How do credits work?",
    answer:
      "Pasting a short text uses 1 credit. Pasting a longer text with optional context and uploading a PDF uses 3 credits. Visitors without an account get 10 credits per week. Free accounts get 20 credits per week. Silver gets 100 credits per week, and Gold gets 200 credits per week.",
  },
  {
    question: "How long is my history saved?",
    answer:
      "Free accounts keep 7 days of history, Silver keeps 30 days, and Gold keeps unlimited history. Visitors without an account can't save history.",
  },
  {
    question: "Is NeuroContext always right?",
    answer:
      "It's designed to flag only clear cases of implicit language to avoid false alarms, but it can miss things or misread context. Use it as a helpful second opinion, not the final word.",
  },
  {
    question: "Can I cancel or change my plan?",
    answer:
      "Yes. You can switch plans, downgrade, or manage billing from your account page at any time.",
  },
  {
    question: "What happens to my paid plan if I delete my account?",
    answer:
      "Paid subscriptions are canceled when you delete your account, and refunds are not provided for the remaining period.",
  },
];

export default function Faq() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "4rem 1.5rem" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "2.5rem", color: "var(--color-text)" }}>
        Frequently Asked Questions
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {faqs.map((faq) => (
          <section key={faq.question}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem", color: "var(--color-text)" }}>
              {faq.question}
            </h2>
            <p style={{ color: "var(--color-muted)", lineHeight: "1.7" }}>{faq.answer}</p>
          </section>
        ))}
      </div>

      <p style={{ marginTop: "3rem", color: "var(--color-muted)" }}>
        <Link href="/" style={{ color: "var(--color-accent)", textDecoration: "underline" }}>
          Back to home
        </Link>
      </p>
    </div>
  );
}
