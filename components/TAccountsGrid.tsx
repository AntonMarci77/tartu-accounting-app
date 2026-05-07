"use client";

import { useMemo } from "react";
import { CHARTS, categoryBadgeColor, findAccount, type Account, type ChartKey } from "@/lib/data/charts";
import { formatEUR, formatEUDate } from "@/lib/format";
import type { JournalEntry } from "@/lib/store";

type Posting = { date: string; doc: string; description: string; amount: number; counter: string };

type Bucket = {
  account: Account;
  debits: Posting[];
  credits: Posting[];
};

export function TAccountsGrid({
  entries,
  chart,
  density = "normal",
  twoColumns = false,
}: {
  entries: JournalEntry[];
  chart: ChartKey;
  density?: "normal" | "compact";
  twoColumns?: boolean;
}) {
  const buckets = useMemo(() => {
    const m = new Map<string, Bucket>();
    function getOrInit(code: string) {
      let b = m.get(code);
      if (!b) {
        const acc = findAccount(code, chart);
        if (!acc) {
          b = {
            account: { code, name: "(unknown)", category: "asset", normal: "D" },
            debits: [],
            credits: [],
          };
        } else {
          b = { account: acc, debits: [], credits: [] };
        }
        m.set(code, b);
      }
      return b;
    }
    for (const e of entries) {
      if (!e.amount || (!e.debit && !e.credit)) continue;
      if (e.debit) {
        const b = getOrInit(e.debit.toUpperCase());
        b.debits.push({
          date: e.date,
          doc: e.doc,
          description: e.description,
          amount: e.amount,
          counter: e.credit,
        });
      }
      if (e.credit) {
        const b = getOrInit(e.credit.toUpperCase());
        b.credits.push({
          date: e.date,
          doc: e.doc,
          description: e.description,
          amount: e.amount,
          counter: e.debit,
        });
      }
    }
    return Array.from(m.values()).sort((a, b) => a.account.code.localeCompare(b.account.code));
  }, [entries, chart]);

  if (buckets.length === 0) {
    return (
      <p className="text-sm italic text-slate-400">
        No postings yet. Fill the journal — accounts will appear as soon as a transaction has both Dr and Cr with an amount.
      </p>
    );
  }

  const gridCols = twoColumns ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid ${gridCols} gap-3`}>
      {buckets.map((b) => (
        <TAccountCard key={b.account.code} bucket={b} density={density} />
      ))}
    </div>
  );
}

function TAccountCard({ bucket, density }: { bucket: Bucket; density: "normal" | "compact" }) {
  const sumD = bucket.debits.reduce((s, p) => s + p.amount, 0);
  const sumC = bucket.credits.reduce((s, p) => s + p.amount, 0);
  const balance = sumD - sumC;
  const onDebit = bucket.account.normal === "D";
  const closingSide: "D" | "C" = balance >= 0 ? "D" : "C";

  return (
    <article className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
      <header className="px-3 py-2 border-b border-slate-100 bg-gradient-to-r from-ut-navy/5 to-transparent flex items-center gap-2">
        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">
          {bucket.account.code}
        </span>
        <h3 className="font-semibold text-ut-navy text-sm truncate flex-1">{bucket.account.name}</h3>
        <span className={`text-[9px] px-1.5 py-0.5 rounded ${categoryBadgeColor[bucket.account.category]}`}>
          {bucket.account.category}
        </span>
      </header>
      <div className="grid grid-cols-2 divide-x divide-slate-100">
        <Side title="Dr" postings={bucket.debits} total={sumD} naturalHere={onDebit} density={density} />
        <Side title="Cr" postings={bucket.credits} total={sumC} naturalHere={!onDebit} density={density} />
      </div>
      <footer className="border-t border-slate-100 px-3 py-1.5 flex items-center justify-between text-xs">
        <span className="text-slate-500">Balance</span>
        <span className="tabular-nums font-medium">
          {formatEUR(Math.abs(balance), false)}{" "}
          <span
            className={`ml-1 text-[9px] px-1.5 py-0.5 rounded ${
              closingSide === "D" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {closingSide === "D" ? "Dr" : "Cr"}
          </span>
        </span>
      </footer>
    </article>
  );
}

function Side({
  title,
  postings,
  total,
  naturalHere,
  density,
}: {
  title: string;
  postings: Posting[];
  total: number;
  naturalHere: boolean;
  density: "normal" | "compact";
}) {
  return (
    <div className={density === "compact" ? "p-2" : "p-3"}>
      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
        <span className="font-medium text-slate-700">{title}</span>
        {naturalHere && <span className="text-[9px] uppercase tracking-wide text-emerald-700">natural</span>}
      </div>
      {postings.length === 0 ? (
        <p className="text-[11px] text-slate-300 italic py-1">—</p>
      ) : (
        <ul className="space-y-0.5">
          {postings.map((p, i) => (
            <li key={i} className="text-[11px] flex items-baseline gap-1.5">
              <span className="text-slate-400 w-9 shrink-0 tabular-nums text-[10px]">
                {p.date ? formatEUDate(p.date) : "—"}
              </span>
              <span className="truncate text-slate-700 flex-1" title={p.description}>
                {p.counter && <span className="font-mono text-[9px] text-slate-400">/{p.counter}</span>}{" "}
                {p.description || p.doc || ""}
              </span>
              <span className="tabular-nums shrink-0 font-medium">{formatEUR(p.amount, false)}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-baseline justify-between text-[11px]">
        <span className="text-slate-500">Total</span>
        <span className="tabular-nums font-medium">{formatEUR(total, false)}</span>
      </div>
    </div>
  );
}
