"use client";

import { useEffect, useState } from "react";
import { BookOpenCheck, ExternalLink, Loader2, X } from "lucide-react";
import type { ChartKey } from "@/lib/data/charts";

type Assignment = {
  id: string;
  title: string;
  description: string;
  student: string;
  solutions: Partial<Record<ChartKey, string>>;
  /** Optional chart-specific student files (when the student file already contains accounts, e.g. opening balances). */
  students?: Partial<Record<ChartKey, string>>;
  /** Optional intermediate versions, e.g. "booked, cash-flow tags still blank". */
  stages?: { label: string; files: Partial<Record<ChartKey, string>> }[];
};

const CHART_LABEL: Record<ChartKey, string> = {
  super: "Super-simplified",
  simplified: "Simplified",
  estonia: "Estonian",
};

const CHART_ORDER: ChartKey[] = ["super", "simplified", "estonia"];

export function LoadAssignment({
  onLoad,
}: {
  onLoad: (csv: string, opts: { suggestedChart?: ChartKey; title?: string }) => void;
}) {
  const [open, setOpen] = useState(false);

  // /journal?load=workshop (the link on the Today page) opens the list at once
  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search);
    if (q.has("load")) {
      setOpen(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);
  const [assignments, setAssignments] = useState<Assignment[] | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState("");

  useEffect(() => {
    if (!open || assignments) return;
    fetch("/assignments/index.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setAssignments)
      .catch(() => setAssignments([]));
  }, [open, assignments]);

  async function load(file: string, opts: { suggestedChart?: ChartKey; title?: string }) {
    setError(null);
    const url = file.startsWith("http") || file.startsWith("/") ? file : `/assignments/${file}`;
    setLoading(url);
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const text = await r.text();
      onLoad(text, opts);
      setOpen(false);
      setCustomUrl("");
    } catch (err) {
      setError(`Could not load this assignment: ${(err as Error).message}`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-md border border-ut-medium text-ut-dark px-3 py-1.5 text-sm bg-white hover:bg-ut-light/30 transition"
      >
        <BookOpenCheck size={14} /> Load assignment
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 flex items-center justify-center p-4 no-print"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="px-5 py-3 border-b border-slate-100 flex items-center gap-2 bg-ut-navy text-white">
              <BookOpenCheck size={16} />
              <h2 className="font-semibold flex-1">Load an assignment</h2>
              <button
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </header>
            <div className="px-5 py-4 overflow-y-auto scroll-thin">
              {assignments === null && (
                <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
                  <Loader2 size={14} className="animate-spin" /> Loading list…
                </div>
              )}
              {assignments && assignments.length === 0 && (
                <p className="text-sm text-slate-500">
                  No pre-made assignments available. You can paste a custom URL below — for example a raw GitHub link to a CSV file.
                </p>
              )}
              {assignments && assignments.length > 0 && (
                <ul className="space-y-3">
                  {assignments.map((a) => (
                    <li key={a.id} className="rounded-xl border border-slate-200 p-3">
                      <h3 className="font-semibold text-ut-navy text-sm">{a.title}</h3>
                      <p className="text-xs text-slate-600 mt-1">{a.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {a.students
                          ? CHART_ORDER.map((k) =>
                              a.students![k] ? (
                                <button
                                  key={`st-${k}`}
                                  onClick={() => load(a.students![k]!, { suggestedChart: k, title: a.title })}
                                  disabled={loading !== null}
                                  className="inline-flex items-center gap-1 rounded-md bg-ut-dark text-white px-3 py-1.5 text-xs hover:bg-ut-navy disabled:opacity-50 transition"
                                >
                                  Student version: {CHART_LABEL[k]}
                                </button>
                              ) : null
                            )
                          : (
                        <button
                          onClick={() =>
                            load(a.student, { title: a.title })
                          }
                          disabled={loading !== null}
                          className="inline-flex items-center gap-1 rounded-md bg-ut-dark text-white px-3 py-1.5 text-xs hover:bg-ut-navy disabled:opacity-50 transition"
                        >
                          {loading?.endsWith(a.student) ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : null}
                          Student version (blank Dr/Cr)
                        </button>
                            )}
                        {(a.stages ?? []).map((stg) =>
                          CHART_ORDER.map((k) =>
                            stg.files[k] ? (
                              <button
                                key={`${stg.label}-${k}`}
                                onClick={() => load(stg.files[k]!, { suggestedChart: k, title: `${a.title} - ${stg.label}` })}
                                disabled={loading !== null}
                                className="inline-flex items-center gap-1 rounded-md border border-ut-medium bg-white text-ut-dark px-3 py-1.5 text-xs hover:bg-ut-light/30 disabled:opacity-50 transition"
                              >
                                {stg.label}: {CHART_LABEL[k]}
                              </button>
                            ) : null
                          )
                        )}
                        {CHART_ORDER.map((k) =>
                          a.solutions[k] ? (
                            <button
                              key={k}
                              onClick={() =>
                                load(a.solutions[k]!, {
                                  suggestedChart: k,
                                  title: `${a.title} — solution (${CHART_LABEL[k]})`,
                                })
                              }
                              disabled={loading !== null}
                              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white text-slate-700 px-3 py-1.5 text-xs hover:border-ut-medium hover:text-ut-dark disabled:opacity-50 transition"
                            >
                              {loading?.endsWith(a.solutions[k]!) ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : null}
                              Solution: {CHART_LABEL[k]}
                            </button>
                          ) : null
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 pt-4 border-t border-slate-100">
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Or paste a CSV link (e.g. raw GitHub URL)
                </label>
                <div className="flex gap-2">
                  <input
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://raw.githubusercontent.com/.../assignment.csv"
                    className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ut-medium focus:border-ut-medium"
                  />
                  <button
                    onClick={() => customUrl && load(customUrl.trim(), {})}
                    disabled={!customUrl.trim() || loading !== null}
                    className="inline-flex items-center gap-1 rounded-md bg-ut-dark text-white px-3 py-1.5 text-sm hover:bg-ut-navy disabled:opacity-50 transition"
                  >
                    {loading === customUrl.trim() ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <ExternalLink size={14} />
                    )}
                    Fetch
                  </button>
                </div>
                {error && <p className="mt-2 text-xs text-rose-700">{error}</p>}
                <p className="mt-2 text-[11px] text-slate-500">
                  Tip: on GitHub open the CSV file → click <span className="font-mono">Raw</span> → copy the URL from the address bar.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
