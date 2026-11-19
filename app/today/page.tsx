import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Banknote, ClipboardList, Download, FileText, GraduationCap, Landmark, Layers, MessageCircle, Presentation, ScrollText } from "lucide-react";
import { SESSION } from "@/lib/session";

export const metadata: Metadata = {
  title: `Today · ${SESSION.title}`,
};

const workshop = [
  { n: 1, title: "Load the workshop", time: "10 min", text: "Open the journal and choose the student version. We book one row together.", href: "/journal?load=workshop", cta: "Open the journal", icon: ClipboardList },
  { n: 2, title: "Book 12 rows", time: "20 min", text: "The rows marked YOU on the handout. Check your postings in the T-accounts.", href: "/t-accounts", cta: "T-accounts", icon: Layers },
  { n: 3, title: "Indirect method on paper", time: "8 min", text: "Fill in the box on the handout. The numbers are in the balance sheet and income statement.", href: "/reports", cta: "Reports", icon: ScrollText },
  { n: 4, title: "Tag the cash rows", time: "15 min", text: "Choose a cash flow tag in the journal, then compare the result with your paper.", href: "/cash-flow", cta: "Cash flow", icon: Banknote },
  { n: 5, title: "Write three notes", time: "15 min", text: "Size category first, then borrowings, equity and income tax on a possible distribution, related parties.", href: "/notes", cta: "Notes", icon: FileText },
];

