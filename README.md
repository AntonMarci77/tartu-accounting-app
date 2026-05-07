# Accounting 101 · University of Tartu

A small Next.js workbook for Erasmus students of the University of Tartu Accounting 101 course. Designed to work as well on a phone in class as on a laptop at home.

## What's inside

- **Journal** — Tabulator-style entry with European date (DD/MM/YY) and amount (122,22) formats. Tab/Enter moves field-by-field; a new row is added automatically at the end. Three chart-of-accounts levels: super-simplified (7), simplified (~30), and the full Estonian e-Financials chart (~295).
- **T-accounts** — every posting from the journal laid out in classic T-form, with a closing balance and the natural side hint.
- **Reports** — auto-generated Statement of Financial Position and Statement of Profit or Loss.
- **Chart of Accounts** — searchable browser of all three charts.
- **Learn** — wrap-up of the lecture: 11 named accounting principles, asset/liability/equity/income/expense definitions, eight transaction patterns, four financial statements, accrual vs. cash, and the ten practice transactions.
- **Self-test** — three pre-made quiz versions (A, B, C) plus a Random version. Instant feedback with explanations.

All data lives in `localStorage` — there is no backend; nothing leaves the student's device. Use the export/import CSV buttons in the journal to share work with a classmate or save a copy.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

The app is a vanilla Next.js 14 project — no environment variables, no database, no edge config. The default Vercel framework preset works out of the box.

## Branding

Colours follow the official University of Tartu palette (Dark Blue `#2C5697`, Navy `#1B365D`, Medium `#517DB9`, Light `#96C8E6`, accent Orange `#FF5725`).

## Credits

Course content adapted from *Accounting 101 — short* lecture by Anton Marci (Erasmus 2025/2026). Estonian chart of accounts: e-Financials.
