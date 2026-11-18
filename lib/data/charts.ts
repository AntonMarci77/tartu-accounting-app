// Three levels of chart of accounts:
// 1. Super-simplified — 7 categories only (great for first lesson / T-accounts intro)
// 2. Simplified — ~30 line items (good middle ground, used in journal exercises)
// 3. Estonian e-Financials chart — ~295 accounts (full real-world chart)

export type AccountCategory = "asset" | "liability" | "equity" | "revenue" | "expense";

export type Account = {
  code: string;
  name: string;
  category: AccountCategory;
  // "D" if natural (normal) balance is debit, "C" if credit.
  // Assets & expenses are normally debit; liabilities, equity, revenue are normally credit.
  normal: "D" | "C";
};

export const superSimplifiedChart: Account[] = [
  { code: "AN", name: "Non-current Assets", category: "asset", normal: "D" },
  { code: "AC", name: "Current Assets", category: "asset", normal: "D" },
  { code: "EQ", name: "Equity", category: "equity", normal: "C" },
  { code: "LC", name: "Current Liabilities", category: "liability", normal: "C" },
  { code: "LN", name: "Non-current Liabilities", category: "liability", normal: "C" },
  { code: "RE", name: "Revenue (Income)", category: "revenue", normal: "C" },
  { code: "EX", name: "Expenses (Costs)", category: "expense", normal: "D" },
  { code: "OB", name: "Opening Balance (technical account)", category: "equity", normal: "C" },
];

export const simplifiedChart: Account[] = [
  // Assets
  { code: "A1", name: "Intangible Assets", category: "asset", normal: "D" },
  { code: "A2", name: "Tangible Assets (PP&E)", category: "asset", normal: "D" },
  { code: "A3", name: "Accumulated Depreciation", category: "asset", normal: "C" },
  { code: "A5", name: "Inventories", category: "asset", normal: "D" },
  { code: "A6", name: "Trade Receivables", category: "asset", normal: "D" },
  { code: "A7", name: "Other Receivables", category: "asset", normal: "D" },
  { code: "A8", name: "Cash & Bank Accounts", category: "asset", normal: "D" },
  { code: "A9", name: "Prepaid Expenses", category: "asset", normal: "D" },
  // Equity
  { code: "E1", name: "Share Capital", category: "equity", normal: "C" },
  { code: "E2", name: "Reserves & Funds", category: "equity", normal: "C" },
  { code: "E3", name: "Retained Earnings", category: "equity", normal: "C" },
  { code: "E4", name: "Profit / Loss Current Period", category: "equity", normal: "C" },
  // Liabilities
  { code: "L1", name: "Long-term Bank Loans", category: "liability", normal: "C" },
  { code: "L2", name: "Other Long-term Liabilities", category: "liability", normal: "C" },
  { code: "L3", name: "Short-term Bank Loans", category: "liability", normal: "C" },
  { code: "L4", name: "Trade Payables", category: "liability", normal: "C" },
  { code: "L5", name: "Tax Liabilities", category: "liability", normal: "C" },
  { code: "L6", name: "Payroll & Social Security", category: "liability", normal: "C" },
  { code: "L7", name: "Other Current Liabilities", category: "liability", normal: "C" },
  { code: "L8", name: "Dividends Payable", category: "liability", normal: "C" },
  // Revenue
  { code: "R1", name: "Sales Revenue", category: "revenue", normal: "C" },
  { code: "R2", name: "Other Operating Income", category: "revenue", normal: "C" },
  { code: "R3", name: "Financial Income", category: "revenue", normal: "C" },
  // Expenses
  { code: "X1", name: "Cost of Materials & Goods", category: "expense", normal: "D" },
  { code: "X2", name: "Services & External Costs", category: "expense", normal: "D" },
  { code: "X3", name: "Personnel Costs", category: "expense", normal: "D" },
  { code: "X4", name: "Depreciation", category: "expense", normal: "D" },
  { code: "X5", name: "Taxes & Fees", category: "expense", normal: "D" },
  { code: "X6", name: "Other Operating Expenses", category: "expense", normal: "D" },
  { code: "X7", name: "Financial Expenses", category: "expense", normal: "D" },
  { code: "X8", name: "Income Tax Expense", category: "expense", normal: "D" },
  // Technical
  { code: "OB", name: "Opening Balance (technical account)", category: "equity", normal: "C" },
];

