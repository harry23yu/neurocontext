import "server-only";
import { cookies } from "next/headers";
import { sql } from "drizzle-orm";
import { db } from "./db";

const ANON_ID_COOKIE = "nc_anon_id";
const ANON_ID_MAX_AGE = 60 * 60 * 24 * 365;

export async function getOrCreateAnonId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(ANON_ID_COOKIE)?.value;
  if (existing) return existing;

  const id = crypto.randomUUID();
  cookieStore.set(ANON_ID_COOKIE, id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: ANON_ID_MAX_AGE,
    path: "/",
  });
  return id;
}

export function getWeekStart(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  const year = Number(get("year"));
  const month = Number(get("month"));
  const day = Number(get("day"));
  const weekday = get("weekday");

  const weekdayIndex: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };

  const asUTC = new Date(Date.UTC(year, month - 1, day));
  asUTC.setUTCDate(asUTC.getUTCDate() - weekdayIndex[weekday]);

  return asUTC.toISOString().slice(0, 10);
}

export class CreditsExhaustedError extends Error {
  constructor() {
    super("Credits exhausted for this week");
    this.name = "CreditsExhaustedError";
  }
}

export async function checkAndConsumeCredit({
  ownerType,
  ownerId,
  cost,
  limit,
}: {
  ownerType: "user" | "anon";
  ownerId: string;
  cost: number;
  limit: number;
}): Promise<number> {
  const weekStart = getWeekStart(new Date());

  const rows = await db.execute<{ used: number }>(sql`
    INSERT INTO credit_usage (owner_type, owner_id, week_start, used)
    VALUES (${ownerType}, ${ownerId}, ${weekStart}, ${cost})
    ON CONFLICT (owner_type, owner_id, week_start)
    DO UPDATE SET used = credit_usage.used + ${cost}, updated_at = now()
    WHERE credit_usage.used + ${cost} <= ${limit}
    RETURNING used
  `);

  const row = rows[0];
  if (!row) throw new CreditsExhaustedError();
  return row.used;
}

const ANON_WEEKLY_LIMIT = 10;

export async function reconcileAnonymousUsageOnLogin(userId: string): Promise<void> {
  const cookieStore = await cookies();
  const anonId = cookieStore.get(ANON_ID_COOKIE)?.value;
  if (!anonId) return;

  const weekStart = getWeekStart(new Date());

  const anonRows = await db.execute<{ used: number }>(sql`
    SELECT used FROM credit_usage
    WHERE owner_type = 'anon' AND owner_id = ${anonId} AND week_start = ${weekStart}
  `);

  const anonUsed = Math.min(anonRows[0]?.used ?? 0, ANON_WEEKLY_LIMIT);
  if (anonUsed <= 0) return;

  await db.execute(sql`
    INSERT INTO credit_usage (owner_type, owner_id, week_start, used)
    VALUES ('user', ${userId}, ${weekStart}, ${anonUsed})
    ON CONFLICT (owner_type, owner_id, week_start)
    DO UPDATE SET used = GREATEST(credit_usage.used, ${anonUsed}), updated_at = now()
  `);
}
