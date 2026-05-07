"use client";

import { useEffect, useState } from "react";
import type { ChartKey } from "./data/charts";

export type JournalEntry = {
  id: string;
  no: number;
  date: string; // ISO YYYY-MM-DD
  doc: string;
  description: string;
  debit: string; // account code
  credit: string; // account code
  amount: number;
};

const KEY_ENTRIES = "tartu.journal.entries.v1";
const KEY_CHART = "tartu.journal.chart.v1";

export function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function emptyEntry(no: number): JournalEntry {
  return { id: makeId(), no, date: "", doc: "", description: "", debit: "", credit: "", amount: 0 };
}

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [chart, setChart] = useState<ChartKey>("simplified");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const e = localStorage.getItem(KEY_ENTRIES);
      const c = localStorage.getItem(KEY_CHART);
      if (e) setEntries(JSON.parse(e));
      else setEntries([emptyEntry(1)]);
      if (c) setChart(JSON.parse(c));
    } catch {
      setEntries([emptyEntry(1)]);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY_ENTRIES, JSON.stringify(entries));
  }, [entries, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY_CHART, JSON.stringify(chart));
  }, [chart, hydrated]);

  return { entries, setEntries, chart, setChart, hydrated };
}
