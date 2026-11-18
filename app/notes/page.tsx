"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, RotateCcw } from "lucide-react";
import { useJournal } from "@/lib/store";
import { assetMovement, buildLedger, ledgerTotals, type LedgerRow } from "@/lib/ledger";
import { computeCashFlow } from "@/lib/cashflow";
import { EE_TAX, splitGross } from "@/lib/tax";
import { isOpeningAccount, type ChartKey } from "@/lib/data/charts";
import { formatEUR } from "@/lib/format";

// ---------------------------------------------------------------------------
// Size categories - Estonian Accounting Act, § 3 (version in force 20.07.2025 - 31.12.2026)
// A category applies when at most one of the three indicators exceeds its limit.
// ---------------------------------------------------------------------------
type Size = "micro" | "small" | "medium" | "large";
const LIMITS: { size: Exclude<Size, "large">; assets: number; income: number; employees: number }[] = [
  { size: "micro", assets: 450_000, income: 900_000, employees: 10 },
  { size: "small", assets: 7_500_000, income: 15_000_000, employees: 50 },
  { size: "medium", assets: 25_000_000, income: 50_000_000, employees: 250 },
];

function sizeOf(assets: number, income: number, employees: number): Size {
  for (const l of LIMITS) {
    const within = [assets <= l.assets, income <= l.income, employees <= l.employees].filter(Boolean).length;
    if (within >= 2) return l.size;
  }
  return "large";
}

const SIZE_LABEL: Record<Size, string> = {
  micro: "Micro undertaking",
  small: "Small undertaking",
  medium: "Medium-sized undertaking",
  large: "Large undertaking",
};

const SIZE_CONTENT: Record<Size, string> = {
  micro:
    "Abridged annual accounts: balance sheet, income statement and a few notes (RTJ 15, par. 60). No cash flow statement, no statement of changes in equity, management report optional.",
  small:
    "Abridged annual accounts: balance sheet, income statement and the notes listed in RTJ 15, par. 59, plus a management report. Cash flow statement and statement of changes in equity are not required.",
  medium:
    "Full annual accounts: balance sheet, income statement, cash flow statement, statement of changes in equity and full notes (RTJ 15, par. 5-58), plus a management report.",
  large:
    "Full annual accounts: balance sheet, income statement, cash flow statement, statement of changes in equity and full notes (RTJ 15, par. 5-58), plus a management report.",
};

type Scope = "micro" | "small" | "full";
const SCOPE_OF: Record<Size, Scope> = { micro: "micro", small: "small", medium: "full", large: "full" };

// ---------------------------------------------------------------------------
// Free-text answers are kept in the browser only.
// ---------------------------------------------------------------------------
const KEY = "tartu.notes.v1";
type NotesState = {
  company: string;
  period: string;
  employees: number;
  scopeOverride: "" | Scope;
  text: Record<string, string>;
  loan12: number; // falling due within 12 months
  loan5: number; // falling due after more than 5 years
};
const EMPTY: NotesState = { company: "", period: "", employees: 0, scopeOverride: "", text: {}, loan12: -1, loan5: 0 };

const POLICY_TEMPLATE =
  "The annual accounts have been prepared in accordance with the Estonian financial reporting standard (Accounting Act and the guidelines of the Estonian Accounting Standards Board). They are presented in euros.\n" +
  "Property, plant and equipment is carried at cost less accumulated depreciation; straight-line depreciation over a useful life of ___ years.\n" +
  "Inventories are carried at the lower of cost and net realisable value (cost formula: ___).\n" +
  "Revenue is recognised when the goods are delivered or the service is rendered.\n" +
  "Corporate income tax: profit is taxed when it is distributed. The income tax on dividends is recognised as an expense and a liability when the dividends are declared.";

