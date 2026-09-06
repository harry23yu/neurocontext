"use server";

import { randomInt } from "crypto";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { Resend } from "resend";
import { db } from "@/app/lib/db";
import { users, verificationCodes, deletedEmailTombstones } from "@/app/lib/db/schema";
import { SignupSchema } from "@/app/lib/definitions";

const VERIFICATION_CODE_TTL_MS = 15 * 60 * 1000;

export type SignupState = {
  error?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
};

async function sendVerificationCodeEmail(email: string, code: string) {
  if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Your NeuroContext verification code",
      html: `<p>Your verification code is <strong>${code}</strong>. It expires in 15 minutes.</p>`,
    });
    return;
  }

  console.log(`[dev] Verification code for ${email}: ${code}`);
}

export async function signup(
  _prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const parsed = SignupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;

  const tombstoned = await db.query.deletedEmailTombstones.findFirst({
    where: eq(deletedEmailTombstones.email, email),
  });
  if (tombstoned) {
    return { error: "Unable to create an account with this email address." };
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  const passwordHash = await bcrypt.hash(password, 12);

  let userId: string;

  if (existingUser) {
    if (existingUser.emailVerifiedAt) {
      return { error: "An account with this email already exists." };
    }

    const latestCode = await db.query.verificationCodes.findFirst({
      where: eq(verificationCodes.userId, existingUser.id),
      orderBy: (codes, { desc }) => [desc(codes.createdAt)],
    });

    if (latestCode && latestCode.expiresAt > new Date()) {
      return {
        error:
          "An account with this email is pending verification. Check your email for the code.",
      };
    }

    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, existingUser.id));
    userId = existingUser.id;
  } else {
    const [inserted] = await db
      .insert(users)
      .values({ email, passwordHash })
      .returning({ id: users.id });
    userId = inserted.id;
  }

  const code = randomInt(100000, 1000000).toString();
  const codeHash = await bcrypt.hash(code, 10);

  await db.insert(verificationCodes).values({
    userId,
    codeHash,
    expiresAt: new Date(Date.now() + VERIFICATION_CODE_TTL_MS),
  });

  await sendVerificationCodeEmail(email, code);

  redirect(`/verify?email=${encodeURIComponent(email)}`);
}