// Estonian chart loaded from JSON (extracted from kontoplaan.xls / e-Financials)
import estoniaRaw from "./estonia_chart.json";

function classifyEstonia(cls: string, dc: string): { category: AccountCategory; normal: "D" | "C" } {
  const c = cls.toLowerCase();
  if (c.startsWith("asset")) return { category: "asset", normal: "D" };
  if (c.startsWith("liab")) return { category: "liability", normal: "C" };
  if (c.startsWith("equity")) return { category: "equity", normal: "C" };
  if (c.startsWith("rev")) return { category: "revenue", normal: "C" };
  if (c.startsWith("cost") || c.startsWith("exp")) return { category: "expense", normal: "D" };
  // Fallback by debit/credit hint
  return dc.toUpperCase() === "C"
    ? { category: "liability", normal: "C" }
    : { category: "asset", normal: "D" };
}

export const estoniaChart: Account[] = (estoniaRaw as Array<{ cls: string; dc: string; code: string; name: string }>)
  .map((r) => {
    const { category, normal } = classifyEstonia(r.cls, r.dc);
    return { code: r.code, name: r.name, category, normal };
  })
  .filter((a) => a.code && a.name)
  .concat([{ code: "0000", name: "Opening balance (technical account)", category: "equity", normal: "C" }]);

export const CHARTS = {
  super: { id: "super", label: "Super-simplified (7 accounts)", accounts: superSimplifiedChart },
  simplified: { id: "simplified", label: "Simplified (~30 accounts)", accounts: simplifiedChart },
  estonia: { id: "estonia", label: "Estonian e-Financials (full)", accounts: estoniaChart },
} as const;

export type ChartKey = keyof typeof CHARTS;

export const categoryLabel: Record<AccountCategory, string> = {
  asset: "Assets",
  liability: "Liabilities",
  equity: "Equity",
  revenue: "Revenues",
  expense: "Expenses",
};

export const categoryColor: Record<AccountCategory, string> = {
  asset: "bg-emerald-50 text-emerald-700 border-emerald-200",
  liability: "bg-amber-50 text-amber-700 border-amber-200",
  equity: "bg-violet-50 text-violet-700 border-violet-200",
  revenue: "bg-sky-50 text-sky-700 border-sky-200",
  expense: "bg-rose-50 text-rose-700 border-rose-200",
};

export const categoryBadgeColor: Record<AccountCategory, string> = {
  asset: "bg-emerald-100 text-emerald-800",
  liability: "bg-amber-100 text-amber-800",
  equity: "bg-violet-100 text-violet-800",
  revenue: "bg-sky-100 text-sky-800",
  expense: "bg-rose-100 text-rose-800",
};

export function findAccount(code: string, key: ChartKey): Account | undefined {
  return CHARTS[key].accounts.find((a) => a.code.toUpperCase() === code.toUpperCase());
}

// ---------------------------------------------------------------------------
// Opening balances
// ---------------------------------------------------------------------------
// Opening balances are booked against a technical "opening balance" account
// (Dr asset / Cr OB, Dr OB / Cr liability or equity). Entries that touch this
// account are treated as the opening position: they are excluded from the cash
// flows and from the movements of the period.
export const OPENING_ACCOUNT: Record<ChartKey, string> = {
  super: "OB",
  simplified: "OB",
  estonia: "0000",
};

export function isOpeningAccount(code: string, key: ChartKey): boolean {
  return !!code && code.toUpperCase() === OPENING_ACCOUNT[key];
}

