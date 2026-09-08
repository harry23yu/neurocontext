import "server-only";
import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "./db";
import { savedHistory, users } from "./db/schema";

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

export async function getHistoryForUser(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { historyRetentionDays: true },
  });
  if (!user) return [];

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - user.historyRetentionDays);

  return db
    .select()
    .from(savedHistory)
    .where(and(eq(savedHistory.userId, userId), gte(savedHistory.createdAt, cutoff)))
    .orderBy(desc(savedHistory.createdAt));
}
