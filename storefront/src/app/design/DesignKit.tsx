"use client";

import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { getProduct } from "@/lib/data";
import { QuantityControl, VariantSelector } from "@/components/pdp";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui";

export function ToastDemo() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary" onClick={() => toast({ tone: "success", message: "Added 1 × Oud Al Layl Attar to your cart." })}>
        Success toast
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast({ tone: "info", message: "Removed Canvas Tote.", action: { label: "Undo", onClick: () => {} } })}
      >
        Reversible toast
      </Button>
      <Button variant="secondary" onClick={() => toast({ tone: "error", message: "Couldn't update your cart. Check your connection and try again." })}>
        Error toast
      </Button>
    </div>
  );
}

export function LoadingButtonDemo() {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      loading={loading}
      onClick={() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1500);
      }}
    >
      {loading ? "Adding" : "Click to see loading"}
    </Button>
  );
}

export function VariantDemo() {
  const kurta = getProduct("cotton-kurta-men")!;
  const [sel, setSel] = useState<Record<string, string>>({ Colour: "Navy" });
  return (
    <div className="space-y-5">
      {kurta.options.map((o) => (
        <VariantSelector key={o.name} option={o} value={sel[o.name]} onChange={(v) => setSel((s) => ({ ...s, [o.name]: v }))} showError />
      ))}
    </div>
  );
}

export function QuantityDemo() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(3);
  return (
    <div className="flex flex-wrap gap-8">
      <div>
        <p className="mb-2 text-xs text-ink-secondary">Default (min reached)</p>
        <QuantityControl value={a} max={10} onChange={setA} label="Demo item A" />
      </div>
      <div>
        <p className="mb-2 text-xs text-ink-secondary">At inventory limit</p>
        <QuantityControl value={b} max={3} onChange={setB} label="Demo item B" />
      </div>
    </div>
  );
}

export function FormFieldDemo() {
  const [phone, setPhone] = useState("0300 12");
  const [submitted, setSubmitted] = useState(false);
  const invalid = submitted && !/^03\d{2}\s?\d{7}$/.test(phone.trim());
  const nameMissing = submitted;
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="max-w-md space-y-4"
    >
      {submitted && (
        <div role="alert" className="rounded-card border border-danger/40 bg-danger-soft p-3 text-sm">
          <p className="flex items-center gap-2 font-semibold text-danger">
            <AlertCircle aria-hidden className="size-4" /> 2 fields need attention
          </p>
          <ul className="mt-1 list-disc pl-6">
            <li>
              <a href="#demo-name" className="underline">
                Full name is required
              </a>
            </li>
            {invalid && (
              <li>
                <a href="#demo-phone" className="underline">
                  Mobile number format
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
      <div>
        <label htmlFor="demo-name" className="mb-1 block text-sm font-semibold">
          Full name
        </label>
        <input
          id="demo-name"
          aria-invalid={nameMissing || undefined}
          aria-describedby={nameMissing ? "demo-name-err" : undefined}
          className="h-11 w-full rounded-control border border-control bg-surface px-3 text-[16px] aria-invalid:border-danger aria-invalid:ring-1 aria-invalid:ring-danger"
        />
        {nameMissing && (
          <p id="demo-name-err" className="mt-1 text-sm text-danger">
            Enter the name the courier should ask for.
          </p>
        )}
      </div>
      <div>
        <label htmlFor="demo-phone" className="mb-1 block text-sm font-semibold">
          Mobile number
        </label>
        <p id="demo-phone-help" className="mb-1 text-xs text-ink-secondary">
          The courier calls this number before delivery. Format: 03XX XXXXXXX
        </p>
        <input
          id="demo-phone"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby={`demo-phone-help${invalid ? " demo-phone-err" : ""}`}
          className="tabular h-11 w-full rounded-control border border-control bg-surface px-3 text-[16px] aria-invalid:border-danger aria-invalid:ring-1 aria-invalid:ring-danger"
        />
        {invalid && (
          <p id="demo-phone-err" className="mt-1 text-sm text-danger">
            Enter an 11-digit mobile number starting with 03.
          </p>
        )}
      </div>
      <Button type="submit">Validate</Button>
    </form>
  );
}
