"use client";

import { AlertCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "./ui";

import type { FormState } from "@/lib/formState";

export type { FormState };

const control =
  "w-full rounded-control border border-control bg-surface px-3 text-[16px] text-ink aria-invalid:border-danger aria-invalid:ring-1 aria-invalid:ring-danger disabled:bg-surface-muted";

type FieldProps = {
  name: string;
  label: string;
  help?: string;
  error?: string;
  className?: string;
};

function Wrap({ name, label, help, error, className = "", children }: FieldProps & { children: React.ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1 block text-sm font-semibold">
        {label}
      </label>
      {help && (
        <p id={`${name}-help`} className="mb-1 text-xs text-ink-secondary">
          {help}
        </p>
      )}
      {children}
      {error && (
        <p id={`${name}-err`} className="mt-1 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

const describedBy = (p: FieldProps) =>
  [p.help && `${p.name}-help`, p.error && `${p.name}-err`].filter(Boolean).join(" ") || undefined;

export function Field(props: FieldProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name">) {
  const { name, label, help, error, className, ...rest } = props;
  return (
    <Wrap {...{ name, label, help, error, className }}>
      <input
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(props)}
        className={`${control} h-11`}
        {...rest}
      />
    </Wrap>
  );
}

export function TextArea(props: FieldProps & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name">) {
  const { name, label, help, error, className, ...rest } = props;
  return (
    <Wrap {...{ name, label, help, error, className }}>
      <textarea
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(props)}
        className={`${control} min-h-28 py-2 leading-6`}
        {...rest}
      />
    </Wrap>
  );
}

export function Select(
  props: FieldProps & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "name"> & { options: { value: string; label: string }[] },
) {
  const { name, label, help, error, className, options, ...rest } = props;
  return (
    <Wrap {...{ name, label, help, error, className }}>
      <select
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(props)}
        className={`${control} h-11`}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Wrap>
  );
}

export function FormAlert({ state }: { state: FormState }) {
  if (!state) return null;
  if (state.error)
    return (
      <div role="alert" className="flex gap-2 rounded-card border border-danger/40 bg-danger-soft p-3 text-sm">
        <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" />
        <p>{state.error}</p>
      </div>
    );
  if (state.ok && state.message)
    return (
      <p role="status" className="rounded-card border border-green/30 bg-green-soft p-3 text-sm text-green">
        {state.message}
      </p>
    );
  return null;
}

export function SubmitButton({ children, pendingLabel, ...rest }: React.ComponentProps<typeof Button> & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} {...rest}>
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}
