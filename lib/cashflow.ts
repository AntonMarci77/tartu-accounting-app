// Cash flow statement engine.
//
// Direct method: every journal row that touches a cash account carries a
// cash-flow tag chosen by the student (journal column "Cash flow").
//
// Indirect method: derived automatically from the same journal - operating
// profit, non-cash items and changes in working capital - without relying on
// the student's tags for balance-sheet flows. When the tags are right, both
// methods give the same net cash from operating activities, so the two
// statements check each other.
//
// Classification follows IAS 7 and the Estonian guideline RTJ 2 (ASBG 2),
// paragraphs 34-44: interest paid and income tax paid are operating by
// default (financing is an allowed alternative for interest paid and for
// income tax related to dividends); interest and dividends received are
// investing by default.

import {
  cashClass,
  findAccount,
  isAccumulatedDepreciation,
  isDepreciationExpense,
  isOpeningAccount,
  type Account,
  type CashClass,
  type ChartKey,
} from "./data/charts";
import type { JournalEntry } from "./store";

export type CfSection = "O" | "I" | "F" | "X";

export type CfTag = {
  id: string;
  section: CfSection;
  label: string;
  /** Expected direction of cash: "in", "out" or "any". Used only for soft warnings. */
  dir: "in" | "out" | "any";
};

export const CF_TAGS: CfTag[] = [
  { id: "O1", section: "O", label: "Receipts from customers", dir: "in" },
  { id: "O2", section: "O", label: "Payments to suppliers", dir: "out" },
  { id: "O3", section: "O", label: "Payments to employees (incl. payroll taxes)", dir: "out" },
  { id: "O4", section: "O", label: "Interest paid", dir: "out" },
  { id: "O5", section: "O", label: "Income tax paid", dir: "out" },
  { id: "O6", section: "O", label: "Other operating receipts and payments", dir: "any" },
  { id: "I1", section: "I", label: "Purchase of non-current assets", dir: "out" },
  { id: "I2", section: "I", label: "Sale of non-current assets", dir: "in" },
  { id: "I3", section: "I", label: "Loans granted, investments made", dir: "out" },
  { id: "I4", section: "I", label: "Loans repaid to us, investments sold", dir: "in" },
  { id: "I5", section: "I", label: "Interest and dividends received", dir: "in" },
  { id: "F1", section: "F", label: "Loans received", dir: "in" },
  { id: "F2", section: "F", label: "Loans repaid (and lease payments)", dir: "out" },
  { id: "F3", section: "F", label: "Share capital paid in", dir: "in" },
  { id: "F4", section: "F", label: "Dividends paid", dir: "out" },
  { id: "F5", section: "F", label: "Income tax on dividends (allowed alternative)", dir: "out" },
  { id: "F6", section: "F", label: "Interest paid (allowed alternative)", dir: "out" },
  { id: "X0", section: "X", label: "Transfer between cash accounts (no cash flow)", dir: "any" },
];

export const CF_SECTION_LABEL: Record<CfSection, string> = {
  O: "Operating activities",
  I: "Investing activities",
  F: "Financing activities",
  X: "Not a cash flow",
};

export function findTag(id?: string): CfTag | undefined {
  if (!id) return undefined;
  return CF_TAGS.find((t) => t.id === id.toUpperCase());
}

/** True when the journal row moves cash (and therefore needs a cash-flow tag). */
export function touchesCash(e: JournalEntry, chart: ChartKey): boolean {
  if (!e.amount || !e.debit || !e.credit) return false;
  if (isOpeningAccount(e.debit, chart) || isOpeningAccount(e.credit, chart)) return false;
  return cashClass(e.debit, chart) === "CASH" || cashClass(e.credit, chart) === "CASH";
}

export function isOpeningEntry(e: JournalEntry, chart: ChartKey): boolean {
  return isOpeningAccount(e.debit, chart) || isOpeningAccount(e.credit, chart);
}

export type CfLine = { id: string; label: string; amount: number; memo?: boolean; strong?: boolean };

export type CfWarning = { no: number; description: string; message: string };

