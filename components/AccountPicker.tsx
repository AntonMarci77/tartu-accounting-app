"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { Account, ChartKey } from "@/lib/data/charts";
import { CHARTS, categoryBadgeColor } from "@/lib/data/charts";

type Props = {
  value: string;
  onChange: (code: string) => void;
  chart: ChartKey;
  placeholder?: string;
  label?: string;
  className?: string;
  onConfirm?: () => void; // when user picks a value via Enter or click
};

export const AccountPicker = forwardRef<HTMLInputElement, Props>(function AccountPicker(
  { value, onChange, chart, placeholder = "code or name…", label, className = "", onConfirm },
  ref
) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [query, setQuery] = useState(value);

  useEffect(() => setQuery(value), [value]);

  const accounts = CHARTS[chart].accounts;
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accounts.slice(0, 30);
    return accounts
      .filter((a) => a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q))
      .slice(0, 30);
  }, [query, accounts]);

  function pick(a: Account) {
    onChange(a.code);
    setQuery(a.code);
    setOpen(false);
    onConfirm?.();
  }

  function setRef(el: HTMLInputElement | null) {
    inputRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
  }

  return (
    <div className={`relative ${className}`}>
      {label && <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>}
      <input
        ref={setRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Delay so click on suggestion still fires
          setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setHighlight((h) => Math.min(h + 1, matches.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter") {
            if (open && matches[highlight]) {
              e.preventDefault();
              pick(matches[highlight]);
            } else {
              onConfirm?.();
            }
          } else if (e.key === "Escape") {
            setOpen(false);
          } else if (e.key === "Tab" && !e.shiftKey) {
            // Auto-fill if there's a clear single match before advancing
            if (open && matches[highlight]) {
              if (matches.length === 1 || query.toLowerCase() === matches[highlight].code.toLowerCase()) {
                onChange(matches[highlight].code);
              }
            }
            e.preventDefault();
            setOpen(false);
            onConfirm?.();
          }
        }}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ut-medium focus:border-ut-medium"
        autoComplete="off"
        spellCheck={false}
      />
      {open && matches.length > 0 && (
        <ul className="absolute z-20 left-0 right-0 mt-1 max-h-72 overflow-auto scroll-thin rounded-md border border-slate-200 bg-white shadow-lg">
          {matches.map((a, i) => (
            <li
              key={a.code}
              className={`px-2 py-1.5 text-sm flex items-center justify-between gap-2 cursor-pointer ${
                i === highlight ? "bg-ut-light/40" : "hover:bg-slate-50"
              }`}
              onMouseDown={() => pick(a)}
              onMouseEnter={() => setHighlight(i)}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">{a.code}</span>
                <span className="truncate">{a.name}</span>
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${categoryBadgeColor[a.category]} shrink-0`}>
                {a.category}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
