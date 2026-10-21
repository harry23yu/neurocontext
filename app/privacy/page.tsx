import Link from "next/link";

const sectionHeading = { fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem", color: "var(--color-text)" };
const bodyText = { color: "var(--color-muted)", lineHeight: "1.7" };
const listStyle = { ...bodyText, paddingLeft: "1.25rem", marginTop: "0.5rem", listStyleType: "disc" };
const linkStyle = { color: "var(--color-accent)", textDecoration: "underline" };

export default function Privacy() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "4rem 1.5rem" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "0.5rem", color: "var(--color-text)", textAlign: "center" }}>
        Privacy Policy
      </h1>
      <p style={{ ...bodyText, textAlign: "center", marginBottom: "2.5rem" }}>Last updated: October 19, 2026</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <section>
          <h2 style={sectionHeading}>Who I am</h2>
          <p style={bodyText}>
            NeuroContext is a personal project run by me, Harry Yu. It is available at neurocontext.app. For privacy questions or requests, contact me{" "}
            <a href="mailto:harry23yu@gmail.com" style={linkStyle}>here</a>.
          </p>
        </section>

        <section>
          <h2 style={sectionHeading}>Information I collect</h2>
          <p style={bodyText}>
            <strong>Account information.</strong> If you sign up, I collect your email address, which must be a gmail.com or .edu address. I store your password only as a one-way hash, never in plain text. I also store a hashed version of your email verification code, when it was sent and verified, and your plan and history settings.
          </p>
          <p style={{ ...bodyText, marginTop: "0.75rem" }}>
            <strong>Text you submit.</strong> When you paste text, add optional context, or upload a PDF, I process that content to generate explanations, summaries, and key points. For PDFs, I extract the text on my server and then discard the file itself.
          </p>
          <p style={{ ...bodyText, marginTop: "0.75rem" }}>
            <strong>Saved history.</strong> Signed-in users can keep a history of their submissions and results. Anonymous visitors do not have history saved.
          </p>
          <p style={{ ...bodyText, marginTop: "0.75rem" }}>
            <strong>Payment information.</strong> Payments are handled by Stripe. I do not see or store your card number. I store your Stripe customer and subscription IDs, your plan, your subscription status, and when your current billing period ends.
          </p>
          <p style={{ ...bodyText, marginTop: "0.75rem" }}>
            <strong>Usage and technical information.</strong> I keep credit usage counts per week for accounts and for anonymous visitors. My hosting provider keeps standard server logs, which can include technical details such as IP address, browser type, and the pages requested.
          </p>
        </section>

        <section>
          <h2 style={sectionHeading}>How I use information</h2>
          <p style={bodyText}>
            I use your information to provide NeuroContext, track your credits, save and display your history, process payments, send verification codes, prevent abuse, fix problems, and respond to your messages.
          </p>
        </section>

        <section>
          <h2 style={sectionHeading}>Service providers</h2>
          <p style={bodyText}>
            I share information only with the services needed to run NeuroContext:
          </p>
          <ul style={listStyle}>
            <li><strong>Anthropic</strong>: receives the text you submit so it can generate explanations and summaries.</li>
            <li><strong>Vercel</strong>: hosts the website and runs my server code.</li>
            <li><strong>Supabase</strong>: stores account data and saved history.</li>
            <li><strong>Stripe</strong>: processes subscription payments.</li>
            <li><strong>Resend</strong>: sends verification code emails.</li>
          </ul>
          <p style={{ ...bodyText, marginTop: "0.75rem" }}>
            I do not sell your personal information, and I do not use it for advertising.
          </p>
        </section>

        <section>
          <h2 style={sectionHeading}>Cookies</h2>
          <p style={bodyText}>
            I use two cookies. One keeps you signed in (a session cookie that lasts up to 7 days). The other gives anonymous visitors a random ID so I can track their weekly credits. I do not use advertising or third-party tracking cookies.
          </p>
        </section>

        <section>
          <h2 style={sectionHeading}>How long I keep information</h2>
          <p style={bodyText}>
            I keep account information and saved history until you delete them. Depending on your plan, older history may be blurred on the history page, but it is still kept. When you delete your account, I remove your account, your saved history, and your credit records from my database. I keep your email address on a block list so it cannot be used to create a new account. Backups and provider logs may keep copies for a limited time after deletion.
          </p>
        </section>

        <section>
          <h2 style={sectionHeading}>Your choices</h2>
          <p style={bodyText}>
            You can view and delete your history and delete your account from your account page. You can also contact me to ask what information I hold about you, to request a correction, or to request deletion. Depending on where you live, you may have additional rights under local privacy laws, and I will respond to requests from anywhere in the world.
          </p>
        </section>

        <section>
          <h2 style={sectionHeading}>International users</h2>
          <p style={bodyText}>
            NeuroContext is run from the United States, and my service providers process information in the United States and other countries. If you use NeuroContext from outside the United States, your information will be transferred to and processed in those countries.
          </p>
        </section>

        <section>
          <h2 style={sectionHeading}>Children</h2>
          <p style={bodyText}>
            NeuroContext is designed for people 13 and older, including teens and adults who are learning English. I do not knowingly collect personal information from children under 13. Free features can be used without an account. If you are a parent or guardian and believe your child under 13 has created an account, contact me at{" "}
            <a href="mailto:harry23yu@gmail.com" style={linkStyle}>harry23yu@gmail.com</a> and I will delete it and its data promptly.
          </p>
        </section>

        <section>
          <h2 style={sectionHeading}>Security</h2>
          <p style={bodyText}>
            I use reasonable safeguards, including hashed passwords and signed session cookies. No online service can be completely secure, so I cannot guarantee that your information will never be accessed without authorization.
          </p>
        </section>

        <section>
          <h2 style={sectionHeading}>Changes to this policy</h2>
          <p style={bodyText}>
            I may update this policy from time to time. The date at the top shows when it was last updated. If I make significant changes, I will say so on this site.
          </p>
        </section>
      </div>

      <p style={{ marginTop: "3rem", color: "var(--color-muted)", textAlign: "center" }}>
        <Link href="/" style={linkStyle}>
          Back to home
        </Link>
      </p>
    </div>
  );
}
