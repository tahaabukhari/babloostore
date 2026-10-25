"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp } from "@/app/actions/auth";
import { Field, FormAlert, SubmitButton } from "@/components/form";

export function SignInForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signIn, undefined);
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormAlert state={state} />
      <input type="hidden" name="next" value={next ?? ""} />
      <Field name="email" label="Email" type="email" autoComplete="email" defaultValue={state?.values?.email} required />
      <Field name="password" label="Password" type="password" autoComplete="current-password" required />
      <SubmitButton className="w-full" size="lg" pendingLabel="Signing in">
        Sign in
      </SubmitButton>
      <p className="text-center text-sm text-ink-secondary">
        New here?{" "}
        <Link href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-gold-ink hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function SignUpForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signUp, undefined);
  const fe = state?.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormAlert state={state} />
      <input type="hidden" name="next" value={next ?? ""} />
      <Field name="name" label="Full name" autoComplete="name" defaultValue={state?.values?.name} error={fe.name} required />
      <Field name="email" label="Email" type="email" autoComplete="email" defaultValue={state?.values?.email} error={fe.email} required />
      <Field
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        help="At least 8 characters."
        error={fe.password}
        required
      />
      <SubmitButton className="w-full" size="lg" pendingLabel="Creating account">
        Create account
      </SubmitButton>
      <p className="text-center text-sm text-ink-secondary">
        Already have an account?{" "}
        <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-gold-ink hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
