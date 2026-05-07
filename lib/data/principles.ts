// Sourced from "Accounting 101 - short" lecture (Anton Marci, University of Tartu).
// 11 named accounting principles + 4 transaction-account-type definitions.

export type Principle = {
  id: string;
  name: string;
  body: string;
  example?: string;
};

export const principles: Principle[] = [
  {
    id: "cost",
    name: "Cost Principle",
    body: "Accounting information is based on actual cost. Cost is either cash, or the fair value of the other non-monetary consideration given to acquire an asset at the time of its acquisition or construction.",
    example: "A laptop bought for €1,200 stays on the books at €1,200 — even if its market value rises to €1,500.",
  },
  {
    id: "business-entity",
    name: "Business Entity Principle",
    body: "The accounting entity keeps separate accounts of its own assets, liabilities and economic transactions and the personal assets, liabilities and transactions of its shareholders, creditors, employees, customers and other persons.",
    example: "The owner pays for personal groceries with a personal card — not booked into the business.",
  },
  {
    id: "going-concern",
    name: "Going Concern Principle",
    body: "Financial statements are prepared under the assumption that an accounting entity is a going concern — it has neither the intention nor the need to terminate its activities. If statements are not prepared on this basis, the policy applied must be disclosed.",
    example: "Equipment is depreciated over 5 years because we expect the business to keep operating that long.",
  },
  {
    id: "understandability",
    name: "Understandability Principle",
    body: "Disclosures in the financial statements shall be presented in such a way that they are informative and unambiguous to users with reasonable knowledge of finance.",
  },
  {
    id: "materiality",
    name: "Materiality Principle",
    body: "Financial statements present all relevant information that affects the financial position, performance and cash flows. Information is relevant if its omission or misstatement could affect users' decisions. Immaterial items may be accounted for and recorded using a simplified method.",
    example: "A €5 stapler is expensed immediately rather than capitalised and depreciated over years.",
  },
  {
    id: "consistency",
    name: "Consistency and Comparability Principle",
    body: "The same accounting policies, presentation and financial statement formats are used consistently for accounting purposes and across reporting periods.",
    example: "If FIFO is chosen for inventory in 2024, it is used in 2025 too — unless a reasoned change is disclosed.",
  },
  {
    id: "matching",
    name: "Matching Principle",
    body: "Costs associated with revenue earned during an accounting period are deducted from such revenue. Expenditures whose matching revenue is expected to be earned over the next periods are recognised as expenses in the same periods as their matching revenue.",
    example: "Sales commissions paid in January for goods sold in December are reported in December's profit.",
  },
  {
    id: "objectivity",
    name: "Objectivity Principle",
    body: "Disclosures in the financial statements are neutral and reliable. Financial information must be based on objective evidence and free from personal bias.",
    example: "Revenue recognition is supported by an invoice and a delivery note, not by a manager's optimism.",
  },
  {
    id: "prudence",
    name: "Prudence Principle",
    body: "Financial statements are prepared on a prudent and cautious basis to avoid overestimation of assets and revenues or underestimation of liabilities and expenses. At the same time, deliberate underestimation of assets and revenues, or overestimation of liabilities and expenses, is not justified.",
    example: "If a customer is unlikely to pay, an allowance for doubtful receivables is recorded — losses are recognised early, gains only when realised.",
  },
  {
    id: "substance",
    name: "Substance over Form Principle",
    body: "Economic transactions are recorded in the accounts and in the financial statements in accordance with their substance, which may not always correspond to their legal form.",
    example: "A long-term lease that effectively transfers all risks and rewards is recorded as a purchase, even if legally it is just rental.",
  },
  {
    id: "full-disclosure",
    name: "Full Disclosure Principle",
    body: "All information that could affect a reader's understanding of a company's financial statements must be included in the reports — financial, legal or strategic.",
    example: "A pending lawsuit that could result in a material loss is disclosed in the notes, even before any judgment.",
  },
];

// ===== Account-type definitions =====

export type DefinitionItem = {
  id: string;
  title: string;
  body: string;
  effects?: { assets?: string; liabilities?: string; equity?: string };
  excludes?: string;
};

