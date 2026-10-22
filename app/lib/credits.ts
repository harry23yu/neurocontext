import "server-only";
import { createHmac } from "crypto";
import { cookies, headers } from "next/headers";
import { sql } from "drizzle-orm";
import { db } from "./db";
import { getUser } from "./dal";
import { getPlanLimits } from "./plans";

const ANON_ID_COOKIE = "nc_anon_id";
const ANON_ID_MAX_AGE = 60 * 60 * 24 * 365;

export async function getOrCreateAnonId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(ANON_ID_COOKIE)?.value;
  if (existing) return existing;

  const id = crypto.randomUUID();
  try {
    cookieStore.set(ANON_ID_COOKIE, id, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: ANON_ID_MAX_AGE,
      path: "/",
    });
  } catch {
    // Ignore: can't set cookies outside Server Actions/Route Handlers
  }
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
  anonymous: boolean;

  constructor(anonymous: boolean) {
    super("Credits exhausted for this week");
    this.name = "CreditsExhaustedError";
    this.anonymous = anonymous;
  }
}

export async function checkAndConsumeCredit({
  ownerType,
  ownerId,
  cost,
  limit,
}: {
  ownerType: "user" | "anon" | "ip";
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
  if (!row) throw new CreditsExhaustedError(ownerType === "anon");
  return row.used;
}

const ANON_WEEKLY_LIMIT = 10;
const ANON_IP_WEEKLY_LIMIT = 10;

// Stores a keyed hash of the IP address, not the address itself, in credit_usage.
// The hash is formatted as a UUID because owner_id is a uuid column.
async function getIpOwnerId(): Promise<string | null> {
  // On Vercel these headers carry the real client IP; visitors can't override them.
  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-real-ip") ??
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (!ip) return null;

  const hex = createHmac("sha256", process.env.SESSION_SECRET ?? "")
    .update(ip)
    .digest("hex")
    .slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

async function getWeeklyUsed(ownerType: "anon" | "ip", ownerId: string): Promise<number> {
  const rows = await db.execute<{ used: number }>(sql`
    SELECT used FROM credit_usage
    WHERE owner_type = ${ownerType} AND owner_id = ${ownerId} AND week_start = ${getWeekStart(new Date())}
  `);
  return rows[0]?.used ?? 0;
}

async function getAnonStatus() {
  const anonId = await getOrCreateAnonId();
  const ipId = await getIpOwnerId();
  const anonUsed = await getWeeklyUsed("anon", anonId);
  const ipUsed = ipId ? await getWeeklyUsed("ip", ipId) : 0;

  const anonRemaining = ANON_WEEKLY_LIMIT - anonUsed;
  const ipRemaining = ipId ? ANON_IP_WEEKLY_LIMIT - ipUsed : anonRemaining;
  return { anonId, ipId, remaining: Math.max(0, Math.min(anonRemaining, ipRemaining)) };
}

// Credits an anonymous visitor can actually use: the lower of the cookie and IP limits.
export async function getAnonRemaining(): Promise<number> {
  return (await getAnonStatus()).remaining;
}

export async function requireCredit(cost: number): Promise<void> {
  if (cost <= 0) return;

  const user = await getUser();
  if (user) {
    const planLimits = getPlanLimits(user.plan);
    await checkAndConsumeCredit({
      ownerType: "user",
      ownerId: user.id,
      cost,
      limit: planLimits.creditLimit,
    });
    return;
  }

  // Check both limits before consuming either, so a refused request doesn't use up credits.
  const { anonId, ipId, remaining } = await getAnonStatus();
  if (remaining < cost) {
    throw new CreditsExhaustedError(true);
  }

  await checkAndConsumeCredit({
    ownerType: "anon",
    ownerId: anonId,
    cost,
    limit: ANON_WEEKLY_LIMIT,
  });
  if (ipId) {
    await checkAndConsumeCredit({
      ownerType: "ip",
      ownerId: ipId,
      cost,
      limit: ANON_IP_WEEKLY_LIMIT,
    });
  }
}

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
