"use client";

import { forwardRef, useEffect, useState } from "react";
import { formatEUR, parseEUR } from "@/lib/format";

type Props = {
  value: number;
  onChange: (n: number) => void;
  onConfirm?: () => void;
  className?: string;
  placeholder?: string;
};

export const AmountInput = forwardRef<HTMLInputElement, Props>(function AmountInput(
  { value, onChange, onConfirm, className = "", placeholder = "0,00" },
  ref
) {
  // Show formatted while idle, raw entry while focused
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(value ? value.toString().replace(".", ",") : "");

  useEffect(() => {
    if (!focused) setDraft(value ? formatEUR(value, false) : "");
  }, [value, focused]);

  return (
    <input
      ref={ref}
      inputMode="decimal"
      placeholder={placeholder}
      value={focused ? draft : value ? formatEUR(value, false) : ""}
      onFocus={(e) => {
        setFocused(true);
        setDraft(value ? value.toString().replace(".", ",") : "");
        e.currentTarget.select();
      }}
      onChange={(e) => {
        const v = e.target.value;
        setDraft(v);
        onChange(parseEUR(v));
      }}
      onBlur={() => setFocused(false)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) {
          e.preventDefault();
          onConfirm?.();
        }
      }}
      className={`w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-ut-medium focus:border-ut-medium ${className}`}
    />
  );
});
