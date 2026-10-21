import { z } from "zod";

const EMAIL_SHAPE_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function isAllowedEmailDomain(email: string): boolean {
  return email.endsWith("@gmail.com") || email.endsWith(".edu");
}

export const SignupSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .regex(EMAIL_SHAPE_REGEX, "Enter a valid email address.")
    .refine(isAllowedEmailDomain, "Only gmail.com or .edu email addresses are allowed."),
  password: z
    .string()
    .regex(
      PASSWORD_REGEX,
      "Password must be at least 8 characters and include a letter, a digit, and a special character.",
    ),
  agree: z
    .boolean()
    .refine((value) => value, "You must be 13 or older and agree to the Terms and Privacy Policy to sign up."),
});

export type SignupInput = z.infer<typeof SignupSchema>;
