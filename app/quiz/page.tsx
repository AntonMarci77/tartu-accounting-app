"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Award, Check, RefreshCw, X } from "lucide-react";
import { getQuestionsByVersion, type QuizQuestion } from "@/lib/data/quiz";

type AnswerState = Record<string, number[]>; // questionId → selected indices
type ResultState = Record<string, "right" | "wrong" | "partial">;

export default function QuizPage() {
  const [version, setVersion] = useState<string>("A");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [results, setResults] = useState<ResultState>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const qs = getQuestionsByVersion(version);
    setQuestions(qs);
    setAnswers({});
    setResults({});
    setSubmitted(false);
  }, [version]);

  const score = useMemo(() => {
    if (!submitted) return null;
    let s = 0;
    for (const q of questions) {
      if (results[q.id] === "right") s += 1;
    }
    return { correct: s, total: questions.length };
  }, [results, submitted, questions]);

  function toggle(qId: string, idx: number, type: QuizQuestion["type"]) {
    if (submitted) return;
    setAnswers((prev) => {
      const cur = prev[qId] ?? [];
      if (type === "multi") {
        return { ...prev, [qId]: cur.includes(idx) ? cur.filter((i) => i !== idx) : [...cur, idx] };
      }
      return { ...prev, [qId]: [idx] };
    });
  }

  function submit() {
    const next: ResultState = {};
    for (const q of questions) {
      const ans = (answers[q.id] ?? []).slice().sort();
      const correct = q.correct.slice().sort();
      const allRight = ans.length === correct.length && ans.every((v, i) => v === correct[i]);
      const someRight = ans.some((v) => correct.includes(v)) && ans.every((v) => correct.includes(v));
      next[q.id] = allRight ? "right" : someRight ? "partial" : "wrong";
    }
    setResults(next);
    setSubmitted(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setAnswers({});
    setResults({});
    setSubmitted(false);
  }

  function newRandom() {
    setVersion("RANDOM");
    if (version === "RANDOM") {
      // Force re-roll
      setQuestions(getQuestionsByVersion("RANDOM"));
      setAnswers({});
      setResults({});
      setSubmitted(false);
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ut-navy">Self-test</h1>
          <p className="text-sm text-slate-600 mt-1">
            Three pre-made test versions plus a random version. Click submit to see your score and the explanations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs text-slate-500">Version</label>
          {(["A", "B", "C"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVersion(v)}
              className={`w-9 h-9 rounded-md font-semibold text-sm border transition ${
                version === v
                  ? "bg-ut-navy text-white border-ut-navy"
                  : "bg-white border-slate-300 hover:border-ut-medium"
              }`}
            >
              {v}
            </button>
          ))}
          <button
            onClick={newRandom}
            className={`inline-flex items-center gap-1 rounded-md border px-3 h-9 text-sm transition ${
              version === "RANDOM"
                ? "bg-ut-navy text-white border-ut-navy"
                : "bg-white border-slate-300 hover:border-ut-medium"
            }`}
          >
            <RefreshCw size={14} /> Random
          </button>
        </div>
      </header>

      {submitted && score && (
        <div
          className={`rounded-2xl p-5 shadow-card border ${
            score.correct === score.total
              ? "border-emerald-200 bg-emerald-50"
              : score.correct >= score.total * 0.7
              ? "border-ut-light bg-ut-light/20"
              : "border-rose-200 bg-rose-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <Award className="text-ut-dark" />
            <div>
              <p className="font-semibold text-ut-navy">
                Result: {score.correct} / {score.total}
              </p>
              <p className="text-sm text-slate-600">
                {score.correct === score.total
                  ? "Perfect — you are ready."
                  : score.correct >= score.total * 0.7
                  ? "Solid. Read the explanations on the questions you missed."
                  : "Worth re-reading the Learn page before trying again."}
              </p>
            </div>
            <button
              onClick={reset}
              className="ml-auto inline-flex items-center gap-1 rounded-md bg-ut-dark text-white px-3 py-1.5 text-sm hover:bg-ut-navy transition"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        </div>
      )}

      <ol className="space-y-3">
        {questions.map((q, qi) => (
          <QuestionCard
            key={q.id}
            index={qi}
            q={q}
            answer={answers[q.id] ?? []}
            result={submitted ? results[q.id] : undefined}
            onToggle={(idx) => toggle(q.id, idx, q.type)}
          />
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-2 sticky bottom-3 no-print">
        {!submitted ? (
          <button
            onClick={submit}
            disabled={questions.some((q) => (answers[q.id] ?? []).length === 0)}
            className="inline-flex items-center gap-2 rounded-lg bg-ut-dark text-white px-4 py-2 text-sm font-medium hover:bg-ut-navy disabled:opacity-50 disabled:cursor-not-allowed transition shadow"
          >
            Submit answers <ArrowRight size={14} />
          </button>
        ) : (
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50 transition"
          >
            <RefreshCw size={14} /> Reset
          </button>
        )}
        <Link
          href="/learn"
          className="inline-flex items-center gap-1 text-sm text-ut-dark hover:underline"
        >
          <ArrowLeft size={14} /> Back to the Learn page
        </Link>
      </div>
    </div>
  );
}

function QuestionCard({
  q,
  index,
  answer,
  result,
  onToggle,
}: {
  q: QuizQuestion;
  index: number;
  answer: number[];
  result?: "right" | "wrong" | "partial";
  onToggle: (i: number) => void;
}) {
  return (
    <li
      className={`rounded-2xl bg-white shadow-card border p-4 sm:p-5 transition ${
        result === "right"
          ? "border-emerald-200"
          : result === "wrong"
          ? "border-rose-200"
          : result === "partial"
          ? "border-amber-200"
          : "border-slate-100"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="font-mono text-xs px-1.5 py-1 rounded bg-ut-navy text-white shrink-0">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-800 font-medium">{q.question}</p>
          <p className="text-[11px] uppercase tracking-wider text-ut-medium mt-1">
            {q.topic} · {q.type === "multi" ? "select all that apply" : q.type === "boolean" ? "true / false" : "single answer"}
          </p>
          <ul className="mt-3 space-y-1.5">
            {q.options.map((opt, i) => {
              const selected = answer.includes(i);
              const isCorrect = q.correct.includes(i);
              const showState = !!result;
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => onToggle(i)}
                    className={`w-full text-left flex items-start gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                      showState
                        ? isCorrect
                          ? "border-emerald-300 bg-emerald-50"
                          : selected
                          ? "border-rose-300 bg-rose-50"
                          : "border-slate-200 bg-white"
                        : selected
                        ? "border-ut-medium bg-ut-light/30"
                        : "border-slate-200 hover:border-ut-medium hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`mt-0.5 w-4 h-4 rounded-${q.type === "multi" ? "sm" : "full"} border flex items-center justify-center shrink-0 ${
                        showState
                          ? isCorrect
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : selected
                            ? "border-rose-500 bg-rose-500 text-white"
                            : "border-slate-300"
                          : selected
                          ? "border-ut-dark bg-ut-dark text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {showState && isCorrect ? (
                        <Check size={12} />
                      ) : showState && selected && !isCorrect ? (
                        <X size={12} />
                      ) : selected ? (
                        <Check size={12} />
                      ) : null}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {result && q.explanation && (
            <p className="mt-3 rounded-md bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-700">
              <span className="font-medium text-ut-dark">Why: </span>
              {q.explanation}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}