export default function NotesPage() {
  const { entries, chart, hydrated } = useJournal();
  const [st, setSt] = useState<NotesState>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSt({ ...EMPTY, ...JSON.parse(raw) });
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(st));
  }, [st, ready]);

  const rows = useMemo(() => buildLedger(entries, chart), [entries, chart]);
  const totals = useMemo(() => ledgerTotals(rows, chart), [rows, chart]);
  const mov = useMemo(() => assetMovement(rows, chart), [rows, chart]);
  const cf = useMemo(() => computeCashFlow(entries, chart), [entries, chart]);

  if (!hydrated || !ready) return <div className="text-slate-500 text-sm">Loading…</div>;

  const set = (patch: Partial<NotesState>) => setSt((p) => ({ ...p, ...patch }));
  const setText = (id: string, v: string) => setSt((p) => ({ ...p, text: { ...p.text, [id]: v } }));
  const text = (id: string, fallback = "") => st.text[id] ?? fallback;

  const income = totals.revenue;
  const size = sizeOf(totals.assets, income, st.employees);
  const scope: Scope = st.scopeOverride || SCOPE_OF[size];
  const show = (...scopes: Scope[]) => scopes.includes(scope);

  const bs = rows.filter((r) => !isOpeningAccount(r.account.code, chart) && Math.abs(r.closing) + Math.abs(r.opening) >= 0.005);
  const cash = bs.filter((r) => r.cls === "CASH");
  const receivables = bs.filter((r) => r.cls === "WC_REC");
  const inventories = bs.filter((r) => r.cls === "WC_INV");
  const payables = bs.filter((r) => r.cls === "WC_LIAB");
  const loans = bs.filter((r) => r.cls === "FIN" && r.account.category === "liability");
  const equity = bs.filter((r) => r.account.category === "equity");
  const revenue = rows.filter((r) => r.account.category === "revenue" && Math.abs(r.closing) >= 0.005);
  const personnel = rows.filter((r) => isPersonnel(r, chart) && Math.abs(r.closing) >= 0.005);
  const incomeTax = rows.filter((r) => isIncomeTax(r, chart) && Math.abs(r.closing) >= 0.005);

  const loanTotal = sum(loans);
  const currentLoans = sum(loans.filter((r) => isCurrentLoan(r, chart)));
  const loan12 = st.loan12 >= 0 ? st.loan12 : currentLoans;
  const loan5 = st.loan5;
  const loanMid = loanTotal - loan12 - loan5;
  const re = splitGross(Math.max(0, totals.retainedEarnings));

  let n = 0;
  const num = () => ++n;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ut-navy">Notes to the financial statements</h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            The numbers come from your journal. Your job is the part no software can do: decide what a reader needs to know, and
            say it in words. Grey boxes are yours to fill in.
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
            onClick={() => {
              if (confirm("Clear all texts you typed into the notes?")) setSt(EMPTY);
            }}
            className="inline-flex items-center gap-1 rounded-md border border-rose-300 text-rose-700 px-3 py-1.5 text-sm hover:bg-rose-50 transition"
          >
            <RotateCcw size={14} /> Clear texts
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1 rounded-md bg-ut-dark text-white px-3 py-1.5 text-sm hover:bg-ut-navy transition"
          >
            <Printer size={14} /> Print / PDF
          </button>
        </div>
      </div>

      {/* ---------- Step 1: size category ---------- */}
      <section className="rounded-2xl bg-white shadow-card border border-slate-100 p-4 sm:p-5">
        <h2 className="font-semibold text-ut-navy">Step 1 · How much must this company disclose?</h2>
        <div className="grid md:grid-cols-2 gap-4 mt-3">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="block text-[11px] font-medium text-slate-500 mb-1">Company</span>
                <input
                  value={st.company}
                  onChange={(e) => set({ company: e.target.value })}
                  placeholder="Supilinn Cycles OÜ"
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                />
              </label>
              <label className="block">
                <span className="block text-[11px] font-medium text-slate-500 mb-1">Financial year</span>
                <input
                  value={st.period}
                  onChange={(e) => set({ period: e.target.value })}
                  placeholder="01.01.2026 - 31.12.2026"
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                />
              </label>
            </div>
            <Kv label="Total assets (journal)" value={formatEUR(totals.assets)} />
            <Kv label="Income for the year: net sales and other income (journal)" value={formatEUR(income)} />
            <label className="flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-700">Average number of employees</span>
              <input
                type="number"
                min={0}
                value={st.employees || ""}
                onChange={(e) => set({ employees: Math.max(0, Number(e.target.value) || 0) })}
                placeholder="0"
                className="w-24 rounded-md border border-slate-300 bg-slate-50 px-2 py-1.5 text-sm text-right"
              />
            </label>
          </div>
          <div className="rounded-xl bg-ut-light/20 border border-ut-light px-4 py-3">
            <div className="text-[11px] uppercase tracking-wider text-ut-medium font-semibold">Category under the Accounting Act</div>
            <div className="text-xl font-semibold text-ut-navy mt-0.5">{SIZE_LABEL[size]}</div>
            <p className="text-sm text-slate-700 mt-1">{SIZE_CONTENT[size]}</p>
            <p className="text-[11px] text-slate-500 mt-2">
              Limits (two of three must not be exceeded): micro 450 000 / 900 000 / 10 · small 7,5 m / 15 m / 50 · medium 25 m / 50
              m / 250 (total assets / income / employees). Accounting Act § 3, version in force until 31.12.2026. A company may
              always choose to report more than the minimum - banks and investors often ask for it.
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 no-print">
          <span className="text-xs text-slate-500">Show the notes of:</span>
          {(
            [
              ["", `this company's category (${SCOPE_OF[size] === "full" ? "full set" : SCOPE_OF[size]})`],
              ["micro", "micro"],
              ["small", "small"],
              ["full", "full set"],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v || "auto"}
              onClick={() => set({ scopeOverride: v })}
              className={`px-3 py-1 rounded-full text-xs border transition ${
                st.scopeOverride === v
                  ? "bg-ut-dark text-white border-ut-dark"
                  : "bg-white border-slate-200 text-slate-700 hover:border-ut-medium"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* ---------- Step 2: the notes ---------- */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-ut-medium">
          Step 2 · Notes{st.company ? ` of ${st.company}` : ""}
          {st.period ? `, ${st.period}` : ""} · {scope === "full" ? "full set" : `abridged accounts of a ${scope} undertaking`}
        </h2>

        {show("micro", "small") && (
          <Note no={num()} title="Basis of preparation" who="micro · small">
            <p>
              These are the abridged annual accounts of a {scope} undertaking, prepared in accordance with the Estonian financial
              reporting standard.
            </p>
          </Note>
        )}

        {show("small", "full") && (
          <Note no={num()} title="Accounting policies" who="small · full">
            <Area value={text("policy", POLICY_TEMPLATE)} onChange={(v) => setText("policy", v)} rows={7} />
          </Note>
        )}

        {show("full") && cash.length > 0 && (
          <Note no={num()} title="Cash and cash equivalents" who="full">
            <AccountTable rows={cash} />
          </Note>
        )}

        {show("full") && receivables.length > 0 && (
          <Note no={num()} title="Receivables and prepayments" who="full">
            <AccountTable rows={receivables} />
            <Area
              value={text("receivables")}
              onChange={(v) => setText("receivables", v)}
              placeholder="Are any receivables overdue or doubtful? Any allowance made?"
            />
          </Note>
        )}

        {show("full") && inventories.length > 0 && (
          <Note no={num()} title="Inventories" who="full">
            <AccountTable rows={inventories} />
          </Note>
        )}

        {show("small", "full") && (mov.assetAccounts.length > 0 || mov.depAccounts.length > 0) && (
          <Note no={num()} title="Property, plant and equipment and intangible assets" who="small · full">
            <div className="overflow-x-auto scroll-thin">
              <table className="w-full text-sm min-w-[420px]">
                <tbody className="divide-y divide-slate-100">
                  <MRow label="Cost at the beginning of the year" v={mov.costOpening} strong />
                  <MRow label="Purchases and improvements" v={mov.additions} />
                  <MRow label="Disposals and write-offs (at cost)" v={mov.disposals} />
                  <MRow label="Cost at the end of the year" v={mov.costClosing} strong />
                  <MRow label="Accumulated depreciation at the beginning of the year" v={-mov.depOpening} strong />
                  <MRow label="Depreciation for the year" v={-mov.depCharge} />
                  <MRow label="Depreciation of assets disposed of" v={-mov.depDisposals} />
                  <MRow label="Accumulated depreciation at the end of the year" v={-mov.depClosing} strong />
                  <MRow label="Carrying amount at the beginning of the year" v={mov.carryingOpening} strong />
                  <MRow label="Carrying amount at the end of the year" v={mov.carryingClosing} strong />
                </tbody>
              </table>
            </div>
            <Area
              value={text("ppe")}
              onChange={(v) => setText("ppe", v)}
              placeholder="Depreciation method and useful lives by group of assets. What was bought, what was sold, and at what gain or loss?"
            />
          </Note>
        )}

        {loans.length > 0 && (
          <Note no={num()} title="Borrowings" who="micro (collateral) · small (collateral, over 5 years) · full">
            <AccountTable rows={loans} />
            {show("small", "full") && (
              <div className="grid sm:grid-cols-3 gap-2 mt-2">
                <NumBox label="Falling due within 12 months" value={loan12} onChange={(v) => set({ loan12: v })} />
                <Kv label="Between 1 and 5 years" value={formatEUR(loanMid, false)} boxed />
                <NumBox label="After more than 5 years" value={loan5} onChange={(v) => set({ loan5: v })} />
              </div>
            )}
            <Area
              value={text("loans")}
              onChange={(v) => setText("loans", v)}
              placeholder="Lender, interest rate, final repayment date. Which assets are pledged as collateral, and what is their carrying amount?"
            />
          </Note>
        )}

        {show("full") && payables.length > 0 && (
          <Note no={num()} title="Payables, tax liabilities and other operating liabilities" who="full">
            <AccountTable rows={payables} />
          </Note>
        )}

        {show("full") && (
          <Note no={num()} title="Equity and income tax on a possible distribution" who="full">
            <AccountTable rows={equity} extra={{ label: "Profit (loss) for the period", opening: 0, closing: totals.profit }} />
            <div className="rounded-lg bg-ut-light/20 border border-ut-light px-3 py-2 mt-2 space-y-0.5">
              <Kv label="Retained earnings at the end of the year (incl. profit for the period)" value={formatEUR(totals.retainedEarnings)} />
              <Kv
                label={`Income tax on a possible distribution: ${EE_TAX.num} % of retained earnings`}
                value={formatEUR(re.tax)}
                strong
              />
              <Kv label="Net dividends that could be paid to the shareholders" value={formatEUR(re.net)} />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Estonia taxes profit when it is distributed. Retained earnings are the gross amount: {EE_TAX.num} % of them is tax and
              the rest is the net dividend (the same as {EE_TAX.num}/{EE_TAX.den} of the net dividend). This tax is not in the balance
              sheet, so the notes must show it (RTJ 15, par. 43).
            </p>
          </Note>
        )}

        {show("full") && revenue.length > 0 && (
          <Note no={num()} title="Revenue" who="full">
            <AccountTable rows={revenue} single />
            <Area
              value={text("revenue")}
              onChange={(v) => setText("revenue", v)}
              placeholder="Split of sales by activity and by country or region (e.g. Estonia / other EU / outside the EU)."
            />
          </Note>
        )}

        <Note no={num()} title="Labour expense and average number of employees" who="micro · small · full">
          {show("full") && personnel.length > 0 && <AccountTable rows={personnel} single />}
          <Kv label="Average number of employees during the year" value={String(st.employees || "-")} />
        </Note>

        {show("full") && (
          <Note no={num()} title="Income tax expense" who="full">
            {incomeTax.length > 0 ? <AccountTable rows={incomeTax} single /> : <p className="text-slate-500">No income tax expense booked.</p>}
            <Area
              value={text("incometax")}
              onChange={(v) => setText("incometax", v)}
              placeholder="What triggered the tax? e.g. net dividends of ___ declared and paid, income tax 22/78 = ___."
            />
          </Note>
        )}

        <Note no={num()} title="Related parties" who="micro (loans and guarantees to management) · small · full">
          <Area
            value={text("related")}
            onChange={(v) => setText("related", v)}
            rows={4}
            placeholder={
              scope === "micro"
                ? "Loans, prepayments and guarantees given to members of the management: amounts, interest rate, main terms, repayments."
                : "Who controls the company? Transactions with owners, management and their close family members and companies: sales and purchases, loans, guarantees, remuneration of the management, dividends paid, private expenses paid by the company."
            }
          />
        </Note>

        <Note no={num()} title="Contingent liabilities, collateral and commitments off the balance sheet" who="micro · small · full">
          <Area
            value={text("contingent")}
            onChange={(v) => setText("contingent", v)}
            placeholder="Guarantees given, pledged assets, pending court cases, lease commitments. Write 'none' if there are none."
          />
        </Note>

        {show("full") && cf.nonCash.length > 0 && (
          <Note no={num()} title="Non-cash investing and financing transactions" who="full">
            <ul className="divide-y divide-slate-100">
              {cf.nonCash.map((x) => (
                <li key={x.no} className="flex justify-between gap-3 py-1">
                  <span>{x.description}</span>
                  <span className="tabular-nums">{formatEUR(x.amount)}</span>
                </li>
              ))}
            </ul>
          </Note>
        )}

        {show("small", "full") && (
          <Note no={num()} title="Events after the reporting date" who="small · full">
            <Area
              value={text("events")}
              onChange={(v) => setText("events", v)}
              placeholder="Significant events between the balance sheet date and the day the accounts are signed that do not change the numbers but matter to the reader."
            />
          </Note>
        )}

        {show("full") && (
          <Note no={num()} title="Going concern" who="full, when there is material uncertainty">
            <Area
              value={text("going")}
              onChange={(v) => setText("going", v)}
              placeholder="Is there any material uncertainty about the company's ability to continue for at least 12 months? If yes: what, and what is management's plan?"
            />
          </Note>
        )}
      </div>

      <p className="text-xs text-slate-500">
        Teaching summary of the Estonian requirements (Accounting Act § 15 and § 21; guideline RTJ 15
        "Disclosures in the notes"). A real set of notes follows the full text of the standard.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
function sum(rows: LedgerRow[]) {
  return rows.reduce((s, r) => s + r.closing, 0);
}
function isPersonnel(r: LedgerRow, chart: ChartKey) {
  const c = r.account.code;
  if (chart === "simplified") return c === "X3";
  if (chart === "estonia") return /^60/.test(c);
  return false;
}
function isIncomeTax(r: LedgerRow, chart: ChartKey) {
  const c = r.account.code;
  if (chart === "simplified") return c === "X8";
  if (chart === "estonia") return c === "8900";
  return false;
}
function isCurrentLoan(r: LedgerRow, chart: ChartKey) {
  const c = r.account.code;
  if (chart === "simplified") return c === "L3" || c === "L8";
  if (chart === "estonia") return /^21/.test(c) || c === "2650";
  return false;
}

function Note({ no, title, who, children }: { no: number; title: string; who: string; children: React.ReactNode }) {
  return (
    <article className="bg-white rounded-2xl shadow-card border border-slate-100 p-4 sm:p-5 break-inside-avoid">
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-2 mb-3">
        <h3 className="font-semibold text-ut-navy">
          Note {no} · {title}
        </h3>
        <span className="text-[11px] font-medium rounded-full bg-ut-light/30 text-ut-navy px-2 py-0.5 no-print">required for: {who}</span>
      </header>
      <div className="text-sm text-slate-700 space-y-2">{children}</div>
    </article>
  );
}

function Area({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ut-medium focus:bg-white"
    />
  );
}

function Kv({ label, value, strong, boxed }: { label: string; value: string; strong?: boolean; boxed?: boolean }) {
  if (boxed) {
    return (
      <div>
        <span className="block text-[11px] font-medium text-slate-500 mb-1">{label}</span>
        <div className="rounded-md border border-slate-200 px-2 py-1.5 text-sm text-right tabular-nums">{value}</div>
      </div>
    );
  }
  return (
    <div className={`flex justify-between gap-3 text-sm ${strong ? "font-semibold text-ut-navy" : "text-slate-700"}`}>
      <span>{label}</span>
      <span className="tabular-nums whitespace-nowrap">{value}</span>
    </div>
  );
}

function NumBox({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium text-slate-500 mb-1">{label}</span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        step="any"
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="w-full rounded-md border border-slate-300 bg-slate-50 px-2 py-1.5 text-sm text-right tabular-nums"
      />
    </label>
  );
}

function MRow({ label, v, strong }: { label: string; v: number; strong?: boolean }) {
  return (
    <tr className={strong ? "font-medium text-slate-900" : "text-slate-700"}>
      <td className="py-1 pr-3">{label}</td>
      <td className="py-1 text-right tabular-nums whitespace-nowrap">{formatEUR(v, false)}</td>
    </tr>
  );
}

function AccountTable({
  rows,
  single,
  extra,
}: {
  rows: LedgerRow[];
  single?: boolean; // income statement accounts: one column
  extra?: { label: string; opening: number; closing: number };
}) {
  const totalOpen = rows.reduce((s, r) => s + r.opening, 0) + (extra?.opening ?? 0);
  const totalClose = rows.reduce((s, r) => s + r.closing, 0) + (extra?.closing ?? 0);
  return (
    <div className="overflow-x-auto scroll-thin">
      <table className="w-full text-sm min-w-[360px]">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-ut-medium border-b border-slate-200">
            <th className="py-1 text-left font-semibold"></th>
            {!single && <th className="py-1 text-right font-semibold whitespace-nowrap">Beginning of year</th>}
            <th className="py-1 text-right font-semibold whitespace-nowrap">{single ? "For the year" : "End of year"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={r.account.code}>
              <td className="py-1 pr-3">
                <span className="font-mono text-[10px] text-slate-400 mr-1.5">{r.account.code}</span>
                {r.account.name}
              </td>
              {!single && <td className="py-1 text-right tabular-nums whitespace-nowrap">{formatEUR(r.opening, false)}</td>}
              <td className="py-1 text-right tabular-nums whitespace-nowrap">{formatEUR(r.closing, false)}</td>
            </tr>
          ))}
          {extra && (
            <tr>
              <td className="py-1 pr-3 italic">{extra.label}</td>
              {!single && <td className="py-1 text-right tabular-nums">{formatEUR(extra.opening, false)}</td>}
              <td className="py-1 text-right tabular-nums">{formatEUR(extra.closing, false)}</td>
            </tr>
          )}
          <tr className="font-medium text-ut-navy border-t border-slate-200">
            <td className="py-1 pr-3">Total</td>
            {!single && <td className="py-1 text-right tabular-nums whitespace-nowrap">{formatEUR(totalOpen, false)}</td>}
            <td className="py-1 text-right tabular-nums whitespace-nowrap">{formatEUR(totalClose, false)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
