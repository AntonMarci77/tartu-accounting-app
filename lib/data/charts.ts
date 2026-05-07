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
  .filter((a) => a.code && a.name);

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
