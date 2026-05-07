"use client";

import { useMemo, useState } from "react";
import { CHARTS, categoryBadgeColor, categoryLabel, type AccountCategory, type ChartKey } from "@/lib/data/charts";
import { Download, Search } from "lucide-react";

const downloadFile: Record<ChartKey, string> = {
  super: "/data/chart-super-simplified.json",
  simplified: "/data/chart-simplified.json",
  estonia: "/data/chart-estonia.json",
};

export default function ChartOfAccountsPage() {
  const [chart, setChart] = useState<ChartKey>("simplified");
  const [filter, setFilter] = useState<"all" | AccountCategory>("all");
  const [query, setQuery] = useState("");

  const accounts = CHARTS[chart].accounts;
  const filtered = useMemo(() => {
    let list = accounts;
    if (filter !== "all") list = list.filter((a) => a.category === filter);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((a) => a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q));
    return list;
  }, [accounts, filter, query]);

  const counts: Record<AccountCategory | "all", number> = {
    all: accounts.length,
    asset: accounts.filter((a) => a.category === "asset").length,
    liability: accounts.filter((a) => a.category === "liability").length,
    equity: accounts.filter((a) => a.category === "equity").length,
    revenue: accounts.filter((a) => a.category === "revenue").length,
    expense: accounts.filter((a) => a.category === "expense").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ut-navy">Chart of Accounts</h1>
          <p className="text-sm text-slate-600 mt-1">
            Three levels of detail. Use the super-simplified one for the very first lessons; switch to the Estonian e-Financials chart for realistic exercises.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">Download JSON:</span>
          {(["super", "simplified", "estonia"] as ChartKey[]).map((k) => (
            <a
              key={k}
              href={downloadFile[k]}
              download
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs hover:border-ut-medium hover:text-ut-dark transition"
            >
              <Download size={12} /> {k === "super" ? "Super" : k === "simplified" ? "Simplified" : "Estonian"}
            </a>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-white rounded-xl border border-slate-100 shadow-card p-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">Chart</label>
          <select
            value={chart}
            onChange={(e) => setChart(e.target.value as ChartKey)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm bg-white"
          >
            {Object.values(CHARTS).map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search size={14} className="text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by code or name…"
            className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ut-medium focus:border-ut-medium"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterPill label={`All (${counts.all})`} active={filter === "all"} onClick={() => setFilter("all")} />
        {(["asset", "liability", "equity", "revenue", "expense"] as AccountCategory[]).map((c) => (
          <FilterPill
            key={c}
            label={`${categoryLabel[c]} (${counts[c]})`}
            active={filter === c}
            onClick={() => setFilter(c)}
            color={categoryBadgeColor[c]}
          />
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto scroll-thin max-h-[70vh]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-ut-navy text-white">
              <tr className="text-left">
                <th className="px-3 py-2 w-24">Code</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2 w-32">Category</th>
                <th className="px-3 py-2 w-24 text-center">Normal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.code} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-3 py-1.5 font-mono text-xs text-slate-700">{a.code}</td>
                  <td className="px-3 py-1.5 text-slate-800">{a.name}</td>
                  <td className="px-3 py-1.5">
                    <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded ${categoryBadgeColor[a.category]}`}>
                      {categoryLabel[a.category]}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-center">
                    <span
                      className={`inline-block text-[10px] px-1.5 py-0.5 rounded ${
                        a.normal === "D" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {a.normal === "D" ? "Debit" : "Credit"}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-slate-400 italic">
                    No accounts match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <Tip
          title="Why three levels?"
          body="The first lesson works best with just 7 accounts so students can focus on debit/credit logic without being overwhelmed by codes. The simplified chart adds enough realism to talk about receivables, payroll, depreciation. The Estonian e-Financials chart is what real Estonian companies actually post against."
        />
        <Tip
          title="Reading the chart"
          body="The 'Normal' column tells you which side increases the account. Debits increase Assets and Expenses; credits increase Liabilities, Equity and Revenue. (Accumulated depreciation is a contra-asset — it sits on the asset side but its natural balance is credit.)"
        />
      </div>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs border transition ${
        active
          ? "bg-ut-navy text-white border-ut-navy"
          : `bg-white border-slate-200 hover:border-ut-medium ${color ?? "text-slate-600"}`
      }`}
    >
      {label}
    </button>
  );
}

function Tip({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-ut-light/40 bg-ut-light/10 p-4">
      <h3 className="font-semibold text-ut-navy mb-1">{title}</h3>
      <p className="text-slate-700">{body}</p>
    </div>
  );
}
