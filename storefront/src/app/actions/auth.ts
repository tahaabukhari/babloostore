"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { inviteRedemptions, stores, users } from "@/db/schema";
import { createSession, destroySession, normaliseEmail } from "@/lib/auth";
import { deliveryCities } from "@/lib/data";
import { echo, type FormState } from "@/lib/formState";
import { isInviteCode, normaliseCode } from "@/lib/invites";
import { hashPassword, verifyPassword } from "@/lib/password";
import { slugify, uniqueSlug } from "@/lib/slug";

// Only allow same-site relative redirects after sign-in.
function safeNext(next: FormDataEntryValue | null, fallback: string) {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") ? n : fallback;
}

const signUpSchema = z.object({
  invite: z.string().trim().min(1, "Enter your invite code."),
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email: z.email("Enter a valid email address.").max(200),
  password: z.string().min(8, "Use at least 8 characters.").max(200),
  storeName: z.string().trim().min(2, "Enter your store name.").max(80),
  city: z.enum(deliveryCities as [string, ...string[]], "Choose a city."),
});

class SignUpError extends Error {
  constructor(
    public field: string,
    message: string,
  ) {
    super(message);
  }
}

/** Invite-only store sign-up: creates the owner account and their store together. */
export async function signUp(_: FormState, form: FormData): Promise<FormState> {
  const values = echo(form, ["password"]);
  const parsed = signUpSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    return { fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])), values };
  }
  const d = parsed.data;
  const code = normaliseCode(d.invite);
  if (!isInviteCode(code)) return { fieldErrors: { invite: "That invite code isn't valid." }, values };

  const email = normaliseEmail(d.email);
  const passwordHash = await hashPassword(d.password);
  let userId: string;
  try {
    userId = await db.transaction(async (tx) => {
      const [exists] = await tx.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
      if (exists) throw new SignUpError("email", "An account with this email already exists. Sign in instead.");
      const [used] = await tx
        .select({ code: inviteRedemptions.code })
        .from(inviteRedemptions)
        .where(eq(inviteRedemptions.code, code))
        .limit(1);
      if (used) throw new SignUpError("invite", "This invite code has already been used.");

      const [user] = await tx.insert(users).values({ email, name: d.name, role: "owner", passwordHash }).returning({ id: users.id });
      // Primary key on the code makes a concurrent second redemption fail and roll back.
      await tx.insert(inviteRedemptions).values({ code, userId: user.id });
      let slug = slugify(d.storeName);
      const [taken] = await tx.select({ id: stores.id }).from(stores).where(eq(stores.slug, slug)).limit(1);
      if (taken) slug = uniqueSlug(d.storeName);
      await tx.insert(stores).values({ ownerId: user.id, name: d.storeName, slug, city: d.city });
      return user.id;
    });
  } catch (e) {
    if (e instanceof SignUpError) return { fieldErrors: { [e.field]: e.message }, values };
    console.error("signUp failed", e);
    return { error: "We couldn't create your store. The invite code may have just been used — try again or ask for a new one.", values };
  }

  await createSession(userId);
  redirect("/dashboard/store?welcome=1");
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
  redirect(safeNext(form.get("next"), "/dashboard"));
}

export async function signOut() {
  await destroySession();
  redirect("/");
}
