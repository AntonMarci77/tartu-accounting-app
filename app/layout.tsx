import type { Metadata, Viewport } from "next";
import "./globals.css";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Accounting 101 · University of Tartu",
  description:
    "Interactive accounting workbook - chart of accounts, journal entries, T-accounts, statements, cash flow statement, notes, Estonian income tax and self-test for University of Tartu accounting students.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1B365D",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 mx-auto w-full max-w-screen-2xl px-4 sm:px-6 py-4 sm:py-8">{children}</main>
        <footer className="no-print mt-8 border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 py-4 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <span>
              Accounting 101 · University of Tartu · for educational use
            </span>
            <span>Anton Marci · Erasmus+ teaching mobility</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
