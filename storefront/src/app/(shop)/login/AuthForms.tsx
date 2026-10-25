"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp } from "@/app/actions/auth";
import { Field, FormAlert, Select, SubmitButton } from "@/components/form";
import { deliveryCities } from "@/lib/data";

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
        Have an invite code?{" "}
        <Link href="/signup" className="font-semibold text-gold-ink hover:underline">
          Open your store
        </Link>
      </p>
    </form>
  );
}

export function SignUpForm({ invite }: { invite?: string }) {
  const [state, action] = useActionState(signUp, undefined);
  const fe = state?.fieldErrors ?? {};
  const v = state?.values ?? {};
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormAlert state={state} />
      <Field
        name="invite"
        label="Invite code"
        autoComplete="off"
        autoCapitalize="characters"
        defaultValue={v.invite ?? invite}
        help="Store sign-up is invite-only for now."
        error={fe.invite}
        required
      />
      <fieldset className="space-y-4">
        <legend className="mb-1 text-sm font-bold">You</legend>
        <Field name="name" label="Your name" autoComplete="name" defaultValue={v.name} error={fe.name} required />
        <Field name="email" label="Email" type="email" autoComplete="email" defaultValue={v.email} error={fe.email} help="You'll sign in with this." required />
        <Field name="password" label="Password" type="password" autoComplete="new-password" help="At least 8 characters." error={fe.password} required />
      </fieldset>
      <fieldset className="space-y-4">
        <legend className="mb-1 text-sm font-bold">Your store</legend>
        <Field name="storeName" label="Store name" autoComplete="organization" defaultValue={v.storeName} error={fe.storeName} required />
        <Select
          name="city"
          label="City you ship from"
          defaultValue={v.city ?? "Lahore"}
          error={fe.city}
          options={deliveryCities.map((c) => ({ value: c, label: c }))}
        />
      </fieldset>
      <SubmitButton className="w-full" size="lg" pendingLabel="Creating your store">
        Create my store
      </SubmitButton>
      <p className="text-center text-sm text-ink-secondary">
        Already have a store?{" "}
        <Link href="/login" className="font-semibold text-gold-ink hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
