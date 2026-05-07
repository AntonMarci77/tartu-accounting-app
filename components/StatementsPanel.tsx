"use client";

import { useMemo } from "react";
import { CHARTS, findAccount, type Account, type ChartKey } from "@/lib/data/charts";
import { formatEUR } from "@/lib/format";
import type { JournalEntry } from "@/lib/store";

type Line = { account: Account; balance: number };

export function StatementsPanel({
  entries,
  chart,
  variant = "full",
}: {
  entries: JournalEntry[];
  chart: ChartKey;
  variant?: "full" | "compact";
}) {
  const balances = useMemo(() => {
    const m = new Map<string, { account: Account; balance: number }>();
    function getOrInit(code: string) {
      let row = m.get(code);
      if (!row) {
        const acc = findAccount(code, chart);
        if (!acc) return null;
        row = { account: acc, balance: 0 };
        m.set(code, row);
      }
      return row;
    }
    for (const e of entries) {
      if (!e.amount) continue;
      if (e.debit) {
        const r = getOrInit(e.debit.toUpperCase());
        if (r) r.balance += r.account.normal === "D" ? e.amount : -e.amount;
      }
      if (e.credit) {
        const r = getOrInit(e.credit.toUpperCase());
        if (r) r.balance += r.account.normal === "C" ? e.amount : -e.amount;
      }
    }
    return Array.from(m.values());
  }, [entries, chart]);

  const assets = balances.filter((r) => r.account.category === "asset");
  const liabilities = balances.filter((r) => r.account.category === "liability");
  const equity = balances.filter((r) => r.account.category === "equity");
  const revenues = balances.filter((r) => r.account.category === "revenue");
  const expenses = balances.filter((r) => r.account.category === "expense");

  const sum = (arr: Line[]) => arr.reduce((s, l) => s + l.balance, 0);
  const totalAssets = sum(assets);
  const totalLiabilities = sum(liabilities);
  const totalEquity = sum(equity);
  const totalRevenue = sum(revenues);
  const totalExpenses = sum(expenses);
  const profitOrLoss = totalRevenue - totalExpenses;
  const totalLE = totalLiabilities + totalEquity + profitOrLoss;
  const balanced = Math.abs(totalAssets - totalLE) < 0.01;
  const empty = balances.length === 0;
  const compact = variant === "compact";

  return (
    <div className={compact ? "space-y-3" : "grid lg:grid-cols-2 gap-4"}>
      <article className="bg-white rounded-2xl shadow-card border border-slate-100 p-4 sm:p-5">
        <header className="border-b border-slate-100 pb-2 mb-3 flex items-center justify-between gap-2">
          <h2 className="font-semibold text-ut-navy text-sm sm:text-base">Statement of Financial Position</h2>
          {!empty && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded ${
                balanced ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
              }`}
            >
              {balanced ? "balanced" : `Δ ${formatEUR(totalAssets - totalLE, false)}`}
            </span>
          )}
        </header>
        {empty ? (
          <Empty />
        ) : (
          <div className="space-y-3 text-sm">
            <Section title="Assets" lines={assets} total={totalAssets} accent />
            <Section title="Liabilities" lines={liabilities} total={totalLiabilities} />
            <Section title="Equity" lines={equity} total={totalEquity} extra={
              profitOrLoss !== 0 ? { label: "Profit / loss for the period", value: profitOrLoss } : undefined
            } extraInTotal={profitOrLoss} />
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-medium">
              <span>Total liabilities + equity</span>
              <span className="tabular-nums">{formatEUR(totalLE)}</span>
            </div>
          </div>
        )}
      </article>

      <article className="bg-white rounded-2xl shadow-card border border-slate-100 p-4 sm:p-5">
        <header className="border-b border-slate-100 pb-2 mb-3">
          <h2 className="font-semibold text-ut-navy text-sm sm:text-base">Statement of Profit or Loss</h2>
        </header>
        {empty ? (
          <Empty />
        ) : (
          <div className="space-y-3 text-sm">
            <Section title="Revenue" lines={revenues} total={totalRevenue} accent />
            <Section title="Expenses" lines={expenses} total={totalExpenses} />
            <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-semibold">
              <span className={profitOrLoss >= 0 ? "text-emerald-700" : "text-rose-700"}>
                {profitOrLoss >= 0 ? "Profit" : "Loss"} for the period
              </span>
              <span
                className={`tabular-nums ${profitOrLoss >= 0 ? "text-emerald-700" : "text-rose-700"}`}
              >
                {formatEUR(profitOrLoss)}
              </span>
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

function Section({
  title,
  lines,
  total,
  accent,
  extra,
  extraInTotal,
}: {
  title: string;
  lines: Line[];
  total: number;
  accent?: boolean;
  extra?: { label: string; value: number };
  extraInTotal?: number;
}) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ut-medium mb-1">{title}</h3>
      {lines.length === 0 && !extra ? (
        <p className="text-xs italic text-slate-400">no balances</p>
      ) : (
        <div className="divide-y divide-slate-50">
          {lines.map((l) => (
            <div key={l.account.code} className="flex justify-between items-baseline py-0.5">
              <span className="flex items-baseline gap-1.5 min-w-0 text-sm">
                <span className="font-mono text-[10px] text-slate-400 shrink-0">{l.account.code}</span>
                <span className="text-slate-700 truncate">{l.account.name}</span>
              </span>
              <span className="tabular-nums text-slate-800 text-sm">{formatEUR(l.balance)}</span>
            </div>
          ))}
          {extra && (
            <div className="flex justify-between py-0.5 text-sm">
              <span className="text-slate-700 italic">{extra.label}</span>
              <span className="tabular-nums">{formatEUR(extra.value)}</span>
            </div>
          )}
        </div>
      )}
      <div
        className={`flex justify-between pt-1 mt-1 border-t border-slate-200 text-sm font-medium ${
          accent ? "text-ut-navy" : "text-slate-800"
        }`}
      >
        <span>Total {title.toLowerCase()}</span>
        <span className="tabular-nums">{formatEUR(total + (extraInTotal ?? 0))}</span>
      </div>
    </div>
  );
}

function Empty() {
  return <p className="text-xs italic text-slate-400">no balances yet — book a transaction in the journal.</p>;
}
