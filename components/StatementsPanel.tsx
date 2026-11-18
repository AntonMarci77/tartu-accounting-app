"use client";

import { useMemo } from "react";
import { cashClass, findAccount, isOpeningAccount, type Account, type ChartKey } from "@/lib/data/charts";
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
        if (r) r.balance += side(r.account) * e.amount;
      }
      if (e.credit) {
        const r = getOrInit(e.credit.toUpperCase());
        if (r) r.balance -= side(r.account) * e.amount;
      }
    }
    return Array.from(m.values()).sort((a, b) => a.account.code.localeCompare(b.account.code));
  }, [entries, chart]);

  // The technical opening-balance account must net to zero and is not part of the statements.
  const openingRow = balances.find((r) => isOpeningAccount(r.account.code, chart));
  const openingDiff = openingRow ? openingRow.balance : 0;
  const stmt = balances.filter((r) => !isOpeningAccount(r.account.code, chart));

  const assets = stmt.filter((r) => r.account.category === "asset");
  const liabilities = stmt.filter((r) => r.account.category === "liability");
  const equity = stmt.filter((r) => r.account.category === "equity");
  const revenues = stmt.filter((r) => r.account.category === "revenue");
  const expenses = stmt.filter((r) => r.account.category === "expense");

  const sum = (arr: Line[]) => arr.reduce((s, l) => s + l.balance, 0);
  const totalAssets = sum(assets);
  const totalLiabilities = sum(liabilities);
  const totalEquity = sum(equity);
  const totalRevenue = sum(revenues);
  const totalExpenses = sum(expenses);
  const profitOrLoss = totalRevenue - totalExpenses;
  // Operating profit = result before financial items and corporate income tax (not available for the super-simplified chart)
  const belowOperating = [...revenues, ...expenses].filter((r) => cashClass(r.account.code, chart) === "PL_FIN");
  const operatingProfit =
    profitOrLoss - belowOperating.reduce((s, r) => s + (r.account.category === "revenue" ? r.balance : -r.balance), 0);
  const totalLE = totalLiabilities + totalEquity + profitOrLoss;
  const balanced = Math.abs(totalAssets - totalLE) < 0.01;
  const empty = stmt.length === 0;
  const compact = variant === "compact";

  return (
    <div className={compact ? "space-y-3" : "grid lg:grid-cols-2 gap-4"}>
      <article className="bg-white rounded-2xl shadow-card border border-slate-100 p-4 sm:p-5">
        <header className="border-b border-slate-100 pb-2 mb-3 flex items-center justify-between gap-2">
          <h2 className="font-semibold text-ut-navy text-sm sm:text-base">Statement of Financial Position <span className="font-normal text-slate-500">(balance sheet)</span></h2>
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
            {Math.abs(openingDiff) >= 0.01 && (
              <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-100 rounded px-2 py-1">
                The opening-balance account does not net to zero (Δ {formatEUR(openingDiff, false)}) - an opening balance is missing or wrong.
              </p>
            )}
          </div>
        )}
      </article>

      <article className="bg-white rounded-2xl shadow-card border border-slate-100 p-4 sm:p-5">
        <header className="border-b border-slate-100 pb-2 mb-3">
          <h2 className="font-semibold text-ut-navy text-sm sm:text-base">Statement of Profit or Loss <span className="font-normal text-slate-500">(income statement)</span></h2>
        </header>
        {empty ? (
          <Empty />
        ) : (
          <div className="space-y-3 text-sm">
            <Section title="Revenue" lines={revenues} total={totalRevenue} accent />
            <Section title="Expenses" lines={expenses} total={totalExpenses} />
            {belowOperating.length > 0 && (
              <div className="flex justify-between text-sm text-slate-700">
                <span>Operating profit (before financial items and income tax)</span>
                <span className="tabular-nums">{formatEUR(operatingProfit)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-semibold">
              <span className={profitOrLoss >= 0 ? "text-emerald-700" : "text-rose-700"}>
                {profitOrLoss >= 0 ? "Net profit" : "Net loss"} for the period
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

// Assets and expenses are debit-positive; liabilities, equity and revenue are credit-positive.
// A contra account (e.g. accumulated depreciation) therefore shows as a negative asset.
function side(acc: Account): 1 | -1 {
  return acc.category === "asset" || acc.category === "expense" ? 1 : -1;
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
