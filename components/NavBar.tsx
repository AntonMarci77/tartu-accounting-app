"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/today", label: "Today" },
  { href: "/journal", label: "Journal" },
  { href: "/t-accounts", label: "T-accounts" },
  { href: "/reports", label: "Reports" },
  { href: "/cash-flow", label: "Cash flow" },
  { href: "/notes", label: "Notes" },
  { href: "/tax", label: "Tax" },
  { href: "/chart-of-accounts", label: "Chart" },
  { href: "/learn", label: "Learn" },
  { href: "/quiz", label: "Self-test" },
];

export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="no-print sticky top-0 z-30 bg-ut-navy text-white shadow-card">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-block w-7 h-7 rounded-md bg-white text-ut-navy grid place-items-center text-sm font-bold">
            UT
          </span>
          <span className="hidden xs:inline sm:inline">Accounting 101</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-2.5 py-1.5 rounded-md text-sm whitespace-nowrap transition ${
                isActive(l.href)
                  ? "bg-white/15 text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          aria-label="Open menu"
          className="lg:hidden p-2 rounded-md hover:bg-white/10"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <nav className="lg:hidden border-t border-white/10 bg-ut-navy">
          <ul className="px-2 py-2 flex flex-col">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base transition ${
                    isActive(l.href)
                      ? "bg-white/15 text-white"
                      : "text-white/85 hover:bg-white/10"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
