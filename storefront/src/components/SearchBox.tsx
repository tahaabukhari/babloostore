"use client";

import { History, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { categories, suggest } from "@/lib/data";

const RECENT_KEY = "hb-recent-searches";

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

// ARIA 1.2 combobox: input owns a listbox of suggestions; arrows move the
// active option, Enter submits it, Escape closes then clears.
export function SearchBox({ id: idProp }: { id?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const autoId = useId();
  const id = idProp ?? autoId;
  const listId = `${id}-list`;
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setQuery(params.get("q") ?? ""), [params]);
  useEffect(() => setRecent(readRecent()), []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const matches = suggest(query);
  const options: { key: string; label: string; kind: "product" | "recent" | "category"; value: string }[] = query
    ? [
        ...matches.map((p) => ({ key: p.slug, label: p.title, kind: "product" as const, value: p.slug })),
        ...categories
          .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
          .map((c) => ({ key: c.slug, label: `in ${c.name}`, kind: "category" as const, value: c.slug })),
      ]
    : recent.map((r) => ({ key: `r-${r}`, label: r, kind: "recent" as const, value: r }));

  function go(q: string) {
    const term = q.trim();
    setOpen(false);
    if (!term) return;
    const next = [term, ...recent.filter((r) => r !== term)].slice(0, 5);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {}
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  function choose(i: number) {
    const o = options[i];
    if (!o) return go(query);
    if (o.kind === "product") {
      setOpen(false);
      router.push(`/product/${o.value}`);
    } else if (o.kind === "category") {
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(query)}&category=${o.value}`);
    } else go(o.value);
  }

  function clearRecent() {
    setRecent([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {}
  }

  const showList = open && options.length > 0;

  return (
    <div ref={wrapRef} className="relative w-full">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (active >= 0) choose(active);
          else go(query);
        }}
      >
        <label htmlFor={id} className="sr-only">
          Search BablooStore
        </label>
        <div className="flex h-11 items-stretch overflow-hidden rounded-control bg-surface ring-1 ring-transparent focus-within:ring-2 focus-within:ring-gold">
          <Search aria-hidden className="ml-3 size-5 self-center text-ink-secondary" />
          <input
            ref={inputRef}
            id={id}
            type="text"
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            autoComplete="off"
            value={query}
            placeholder="Search lawn, attar, earbuds…"
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(-1);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setOpen(true);
                setActive((a) => Math.min(options.length - 1, a + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(-1, a - 1));
              } else if (e.key === "Escape") {
                if (open) setOpen(false);
                else setQuery("");
                setActive(-1);
              }
            }}
            className="min-w-0 flex-1 bg-transparent px-2 text-[16px] text-ink outline-none placeholder:text-ink-secondary focus-visible:outline-none"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                setActive(-1);
                inputRef.current?.focus();
              }}
              className="grid w-10 place-items-center text-ink-secondary hover:text-ink"
            >
              <X aria-hidden className="size-4" />
            </button>
          )}
          <button
            type="submit"
            className="bg-gold px-4 text-sm font-semibold text-ink transition-hb transition-colors hover:bg-gold-hover"
          >
            Search
          </button>
        </div>
      </form>

      {showList && (
        <div className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-card border border-border bg-surface text-ink shadow-overlay">
          {!query && (
            <div className="flex items-center justify-between px-3 pt-2 text-xs text-ink-secondary">
              <span>Recent searches (saved on this device only)</span>
              <button type="button" onClick={clearRecent} className="rounded px-1 py-1 font-semibold text-gold-ink hover:underline">
                Clear
              </button>
            </div>
          )}
          <ul id={listId} role="listbox" aria-label="Search suggestions" className="py-1">
            {options.map((o, i) => (
              <li
                key={o.key}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(i)}
                onMouseEnter={() => setActive(i)}
                className={`flex min-h-11 cursor-pointer items-center gap-2 px-3 text-sm ${i === active ? "bg-gold-soft" : ""}`}
              >
                {o.kind === "recent" ? (
                  <History aria-hidden className="size-4 text-ink-secondary" />
                ) : (
                  <Search aria-hidden className="size-4 text-ink-secondary" />
                )}
                <span className="truncate">
                  {o.kind === "category" ? (
                    <>
                      <span className="font-semibold">{query}</span> <span className="text-ink-secondary">{o.label}</span>
                    </>
                  ) : (
                    o.label
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
