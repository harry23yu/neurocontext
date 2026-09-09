"use server";

import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { db } from "@/app/lib/db";
import { users, deletedEmailTombstones, creditUsage } from "@/app/lib/db/schema";
import { verifySession } from "@/app/lib/dal";
import { deleteSession } from "@/app/lib/session";

export type DeleteAccountState = {
  error?: string;
};

export async function deleteAccount(
  _prevState: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }

  const password = String(formData.get("password") ?? "");
  if (!password) {
    return { error: "Enter your password to confirm." };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });
  if (!user) {
    redirect("/login");
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    return { error: "Incorrect password." };
  }

  await db
    .insert(deletedEmailTombstones)
    .values({ email: user.email })
    .onConflictDoNothing();
  await db
    .delete(creditUsage)
    .where(and(eq(creditUsage.ownerType, "user"), eq(creditUsage.ownerId, user.id)));
  await db.delete(users).where(eq(users.id, user.id));
  await deleteSession();

  redirect("/");
}