// ---------------------------------------------------------------------------
// Cash-flow classes of accounts
// ---------------------------------------------------------------------------
// CASH    cash and cash equivalents
// WC_REC  operating receivables and prepayments
// WC_INV  inventories
// WC_LIAB operating liabilities (trade payables, taxes, payroll, accruals)
// INV     non-current assets and financial investments (investing activities)
// FIN     borrowings, dividends payable and equity (financing activities)
// PL_OP   income and expenses that are part of operating profit
// PL_FIN  financial income and expenses and income tax expense (below operating profit)
// OB      technical opening balance account
export type CashClass = "CASH" | "WC_REC" | "WC_INV" | "WC_LIAB" | "INV" | "FIN" | "PL_OP" | "PL_FIN" | "OB";

const SIMPLIFIED_CLASS: Record<string, CashClass> = {
  A1: "INV", A2: "INV", A3: "INV",
  A5: "WC_INV",
  A6: "WC_REC", A7: "WC_REC", A9: "WC_REC",
  A8: "CASH",
  E1: "FIN", E2: "FIN", E3: "FIN", E4: "FIN",
  L1: "FIN", L2: "FIN", L3: "FIN", L8: "FIN",
  L4: "WC_LIAB", L5: "WC_LIAB", L6: "WC_LIAB", L7: "WC_LIAB",
  R1: "PL_OP", R2: "PL_OP", R3: "PL_FIN",
  X1: "PL_OP", X2: "PL_OP", X3: "PL_OP", X4: "PL_OP", X5: "PL_OP", X6: "PL_OP",
  X7: "PL_FIN", X8: "PL_FIN",
  OB: "OB",
};

function estoniaClass(code: string, acc: Account): CashClass {
  if (code === "0000") return "OB";
  const n = parseInt(code, 10);
  if (!Number.isFinite(n)) return acc.category === "revenue" || acc.category === "expense" ? "PL_OP" : "WC_REC";
  if (n >= 1010 && n <= 1050) return "CASH";
  if (n === 1100 || n === 1410) return "INV"; // financial investments, loans granted
  if (n >= 1600 && n <= 1699) return "WC_INV";
  if (n >= 1700 && n <= 1999) return "INV";
  if (n >= 1000 && n <= 1599) return "WC_REC";
  if (n >= 2110 && n <= 2140) return "FIN"; // current borrowings
  if (n === 2650) return "FIN"; // dividend payables
  if (n >= 2810 && n <= 2860) return "FIN"; // non-current borrowings
  if (n >= 2900 && n <= 2999) return "FIN"; // equity
  if (n >= 2000 && n <= 2899) return "WC_LIAB";
  if (n === 3900) return "PL_FIN"; // dividends received
  if (n >= 8000 && n <= 8999 && n !== 8888) return "PL_FIN";
  if (acc.category === "revenue" || acc.category === "expense") return "PL_OP";
  return acc.category === "liability" ? "WC_LIAB" : "WC_REC";
}

/** Cash-flow class of an account, or null when it cannot be determined (super-simplified chart). */
export function cashClass(code: string, key: ChartKey): CashClass | null {
  if (!code) return null;
  const c = code.toUpperCase();
  if (key === "super") return c === "OB" ? "OB" : null;
  if (key === "simplified") return SIMPLIFIED_CLASS[c] ?? null;
  const acc = findAccount(c, key);
  if (!acc) return null;
  return estoniaClass(c, acc);
}

export function isCashAccount(code: string, key: ChartKey): boolean {
  return cashClass(code, key) === "CASH";
}

/** Depreciation / amortisation / accumulated depreciation accounts (used for the notes and the indirect method). */
export function isAccumulatedDepreciation(code: string, key: ChartKey): boolean {
  const c = (code || "").toUpperCase();
  if (key === "simplified") return c === "A3";
  if (key === "estonia") {
    const n = parseInt(c, 10);
    return (n >= 1840 && n <= 1843) || n === 1855 || (n >= 1970 && n <= 1974);
  }
  return false;
}

export function isDepreciationExpense(code: string, key: ChartKey): boolean {
  const c = (code || "").toUpperCase();
  if (key === "simplified") return c === "X4";
  if (key === "estonia") {
    const n = parseInt(c, 10);
    return n >= 7010 && n <= 7074;
  }
  return false;
}
