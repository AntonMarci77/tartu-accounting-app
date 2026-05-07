"use client";

import { forwardRef, useEffect, useState } from "react";
import { formatEUDate, parseEUDate } from "@/lib/format";

type Props = {
  value: string; // ISO YYYY-MM-DD
  onChange: (iso: string) => void;
  onConfirm?: () => void;
  className?: string;
  placeholder?: string;
};

export const DateInput = forwardRef<HTMLInputElement, Props>(function DateInput(
  { value, onChange, onConfirm, className = "", placeholder = "DD/MM/YY" },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(formatEUDate(value));

  useEffect(() => {
    if (!focused) setDraft(formatEUDate(value));
  }, [value, focused]);

  return (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={focused ? draft : formatEUDate(value)}
      onFocus={(e) => {
        setFocused(true);
        setDraft(formatEUDate(value));
        e.currentTarget.select();
      }}
      onChange={(e) => {
        let v = e.target.value;
        // Auto-insert slashes as user types digits
        const digits = v.replace(/\D/g, "").slice(0, 8);
        let out = digits;
        if (digits.length > 4) out = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
        else if (digits.length > 2) out = `${digits.slice(0, 2)}/${digits.slice(2)}`;
        setDraft(out);
        const iso = parseEUDate(out);
        if (iso) onChange(iso);
        else if (digits.length === 0) onChange("");
      }}
      onBlur={() => {
        setFocused(false);
        const iso = parseEUDate(draft);
        if (iso) onChange(iso);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) {
          e.preventDefault();
          const iso = parseEUDate(draft);
          if (iso) onChange(iso);
          onConfirm?.();
        }
      }}
      className={`w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ut-medium focus:border-ut-medium ${className}`}
      autoComplete="off"
    />
  );
});
