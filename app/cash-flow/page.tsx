"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, Info, Printer } from "lucide-react";
import { useJournal } from "@/lib/store";
import { computeCashFlow, type CfLine } from "@/lib/cashflow";
import { formatEUR } from "@/lib/format";

export default function CashFlowPage() {
  const { entries, chart, hydrated } = useJournal();
  const cf = useMemo(() => computeCashFlow(entries, chart), [entries, chart]);

  if (!hydrated) return <div className="text-slate-500 text-sm">Loading…</div>;

  const header = (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-ut-navy">Statement of Cash Flows</h1>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl">
          Built from the journal in two ways. The <b>direct method</b> adds up the cash-flow tags you gave to the rows that move
          cash. The <b>indirect method</b> starts from operating profit and removes everything that is not operating cash. Both
          methods must give the same cash flow from operating activities.
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
  );

  if (!cf.supported) {
    return (
      <div className="space-y-4">
        {header}
        <div className="rounded-2xl bg-white border border-slate-100 shadow-card p-5 text-sm text-slate-700">
          The super-simplified chart has one account for all current assets, so cash cannot be separated from receivables and
          inventories. Switch the journal to the <b>Simplified</b> or the <b>Estonian</b> chart to build a cash flow statement.
        </div>
      </div>
    );
  }

  const noCash = cf.direct.O.length + cf.direct.I.length + cf.direct.F.length + cf.direct.untaggedRows.length === 0;
  const allTagged = cf.direct.untaggedRows.length === 0;
  const reconciled = allTagged && Math.abs(cf.difference) < 0.01;

  return (
    <div className="space-y-5">
      {header}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Cash at the beginning" value={cf.openingCash} />
        <Stat label="Net change in cash" value={cf.change} tone={cf.change >= 0 ? "pos" : "neg"} />
        <Stat label="Cash at the end" value={cf.closingCash} />
        <Stat
          label="Profit for the period"
          value={cf.indirect.profit}
          hint={
            Math.abs(cf.indirect.profit - cf.change) >= 0.01
              ? `Profit and the change in cash differ by ${formatEUR(cf.indirect.profit - cf.change)} - the statement below explains why.`
              : undefined
          }
        />
      </section>

      {noCash ? (
        <div className="rounded-2xl bg-white border border-slate-100 shadow-card p-5 text-sm text-slate-600">
          No cash movements in the period yet. Book the transactions in the journal: every row that touches a cash or bank account will ask for a cash-flow tag.
        </div>
      ) : (
        <>
          <div
            className={`rounded-xl border px-4 py-3 text-sm flex items-start gap-2 ${
              reconciled && cf.warnings.length === 0
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            {reconciled && cf.warnings.length === 0 ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            )}
            <div className="space-y-0.5">
              {reconciled ? (
                <p>
                  <b>Operating total reconciled.</b> The direct and the indirect method give the same cash flow from operating
                  activities: {formatEUR(cf.indirect.total)}.
                </p>
              ) : (
                <p>
                  <b>Not reconciled yet.</b>
                </p>
              )}
              {!allTagged && (
                <p>
                  Journal row{cf.direct.untaggedRows.length > 1 ? "s" : ""} {cf.direct.untaggedRows.join(", ")}{" "}
                  {cf.direct.untaggedRows.length > 1 ? "move" : "moves"} cash but {cf.direct.untaggedRows.length > 1 ? "have" : "has"} no
                  cash-flow tag.
                </p>
              )}
              {Math.abs(cf.difference) >= 0.01 && (
                <p>
                  Operating cash flow by the direct method is {formatEUR(cf.direct.totals.O)}. By the indirect method it is{" "}
                  {formatEUR(cf.indirect.total)}. Check whether an investing or financing cash flow is tagged as operating, or an
                  operating one as investing or financing.
                </p>
              )}
              {reconciled && cf.warnings.length > 0 && (
                <p>
                  But {cf.warnings.length} tag{cf.warnings.length > 1 ? "s look" : " looks"} unusual - see the hints below. This check
                  compares only the operating total; investing and financing you have to check yourself.
                </p>
              )}
              {reconciled && cf.warnings.length === 0 && (
                <p>All cash rows are tagged and no tag looks unusual. Compare investing and financing with your own expectation.</p>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Direct method */}
            <article className="bg-white rounded-2xl shadow-card border border-slate-100 p-4 sm:p-5">
              <header className="border-b border-slate-100 pb-2 mb-3">
                <h2 className="font-semibold text-ut-navy">Direct method</h2>
                <p className="text-xs text-slate-500">gross receipts and payments, from your cash-flow tags</p>
              </header>
              <div className="space-y-3 text-sm">
                <Block title="Cash flows from operating activities" lines={cf.direct.O} total={cf.direct.totals.O} />
                <Block title="Cash flows from investing activities" lines={cf.direct.I} total={cf.direct.totals.I} />
                <Block title="Cash flows from financing activities" lines={cf.direct.F} total={cf.direct.totals.F} />
                {!allTagged && (
                  <Row label={`Cash movements without a tag (journal row${cf.direct.untaggedRows.length > 1 ? "s" : ""} ${cf.direct.untaggedRows.join(", ")})`} amount={cf.direct.untagged} tone="warn" />
                )}
                <Footer cf={cf} />
              </div>
            </article>

            {/* Indirect method */}
            <article className="bg-white rounded-2xl shadow-card border border-slate-100 p-4 sm:p-5">
              <header className="border-b border-slate-100 pb-2 mb-3">
                <h2 className="font-semibold text-ut-navy">Indirect method</h2>
                <p className="text-xs text-slate-500">operating profit adjusted for non-cash items and working capital</p>
              </header>
              <div className="space-y-3 text-sm">
                <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                  {cf.indirect.bridge.map((l) => (
                    <Row key={l.id} label={l.label} amount={l.amount} small />
                  ))}
                </div>
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ut-medium mb-1">
                    Cash flows from operating activities
                  </h3>
                  <div className="divide-y divide-slate-50">
                    {cf.indirect.lines.map((l) => (
                      <Row key={l.id} label={l.label} amount={l.amount} strong={l.strong} />
                    ))}
                  </div>
                  <TotalRow label="Net cash from operating activities" amount={cf.indirect.total} />
                </div>
                <Block title="Cash flows from investing activities" lines={cf.direct.I} total={cf.direct.totals.I} />
                <Block title="Cash flows from financing activities" lines={cf.direct.F} total={cf.direct.totals.F} />
                <p className="text-[11px] text-slate-500">
                  Investing and financing cash flows are always presented gross (direct), also in an indirect statement.
                </p>
              </div>
            </article>
          </div>

          {cf.warnings.length > 0 && (
            <section className="bg-white rounded-2xl shadow-card border border-amber-200 p-4 sm:p-5">
              <h2 className="font-semibold text-ut-navy flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-600" /> Hints: check these tags
              </h2>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                {cf.warnings.map((w, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-mono text-xs text-slate-500 shrink-0 mt-0.5">#{w.no}</span>
                    <span>
                      <span className="text-slate-500">{w.description || "(no description)"}:</span> {w.message}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-slate-500">
                These are hints, not errors - some items can legitimately be presented in more than one activity (see below).
              </p>
            </section>
          )}

          {cf.nonCash.length > 0 && (
            <section className="bg-white rounded-2xl shadow-card border border-slate-100 p-4 sm:p-5">
              <h2 className="font-semibold text-ut-navy">Non-cash investing and financing transactions</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Not in the cash flow statement, because no cash moved - but they must be explained in the notes (IAS 7.43).
              </p>
              <ul className="mt-2 text-sm text-slate-700 divide-y divide-slate-50">
                {cf.nonCash.map((n) => (
                  <li key={n.no} className="flex justify-between py-1 gap-3">
                    <span>
                      <span className="font-mono text-xs text-slate-500">#{n.no}</span> {n.description}
                    </span>
                    <span className="tabular-nums">{formatEUR(n.amount)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {cf.incompleteRows.length > 0 && (
        <p className="text-xs text-rose-700">
          Journal rows {cf.incompleteRows.join(", ")} have an amount but not both a valid debit and credit account - they are
          ignored here.
        </p>
      )}

      <section className="rounded-2xl bg-white shadow-card border border-slate-100 p-4 sm:p-5">
        <h2 className="font-semibold text-ut-navy flex items-center gap-2">
          <Info size={16} className="text-ut-medium" /> Where do interest, dividends and income tax go?
        </h2>
        <div className="overflow-x-auto scroll-thin mt-3">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-ut-medium border-b border-slate-200">
                <th className="py-1.5 pr-3">Cash flow</th>
                <th className="py-1.5 pr-3">Estonian GAAP (RTJ 2)</th>
                <th className="py-1.5 pr-3">IAS 7 today</th>
                <th className="py-1.5">IAS 7 from 2027 (IFRS 18)*</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-1.5 pr-3 font-medium">Interest paid</td>
                <td className="py-1.5 pr-3">operating (financing allowed)</td>
                <td className="py-1.5 pr-3">operating or financing</td>
                <td className="py-1.5">financing</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-3 font-medium">Interest and dividends received</td>
                <td className="py-1.5 pr-3">investing (operating allowed)</td>
                <td className="py-1.5 pr-3">operating or investing</td>
                <td className="py-1.5">investing</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-3 font-medium">Dividends paid</td>
                <td className="py-1.5 pr-3">financing</td>
                <td className="py-1.5 pr-3">financing or operating</td>
                <td className="py-1.5">financing</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-3 font-medium">Income tax paid</td>
                <td className="py-1.5 pr-3">operating (tax on dividends may go to financing)</td>
                <td className="py-1.5 pr-3">operating, unless clearly linked to investing or financing</td>
                <td className="py-1.5">unchanged</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          * For companies whose main business is neither investing nor financing customers. From 2027 the indirect method under
          IFRS must also start from operating profit - as the Estonian sample layout (RTJ 2, Annex 3) already does. Whatever
          option a company picks, it applies it consistently from year to year.
        </p>
      </section>
    </div>
  );
}

function Stat({ label, value, tone, hint }: { label: string; value: number; tone?: "pos" | "neg"; hint?: string }) {
  return (
    <div className="rounded-xl bg-white border border-slate-100 shadow-card px-4 py-3">
      <div className="text-[11px] uppercase tracking-wider text-ut-medium font-semibold">{label}</div>
      <div
        className={`mt-1 text-lg sm:text-xl font-semibold tabular-nums ${
          tone === "pos" ? "text-emerald-700" : tone === "neg" ? "text-rose-700" : "text-ut-navy"
        }`}
      >
        {formatEUR(value)}
      </div>
      {hint && <div className="mt-1 text-[11px] text-slate-500 leading-snug">{hint}</div>}
    </div>
  );
}

function Row({
  label,
  amount,
  strong,
  small,
  tone,
}: {
  label: string;
  amount: number;
  strong?: boolean;
  small?: boolean;
  tone?: "warn";
}) {
  return (
    <div
      className={`flex justify-between items-baseline gap-3 py-0.5 ${small ? "text-xs" : "text-sm"} ${
        tone === "warn" ? "text-rose-700 bg-rose-50 rounded px-2" : strong ? "font-medium text-slate-900" : "text-slate-700"
      }`}
    >
      <span>{label}</span>
      <span className="tabular-nums whitespace-nowrap">{formatEUR(amount, false)}</span>
    </div>
  );
}

function TotalRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex justify-between pt-1 mt-1 border-t border-slate-200 text-sm font-semibold text-ut-navy gap-3">
      <span>{label}</span>
      <span className="tabular-nums whitespace-nowrap">{formatEUR(amount, false)}</span>
    </div>
  );
}

function Block({ title, lines, total }: { title: string; lines: CfLine[]; total: number }) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ut-medium mb-1">{title}</h3>
      {lines.length === 0 ? (
        <p className="text-xs italic text-slate-400">no cash flows</p>
      ) : (
        <div className="divide-y divide-slate-50">
          {lines.map((l) => (
            <Row key={l.id} label={l.label} amount={l.amount} />
          ))}
        </div>
      )}
      <TotalRow label={title.replace("Cash flows from", "Net cash from")} amount={total} />
    </div>
  );
}

function Footer({ cf }: { cf: ReturnType<typeof computeCashFlow> }) {
  return (
    <div className="pt-2 border-t-2 border-slate-200 space-y-0.5">
      <Row label="Net change in cash and cash equivalents" amount={cf.change} strong />
      <Row label="Cash and cash equivalents at the beginning of the period" amount={cf.openingCash} />
      <Row label="Cash and cash equivalents at the end of the period" amount={cf.closingCash} strong />
    </div>
  );
}