export default function TodayPage() {
  const slido = SESSION.slidoUrl.trim();
  const code = SESSION.slidoCode.trim();
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-ut-navy via-ut-dark to-ut-medium text-white shadow-card overflow-hidden">
        <div className="px-6 sm:px-10 py-7 sm:py-10">
          <p className="uppercase tracking-widest text-xs sm:text-sm text-ut-light/90">{SESSION.course} · {SESSION.date}</p>
          <h1 className="mt-2 text-3xl sm:text-5xl font-bold tracking-tight leading-tight">{SESSION.title}</h1>
          <p className="mt-2 text-white/85 text-sm sm:text-base">{SESSION.lecturer}</p>
          <p className="mt-3 text-white/85 max-w-2xl text-sm sm:text-base">
            Everything for today is on this page: the live quiz, the slides, the workshop assignment and the workbook you will use in the second half.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {slido ? (
              <a
                href={slido}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-lg bg-amber-400 text-ut-navy px-5 py-3 text-base font-semibold shadow hover:bg-amber-300 transition"
              >
                <MessageCircle size={18} /> Join the quiz on Slido
              </a>
            ) : (
              <a
                href="https://www.slido.com"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-lg bg-amber-400 text-ut-navy px-5 py-3 text-base font-semibold shadow hover:bg-amber-300 transition"
              >
                <MessageCircle size={18} /> Open slido.com
              </a>
            )}
            <span className="text-sm text-white/90">
              {code ? (
                <>or open slido.com and enter the code <span className="font-mono font-semibold text-white">#{code}</span></>
              ) : slido ? (
                <>Choose a nickname - the best scores are shown at the end.</>
              ) : (
                <>and enter the code shown by the lecturer.</>
              )}
            </span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href={SESSION.slides} target="_blank" rel="noopener" className="group rounded-2xl bg-white shadow-card border border-slate-100 p-5 hover:border-ut-medium/60 transition flex flex-col">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ut-navy to-ut-dark text-white grid place-items-center mb-3"><Presentation size={20} /></div>
          <h2 className="font-semibold text-ut-navy">Lecture slides (PDF)</h2>
          <p className="text-sm text-slate-600 mt-1 flex-1">Part 1: why profit is not cash, the cash flow statement, the notes, Estonian income tax in the accounts.</p>
          <span className="mt-3 inline-flex items-center text-sm text-ut-dark group-hover:text-ut-navy"><Download size={14} className="mr-1" /> Open the slides</span>
        </a>
        <a href={SESSION.handout} target="_blank" rel="noopener" className="group rounded-2xl bg-white shadow-card border border-slate-100 p-5 hover:border-ut-medium/60 transition flex flex-col">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ut-dark to-ut-medium text-white grid place-items-center mb-3"><FileText size={20} /></div>
          <h2 className="font-semibold text-ut-navy">Workshop assignment (PDF)</h2>
          <p className="text-sm text-slate-600 mt-1 flex-1">Part 2: Supilinn Cycles OÜ. Two pages with the transactions, the account codes and the check figures.</p>
          <span className="mt-3 inline-flex items-center text-sm text-ut-dark group-hover:text-ut-navy"><Download size={14} className="mr-1" /> Open the assignment</span>
        </a>
        <Link href="/journal?load=workshop" className="group rounded-2xl bg-white shadow-card border border-slate-100 p-5 hover:border-ut-medium/60 transition flex flex-col">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ut-medium to-ut-light text-white grid place-items-center mb-3"><ClipboardList size={20} /></div>
          <h2 className="font-semibold text-ut-navy">Workbook: start the workshop</h2>
          <p className="text-sm text-slate-600 mt-1 flex-1">Opens the journal with the list of assignments. Choose &quot;Student version: Simplified&quot;. Best on a laptop.</p>
          <span className="mt-3 inline-flex items-center text-sm text-ut-dark group-hover:text-ut-navy">Open the journal <ArrowRight size={14} className="ml-1 transition group-hover:translate-x-0.5" /></span>
        </Link>
      </section>

      <section className="rounded-2xl bg-white shadow-card border border-slate-100 p-5 sm:p-6">
        <h2 className="font-semibold text-ut-navy">Part 2 · Workshop in five steps</h2>
        <p className="text-sm text-slate-600 mt-1">Work in pairs, one laptop per pair. Your work is saved in your browser only.</p>
        <ol className="mt-4 space-y-2">
          {workshop.map((s) => (
            <li key={s.n} className="rounded-xl border border-slate-100 p-3 flex flex-wrap items-center gap-3">
              <span className="w-8 h-8 shrink-0 rounded-full bg-ut-navy text-white grid place-items-center text-sm font-semibold">{s.n}</span>
              <div className="flex-1 min-w-[14rem]">
                <div className="font-medium text-ut-navy">{s.title} <span className="ml-1 text-xs font-normal text-slate-500">{s.time}</span></div>
                <p className="text-sm text-slate-600">{s.text}</p>
              </div>
              <Link href={s.href} className="inline-flex items-center gap-1 rounded-md border border-ut-medium text-ut-dark px-3 py-1.5 text-sm bg-white hover:bg-ut-light/30 transition">
                <s.icon size={14} /> {s.cta}
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-slate-600">
          Behind after step 2? In the journal choose Load assignment and take &quot;Everything booked, cash-flow tags blank&quot;, then continue with step 3.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/tax" className="rounded-2xl bg-white shadow-card border border-slate-100 p-5 hover:border-ut-medium/60 transition">
          <div className="flex items-center gap-2 font-semibold text-ut-navy"><Landmark size={18} /> Income tax calculator</div>
          <p className="text-sm text-slate-600 mt-1">22/78 on a dividend, a fringe benefit or a private expense - for the four amounts you calculate in step 2.</p>
        </Link>
        <Link href="/quiz" className="rounded-2xl bg-white shadow-card border border-slate-100 p-5 hover:border-ut-medium/60 transition">
          <div className="flex items-center gap-2 font-semibold text-ut-navy"><GraduationCap size={18} /> After the class: self-test D</div>
          <p className="text-sm text-slate-600 mt-1">Questions on the cash flow statement, the notes and Estonian income tax, with an explanation after each answer.</p>
        </Link>
        <Link href="/learn#cashflow" className="rounded-2xl bg-white shadow-card border border-slate-100 p-5 hover:border-ut-medium/60 transition">
          <div className="flex items-center gap-2 font-semibold text-ut-navy"><ScrollText size={18} /> Summary of today</div>
          <p className="text-sm text-slate-600 mt-1">The three activities, the two methods, what belongs in the notes - on one page for revision.</p>
        </Link>
      </section>
    </div>
  );
}
