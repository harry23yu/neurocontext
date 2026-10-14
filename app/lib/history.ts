import "server-only";
import { count, desc, eq } from "drizzle-orm";
import { db } from "./db";
import { savedHistory, users } from "./db/schema";
import { UNLIMITED_HISTORY_DAYS } from "./plans";

export async function saveHistoryEntry({
  userId,
  mode,
  inputText,
  inputContext,
  resultSummary,
  resultExplanations,
}: {
  userId: string;
  mode: "text" | "context" | "pdf";
  inputText: string;
  inputContext?: string | null;
  resultSummary: unknown;
  resultExplanations: unknown;
}): Promise<void> {
  await db.insert(savedHistory).values({
    userId,
    mode,
    inputText,
    inputContext: inputContext ?? null,
    resultSummary,
    resultExplanations,
  });
}

export const HISTORY_PAGE_SIZE = 25;

export async function getHistoryPageForUser(userId: string, page: number) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { historyRetentionDays: true },
  });
  if (!user) return { entries: [], total: 0, historyRetentionDays: UNLIMITED_HISTORY_DAYS };

  const where = eq(savedHistory.userId, userId);

  const [{ total }] = await db.select({ total: count() }).from(savedHistory).where(where);

  const entries = await db
    .select()
    .from(savedHistory)
    .where(where)
    .orderBy(desc(savedHistory.createdAt))
    .limit(HISTORY_PAGE_SIZE)
    .offset((page - 1) * HISTORY_PAGE_SIZE);

  return { entries, total, historyRetentionDays: user.historyRetentionDays };
}
