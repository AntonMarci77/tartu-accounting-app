import Link from "next/link";
import { ArrowRight, Banknote, BookOpen, BookText, ClipboardList, FileText, GraduationCap, Landmark, Layers, ListTree, ScrollText } from "lucide-react";

const tiles = [
  {
    href: "/journal",
    title: "Journal",
    text: "Record transactions in a tabulator-style journal — Tab/Enter to move, EU date and amount formats.",
    icon: ClipboardList,
    accent: "from-ut-dark to-ut-medium",
  },
  {
    href: "/t-accounts",
    title: "T-accounts",
    text: "See every posted transaction laid out in classic T-form, with debits left and credits right.",
    icon: Layers,
    accent: "from-ut-medium to-ut-light",
  },
  {
    href: "/reports",
    title: "Reports",
    text: "Auto-built Balance Sheet and Statement of Profit or Loss based on the journal you keep.",
    icon: ScrollText,
    accent: "from-ut-navy to-ut-dark",
  },
  {
    href: "/cash-flow",
    title: "Cash flow",
    text: "Tag the rows that move cash and get the Statement of Cash Flows - direct and indirect method, checked against each other.",
    icon: Banknote,
    accent: "from-ut-dark to-ut-navy",
  },
  {
    href: "/notes",
    title: "Notes",
    text: "Find the size category of the company and build the notes: the numbers come from the journal, the words from you.",
    icon: FileText,
    accent: "from-ut-medium to-ut-dark",
  },
  {
    href: "/tax",
    title: "Income tax (Estonia)",
    text: "The distribution tax in practice: 22/78 on dividends, fringe benefits and private expenses, and the hidden tax on retained earnings.",
    icon: Landmark,
    accent: "from-ut-navy to-ut-medium",
  },
  {
    href: "/chart-of-accounts",
    title: "Chart of Accounts",
    text: "Three levels: super-simplified, simplified and the full Estonian e-Financials chart (~295 accounts).",
    icon: ListTree,
    accent: "from-ut-light to-ut-medium",
  },
  {
    href: "/learn",
    title: "Learn",
    text: "Eleven accounting principles, definitions of asset/liability/equity/income/expense, and the four statements.",
    icon: BookOpen,
    accent: "from-ut-dark to-ut-navy",
  },
  {
    href: "/quiz",
    title: "Self-test",
    text: "Three pre-made test versions plus a random version — instant feedback after each question.",
    icon: GraduationCap,
    accent: "from-ut-medium to-ut-dark",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-br from-ut-navy via-ut-dark to-ut-medium text-white shadow-card overflow-hidden">
        <div className="px-6 sm:px-10 py-8 sm:py-12">
          <p className="uppercase tracking-widest text-xs sm:text-sm text-ut-light/90">University of Tartu · Accounting 101</p>
          <h1 className="mt-2 text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
            From a transaction to a financial statement.
          </h1>
          <p className="mt-3 text-white/85 max-w-2xl text-sm sm:text-base">
            A small workbook to practice double-entry bookkeeping the way it is taught in the lecture: pick a chart of accounts, enter a transaction, see the T-accounts move, watch the balance sheet stay in balance - and finish the year with a cash flow statement, the income tax and the notes.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/journal"
              className="inline-flex items-center gap-2 rounded-lg bg-white text-ut-navy px-4 py-2 text-sm font-medium shadow hover:bg-ut-light transition"
            >
              Open the journal <ArrowRight size={16} />
            </Link>
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-4 py-2 text-sm font-medium hover:bg-white/10 transition"
            >
              <BookText size={16} /> Read the theory
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group rounded-2xl bg-white shadow-card border border-slate-100 p-5 hover:border-ut-medium/60 transition flex flex-col"
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${t.accent} text-white grid place-items-center mb-3`}>
              <t.icon size={20} />
            </div>
            <h3 className="font-semibold text-ut-navy">{t.title}</h3>
            <p className="text-sm text-slate-600 mt-1 flex-1">{t.text}</p>
            <span className="mt-3 inline-flex items-center text-sm text-ut-dark group-hover:text-ut-navy">
              Open <ArrowRight size={14} className="ml-1 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>

      <section className="rounded-2xl bg-white shadow-card border border-slate-100 p-5 sm:p-6">
        <h2 className="font-semibold text-ut-navy">How a typical lesson goes</h2>
        <ol className="mt-3 grid sm:grid-cols-2 gap-3 text-sm text-slate-700">
          <li className="rounded-lg border border-slate-100 p-3">
            <span className="font-medium text-ut-dark">1. Pick a chart of accounts.</span> Start with the
            super-simplified one to get the feel of debits and credits.
          </li>
          <li className="rounded-lg border border-slate-100 p-3">
            <span className="font-medium text-ut-dark">2. Book a transaction.</span> Type a date,
            description, debit code, credit code and the amount.
          </li>
          <li className="rounded-lg border border-slate-100 p-3">
            <span className="font-medium text-ut-dark">3. Open T-accounts.</span> Each posting now appears on the
            correct side. Watch the closing balance change.
          </li>
          <li className="rounded-lg border border-slate-100 p-3">
            <span className="font-medium text-ut-dark">4. Check the reports.</span> Confirm that
            Assets = Liabilities + Equity and that profit landed where you expected.
          </li>
          <li className="rounded-lg border border-slate-100 p-3">
            <span className="font-medium text-ut-dark">5. Follow the cash.</span> Tag every row that moves cash as
            operating, investing or financing and read the Statement of Cash Flows.
          </li>
          <li className="rounded-lg border border-slate-100 p-3">
            <span className="font-medium text-ut-dark">6. Close the year.</span> Compute the income tax on what was
            distributed and write the notes a reader of the accounts needs.
          </li>
        </ol>
      </section>
    </div>
  );
}
