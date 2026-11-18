// Estonian corporate income tax - the distribution tax.
//
// Profit is not taxed when it is earned; the company pays income tax when it
// distributes profit or makes payments that are treated like a distribution.
// Rates as in force in 2025 and 2026 (Estonian Tax and Customs Board, emta.ee):
//   - income tax 22/78 of the net amount (= 22 % of the gross amount) on dividends,
//     payments from equity, fringe benefits, gifts and donations, costs of
//     entertaining guests and expenses not related to business;
//   - fringe benefits additionally: social tax 33 % of (benefit + income tax).
// Declared monthly on form TSD, due by the 10th day of the following month.
// The reduced 14/86 rate for regular dividends no longer applies from 2025.

export const EE_TAX = {
  year: "2025-2026",
  num: 22,
  den: 78,
  socialTax: 0.33,
  source: "https://emta.ee/en/business-client/taxes-and-payment/income-and-social-taxes",
};

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Income tax on a net payment (dividend actually paid out, non-business expense, gift...). */
export function taxOnNet(net: number): number {
  return round2((net * EE_TAX.num) / EE_TAX.den);
}

/** Split a gross amount of profit into net dividend and income tax. */
export function splitGross(gross: number): { net: number; tax: number } {
  const tax = round2((gross * EE_TAX.num) / (EE_TAX.num + EE_TAX.den));
  return { net: round2(gross - tax), tax };
}

/** Taxes on a fringe benefit with the given value (market price of the benefit). */
export function fringeBenefit(value: number): { incomeTax: number; socialTax: number; total: number } {
  const incomeTax = taxOnNet(value);
  const socialTax = round2((value + incomeTax) * EE_TAX.socialTax);
  return { incomeTax, socialTax, total: round2(incomeTax + socialTax) };
}

export const TSD_ANNEXES = [
  { annex: "Annex 4", what: "Fringe benefits", tax: "income tax 22/78 + social tax 33 %" },
  { annex: "Annex 5", what: "Gifts, donations and costs of entertaining guests", tax: "income tax 22/78 (above the tax-free limits)" },
  { annex: "Annex 6", what: "Expenses and payments not related to business", tax: "income tax 22/78" },
  { annex: "Annex 7", what: "Dividends and other profit distributions, payments from equity", tax: "income tax 22/78" },
];
