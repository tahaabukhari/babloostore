"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

/**
 * Near-real-time updates: re-fetches the server component every `seconds`
 * while the tab is visible (Neon has no push channel; polling is cheap here).
 */
export function AutoRefresh({ seconds = 15 }: { seconds?: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [last, setLast] = useState<Date | null>(null);

  useEffect(() => {
    setLast(new Date());
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      start(() => router.refresh());
      setLast(new Date());
    };
    const id = setInterval(tick, seconds * 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [router, seconds]);

  return (
    <button
      type="button"
      onClick={() => {
        start(() => router.refresh());
        setLast(new Date());
      }}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-control px-2 text-xs text-ink-secondary hover:bg-surface-muted"
    >
      <RefreshCw aria-hidden className={`size-3.5 ${pending ? "animate-spin" : ""}`} />
      <span>
        Live · updated{" "}
        {last ? last.toLocaleTimeString("en-PK", { hour: "numeric", minute: "2-digit", second: "2-digit" }) : "now"}
      </span>
    </button>
  );
}
