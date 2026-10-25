"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useRef, useState } from "react";

type Tone = "success" | "info" | "error";
type Toast = { id: number; tone: Tone; message: string; action?: { label: string; onClick: () => void } };

const ToastContext = createContext<((t: Omit<Toast, "id">) => void) | null>(null);

const toneStyles: Record<Tone, { cls: string; Icon: typeof Info }> = {
  success: { cls: "border-green/30", Icon: CheckCircle2 },
  info: { cls: "border-info/30", Icon: Info },
  error: { cls: "border-danger/40", Icon: XCircle },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = ++seq.current;
      setToasts((prev) => [...prev.slice(-2), { ...t, id }]);
      setTimeout(() => dismiss(id), 6000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        role="status"
        aria-live="polite"
        // Top on phones so toasts never cover the sticky purchase bar or the options above it.
        className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:top-auto lg:items-end lg:pr-8"
      >
        {toasts.map((t) => {
          const { cls, Icon } = toneStyles[t.tone];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-card border bg-ink p-3 text-white shadow-overlay on-dark ${cls}`}
              style={{ animation: "hb-toast-in var(--hb-motion-panel) ease-out" }}
            >
              <Icon
                aria-hidden
                className={`mt-0.5 size-5 shrink-0 ${t.tone === "error" ? "text-[#ff9b8f]" : t.tone === "success" ? "text-[#8fd3b0]" : "text-gold-soft"}`}
              />
              <p className="flex-1 text-sm">{t.message}</p>
              {t.action && (
                <button
                  type="button"
                  onClick={() => {
                    t.action!.onClick();
                    dismiss(t.id);
                  }}
                  className="min-h-8 rounded-md px-2 text-sm font-semibold text-gold underline-offset-2 hover:underline"
                >
                  {t.action.label}
                </button>
              )}
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="grid size-8 place-items-center rounded-md text-white/80 hover:bg-white/10"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
