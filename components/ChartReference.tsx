"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, ListTree } from "lucide-react";
import {
  CHARTS,
  categoryBadgeColor,
  categoryLabel,
  type AccountCategory,
  type ChartKey,
} from "@/lib/data/charts";

const ORDER: AccountCategory[] = ["asset", "liability", "equity", "revenue", "expense"];

export function ChartReference({
  chart,
  defaultOpen = true,
}: {
  chart: ChartKey;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const accounts = CHARTS[chart].accounts;
  const grouped = useMemo(() => {
    const m: Record<AccountCategory, typeof accounts> = {
      asset: [],
      liability: [],
      equity: [],
      revenue: [],
      expense: [],
    };
    for (const a of accounts) m[a.category].push(a);
    return m;
  }, [accounts]);

  return (
    <article className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
      <header className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
        <ListTree size={16} className="text-ut-dark" />
        <h2 className="font-semibold text-ut-navy text-sm flex-1">Chart of accounts</h2>
        <span className="text-[10px] text-slate-500">{accounts.length} accounts</span>
        <Link href="/chart-of-accounts" className="text-xs text-ut-dark hover:underline">
          Full →
        </Link>
        <button
          aria-label={open ? "Collapse chart" : "Expand chart"}
          onClick={() => setOpen((v) => !v)}
          className="p-1 rounded hover:bg-slate-50"
        >
          <ChevronDown size={16} className={`text-slate-400 transition ${open ? "rotate-180" : ""}`} />
        </button>
      </header>
      {open && (
        <div className="max-h-[480px] overflow-y-auto scroll-thin px-4 py-3 space-y-3">
          {ORDER.map((cat) =>
            grouped[cat].length > 0 ? (
              <section key={cat}>
                <h3
                  className={`inline-block text-[10px] font-semibold uppercase tracking-wider mb-1 px-1.5 py-0.5 rounded ${categoryBadgeColor[cat]}`}
                >
                  {categoryLabel[cat]} · {grouped[cat].length}
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5">
                  {grouped[cat].map((a) => (
                    <li
                      key={a.code}
                      className="flex items-baseline gap-2 text-xs hover:bg-slate-50 rounded px-1 -mx-1"
                    >
                      <span className="font-mono text-[10px] text-slate-500 shrink-0 w-12">
                        {a.code}
                      </span>
                      <span className="text-slate-700 truncate flex-1" title={a.name}>
                        {a.name}
                      </span>
                      <span
                        className={`text-[9px] px-1 py-0.5 rounded shrink-0 ${
                          a.normal === "D" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}
                        title={a.normal === "D" ? "Debit balance" : "Credit balance"}
                      >
                        {a.normal}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null
          )}
        </div>
      )}
    </article>
  );
}
