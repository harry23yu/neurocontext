"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/app/lib/db";
import { savedHistory } from "@/app/lib/db/schema";
import { verifySession } from "@/app/lib/dal";

export async function deleteHistoryEntry(id: string) {
  const session = await verifySession();
  if (!session) return;

  await db
    .delete(savedHistory)
    .where(and(eq(savedHistory.id, id), eq(savedHistory.userId, session.userId)));

  revalidatePath("/history");
}
