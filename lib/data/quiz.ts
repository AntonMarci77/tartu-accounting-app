// Quiz bank for the self-test page. Questions are grouped into "sections" and a
// quiz is built by sampling questions from each section. We provide several
// pre-made test versions (A, B, C) so two students sitting next to each other
// don't get the same questions.

export type QuizQuestion = {
  id: string;
  type: "multi" | "single" | "boolean";
  question: string;
  options: string[];
  correct: number[]; // indices of correct options
  explanation?: string;
  topic: string;
};

export const questionBank: QuizQuestion[] = [
  // ----- Asset definition -----
  {
    id: "q-asset-1",
    type: "multi",
    topic: "Asset definition",
    question: "Which of the following items qualify as ASSETS? Select all that apply.",
    options: [
      "A computer purchased for €2,000",
      "A cell phone purchased for €1,000",
      "The owner's idea, personally valued at €5,000",
      "Last month's income tax of €2,000",
      "Salaries payable to employees, €3,000",
      "A bank loan of €5,000",
      "Cash on hand totaling €5,000",
    ],
    correct: [0, 1, 6],
    explanation:
      "Assets are resources owned/controlled by the entity expected to generate future benefits. The computer, the phone and cash qualify. The owner's idea is not measurable and not controlled by the entity. Income tax payable, salaries payable and the bank loan are LIABILITIES, not assets.",
  },
  {
    id: "q-asset-2",
    type: "boolean",
    topic: "Asset definition",
    question: "An owner's personal car kept at home counts as an asset of the business.",
    options: ["True", "False"],
    correct: [1],
    explanation:
      "Business Entity Principle — the owner's personal car is separate from the business. Only assets owned/controlled by the business count.",
  },
  {
    id: "q-asset-3",
    type: "single",
    topic: "Asset definition",
    question: "Which characteristic is required for something to qualify as an asset?",
    options: [
      "It is shiny and new",
      "It is owned/controlled by the entity AND will bring future economic benefits",
      "It was bought on credit",
      "It is at least €1,000 in value",
    ],
    correct: [1],
    explanation:
      "Two conditions must hold: (a) past event giving control, (b) probable future economic benefits.",
  },

  // ----- Liability definition -----
  {
    id: "q-liab-1",
    type: "multi",
    topic: "Liability definition",
    question: "Which of the following items qualify as LIABILITIES? Select all that apply.",
    options: [
      "A computer purchased for €2,000",
      "A cell phone purchased for €1,000",
      "The owner's idea, personally valued at €5,000",
      "Last month's income tax of €2,000",
      "Salaries payable to employees, €3,000",
      "A bank loan of €5,000",
      "Cash on hand totaling €5,000",
    ],
    correct: [3, 4, 5],
    explanation:
      "Liabilities = obligations expected to result in an outflow of resources. The income tax, salaries payable and bank loan all qualify. The other items are assets.",
  },
  {
    id: "q-liab-2",
    type: "single",
    topic: "Liability definition",
    question: "Which is a defining characteristic of a liability?",
    options: [
      "It is a future plan to spend money",
      "An obligation arising from a past event that will require an outflow of resources",
      "Any expense incurred during the period",
      "Money the owner promises to invest",
    ],
    correct: [1],
  },

  // ----- Equity & accounting equation -----
  {
    id: "q-eq-1",
    type: "single",
    topic: "Accounting equation",
    question: "If a business has total assets €100,000 and total liabilities €150,000, what does that say?",
    options: [
      "It has equity of €50,000",
      "It has negative equity of €50,000 — liabilities exceed assets",
      "It is profitable",
      "Equity equals zero by definition",
    ],
    correct: [1],
    explanation: "Equity = Assets − Liabilities = 100,000 − 150,000 = −50,000.",
  },
  {
    id: "q-eq-2",
    type: "single",
    topic: "Accounting equation",
    question: "Which equation must always hold in double-entry bookkeeping?",
    options: [
      "Income = Expenses",
      "Assets = Liabilities + Equity",
      "Cash = Profit",
      "Revenue − Expenses = Equity",
    ],
    correct: [1],
  },
  {
    id: "q-eq-3",
    type: "boolean",
    topic: "Accounting equation",
    question: "Every transaction affects at least two accounts.",
    options: ["True", "False"],
    correct: [0],
    explanation: "That's the essence of double-entry bookkeeping.",
  },

  // ----- Income vs expense -----
  {
    id: "q-inc-1",
    type: "multi",
    topic: "Income definition",
    question: "Which of the following qualifies as INCOME of the business? Select all that apply.",
    options: [
      "Gift from a customer – €1,000",
      "Gift from the owner – €5,000",
      "Donation made by the business to charity – €1,000",
      "Internet usage paid by the business – €50",
      "Sale of a company car – €10,000",
      "Received accounting services – €1,000",
    ],
    correct: [0, 4],
    explanation:
      "Income comes from outside the business and increases equity. Owner gifts are equity contributions (excluded). Donations made and services received are EXPENSES.",
  },
  {
    id: "q-exp-1",
    type: "multi",
    topic: "Expense definition",
    question: "Which of the following qualifies as EXPENSE? Select all that apply.",
    options: [
      "Gift from a customer – €1,000",
      "Gift from the owner – €5,000",
      "Donation made by the business to charity – €1,000",
      "Internet usage paid by the business – €50",
      "Sale of a company car – €10,000",
      "Received accounting services – €1,000",
    ],
    correct: [2, 3, 5],
    explanation:
      "Expenses reduce equity and are incurred to generate revenue or run the business. Charity donation, internet, and accounting services are expenses.",
  },

  // ----- Principles -----
  {
    id: "q-prin-1",
    type: "single",
    topic: "Principles",
    question:
      "A laptop bought for €1,200 in 2024 stays at €1,200 on the balance sheet, even though it now sells for €1,500. Which principle is illustrated?",
    options: ["Cost Principle", "Going Concern Principle", "Matching Principle", "Materiality Principle"],
    correct: [0],
  },
  {
    id: "q-prin-2",
    type: "single",
    topic: "Principles",
    question:
      "Sales commissions paid in January for goods sold in December are reported as an expense in December. Which principle?",
    options: ["Cost Principle", "Matching Principle", "Going Concern Principle", "Substance over Form"],
    correct: [1],
  },
  {
    id: "q-prin-3",
    type: "single",
    topic: "Principles",
    question:
      "A long-term lease that effectively transfers all risks and rewards is recorded as a purchase, even though legally it is rental. Which principle?",
    options: [
      "Substance over Form",
      "Prudence",
      "Consistency and Comparability",
      "Full Disclosure",
    ],
    correct: [0],
  },
  {
    id: "q-prin-4",
    type: "single",
    topic: "Principles",
    question:
      "We will keep depreciating equipment over its useful life, because we expect to keep operating. Which principle?",
    options: ["Going Concern", "Matching", "Materiality", "Objectivity"],
    correct: [0],
  },
  {
    id: "q-prin-5",
    type: "single",
    topic: "Principles",
    question:
      "If a customer is unlikely to pay, an allowance for doubtful receivables is recorded immediately. Which principle?",
    options: ["Prudence", "Cost", "Going Concern", "Materiality"],
    correct: [0],
  },
  {
    id: "q-prin-6",
    type: "single",
    topic: "Principles",
    question: "A €5 stapler is expensed immediately rather than capitalised over years. Which principle?",
    options: ["Materiality", "Consistency", "Matching", "Objectivity"],
    correct: [0],
  },

  // ----- Transaction booking -----
  {
    id: "q-tx-1",
    type: "single",
    topic: "Transaction patterns",
    question:
      "A company borrows €5,000 from the bank, money is credited to the bank account. Which two accounts are affected?",
    options: [
      "Cash ↑ / Revenue ↑",
      "Cash ↑ / Loan Payable ↑",
      "Cash ↓ / Loan Payable ↑",
      "Cash ↑ / Equity ↑",
    ],
    correct: [1],
  },
  {
    id: "q-tx-2",
    type: "single",
    topic: "Transaction patterns",
    question: "Paying €500 office rent in cash. The journal entry is:",
    options: [
      "Debit Cash 500 / Credit Rent Expense 500",
      "Debit Rent Expense 500 / Credit Cash 500",
      "Debit Cash 500 / Credit Loan Payable 500",
      "Debit Equity 500 / Credit Cash 500",
    ],
    correct: [1],
  },
  {
    id: "q-tx-3",
    type: "single",
    topic: "Transaction patterns",
    question: "Owner contributes €10,000 cash into the business. The entry is:",
    options: [
      "Debit Cash 10,000 / Credit Share Capital 10,000",
      "Debit Share Capital 10,000 / Credit Cash 10,000",
      "Debit Cash 10,000 / Credit Revenue 10,000",
      "Debit Equity 10,000 / Credit Loan 10,000",
    ],
    correct: [0],
  },
  {
    id: "q-tx-4",
    type: "single",
    topic: "Transaction patterns",
    question:
      "A client buys €3,500 of services on credit (will pay later). The entry is:",
    options: [
      "Debit Cash 3,500 / Credit Sales 3,500",
      "Debit Trade Receivables 3,500 / Credit Sales 3,500",
      "Debit Sales 3,500 / Credit Trade Receivables 3,500",
      "Debit Trade Payables 3,500 / Credit Sales 3,500",
    ],
    correct: [1],
  },
  {
    id: "q-tx-5",
    type: "boolean",
    topic: "Transaction patterns",
    question: "In double-entry bookkeeping, total debits must equal total credits in every entry.",
    options: ["True", "False"],
    correct: [0],
  },

  // ----- Statements -----
  {
    id: "q-stmt-1",
    type: "single",
    topic: "Financial statements",
    question:
      "Which statement shows the financial position of a business at a specific point in time?",
    options: [
      "Statement of Profit or Loss",
      "Statement of Cash Flows",
      "Statement of Financial Position (Balance Sheet)",
      "Statement of Changes in Equity",
    ],
    correct: [2],
  },
  {
    id: "q-stmt-2",
    type: "single",
    topic: "Financial statements",
    question: "Which statement reports profit or loss for a period?",
    options: [
      "Balance Sheet",
      "Statement of Profit or Loss",
      "Statement of Cash Flows",
      "Statement of Changes in Equity",
    ],
    correct: [1],
  },
  {
    id: "q-stmt-3",
    type: "single",
    topic: "Financial statements",
    question:
      "Cash inflows from selling goods are reported in which section of the Cash Flow Statement?",
    options: ["Operating activities", "Investing activities", "Financing activities", "None of these"],
    correct: [0],
  },
  {
    id: "q-stmt-4",
    type: "single",
    topic: "Financial statements",
    question: "Cash inflows from a new bank loan are reported in which section?",
    options: ["Operating", "Investing", "Financing", "Equity"],
    correct: [2],
  },
  {
    id: "q-stmt-5",
    type: "single",
    topic: "Financial statements",
    question: "Buying a piece of equipment for cash appears in which cash-flow section?",
    options: ["Operating", "Investing", "Financing", "Owner's Equity"],
    correct: [1],
  },

  // ----- Methods -----
  {
    id: "q-method-1",
    type: "single",
    topic: "Cash vs. accrual",
    question:
      "An invoice is sent to a customer in December but the cash arrives in February. Under accrual accounting, when is revenue recognised?",
    options: ["December", "February", "Whichever the manager decides", "Half in December, half in February"],
    correct: [0],
  },
  {
    id: "q-method-2",
    type: "single",
    topic: "Cash vs. accrual",
    question:
      "Under cash-basis accounting, the same December invoice would be recognised:",
    options: ["In December", "In February when cash arrives", "Never", "Only when both parties agree"],
    correct: [1],
  },

  // ----- Cash flow statement, notes and Estonian income tax (lecture "Cash flow statement and notes") -----
  {
    id: "q-cf-1",
    type: "single",
    topic: "Cash flow statement",
    question: "A company buys a delivery van for €20,000 and pays for it from the bank account. In the statement of cash flows this is a cash flow from:",
    options: ["Operating activities", "Investing activities", "Financing activities", "It is not shown - a van is an asset, not an expense"],
    correct: [1],
    explanation: "Buying and selling non-current assets is investing. Whether something is an expense has nothing to do with the cash flow statement - only cash matters.",
  },
  {
    id: "q-cf-2",
    type: "single",
    topic: "Cash flow statement",
    question: "Which of these is NOT a cash flow?",
    options: ["Repayment of a bank loan", "Payment of salaries", "Depreciation of equipment", "Dividend paid to the owners"],
    correct: [2],
    explanation: "Depreciation is an expense without a payment. The cash left the company when the equipment was bought (investing activities).",
  },
  {
    id: "q-cf-3",
    type: "single",
    topic: "Cash flow statement",
    question: "Indirect method: trade receivables grew by €5,000 during the year. What do you do with operating profit?",
    options: ["Add €5,000", "Deduct €5,000", "Nothing - receivables are not cash", "Show €5,000 in investing activities"],
    correct: [1],
    explanation: "Revenue of €5,000 is in the profit but the customers have not paid yet. An increase in an operating asset reduces cash.",
  },
  {
    id: "q-cf-4",
    type: "single",
    topic: "Cash flow statement",
    question: "Operating profit €10,000, depreciation €4,000, inventories increased by €3,000, trade payables increased by €2,000. Cash flow from operating activities?",
    options: ["€9,000", "€11,000", "€15,000", "€13,000"],
    correct: [3],
    explanation: "10,000 + 4,000 (non-cash expense) - 3,000 (cash tied up in inventories) + 2,000 (suppliers not paid yet) = 13,000.",
  },
  {
    id: "q-cf-5",
    type: "boolean",
    topic: "Cash flow statement",
    question: "A company that reports a profit can still run out of cash.",
    options: ["True", "False"],
    correct: [0],
    explanation: "Profit is measured on the accrual basis. Unpaid customer invoices, growing inventories, investments, loan repayments and dividends all take cash without reducing profit.",
  },
  {
    id: "q-cf-6",
    type: "single",
    topic: "Cash flow statement",
    question: "Dividends paid to the shareholders are presented under Estonian GAAP (RTJ 2) in:",
    options: ["Operating activities", "Investing activities", "Financing activities"],
    correct: [2],
    explanation: "Dividends are a transaction with the owners - financing. (Dividends RECEIVED from an investment are investing.)",
  },
  {
    id: "q-cf-7",
    type: "single",
    topic: "Cash flow statement",
    question: "A machine worth €50,000 is acquired on a long-term supplier credit; nothing is paid this year. Where does the transaction appear?",
    options: [
      "Not in the cash flow statement - it is explained in the notes",
      "Investing outflow of €50,000",
      "Financing inflow and investing outflow of €50,000 each",
      "Operating outflow of €50,000",
    ],
    correct: [0],
    explanation: "No cash moved, so there is no cash flow. Significant non-cash investing and financing transactions are disclosed in the notes.",
  },
  {
    id: "q-ee-1",
    type: "single",
    topic: "Estonian income tax",
    question: "An Estonian company pays its shareholder a net dividend of €7,800. How much income tax does the company pay (rate 22/78)?",
    options: ["€1,716", "€2,200", "€1,560", "Nothing - Estonia has no corporate income tax"],
    correct: [1],
    explanation: "7,800 × 22/78 = 2,200. The tax is 22 % of the gross amount (7,800 + 2,200 = 10,000), not 22 % of the net dividend.",
  },
  {
    id: "q-ee-2",
    type: "single",
    topic: "Estonian income tax",
    question: "When does an Estonian company pay corporate income tax on its profit?",
    options: [
      "Every year, on the profit of that year",
      "Never",
      "When the profit is distributed - for example as a dividend",
      "When the annual report is filed",
    ],
    correct: [2],
    explanation: "Retained profit is not taxed. Tax (22/78 of the net amount) is due when profit leaves the company: dividends, fringe benefits, gifts, non-business expenses.",
  },
  {
    id: "q-notes-1",
    type: "multi",
    topic: "Notes",
    question: "Which of these does a reader find only in the NOTES, not in the balance sheet or the income statement? Select all that apply.",
    options: [
      "A guarantee given for another company's bank loan",
      "The income tax that would be payable if all retained earnings were distributed",
      "Trade payables at the end of the year",
      "A significant event that happened after the balance sheet date",
      "The balance of the bank account",
    ],
    correct: [0, 1, 3],
    explanation: "Contingent liabilities, the contingent income tax on retained earnings and non-adjusting events after the reporting date are not recognised in the statements - they are disclosed.",
  },
  {
    id: "q-notes-2",
    type: "single",
    topic: "Notes",
    question: "What must a micro undertaking in Estonia prepare as a minimum?",
    options: [
      "A balance sheet only",
      "An income statement and a cash flow statement",
      "All four statements and full notes",
      "A balance sheet, an income statement and a few notes",
    ],
    correct: [3],
    explanation: "Micro and small undertakings may prepare abridged annual accounts: balance sheet, income statement and limited notes. The cash flow statement and the statement of changes in equity are required from medium-sized and large undertakings.",
  },
];

