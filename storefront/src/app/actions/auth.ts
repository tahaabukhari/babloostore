"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, destroySession, normaliseEmail } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { echo, type FormState } from "@/lib/formState";

// Only allow same-site relative redirects after sign-in.
function safeNext(next: FormDataEntryValue | null, fallback: string) {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") ? n : fallback;
}

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email: z.email("Enter a valid email address.").max(200),
  password: z.string().min(8, "Use at least 8 characters.").max(200),
});

export async function signUp(_: FormState, form: FormData): Promise<FormState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    return {
      fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])),
      values: echo(form, ["password"]),
    };
  }
  const email = normaliseEmail(parsed.data.email);
  const [exists] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (exists) {
    return { fieldErrors: { email: "An account with this email already exists. Sign in instead." }, values: echo(form, ["password"]) };
  }

  const [user] = await db
    .insert(users)
    .values({ email, name: parsed.data.name, passwordHash: await hashPassword(parsed.data.password) })
    .returning({ id: users.id });
  await createSession(user.id);
  redirect(safeNext(form.get("next"), "/account"));
}

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const email = normaliseEmail(String(form.get("email") ?? ""));
  const password = String(form.get("password") ?? "");
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  // Same message for unknown email and wrong password.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Email or password is incorrect.", values: echo(form, ["password"]) };
  }
  await createSession(user.id);
  const fallback = user.role === "customer" ? "/account" : "/dashboard";
  redirect(safeNext(form.get("next"), fallback));
}

export async function signOut() {
  await destroySession();
  redirect("/");
}
