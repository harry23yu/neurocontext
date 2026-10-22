# NeuroContext

NeuroContext is a web app that helps neurodivergent people, especially autistic and ADHD users, understand implicit language — including but not limited to idioms, figurative speech, sarcasm, and social cues in text — by breaking them down into clear, literal explanations.

## Why I'm Building This

I'm autistic, and growing up, I struggled with English reading comprehension — especially idioms, figurative language, and picking up on social cues in text and conversation. Over time, I significantly improved, but I remember how disorienting it was to read something and know every word individually while still missing what it actually meant.

Most existing tools for autism and ADHD focus on sensory regulation or social-script practice. NeuroContext is different: it's about decoding *meaning* — helping users understand what's actually being said beneath the literal words, whether that's an idiom, a sarcastic remark, or an implied social cue.

This project started as an evolution of **AutiKit**, a tool I built in 3 hours at the February 2026 Anthropic Claude Code Portland Hackathon (placed 6th out of 125 hackers).
- GitHub: [github.com/harry23yu/autikit](https://github.com/harry23yu/autikit)
- Live demo: [autikit.onrender.com](https://autikit.onrender.com/)

NeuroContext takes that initial idea and rebuilds it as a more complete, production-style tool. It also helps people who are learning English.

Live at [neurocontext-chi.vercel.app](https://neurocontext-chi.vercel.app/).

## What It Does

- **Paste short text** (up to 500 characters): each example of implicit language like idioms, sarcasm, or social cues is explained in plain terms.
- **Paste longer text with context** (501–5,000 characters): the same explanations, plus a summary and key points. You can add a note about where the text is from.
- **Upload a PDF** (up to 5,000 characters of text and 100 KB): the same output as longer text.

## Plans and Credits

| Plan | Price | Credits per week | History kept |
|---|---|---|---|
| Visitor (no account) | Free | 10 | Not saved |
| Free account | Free | 20 | 7 days |
| Silver | $9/month | 100 | 30 days |
| Gold | $16/month | 200 | Unlimited |

Credits reset every Monday at 12:00 a.m. Pacific Time. Visitors without an account are limited by both a per-browser count and a per-IP-address count, so clearing cookies or using a private window doesn't reset the limit. Sign-up is limited to gmail.com and .edu addresses, and each account needs a verified email.

Paid plans are monthly subscriptions billed through Stripe. Upgrades take effect immediately, prorated. Downgrades and cancellations take effect at the end of the billing period. Deleting an account is permanent.

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** CSS Modules and Tailwind CSS 4
- **AI:** Anthropic Claude API
- **Database:** Postgres (Supabase), accessed with Drizzle ORM
- **Auth:** email and password, with a 6-digit email verification code; sessions use signed cookies (jose)
- **Payments:** Stripe (Checkout, customer portal, subscription schedules, webhooks)
- **Email:** Resend
- **PDFs:** pdf-parse
- **Hosting:** Vercel

## Pages

- `/` — landing page
- `/app` — the actual tool
- `/signup`, `/login`, `/verify` — accounts
- `/pricing` — plans
- `/account` — current plan, billing, account deletion
- `/history` — saved results (signed-in users)
- `/faq`, `/privacy`, `/terms` — information pages

## Roadmap

**Done**
- Paid plans
- Landing page
- FAQ
- History
- Privacy policy and terms

**Next**
- Sign-up and email verification (see Status section)
- Chrome extension that explains highlighted text on any web page, using the same credits and saving results to the website

## Status

🚀 Live. The explainer, visitor use, and paid-plan checkout are working. New account sign-up is not yet complete: verification codes are sent from Resend's shared test address, which only delivers to the Resend account owner, so new users can't receive their code. This is fixed by verifying neurocontext.app in Resend and switching the sender to an address on that domain.

## Author

Built by Harry Yu, a CS student at Oregon State University. Feedback is welcome at [harry23yu@gmail.com](mailto:harry23yu@gmail.com).