export type CashFlowResult = {
  supported: boolean;
  /** Rows with an amount but without both accounts - ignored by the engine. */
  incompleteRows: number[];
  openingCash: number;
  closingCash: number;
  change: number;
  direct: {
    O: CfLine[];
    I: CfLine[];
    F: CfLine[];
    totals: { O: number; I: number; F: number };
    untagged: number;
    untaggedRows: number[];
    total: number;
  };
  indirect: {
    bridge: CfLine[]; // profit for the period -> operating profit
    lines: CfLine[];
    total: number;
    profit: number;
    operatingProfit: number;
  };
  /** direct operating minus indirect operating (zero when the tags are consistent). */
  difference: number;
  warnings: CfWarning[];
  /** Investing / financing transactions without cash - to be disclosed in the notes (IAS 7.43). */
  nonCash: { no: number; description: string; amount: number }[];
};

const isWC = (k: CashClass | null) => k === "WC_REC" || k === "WC_INV" || k === "WC_LIAB";
const isPL = (k: CashClass | null) => k === "PL_OP" || k === "PL_FIN";

function isIncomeTaxExpense(code: string, chart: ChartKey): boolean {
  const c = (code || "").toUpperCase();
  if (chart === "simplified") return c === "X8";
  if (chart === "estonia") return c === "8900";
  return false;
}

const OPERATING_PLAIN = new Set(["O1", "O2", "O3", "O6"]);

