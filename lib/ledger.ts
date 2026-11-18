// Ledger helpers shared by the statements, the cash flow page and the notes.
//
// Sign convention ("statement value"): assets and expenses are debit-positive,
// liabilities, equity and revenue are credit-positive. A contra account such as
// accumulated depreciation therefore shows as a negative asset.

import {
  cashClass,
  findAccount,
  isAccumulatedDepreciation,
  isOpeningAccount,
  type Account,
  type CashClass,
  type ChartKey,
} from "./data/charts";
import type { JournalEntry } from "./store";

export type LedgerRow = {
  account: Account;
  cls: CashClass | null;
  opening: number; // statement value at the start of the period (from opening-balance entries)
  debits: number; // period debits (excluding opening entries)
  credits: number; // period credits (excluding opening entries)
  closing: number; // statement value at the end of the period
  // period movements split by the nature of the counter-account (raw debit / credit amounts)
  debitFromPL: number;
  creditToPL: number;
  debitFromInv: number;
  creditToInv: number;
};

export function sideSign(acc: Account): 1 | -1 {
  return acc.category === "asset" || acc.category === "expense" ? 1 : -1;
}

export function buildLedger(entries: JournalEntry[], chart: ChartKey): LedgerRow[] {
  const m = new Map<string, LedgerRow>();
  const get = (code: string): LedgerRow | null => {
    const key = code.toUpperCase();
    let row = m.get(key);
    if (!row) {
      const acc = findAccount(key, chart);
      if (!acc) return null;
      row = {
        account: acc,
        cls: cashClass(key, chart),
        opening: 0,
        debits: 0,
        credits: 0,
        closing: 0,
        debitFromPL: 0,
        creditToPL: 0,
        debitFromInv: 0,
        creditToInv: 0,
      };
      m.set(key, row);
    }
    return row;
  };
  const isPLcode = (code: string) => {
    const a = findAccount(code, chart);
    return !!a && (a.category === "revenue" || a.category === "expense");
  };
  const isInvCode = (code: string) => cashClass(code, chart) === "INV";

  for (const e of entries) {
    if (!e.amount) continue;
    const opening = isOpeningAccount(e.debit, chart) || isOpeningAccount(e.credit, chart);
    if (e.debit) {
      const r = get(e.debit);
      if (r) {
        const v = sideSign(r.account) * e.amount;
        if (opening) r.opening += v;
        else {
          r.debits += e.amount;
          if (e.credit && isPLcode(e.credit)) r.debitFromPL += e.amount;
          if (e.credit && isInvCode(e.credit)) r.debitFromInv += e.amount;
        }
        r.closing += v;
      }
    }
    if (e.credit) {
      const r = get(e.credit);
      if (r) {
        const v = -sideSign(r.account) * e.amount;
        if (opening) r.opening += v;
        else {
          r.credits += e.amount;
          if (e.debit && isPLcode(e.debit)) r.creditToPL += e.amount;
          if (e.debit && isInvCode(e.debit)) r.creditToInv += e.amount;
        }
        r.closing += v;
      }
    }
  }
  return Array.from(m.values()).sort((a, b) => a.account.code.localeCompare(b.account.code));
}

export type Totals = {
  assets: number;
  liabilities: number;
  equity: number; // booked equity accounts (without the result of the period)
  revenue: number;
  expenses: number;
  profit: number;
  cash: number;
  retainedEarnings: number; // booked retained earnings + profit of the period
};

function isRetainedEarnings(code: string, chart: ChartKey): boolean {
  const c = code.toUpperCase();
  if (chart === "simplified") return c === "E3" || c === "E4";
  if (chart === "estonia") return c === "2960" || c === "2970";
  return false;
}

export function ledgerTotals(rows: LedgerRow[], chart: ChartKey): Totals {
  const t: Totals = { assets: 0, liabilities: 0, equity: 0, revenue: 0, expenses: 0, profit: 0, cash: 0, retainedEarnings: 0 };
  for (const r of rows) {
    if (isOpeningAccount(r.account.code, chart)) continue;
    const cat = r.account.category;
    if (cat === "asset") t.assets += r.closing;
    else if (cat === "liability") t.liabilities += r.closing;
    else if (cat === "equity") t.equity += r.closing;
    else if (cat === "revenue") t.revenue += r.closing;
    else if (cat === "expense") t.expenses += r.closing;
    if (r.cls === "CASH") t.cash += r.closing;
    if (isRetainedEarnings(r.account.code, chart)) t.retainedEarnings += r.closing;
  }
  t.profit = t.revenue - t.expenses;
  t.retainedEarnings += t.profit;
  return t;
}

// ---------------------------------------------------------------------------
// Non-current asset movement schedule (notes: property, plant and equipment
// and intangible assets - ASBG 15 par. 33, small undertakings par. 59 d)
// ---------------------------------------------------------------------------
export type AssetMovement = {
  costOpening: number;
  additions: number;
  disposals: number; // at cost, shown as a negative number
  costClosing: number;
  depOpening: number; // positive numbers = accumulated depreciation
  depCharge: number;
  depDisposals: number; // negative
  depClosing: number;
  carryingOpening: number;
  carryingClosing: number;
  assetAccounts: LedgerRow[];
  depAccounts: LedgerRow[];
};

export function assetMovement(rows: LedgerRow[], chart: ChartKey): AssetMovement {
  const inv = rows.filter((r) => r.cls === "INV");
  const dep = inv.filter((r) => isAccumulatedDepreciation(r.account.code, chart));
  const cost = inv.filter((r) => !isAccumulatedDepreciation(r.account.code, chart));

  let costOpening = 0, additions = 0, disposals = 0, costClosing = 0;
  for (const r of cost) {
    costOpening += r.opening;
    costClosing += r.closing;
    // additions: debits that do not come from income (gain transfer) or from another non-current asset account
    additions += r.debits - r.debitFromPL - r.debitFromInv;
  }
  // disposals at cost = whatever else explains the movement of the cost accounts
  disposals = costClosing - costOpening - additions;

  let depOpening = 0, depCharge = 0, depClosing = 0;
  for (const r of dep) {
    depOpening += -r.opening;
    depClosing += -r.closing;
    depCharge += r.creditToPL;
  }
  const depDisposals = depClosing - depOpening - depCharge;

  return {
    costOpening,
    additions,
    disposals,
    costClosing,
    depOpening,
    depCharge,
    depDisposals,
    depClosing,
    carryingOpening: costOpening - depOpening,
    carryingClosing: costClosing - depClosing,
    assetAccounts: cost,
    depAccounts: dep,
  };
}
