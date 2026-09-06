import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/app/lib/db";
import { users } from "@/app/lib/db/schema";
import { decrypt, getSessionCookie } from "@/app/lib/session";

export const verifySession = cache(async (): Promise<{ userId: string } | null> => {
  const cookie = await getSessionCookie();
  const payload = await decrypt(cookie);
  if (!payload?.userId) return null;
  return { userId: payload.userId };
});

export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
    columns: { id: true, email: true, plan: true },
  });

  return user ?? null;
});