export const accountTypes: DefinitionItem[] = [
  {
    id: "asset",
    title: "Asset",
    body: "A resource (an object or a right) owned or controlled by an accounting entity that (a) has arisen from past events, and (b) is expected to generate future economic benefits.",
    effects: { assets: "↑ increases", equity: "neutral on its own" },
  },
  {
    id: "liability",
    title: "Liability",
    body: "An obligation of an accounting entity that (a) has arisen from past events, and (b) is expected to result in an outflow of resources in the future.",
    effects: { liabilities: "↑ increases", equity: "neutral on its own" },
  },
  {
    id: "equity",
    title: "Owner's Equity",
    body: "Also called net assets — the residual interest in the assets of an accounting entity after deducting its liabilities. In other words, it is the difference between total assets and total liabilities on the balance-sheet date.",
    effects: { equity: "= Assets − Liabilities" },
  },
  {
    id: "income",
    title: "Income (Revenue)",
    body: "Money or value flowing into the business during the accounting period. It increases assets or reduces liabilities, which in turn increases equity.",
    effects: { assets: "↑", liabilities: "↓", equity: "↑" },
    excludes: "Owner contributions (capital invested)",
  },
  {
    id: "expense",
    title: "Expense (Cost)",
    body: "Money or value going out of the business during the accounting period. Expenses decrease assets or increase liabilities, which reduces equity.",
    effects: { assets: "↓", liabilities: "↑", equity: "↓" },
    excludes: "Owner withdrawals (drawings)",
  },
];

// ===== Transaction patterns =====

export const transactionPatterns: Array<{
  id: string;
  pattern: string;
  description: string;
  example: string;
}> = [
  { id: "p1", pattern: "Assets ↑ / Liabilities ↑", description: "Acquiring an asset by taking on a debt", example: "Buying inventory on credit; borrowing from a bank — Cash ↑, Loan Payable ↑" },
  { id: "p2", pattern: "Liabilities ↓ / Assets ↓", description: "Settling a debt with assets", example: "Repaying a loan using cash" },
  { id: "p3", pattern: "Assets ↑ / Income ↑", description: "Earning revenue and receiving an asset", example: "Selling services for cash on the spot" },
  { id: "p4", pattern: "Costs ↑ / Liabilities ↑", description: "Incurring an expense to be paid later", example: "Receiving a utility bill, payable in 30 days" },
  { id: "p5", pattern: "Costs ↑ / Assets ↓", description: "Paying for an expense in cash", example: "Paying for office rent" },
  { id: "p6", pattern: "Liabilities ↓ / Income ↑", description: "Earning previously unearned revenue", example: "Recognising a deferred service obligation as earned" },
  { id: "p7", pattern: "Assets ↑ / Assets ↓", description: "Swapping one asset for another", example: "Buying a laptop for cash" },
  { id: "p8", pattern: "Liabilities ↓ / Liabilities ↑", description: "Restructuring debts", example: "Converting a short-term loan into a long-term one" },
];

// ===== The four financial statements (summary cards) =====

export const statements = [
  {
    id: "sofp",
    name: "Statement of Financial Position (Balance Sheet)",
    body: "Shows the financial situation of the business at a single point in time. Lists Assets, Liabilities and Equity. Built on the equation: Assets = Liabilities + Equity.",
  },
  {
    id: "sopl",
    name: "Statement of Profit or Loss",
    body: "Shows business performance over a period of time. Income − Expenses = Profit (if positive) or Loss (if negative).",
  },
  {
    id: "scf",
    name: "Statement of Cash Flows",
    body: "Shows movement of cash in and out of the business, grouped into Operating, Investing and Financing activities.",
  },
  {
    id: "sce",
    name: "Statement of Changes in Equity",
    body: "Shows how the owner's equity moved during the period — profit/loss earned, owner contributions, distributions (e.g. dividends), and other changes such as revaluations.",
  },
];

// ===== Cash vs. accrual =====

export const accountingMethods = [
  {
    id: "accrual",
    name: "Accrual basis",
    body: "Revenues and expenses are recognised when they are incurred, regardless of when cash actually changes hands. Used by larger and most regulated entities.",
  },
  {
    id: "cash",
    name: "Cash basis",
    body: "Revenue and expenses are recorded only when cash is received or paid. Simpler — typically used by very small businesses or for individual finances.",
  },
];
