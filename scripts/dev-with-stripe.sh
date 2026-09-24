#!/bin/bash
# Starts the Stripe webhook listener alongside the Next.js dev server,
# so billing webhooks (checkout, subscription updates/cancellations)
# reach localhost without a separate manual `stripe listen` step.
set -e

LOG_FILE="/tmp/stripe-listen.log"

echo "Starting Stripe webhook listener..."
stripe listen \
  --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted \
  --forward-to localhost:3000/api/stripe/webhook \
  > "$LOG_FILE" 2>&1 &
STRIPE_PID=$!

cleanup() {
  kill "$STRIPE_PID" 2>/dev/null || true
}
trap cleanup EXIT

echo "Waiting for listener to be ready..."
for _ in $(seq 1 20); do
  if grep -q "Ready!" "$LOG_FILE" 2>/dev/null; then
    break
  fi
  sleep 0.5
done
grep "signing secret" "$LOG_FILE" || echo "(listener starting, check $LOG_FILE if webhooks don't arrive)"

echo "Starting Next.js dev server..."
next dev
