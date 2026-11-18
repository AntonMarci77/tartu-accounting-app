"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { useJournal } from "@/lib/store";
import { StatementsPanel } from "@/components/StatementsPanel";

export default function ReportsPage() {
  const { entries, chart, hydrated } = useJournal();
  if (!hydrated) return <div className="text-slate-500 text-sm">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ut-navy">Reports</h1>
          <p className="text-sm text-slate-600 mt-1">
            Auto-built from the journal: a Statement of Financial Position (Balance Sheet) and a Statement of Profit or Loss.
          </p>
        </div>
        <div className="flex gap-2 no-print">
          <Link
            href="/journal"
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm bg-white hover:bg-slate-50 transition"
          >
            <ArrowLeft size={14} /> Journal
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1 rounded-md bg-ut-dark text-white px-3 py-1.5 text-sm hover:bg-ut-navy transition"
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>
      <StatementsPanel entries={entries} chart={chart} variant="full" />
      <div className="no-print flex flex-wrap gap-2">
        <Link href="/cash-flow" className="inline-flex items-center gap-1 rounded-md border border-ut-medium text-ut-dark px-3 py-1.5 text-sm bg-white hover:bg-ut-light/30 transition">
          Statement of Cash Flows →
        </Link>
        <Link href="/notes" className="inline-flex items-center gap-1 rounded-md border border-ut-medium text-ut-dark px-3 py-1.5 text-sm bg-white hover:bg-ut-light/30 transition">
          Notes →
        </Link>
      </div>
      <p className="text-xs text-slate-500">
        Note: this is a teaching tool, not a substitute for an audited report. The "Profit / loss for the period" line in the
        Balance Sheet is derived from the difference between revenue and expense balances.
      </p>
    </div>
  );
}
