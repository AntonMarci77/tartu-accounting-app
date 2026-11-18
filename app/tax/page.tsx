"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { useJournal } from "@/lib/store";
import { buildLedger, ledgerTotals } from "@/lib/ledger";
import { EE_TAX, TSD_ANNEXES, fringeBenefit, round2, splitGross, taxOnNet } from "@/lib/tax";
import { AmountInput } from "@/components/AmountInput";
import { formatEUR } from "@/lib/format";
import type { ChartKey } from "@/lib/data/charts";

// Accounts suggested for the journal entries, per chart.
const ACCOUNTS: Record<Exclude<ChartKey, "super">, Record<string, string>> = {
  simplified: {
    retained: "E3 Retained Earnings",
    divPayable: "L8 Dividends Payable",
    taxExpense: "X8 Corporate Income Tax Expense",
    taxLiability: "L5 Tax Liabilities",
    otherTaxExpense: "X5 Taxes & Fees",
    personnel: "X3 Personnel Costs",
    cash: "A8 Cash & Bank Accounts",
  },
  estonia: {
    retained: "2960 Retained earnings (loss)",
    divPayable: "2650 Dividend payables",
    taxExpense: "8900 Income tax expense",
    taxLiability: "2656 Dividend income tax payable",
    otherTaxExpense: "5830 Income tax on non-business-related expenses",
    personnel: "5650 / 5660 Income tax / social tax on fringe benefits",
    cash: "1020 Settlement accounts",
  },
};

