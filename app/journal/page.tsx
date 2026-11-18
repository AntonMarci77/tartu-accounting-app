"use client";

import { useEffect, useMemo, useRef } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { Plus, Trash2, RotateCcw, Download, Upload, Layers } from "lucide-react";
import { useJournal, emptyEntry, type JournalEntry } from "@/lib/store";
import { CHARTS, findAccount, categoryBadgeColor } from "@/lib/data/charts";
import { AccountPicker } from "@/components/AccountPicker";
import { AmountInput } from "@/components/AmountInput";
import { DateInput } from "@/components/DateInput";
import { StatementsPanel } from "@/components/StatementsPanel";
import { TAccountsGrid } from "@/components/TAccountsGrid";
import { ChartReference } from "@/components/ChartReference";
import { LoadAssignment } from "@/components/LoadAssignment";
import { formatEUR, parseEUDate, formatEUDate, todayISO } from "@/lib/format";
import { CF_TAGS, CF_SECTION_LABEL, findTag, touchesCash, type CfSection } from "@/lib/cashflow";
import type { ChartKey } from "@/lib/data/charts";

const COLS = ["date", "doc", "description", "amount", "debit", "credit"] as const;
type ColKey = (typeof COLS)[number];

export default function JournalPage() {
  const { entries, setEntries, chart, setChart, hydrated } = useJournal();
  const fieldRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function setRef(rowId: string, col: ColKey, el: HTMLInputElement | null) {
    fieldRefs.current[`${rowId}:${col}`] = el;
  }

  function focusNext(rowId: string, col: ColKey) {
    const idx = COLS.indexOf(col);
    if (idx < COLS.length - 1) {
      const nextCol = COLS[idx + 1];
      const el = fieldRefs.current[`${rowId}:${nextCol}`];
      if (el) {
        el.focus();
        el.select?.();
        return;
      }
    }
    // End of row — jump to the next existing row, or synchronously create one.
    const cur = fieldRefs.current[`${rowId}:${col}`];
    cur?.blur();
    const idxOfRow = entries.findIndex((e) => e.id === rowId);
    let nextRowId: string | undefined;
    if (idxOfRow >= 0 && idxOfRow < entries.length - 1) {
      nextRowId = entries[idxOfRow + 1].id;
    } else {
      const newRow = emptyEntry(entries.length + 1);
      flushSync(() => {
        setEntries((prev) => [...prev, newRow]);
      });
      nextRowId = newRow.id;
    }
    const el = fieldRefs.current[`${nextRowId}:date`];
    el?.focus();
    el?.select?.();
  }

  function update(rowId: string, patch: Partial<JournalEntry>) {
    setEntries((prev) => prev.map((e) => (e.id === rowId ? { ...e, ...patch } : e)));
  }

  function addRow(): string {
    const newRow = emptyEntry(entries.length + 1);
    flushSync(() => {
      setEntries((prev) => [...prev, newRow]);
    });
    return newRow.id;
  }

  function removeRow(rowId: string) {
    setEntries((prev) => {
      const filtered = prev.filter((e) => e.id !== rowId);
      const renum = filtered.map((e, i) => ({ ...e, no: i + 1 }));
      return renum.length ? renum : [emptyEntry(1)];
    });
  }

  function clearAll() {
    if (!confirm("Clear the whole journal? This cannot be undone.")) return;
    setEntries([emptyEntry(1)]);
  }

  const totals = useMemo(() => {
    let dr = 0,
      cr = 0;
    for (const e of entries) {
      if (e.debit) dr += e.amount || 0;
      if (e.credit) cr += e.amount || 0;
    }
    return { dr, cr };
  }, [entries]);

  const cashRows = useMemo(() => {
    let total = 0,
      tagged = 0;
    for (const e of entries) {
      if (!touchesCash(e, chart)) continue;
      total++;
      if (findTag(e.cf)) tagged++;
    }
    return { total, tagged };
  }, [entries, chart]);

  function exportCSV() {
    const header = "no;date;doc;description;amount;debit;credit;cf";
    const rows = entries.map((e) =>
      [
        e.no,
        formatEUDate(e.date, true),
        e.doc,
        `"${(e.description || "").replace(/"/g, '""')}"`,
        (e.amount || 0).toFixed(2).replace(".", ","),
        e.debit,
        e.credit,
        e.cf || "",
      ].join(";")
    );
    const blob = new Blob(["﻿" + [header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `journal-${todayISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importCSV(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target?.result || "");
      ingestCSV(text);
    };
    reader.readAsText(file, "utf-8");
  }

  function ingestCSV(rawText: string) {
    try {
      const text = rawText.replace(/^﻿/, "");
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (!lines.length) return;
      const startIdx = /^\s*no\s*[;,]/i.test(lines[0]) ? 1 : 0;
      const out: JournalEntry[] = [];
      for (let i = startIdx; i < lines.length; i++) {
        const parts = parseCSVLine(lines[i]);
        if (parts.length < 7) continue;
        const [no, dateRaw, doc, desc, p4, p5, p6] = parts;
        // Three CSV layouts seen in the wild:
        //   legacy:  no;date;doc;description;debit;credit;amount
        //   v2:      no;date;doc;description;amount;credit;debit
        //   current: no;date;doc;description;amount;debit;credit
        const headerLine = startIdx === 1 ? lines[0].toLowerCase() : "";
        let amtRaw = p6, dr = p4, cr = p5;
        if (headerLine.includes("amount;debit;credit")) {
          amtRaw = p4; dr = p5; cr = p6;
        } else if (headerLine.includes("amount;credit;debit")) {
          amtRaw = p4; cr = p5; dr = p6;
        }
        out.push({
          id: Math.random().toString(36).slice(2, 10),
          no: parseInt(no, 10) || out.length + 1,
          date: parseEUDate(dateRaw) || dateRaw,
          doc,
          description: desc.replace(/^"|"$/g, "").replace(/""/g, '"'),
          debit: dr,
          credit: cr,
          amount: parseFloat(amtRaw.replace(/\s/g, "").replace(",", ".")) || 0,
          // optional 8th column: cash-flow tag (current layout only)
          cf: headerLine.includes("credit;cf") && parts[7] ? parts[7].toUpperCase() : "",
        });
      }
      // Add a trailing blank row so students can keep typing
      if (out.length) {
        out.push(emptyEntry(out.length + 1));
        setEntries(out);
      }
    } catch (err) {
      alert("Could not parse the file. Please check the CSV format.");
    }
  }

  function loadAssignment(text: string, opts: { suggestedChart?: ChartKey; title?: string }) {
    if (opts.suggestedChart && opts.suggestedChart !== chart) {
      setChart(opts.suggestedChart);
    }
    ingestCSV(text);
  }

  if (!hydrated) {
    return <div className="text-slate-500 text-sm">Loading…</div>;
  }

  const journalCard = (
    <section className="space-y-3">
      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {entries.map((e) => (
          <MobileRow
            key={e.id}
            entry={e}
            chart={chart}
            update={(patch) => update(e.id, patch)}
            remove={() => removeRow(e.id)}
            setRef={(col, el) => setRef(e.id, col, el)}
            focusNext={(col) => focusNext(e.id, col)}
          />
        ))}
        <button
          className="w-full rounded-lg border-2 border-dashed border-ut-medium/40 text-ut-dark py-3 hover:bg-white transition flex items-center justify-center gap-2"
          onClick={() => addRow()}
        >
          <Plus size={16} /> Add row
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto scroll-thin">
          <table className="w-full text-sm">
            <thead className="bg-ut-navy text-white">
              <tr className="text-left">
                <th className="px-3 py-2 w-10">#</th>
                <th className="px-3 py-2 w-24">Date</th>
                <th className="px-3 py-2 w-20">Doc</th>
                <th className="px-3 py-2 min-w-[12rem]">Description{chart !== "super" ? " · cash flow" : ""}</th>
                <th className="px-3 py-2 w-28 text-right">Amount</th>
                <th className="px-3 py-2 w-32">Debit (Dr)</th>
                <th className="px-3 py-2 w-32">Credit (Cr)</th>
                <th className="px-3 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <DesktopRow
                  key={e.id}
                  entry={e}
                  chart={chart}
                  update={(patch) => update(e.id, patch)}
                  remove={() => removeRow(e.id)}
                  setRef={(col, el) => setRef(e.id, col, el)}
                  focusNext={(col) => focusNext(e.id, col)}
                />
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-medium">
              <tr>
                <td colSpan={4} className="px-3 py-2 text-right text-slate-600">
                  Totals
                </td>
                <td
                  className={`px-3 py-2 text-right tabular-nums ${
                    Math.abs(totals.dr - totals.cr) < 0.01 ? "text-emerald-700" : "text-rose-600"
                  }`}
                >
                  {Math.abs(totals.dr - totals.cr) < 0.01 ? "balanced" : `Δ ${formatEUR(totals.dr - totals.cr)}`}
                </td>
                <td className="px-3 py-2 tabular-nums">{formatEUR(totals.dr)}</td>
                <td className="px-3 py-2 tabular-nums">{formatEUR(totals.cr)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => addRow()}
          className="hidden md:inline-flex items-center gap-1 rounded-md bg-ut-dark text-white px-3 py-1.5 text-sm hover:bg-ut-navy transition"
        >
          <Plus size={14} /> Add row
        </button>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm bg-white hover:bg-slate-50 transition"
        >
          <Download size={14} /> Export CSV
        </button>
        <label className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm bg-white hover:bg-slate-50 transition cursor-pointer">
          <Upload size={14} /> Import CSV
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importCSV(f);
              e.target.value = "";
            }}
          />
        </label>
        <LoadAssignment onLoad={loadAssignment} />
        <button
          onClick={clearAll}
          className="ml-auto inline-flex items-center gap-1 rounded-md border border-rose-300 text-rose-700 px-3 py-1.5 text-sm hover:bg-rose-50 transition"
        >
          <RotateCcw size={14} /> Clear journal
        </button>
      </div>
    </section>
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ut-navy">Accounting Journal</h1>
          <p className="text-sm text-slate-600 mt-1">
            Tab or Enter to move from field to field. The T-accounts and statements on this page update with every transaction —
            watch them shift as you type. Rows that move cash get a cash-flow tag (operating, investing or financing) for the
            cash flow statement.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {chart !== "super" && cashRows.total > 0 && (
            <Link
              href="/cash-flow"
              className={`text-xs rounded-full px-3 py-1 border transition ${
                cashRows.tagged === cashRows.total
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-amber-50 border-amber-200 text-amber-800"
              }`}
            >
              Cash flow tags: {cashRows.tagged}/{cashRows.total} → statement
            </Link>
          )}
          <label className="text-xs text-slate-500">Chart</label>
          <select
            value={chart}
            onChange={(e) => setChart(e.target.value as typeof chart)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm bg-white"
          >
            {Object.values(CHARTS).map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Journal on the left, Statements + Chart of Accounts in the right rail (sticky on xl, stacked below xl). */}
      <div className="grid xl:grid-cols-12 gap-4 xl:gap-6">
        <div className="xl:col-span-8 space-y-3">{journalCard}</div>

        <aside className="xl:col-span-4">
          <div className="xl:sticky xl:top-20 space-y-4">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-ut-medium mb-2">Live statements</h2>
              <StatementsPanel entries={entries} chart={chart} variant="compact" />
            </div>
            <ChartReference chart={chart} />
          </div>
        </aside>
      </div>

      {/* Live T-accounts — desktop and tablet */}
      <section className="hidden md:block">
        <header className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ut-medium">Live T-accounts</h2>
          <Link href="/t-accounts" className="text-xs text-ut-dark hover:underline">
            Open full view →
          </Link>
        </header>
        <TAccountsGrid entries={entries} chart={chart} density="compact" />
      </section>

      {/* Mobile: quick link to T-accounts page (statements & chart already render above in the aside) */}
      <div className="md:hidden">
        <Link
          href="/t-accounts"
          className="block rounded-lg bg-white border border-slate-200 p-3 text-sm flex items-center gap-2 hover:border-ut-medium transition"
        >
          <Layers size={16} className="text-ut-dark" />
          <span>
            <span className="block font-medium text-ut-navy">Open T-accounts</span>
            <span className="block text-[11px] text-slate-500">see every posting on the debit/credit side it lands on</span>
          </span>
        </Link>
      </div>

      <p className="text-xs text-slate-500">
        Tip: in the amount field, use a comma for cents (e.g. <span className="font-mono">122,22</span>). Dates can be typed as
        <span className="font-mono"> DD/MM/YY</span> or <span className="font-mono"> DD/MM/YYYY</span> — slashes appear as you type.
      </p>
    </div>
  );
}

function parseCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQ = !inQ;
    } else if (ch === ";" && !inQ) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

// ===== Desktop row =====
function DesktopRow(props: {
  entry: JournalEntry;
  chart: keyof typeof CHARTS;
  update: (p: Partial<JournalEntry>) => void;
  remove: () => void;
  setRef: (col: ColKey, el: HTMLInputElement | null) => void;
  focusNext: (col: ColKey) => void;
}) {
  const { entry, chart, update, remove, setRef, focusNext } = props;
  const dr = findAccount(entry.debit, chart);
  const cr = findAccount(entry.credit, chart);
  return (
    <tr className="border-t border-slate-100 hover:bg-slate-50/50">
      <td className="px-3 py-1.5 text-slate-500">{entry.no}</td>
      <td className="px-2 py-1.5">
        <DateInput
          ref={(el) => setRef("date", el)}
          value={entry.date}
          onChange={(iso) => update({ date: iso })}
          onConfirm={() => focusNext("date")}
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          ref={(el) => setRef("doc", el)}
          value={entry.doc}
          onChange={(e) => update({ doc: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) {
              e.preventDefault();
              focusNext("doc");
            }
          }}
          placeholder="INV-001"
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ut-medium focus:border-ut-medium"
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          ref={(el) => setRef("description", el)}
          value={entry.description}
          onChange={(e) => update({ description: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) {
              e.preventDefault();
              focusNext("description");
            }
          }}
          placeholder="Description"
          title={entry.description}
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ut-medium focus:border-ut-medium"
        />
        {chart !== "super" && touchesCash(entry, chart) && (
          <div className="mt-1">
            <CfSelect entry={entry} chart={chart} update={update} />
          </div>
        )}
      </td>
      <td className="px-2 py-1.5">
        <AmountInput
          ref={(el) => setRef("amount", el)}
          value={entry.amount}
          onChange={(n) => update({ amount: n })}
          onConfirm={() => focusNext("amount")}
        />
      </td>
      <td className="px-2 py-1.5">
        <AccountPicker
          ref={(el) => setRef("debit", el)}
          value={entry.debit}
          chart={chart}
          onChange={(v) => update({ debit: v })}
          onConfirm={() => focusNext("debit")}
        />
        {dr && (
          <span className={`mt-1 inline-block text-[10px] px-1.5 py-0.5 rounded ${categoryBadgeColor[dr.category]}`}>
            {dr.name}
          </span>
        )}
      </td>
      <td className="px-2 py-1.5">
        <AccountPicker
          ref={(el) => setRef("credit", el)}
          value={entry.credit}
          chart={chart}
          onChange={(v) => update({ credit: v })}
          onConfirm={() => focusNext("credit")}
        />
        {cr && (
          <span className={`mt-1 inline-block text-[10px] px-1.5 py-0.5 rounded ${categoryBadgeColor[cr.category]}`}>
            {cr.name}
          </span>
        )}
      </td>
      <td className="px-2 py-1.5 text-right">
        <button
          onClick={remove}
          aria-label="Remove row"
          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
}

// ===== Mobile card row =====
function MobileRow(props: {
  entry: JournalEntry;
  chart: keyof typeof CHARTS;
  update: (p: Partial<JournalEntry>) => void;
  remove: () => void;
  setRef: (col: ColKey, el: HTMLInputElement | null) => void;
  focusNext: (col: ColKey) => void;
}) {
  const { entry, chart, update, remove, setRef, focusNext } = props;
  const dr = findAccount(entry.debit, chart);
  const cr = findAccount(entry.credit, chart);
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-slate-500">#{entry.no}</span>
        <button
          onClick={remove}
          aria-label="Remove"
          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Date</label>
          <DateInput
            ref={(el) => setRef("date", el)}
            value={entry.date}
            onChange={(iso) => update({ date: iso })}
            onConfirm={() => focusNext("date")}
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Doc</label>
          <input
            ref={(el) => setRef("doc", el)}
            value={entry.doc}
            onChange={(e) => update({ doc: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                focusNext("doc");
              }
            }}
            placeholder="INV-001"
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ut-medium focus:border-ut-medium"
          />
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-medium text-slate-500 mb-1">Description</label>
        <input
          ref={(el) => setRef("description", el)}
          value={entry.description}
          onChange={(e) => update({ description: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) {
              e.preventDefault();
              focusNext("description");
            }
          }}
          placeholder="What happened?"
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ut-medium focus:border-ut-medium"
        />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-slate-500 mb-1">Amount (EUR)</label>
        <AmountInput
          ref={(el) => setRef("amount", el)}
          value={entry.amount}
          onChange={(n) => update({ amount: n })}
          onConfirm={() => focusNext("amount")}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Debit (Dr)</label>
          <AccountPicker
            ref={(el) => setRef("debit", el)}
            value={entry.debit}
            chart={chart}
            onChange={(v) => update({ debit: v })}
            onConfirm={() => focusNext("debit")}
          />
          {dr && (
            <span className={`mt-1 inline-block text-[10px] px-1.5 py-0.5 rounded ${categoryBadgeColor[dr.category]}`}>
              {dr.name}
            </span>
          )}
        </div>
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Credit (Cr)</label>
          <AccountPicker
            ref={(el) => setRef("credit", el)}
            value={entry.credit}
            chart={chart}
            onChange={(v) => update({ credit: v })}
            onConfirm={() => focusNext("credit")}
          />
          {cr && (
            <span className={`mt-1 inline-block text-[10px] px-1.5 py-0.5 rounded ${categoryBadgeColor[cr.category]}`}>
              {cr.name}
            </span>
          )}
        </div>
      </div>
      {chart !== "super" && touchesCash(entry, chart) && (
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Cash flow</label>
          <CfSelect entry={entry} chart={chart} update={update} />
        </div>
      )}
    </div>
  );
}

// ===== Cash-flow tag (only for rows that move cash) =====
const CF_SECTION_STYLE: Record<CfSection, string> = {
  O: "border-sky-300 bg-sky-50 text-sky-900",
  I: "border-violet-300 bg-violet-50 text-violet-900",
  F: "border-amber-300 bg-amber-50 text-amber-900",
  X: "border-slate-300 bg-slate-50 text-slate-700",
};

function CfSelect(props: {
  entry: JournalEntry;
  chart: keyof typeof CHARTS;
  update: (p: Partial<JournalEntry>) => void;
}) {
  const { entry, chart, update } = props;
  if (!touchesCash(entry, chart)) {
    return <span className="text-xs text-slate-300 px-1">-</span>;
  }
  const tag = findTag(entry.cf);
  const sections: CfSection[] = ["O", "I", "F", "X"];
  return (
    <select
      value={tag?.id ?? ""}
      onChange={(e) => update({ cf: e.target.value })}
      title={tag ? `${CF_SECTION_LABEL[tag.section]}: ${tag.label}` : "Which activity does this cash flow belong to?"}
      className={`w-full rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ut-medium ${
        tag ? CF_SECTION_STYLE[tag.section] : "border-rose-300 bg-rose-50 text-rose-700"
      }`}
    >
      <option value="">cash flow: choose activity…</option>
      {sections.map((sec) => (
        <optgroup key={sec} label={CF_SECTION_LABEL[sec]}>
          {CF_TAGS.filter((t) => t.section === sec).map((t) => (
            <option key={t.id} value={t.id}>
              {t.id} · {t.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
