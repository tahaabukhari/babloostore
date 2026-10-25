// Shared by server actions and client forms (no "use client" here).
export type FormState =
  | {
      error?: string;
      fieldErrors?: Record<string, string>;
      ok?: boolean;
      message?: string;
      // Submitted values, echoed back so React's post-action form reset doesn't wipe them.
      values?: Record<string, string>;
    }
  | undefined;

export function echo(form: FormData, omit: string[] = []) {
  const out: Record<string, string> = {};
  for (const [k, v] of form) if (typeof v === "string" && !omit.includes(k)) out[k] = v;
  return out;
}
