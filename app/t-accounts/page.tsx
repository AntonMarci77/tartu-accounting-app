"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useJournal } from "@/lib/store";
import { TAccountsGrid } from "@/components/TAccountsGrid";

export default function TAccountsPage() {
  const { entries, chart, hydrated } = useJournal();
  if (!hydrated) return <div className="text-slate-500 text-sm">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ut-navy">T-accounts</h1>
          <p className="text-sm text-slate-600 mt-1">
            Each account in the journal is shown as a T — debits on the left, credits on the right. Closing balance follows the
            natural side of the account.
          </p>
        </div>
        <Link
          href="/journal"
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm bg-white hover:bg-slate-50 transition"
        >
          <ArrowLeft size={14} /> Back to journal
        </Link>
      </div>
      <TAccountsGrid entries={entries} chart={chart} density="normal" />
    </div>
  );
}
