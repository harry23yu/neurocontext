// Throwaway test helper: moves the end of a scheduled downgrade's current phase to ~90s from now
// so Stripe advances the schedule and fires the webhook. Usage:
//   node --env-file=.env.local scripts/advance-downgrade.mjs <user-email>
import Stripe from "stripe";
import postgres from "postgres";

if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")) {
  console.error("Refusing to run: STRIPE_SECRET_KEY is not a test-mode key.");
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.error("Usage: node --env-file=.env.local scripts/advance-downgrade.mjs <user-email>");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { prepare: false });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

try {
  const [row] = await sql`
    SELECT s.stripe_schedule_id, s.pending_plan
    FROM subscriptions s JOIN users u ON u.id = s.user_id
    WHERE u.email = ${email}
  `;
  if (!row?.stripe_schedule_id) {
    throw new Error(`No scheduled downgrade found for ${email}`);
  }

  const schedule = await stripe.subscriptionSchedules.retrieve(row.stripe_schedule_id);
  const [current, next] = schedule.phases;
  const newEnd = Math.floor(Date.now() / 1000) + 90;

  // Gold→Silver has two phases; Gold→Free and Silver→Free have one (the subscription cancels when it ends).
  const phases = [
    {
      start_date: current.start_date,
      end_date: newEnd,
      items: current.items.map((i) => ({ price: i.price, quantity: i.quantity })),
    },
  ];
  if (next) {
    phases.push({ items: next.items.map((i) => ({ price: i.price, quantity: i.quantity })) });
  }

  await stripe.subscriptionSchedules.update(schedule.id, {
    proration_behavior: "none",
    phases,
  });

  console.log(
    `Phase 1 of ${schedule.id} now ends at ${new Date(newEnd * 1000).toLocaleTimeString()}. ` +
      `Expect ${row.pending_plan} in ~90s.`,
  );
} finally {
  await sql.end();
}