export function computeCashFlow(entries: JournalEntry[], chart: ChartKey): CashFlowResult {
  const empty: CashFlowResult = {
    supported: chart !== "super",
    incompleteRows: [],
    openingCash: 0,
    closingCash: 0,
    change: 0,
    direct: { O: [], I: [], F: [], totals: { O: 0, I: 0, F: 0 }, untagged: 0, untaggedRows: [], total: 0 },
    indirect: { bridge: [], lines: [], total: 0, profit: 0, operatingProfit: 0 },
    difference: 0,
    warnings: [],
    nonCash: [],
  };
  if (chart === "super") return empty;

  const res = empty;
  const byTag = new Map<string, number>();

  // Indirect-method accumulators
  let profit = 0;
  let opProfit = 0;
  let incomeTaxExpense = 0; // profit effect (negative for an expense)
  let financialNet = 0; // profit effect of financial income and expenses
  let adjDepreciation = 0;
  let adjOtherNonCash = 0;
  let adjReclass = 0;
  let wcRec = 0;
  let wcInv = 0;
  let wcLiab = 0;
  let interestPaid = 0;
  let incomeTaxPaid = 0;
  let otherFinancialCash = 0;

  for (const e of entries) {
    if (!e.amount) continue;
    if (!e.debit || !e.credit) {
      if (e.debit || e.credit) res.incompleteRows.push(e.no);
      continue;
    }
    const d = cashClass(e.debit, chart);
    const c = cashClass(e.credit, chart);
    if (!d || !c) {
      res.incompleteRows.push(e.no);
      continue;
    }
    const amt = e.amount;

    // ----- Opening balances -----
    if (d === "OB" || c === "OB") {
      if (d === "CASH") res.openingCash += amt;
      if (c === "CASH") res.openingCash -= amt;
      continue;
    }

    const cashEffect = (d === "CASH" ? amt : 0) - (c === "CASH" ? amt : 0);
    const tag = findTag(e.cf);
    const hasCash = d === "CASH" || c === "CASH";
    const other: CashClass = d === "CASH" ? c : c === "CASH" ? d : c; // counter-class of the cash side
    const counterCode = d === "CASH" ? e.credit : e.debit;
    const counterAcc: Account | undefined = findAccount(counterCode, chart);

    res.closingCash += cashEffect;

    // ----- Direct method -----
    if (hasCash && cashEffect !== 0) {
      if (!tag) {
        res.direct.untagged += cashEffect;
        res.direct.untaggedRows.push(e.no);
      } else if (tag.section !== "X") {
        byTag.set(tag.id, (byTag.get(tag.id) ?? 0) + cashEffect);
      } else {
        // tagged as a transfer although cash really changes
        res.direct.untagged += cashEffect;
        res.direct.untaggedRows.push(e.no);
        res.warnings.push({
          no: e.no,
          description: e.description,
          message: "Tagged as a transfer between cash accounts, but only one side is a cash account - this is a real cash flow.",
        });
      }
    }
    if (d === "CASH" && c === "CASH" && tag && tag.section !== "X") {
      res.warnings.push({
        no: e.no,
        description: e.description,
        message: "Both sides are cash accounts - a transfer between cash accounts is not a cash flow.",
      });
    }

    // ----- Soft plausibility warnings on tags -----
    if (hasCash && cashEffect !== 0 && tag && tag.section !== "X") {
      const name = counterAcc ? `${counterAcc.code} ${counterAcc.name}` : counterCode;
      if (other === "INV" && tag.section !== "I") {
        res.warnings.push({
          no: e.no,
          description: e.description,
          message: `The other side of this entry is ${name}, a non-current asset or investment. Such cash flows are normally investing.`,
        });
      } else if (other === "FIN" && tag.section !== "F") {
        res.warnings.push({
          no: e.no,
          description: e.description,
          message: `The other side of this entry is ${name} (loans, dividends or equity). Such cash flows are normally financing.`,
        });
      } else if (isWC(other) && (tag.section === "I" || ["F1", "F2", "F3"].includes(tag.id))) {
        res.warnings.push({
          no: e.no,
          description: e.description,
          message: `The other side of this entry is ${name}, an operating receivable, inventory or payable. This is normally an operating cash flow.`,
        });
      } else if (other === "PL_FIN" && OPERATING_PLAIN.has(tag.id) && tag.id !== "O6") {
        res.warnings.push({
          no: e.no,
          description: e.description,
          message: `The other side of this entry is ${name} (interest or income tax). Consider the tags "Interest paid", "Income tax paid" or "Interest and dividends received".`,
        });
      }
      if ((tag.dir === "in" && cashEffect < 0) || (tag.dir === "out" && cashEffect > 0)) {
        res.warnings.push({
          no: e.no,
          description: e.description,
          message: `The tag "${tag.label}" expects cash to go ${tag.dir === "in" ? "in" : "out"}, but this row moves cash the other way.`,
        });
      }
    }

    // ----- Non-cash investing and financing transactions (for the notes) -----
    if (!hasCash) {
      const pair = [d, c];
      const invFin = pair.includes("INV") && pair.includes("FIN");
      const invCredit = pair.includes("INV") && (pair.includes("WC_LIAB") || pair.includes("WC_REC"));
      if (invFin || invCredit) res.nonCash.push({ no: e.no, description: e.description, amount: amt });
    }

    // ----- Indirect method -----
    const pe = (isPL(c) ? amt : 0) - (isPL(d) ? amt : 0);
    const ope = (c === "PL_OP" ? amt : 0) - (d === "PL_OP" ? amt : 0);
    const fe = (c === "PL_FIN" ? amt : 0) - (d === "PL_FIN" ? amt : 0);
    profit += pe;
    opProfit += ope;
    if (fe !== 0) {
      const finCode = c === "PL_FIN" ? e.credit : e.debit;
      // (an entry between two PL_FIN accounts nets to zero and is ignored here)
      if (!(c === "PL_FIN" && d === "PL_FIN")) {
        if (isIncomeTaxExpense(finCode, chart)) incomeTaxExpense += fe;
        else financialNet += fe;
      }
    }

    const tagId = tag?.id ?? "";
    const tagSection = tag?.section ?? "";
    const plainOperatingCash = hasCash && (!tag || OPERATING_PLAIN.has(tagId));

    // Operating-profit items whose counterpart is not operating cash / working capital
    if (ope !== 0) {
      const counter = c === "PL_OP" && d === "PL_OP" ? null : c === "PL_OP" ? d : c;
      if (counter === "INV" || counter === "FIN" || counter === "PL_FIN") {
        const plCode = c === "PL_OP" ? e.credit : e.debit;
        const invCode = c === "PL_OP" ? e.debit : e.credit;
        if (counter === "INV" && (isDepreciationExpense(plCode, chart) || isAccumulatedDepreciation(invCode, chart))) {
          adjDepreciation += -ope;
        } else {
          adjOtherNonCash += -ope;
        }
      } else if (counter === "CASH" && !plainOperatingCash) {
        // presented on its own line (interest / income tax paid) or in investing / financing
        adjReclass += -ope;
      }
    }

    // Working capital movements that belong to operating activities
    const wcSource = (cls: CashClass, sign: number) => {
      if (cls === "WC_REC") wcRec += sign * amt;
      else if (cls === "WC_INV") wcInv += sign * amt;
      else if (cls === "WC_LIAB") wcLiab += sign * amt;
    };
    const wcCounts = (counter: CashClass) =>
      counter === "PL_OP" || isWC(counter) || (counter === "CASH" && plainOperatingCash);
    if (isWC(c) && wcCounts(d)) wcSource(c, +1); // credit to a WC account = source of cash
    if (isWC(d) && wcCounts(c)) wcSource(d, -1); // debit to a WC account = use of cash

    // Cash lines shown separately inside the indirect operating section
    if (hasCash && cashEffect !== 0 && other !== "INV" && other !== "FIN") {
      if (tagId === "O4") interestPaid += cashEffect;
      else if (tagId === "O5") incomeTaxPaid += cashEffect;
      else if (other === "PL_FIN" && plainOperatingCash) otherFinancialCash += cashEffect;
    }
    void tagSection;
  }

  res.closingCash += res.openingCash;
  res.change = res.closingCash - res.openingCash;

  // Direct statement lines
  for (const t of CF_TAGS) {
    if (t.section === "X") continue;
    const v = byTag.get(t.id);
    if (v === undefined || Math.abs(v) < 0.005) continue;
    res.direct[t.section as "O" | "I" | "F"].push({ id: t.id, label: t.label, amount: v });
    res.direct.totals[t.section as "O" | "I" | "F"] += v;
  }
  res.direct.total = res.direct.totals.O + res.direct.totals.I + res.direct.totals.F;

  // Indirect statement
  const push = (arr: CfLine[], id: string, label: string, amount: number, always = false, extra: Partial<CfLine> = {}) => {
    if (!always && Math.abs(amount) < 0.005) return;
    arr.push({ id, label, amount, ...extra });
  };
  const ind = res.indirect;
  ind.profit = profit;
  ind.operatingProfit = opProfit;
  push(ind.bridge, "profit", "Net profit (loss) for the period", profit, true);
  push(ind.bridge, "tax", "Add back: corporate income tax expense", -incomeTaxExpense);
  push(ind.bridge, "fin", "Add back: financial expenses less financial income", -financialNet);

  push(ind.lines, "op", "Operating profit (loss)", opProfit, true, { strong: true });
  push(ind.lines, "dep", "Adjustment: depreciation, amortisation and impairment", adjDepreciation);
  push(ind.lines, "noncash", "Adjustment: (gain) / loss on disposal of non-current assets and other non-cash items", adjOtherNonCash);
  push(ind.lines, "reclass", "Adjustment: items presented on other cash-flow lines", adjReclass);
  push(ind.lines, "rec", "Change in receivables and prepayments", wcRec);
  push(ind.lines, "inv", "Change in inventories", wcInv);
  push(ind.lines, "liab", "Change in payables and other operating liabilities", wcLiab);
  push(ind.lines, "int", "Interest paid", interestPaid);
  push(ind.lines, "taxpaid", "Income tax paid", incomeTaxPaid);
  push(ind.lines, "finother", "Other financial income and expenses settled in cash", otherFinancialCash);
  ind.total =
    opProfit + adjDepreciation + adjOtherNonCash + adjReclass + wcRec + wcInv + wcLiab + interestPaid + incomeTaxPaid + otherFinancialCash;

  res.difference = res.direct.totals.O - ind.total;
  return res;
}
