"use client";

import { useState } from "react";
import Link from "next/link";
import {
  accountTypes,
  accountingMethods,
  principles,
  statements,
  transactionPatterns,
} from "@/lib/data/principles";
import { ArrowRight, ChevronDown, GraduationCap } from "lucide-react";

const sections = [
  { id: "intro", label: "Introduction" },
  { id: "principles", label: "Principles" },
  { id: "definitions", label: "Definitions" },
  { id: "transactions", label: "Transactions" },
  { id: "statements", label: "Statements" },
  { id: "methods", label: "Cash vs. accrual" },
  { id: "cashflow", label: "Cash flow & notes" },
  { id: "practice", label: "Practice list" },
];

export default function LearnPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-ut-navy">Learn — Accounting 101</h1>
        <p className="text-sm text-slate-600 mt-1">
          Wrap-up of the lecture: what accounting reports, the 11 named principles, the asset/liability/equity/income/expense definitions, the eight transaction patterns and the four financial statements.
        </p>
        <nav className="mt-3 flex flex-wrap gap-2">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-3 py-1 rounded-full text-xs border border-slate-200 bg-white hover:border-ut-medium hover:text-ut-dark transition"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </header>

      <Section id="intro" title="What does accounting report?">
        <p>
          Accounting is an information and measurement system that <strong>identifies, records and communicates</strong> relevant, reliable and comparable information about an organisation's business activities. Two questions drive everything else:
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <Card title="Where do we stand?">
            What does the business own (assets), what does it owe (liabilities), and what is left for the owner
            (equity)? Snapshot at a single date.
          </Card>
          <Card title="How did we get there?">
            What revenue did the business earn, and what expenses did it incur, over the period? The difference is profit or loss.
          </Card>
        </div>
        <Equation />
      </Section>

      <Section id="principles" title="The eleven accounting principles">
        <p className="text-slate-600">
          Click a card to read the principle in full. The same principles are also tested in the self-test.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          {principles.map((p) => (
            <Disclosure key={p.id} title={p.name}>
              <p>{p.body}</p>
              {p.example && (
                <p className="mt-2 text-slate-600 text-sm italic">
                  <span className="font-medium not-italic text-ut-dark">Example: </span>
                  {p.example}
                </p>
              )}
            </Disclosure>
          ))}
        </div>
      </Section>

      <Section id="definitions" title="Asset, liability, equity, income, expense">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {accountTypes.map((t) => (
            <article key={t.id} className="rounded-xl border border-slate-100 bg-white shadow-card p-4">
              <h3 className="font-semibold text-ut-navy">{t.title}</h3>
              <p className="text-sm text-slate-700 mt-1">{t.body}</p>
              {t.effects && (
                <ul className="mt-3 text-xs text-slate-600 space-y-0.5">
                  {Object.entries(t.effects).map(([k, v]) => (
                    <li key={k}>
                      <span className="capitalize text-slate-500 mr-1">{k}:</span>
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              )}
              {t.excludes && (
                <p className="mt-2 text-xs text-rose-700">
                  <span className="font-medium">Excludes:</span> {t.excludes}
                </p>
              )}
            </article>
          ))}
        </div>
      </Section>

      <Section id="transactions" title="The eight transaction patterns">
        <p className="text-slate-600">
          Every business transaction can be reduced to one of these eight patterns. (Liabilities can be replaced by equity wherever it makes sense.)
        </p>
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-ut-navy text-white text-left">
              <tr>
                <th className="px-3 py-2">Pattern</th>
                <th className="px-3 py-2">When it happens</th>
                <th className="px-3 py-2">Example</th>
              </tr>
            </thead>
            <tbody>
              {transactionPatterns.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium text-ut-dark whitespace-nowrap">{p.pattern}</td>
                  <td className="px-3 py-2 text-slate-700">{p.description}</td>
                  <td className="px-3 py-2 text-slate-600 italic">{p.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="statements" title="The four financial statements">
        <div className="grid sm:grid-cols-2 gap-3">
          {statements.map((s) => (
            <article key={s.id} className="rounded-xl border border-slate-100 bg-white shadow-card p-4">
              <h3 className="font-semibold text-ut-navy">{s.name}</h3>
              <p className="text-sm text-slate-700 mt-1">{s.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="methods" title="Cash basis vs. accrual basis">
        <div className="grid sm:grid-cols-2 gap-3">
          {accountingMethods.map((m) => (
            <article key={m.id} className="rounded-xl border border-slate-100 bg-white shadow-card p-4">
              <h3 className="font-semibold text-ut-navy">{m.name}</h3>
              <p className="text-sm text-slate-700 mt-1">{m.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="cashflow" title="Cash flow statement, notes and the Estonian income tax">
        <p>
          Profit is not cash. The <strong>statement of cash flows</strong> explains how cash changed during the year, split into three
          activities. The <strong>notes</strong> explain what the numbers alone cannot.
        </p>
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          <Card title="Operating">
            The day-to-day business: receipts from customers, payments to suppliers and employees, interest and income tax paid.
          </Card>
          <Card title="Investing">
            Buying and selling non-current assets and investments, loans granted, interest and dividends received.
          </Card>
          <Card title="Financing">
            Money from and to those who finance the company: loans received and repaid, share issues, dividends paid.
          </Card>
        </div>
        <ul className="mt-3 list-disc pl-5 space-y-1">
          <li>
            <strong>Direct method:</strong> gross receipts and payments. <strong>Indirect method:</strong> operating profit, plus
            non-cash expenses (depreciation), less gains that belong to investing, adjusted for changes in receivables, inventories
            and payables. Both give the same operating cash flow.
          </li>
          <li>
            An increase in an operating asset uses cash; an increase in an operating liability saves cash.
          </li>
          <li>
            Transactions without cash (an asset bought on credit, a loan converted into shares) are not in the statement - they are
            explained in the notes.
          </li>
          <li>
            In Estonia, micro and small undertakings may prepare abridged accounts: balance sheet, income statement and limited
            notes. Medium-sized and large undertakings add the cash flow statement and the statement of changes in equity.
          </li>
          <li>
            Estonian companies pay income tax only when profit is distributed: 22/78 of the net dividend. The tax that would fall
            due if all retained earnings were paid out is shown in the notes.
          </li>
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/cash-flow" className="inline-flex items-center gap-2 rounded-lg border border-ut-medium text-ut-dark px-3 py-1.5 text-sm hover:bg-ut-light/30 transition">
            Cash flow statement <ArrowRight size={14} />
          </Link>
          <Link href="/notes" className="inline-flex items-center gap-2 rounded-lg border border-ut-medium text-ut-dark px-3 py-1.5 text-sm hover:bg-ut-light/30 transition">
            Notes <ArrowRight size={14} />
          </Link>
          <Link href="/tax" className="inline-flex items-center gap-2 rounded-lg border border-ut-medium text-ut-dark px-3 py-1.5 text-sm hover:bg-ut-light/30 transition">
            Income tax <ArrowRight size={14} />
          </Link>
        </div>
      </Section>

      <Section id="practice" title="Ten transactions to book in the journal">
        <p className="text-slate-600">
          The same list from the lecture — try booking each one in the <Link href="/journal" className="text-ut-dark underline">journal</Link>, then verify on the
          <Link href="/t-accounts" className="text-ut-dark underline mx-1">T-accounts</Link>
          and
          <Link href="/reports" className="text-ut-dark underline ml-1">Reports</Link> pages.
        </p>
        <ol className="mt-3 grid sm:grid-cols-2 gap-3 text-sm list-none counter-reset:[item]">
          {[
            "Owner invests €10,000 cash into the business.",
            "Purchase office equipment for €2,000, paid in cash.",
            "Pay €500 for the first month's office rent.",
            "Provide services worth €3,500 to a client on credit.",
            "Collect €1,000 cash from a client on services sold.",
            "Pay €200 for an advertising campaign.",
            "Take a €5,000 bank loan, payable over 3 years.",
            "Buy office supplies worth €300 on credit.",
            "Pay €150 for electricity.",
            "Pay €100 toward the principal of the long-term loan.",
          ].map((t, i) => (
            <li key={i} className="flex gap-3 rounded-lg bg-white border border-slate-100 p-3 shadow-card">
              <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-ut-navy text-white shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-slate-700">{t}</span>
            </li>
          ))}
        </ol>
        <Link
          href="/quiz"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-ut-dark text-white px-4 py-2 text-sm hover:bg-ut-navy transition"
        >
          <GraduationCap size={16} /> Try the self-test now <ArrowRight size={14} />
        </Link>
      </Section>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 space-y-3">
      <h2 className="text-xl font-semibold text-ut-navy">{title}</h2>
      <div className="text-slate-700 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-xl border border-slate-100 bg-white shadow-card p-4">
      <h3 className="font-semibold text-ut-navy">{title}</h3>
      <p className="text-sm text-slate-700 mt-1">{children}</p>
    </article>
  );
}

function Disclosure({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="rounded-xl border border-slate-100 bg-white shadow-card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50/60"
      >
        <span className="font-medium text-ut-navy">{title}</span>
        <ChevronDown size={16} className={`text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 pb-4 text-sm text-slate-700 leading-relaxed">{children}</div>}
    </article>
  );
}

function Equation() {
  return (
    <div className="mt-4 rounded-xl bg-gradient-to-br from-ut-light/30 to-white border border-ut-light/40 p-5 text-center">
      <p className="text-xs uppercase tracking-widest text-ut-medium">The accounting equation</p>
      <p className="mt-2 text-2xl sm:text-3xl font-bold text-ut-navy">
        Assets = Liabilities + Equity
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Holds for every transaction, every period, every business — that is what double-entry guarantees.
      </p>
    </div>
  );
}