// ----- Pre-made test versions -----
// Each version selects a fixed subset (10 questions) so two students get
// different but equally fair tests. The professor can also pick "Random".

export const testVersions: Record<string, string[]> = {
  A: [
    "q-asset-1",
    "q-liab-2",
    "q-eq-1",
    "q-prin-1",
    "q-prin-3",
    "q-tx-2",
    "q-tx-4",
    "q-stmt-1",
    "q-stmt-4",
    "q-method-1",
  ],
  B: [
    "q-asset-2",
    "q-liab-1",
    "q-eq-2",
    "q-prin-2",
    "q-prin-5",
    "q-tx-1",
    "q-tx-3",
    "q-stmt-2",
    "q-stmt-5",
    "q-method-2",
  ],
  C: [
    "q-asset-3",
    "q-eq-3",
    "q-inc-1",
    "q-exp-1",
    "q-prin-4",
    "q-prin-6",
    "q-tx-5",
    "q-stmt-3",
    "q-stmt-1",
    "q-method-1",
  ],
  // Version D - cash flow statement, notes and Estonian income tax
  D: ["q-cf-1", "q-cf-3", "q-cf-4", "q-cf-5", "q-cf-6", "q-cf-7", "q-ee-1", "q-ee-2", "q-notes-1", "q-notes-2"],
};

export function getQuestionsByVersion(version: string): QuizQuestion[] {
  if (version === "RANDOM") {
    const shuffled = [...questionBank].sort(() => Math.random() - 0.5).slice(0, 10);
    return shuffled;
  }
  const ids = testVersions[version];
  if (!ids) return [];
  return ids.map((id) => questionBank.find((q) => q.id === id)).filter(Boolean) as QuizQuestion[];
}
