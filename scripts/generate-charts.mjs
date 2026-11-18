// Regenerates the three chart-of-accounts JSON files in public/data/.
// Run with:  node scripts/generate-charts.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");

const superSimplified = [
  { code: "AN", name: "Non-current Assets", category: "asset", normal: "D" },
  { code: "AC", name: "Current Assets", category: "asset", normal: "D" },
  { code: "EQ", name: "Equity", category: "equity", normal: "C" },
  { code: "LC", name: "Current Liabilities", category: "liability", normal: "C" },
  { code: "LN", name: "Non-current Liabilities", category: "liability", normal: "C" },
  { code: "RE", name: "Revenue (Income)", category: "revenue", normal: "C" },
  { code: "EX", name: "Expenses (Costs)", category: "expense", normal: "D" },
  { code: "OB", name: "Opening Balance (technical account)", category: "equity", normal: "C" },
];

const simplified = [
  { code: "A1", name: "Intangible Assets", category: "asset", normal: "D" },
  { code: "A2", name: "Tangible Assets (PP&E)", category: "asset", normal: "D" },
  { code: "A3", name: "Accumulated Depreciation", category: "asset", normal: "C" },
  { code: "A5", name: "Inventories", category: "asset", normal: "D" },
  { code: "A6", name: "Trade Receivables", category: "asset", normal: "D" },
  { code: "A7", name: "Other Receivables", category: "asset", normal: "D" },
  { code: "A8", name: "Cash & Bank Accounts", category: "asset", normal: "D" },
  { code: "A9", name: "Prepaid Expenses", category: "asset", normal: "D" },
  { code: "E1", name: "Share Capital", category: "equity", normal: "C" },
  { code: "E2", name: "Reserves & Funds", category: "equity", normal: "C" },
  { code: "E3", name: "Retained Earnings", category: "equity", normal: "C" },
  { code: "E4", name: "Profit / Loss Current Period", category: "equity", normal: "C" },
  { code: "L1", name: "Long-term Bank Loans", category: "liability", normal: "C" },
  { code: "L2", name: "Other Long-term Liabilities", category: "liability", normal: "C" },
  { code: "L3", name: "Short-term Bank Loans", category: "liability", normal: "C" },
  { code: "L4", name: "Supplier Payables (trade payables)", category: "liability", normal: "C" },
  { code: "L5", name: "Tax Liabilities", category: "liability", normal: "C" },
  { code: "L6", name: "Payables to Employees & Payroll Taxes", category: "liability", normal: "C" },
  { code: "L7", name: "Other Current Liabilities", category: "liability", normal: "C" },
  { code: "L8", name: "Dividends Payable", category: "liability", normal: "C" },
  { code: "R1", name: "Sales Revenue", category: "revenue", normal: "C" },
  { code: "R2", name: "Other Operating Income", category: "revenue", normal: "C" },
  { code: "R3", name: "Financial Income", category: "revenue", normal: "C" },
  { code: "X1", name: "Cost of Materials & Goods", category: "expense", normal: "D" },
  { code: "X2", name: "Services & External Costs", category: "expense", normal: "D" },
  { code: "X3", name: "Personnel Costs", category: "expense", normal: "D" },
  { code: "X4", name: "Depreciation", category: "expense", normal: "D" },
  { code: "X5", name: "Taxes & Fees", category: "expense", normal: "D" },
  { code: "X6", name: "Other Operating Expenses", category: "expense", normal: "D" },
  { code: "X7", name: "Financial Expenses", category: "expense", normal: "D" },
  { code: "X8", name: "Corporate Income Tax Expense", category: "expense", normal: "D" },
  { code: "OB", name: "Opening Balance (technical account)", category: "equity", normal: "C" },
];

function classifyEstonia(cls, dc) {
  const c = cls.toLowerCase();
  if (c.startsWith("asset")) return { category: "asset", normal: "D" };
  if (c.startsWith("liab")) return { category: "liability", normal: "C" };
  if (c.startsWith("equity")) return { category: "equity", normal: "C" };
  if (c.startsWith("rev")) return { category: "revenue", normal: "C" };
  if (c.startsWith("cost") || c.startsWith("exp")) return { category: "expense", normal: "D" };
  return dc.toUpperCase() === "C"
    ? { category: "liability", normal: "C" }
    : { category: "asset", normal: "D" };
}

const estoniaRaw = JSON.parse(
  fs.readFileSync(path.join(root, "lib/data/estonia_chart.json"), "utf-8")
);
const estonia = estoniaRaw
  .map((r) => {
    const { category, normal } = classifyEstonia(r.cls, r.dc);
    return { code: r.code, name: r.name, category, normal };
  })
  .filter((a) => a.code && a.name)
  .concat([{ code: "0000", name: "Opening balance (technical account)", category: "equity", normal: "C" }]);

const outDir = path.join(root, "public/data");
fs.mkdirSync(outDir, { recursive: true });

function write(file, data, label) {
  const fp = path.join(outDir, file);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2) + "\n", "utf-8");
  console.log(`✓ ${label.padEnd(28)} ${data.length.toString().padStart(4)} accounts → ${path.relative(root, fp)}`);
}

write("chart-super-simplified.json", superSimplified, "Super-simplified");
write("chart-simplified.json", simplified, "Simplified");
write("chart-estonia.json", estonia, "Estonian e-Financials");