export default function TaxPage() {
  const { entries, chart, hydrated } = useJournal();
  const totals = useMemo(() => ledgerTotals(buildLedger(entries, chart), chart), [entries, chart]);

  const [netDividend, setNetDividend] = useState(0);
  const [benefit, setBenefit] = useState(0);
  const [nonBusiness, setNonBusiness] = useState(0);
  const [classicRate, setClassicRate] = useState(20);
  const [payout, setPayout] = useState(50);

  if (!hydrated) return <div className="text-slate-500 text-sm">Loading…</div>;

  const acc = ACCOUNTS[chart === "super" ? "simplified" : chart];
  const divTax = taxOnNet(netDividend);
  const fb = fringeBenefit(benefit);
  const nbTax = taxOnNet(nonBusiness);
  const re = Math.max(0, totals.retainedEarnings);
  const maxSplit = splitGross(re);

  const profit = Math.max(0, totals.profit);
  const classicTax = round2((profit * classicRate) / 100);
  const eeTax = round2(((profit * payout) / 100) * (EE_TAX.num / (EE_TAX.num + EE_TAX.den)));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ut-navy">Income tax · Estonia</h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            An Estonian company pays no income tax on the profit it keeps. Tax is due only when profit leaves the company - as a
            dividend, or hidden in a fringe benefit, a gift or a private expense of the owner. The rate is{" "}
            <b>
              {EE_TAX.num}/{EE_TAX.den}
            </b>{" "}
            of the net amount paid out (= {EE_TAX.num} % of the gross amount).
          </p>
        </div>
        <Link
          href="/journal"
          className="no-print inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm bg-white hover:bg-slate-50 transition"
        >
          <ArrowLeft size={14} /> Journal
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Dividends */}
        <Card title="1 · Dividend" subtitle="TSD Annex 7">
          <Field label="Net dividend paid to the shareholders">
            <AmountInput value={netDividend} onChange={setNetDividend} />
          </Field>
          <Line label={`Income tax ${EE_TAX.num}/${EE_TAX.den}`} value={divTax} strong />
          <Line label="Gross profit used (dividend + tax)" value={round2(netDividend + divTax)} />
          <Entries
            rows={[
              ["Dividend declared", acc.retained, acc.divPayable, netDividend],
              ["Income tax on the dividend", acc.taxExpense, acc.taxLiability, divTax],
            ]}
          />
          <p className="text-[11px] text-slate-500">
            The tax expense is recognised when the dividend is declared; the tax itself falls due by the 10th day of the month
            after the dividend is paid.
          </p>
        </Card>

        {/* Fringe benefit */}
        <Card title="2 · Fringe benefit" subtitle="TSD Annex 4">
          <Field label="Value of the benefit given to an employee">
            <AmountInput value={benefit} onChange={setBenefit} />
          </Field>
          <Line label={`Income tax ${EE_TAX.num}/${EE_TAX.den}`} value={fb.incomeTax} />
          <Line label={`Social tax ${Math.round(EE_TAX.socialTax * 100)} % of (benefit + income tax)`} value={fb.socialTax} />
          <Line label="Total tax cost for the employer" value={fb.total} strong />
          <Entries rows={[["Taxes on the fringe benefit", acc.personnel, acc.taxLiability.replace("Dividend income tax payable", "Tax liabilities (2570 / 2550)"), fb.total]]} />
          <p className="text-[11px] text-slate-500">
            Check: a benefit of 1 000,00 gives income tax 282,05 and social tax 423,08 - the example of the Tax and Customs Board.
          </p>
        </Card>

        {/* Non-business */}
        <Card title="3 · Private or non-business expense" subtitle="TSD Annex 6 (gifts and entertainment: Annex 5)">
          <Field label="Expense paid by the company that is not related to its business">
            <AmountInput value={nonBusiness} onChange={setNonBusiness} />
          </Field>
          <Line label={`Income tax ${EE_TAX.num}/${EE_TAX.den}`} value={nbTax} strong />
          <Line label="Total cost for the company" value={round2(nonBusiness + nbTax)} />
          <Entries rows={[["Income tax on the non-business expense", acc.otherTaxExpense, acc.taxLiability.replace("2656 Dividend income tax payable", "2570 Income tax"), nbTax]]} />
          <p className="text-[11px] text-slate-500">
            This card is for an owner who does not work for the company. If the person is an employee or a member of the management
            board, the expense is a fringe benefit (card 2) and social tax is added.
          </p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="From your journal · income tax on a possible distribution" subtitle="shown in the notes (RTJ 15, par. 43)">
          <Line label="Retained earnings incl. profit of the period" value={totals.retainedEarnings} />
          <Line label={`Income tax on a possible distribution: ${EE_TAX.num} % of retained earnings`} value={maxSplit.tax} strong />
          <Line label="Net dividend the owners could receive" value={maxSplit.net} />
          <p className="text-[11px] text-slate-500">
            This tax is not a liability in the balance sheet - it arises only if and when the owners decide to distribute. That is
            exactly why the notes must tell the reader about it. (Company law may restrict the distributable amount further.)
          </p>
        </Card>

        <Card title="Timing: classic profit tax vs Estonian distribution tax" subtitle="illustration with the profit from your journal">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Classic corporate tax rate, % (type your country's)">
              <input
                type="number"
                min={0}
                max={60}
                value={classicRate}
                onChange={(e) => setClassicRate(Math.max(0, Math.min(60, Number(e.target.value) || 0)))}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-right"
              />
            </Field>
            <Field label="Share of the profit paid out, %">
              <input
                type="number"
                min={0}
                max={100}
                value={payout}
                onChange={(e) => setPayout(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-right"
              />
            </Field>
          </div>
          <Line label="Profit for the period (journal)" value={profit} />
          <Line label={`Classic system: tax now, ${classicRate} % of the profit`} value={classicTax} />
          <Line label={`Estonia: tax now, ${EE_TAX.num} % of the gross profit paid out`} value={eeTax} strong />
          <p className="text-[11px] text-slate-500">
            The classic system taxes the whole profit every year (simplified: accounting profit = tax base). Estonia taxes only the
            part that is distributed; the rest is taxed later, when it is paid out.
          </p>
        </Card>
      </div>

      <section className="rounded-2xl bg-white shadow-card border border-slate-100 p-4 sm:p-5">
        <h2 className="font-semibold text-ut-navy flex items-center gap-2">
          <Info size={16} className="text-ut-medium" /> How it is declared: form TSD, every month
        </h2>
        <div className="overflow-x-auto scroll-thin mt-3">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-ut-medium border-b border-slate-200">
                <th className="py-1.5 pr-3">TSD</th>
                <th className="py-1.5 pr-3">What is declared</th>
                <th className="py-1.5">Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {TSD_ANNEXES.map((a) => (
                <tr key={a.annex}>
                  <td className="py-1.5 pr-3 font-medium whitespace-nowrap">{a.annex}</td>
                  <td className="py-1.5 pr-3">{a.what}</td>
                  <td className="py-1.5">{a.tax}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          Tax period: calendar month. Declaration and payment by the 10th day of the following month. There is no annual corporate
          income tax return. Rates as in force in {EE_TAX.year}; source:{" "}
          <a className="underline" href={EE_TAX.source} target="_blank" rel="noreferrer">
            Estonian Tax and Customs Board
          </a>
          .
        </p>
      </section>
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <article className="bg-white rounded-2xl shadow-card border border-slate-100 p-4 sm:p-5 space-y-2">
      <header className="border-b border-slate-100 pb-2">
        <h2 className="font-semibold text-ut-navy">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </header>
      {children}
    </article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium text-slate-500 mb-1">{label}</span>
      {children}
    </label>
  );
}

function Line({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 text-sm ${strong ? "font-semibold text-ut-navy" : "text-slate-700"}`}>
      <span>{label}</span>
      <span className="tabular-nums whitespace-nowrap">{formatEUR(value)}</span>
    </div>
  );
}

function Entries({ rows }: { rows: [string, string, string, number][] }) {
  const shown = rows.filter((r) => r[3] > 0);
  if (shown.length === 0) return null;
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-700 space-y-1.5">
      <div className="font-semibold uppercase tracking-wider text-[10px] text-ut-medium">Journal entries</div>
      {shown.map((r, i) => (
        <div key={i}>
          <div className="text-slate-500">{r[0]}</div>
          <div className="flex justify-between gap-2">
            <span>
              Dr {r[1]} / Cr {r[2]}
            </span>
            <span className="tabular-nums whitespace-nowrap">{formatEUR(r[3], false)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
