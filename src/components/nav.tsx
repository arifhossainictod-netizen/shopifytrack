"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Download, Menu, X } from "lucide-react";
import Logo from "./logo";

const LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how", label: "How it works" },
  { href: "/docs", label: "Docs" },
  { href: "/extension", label: "Extension" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="ml-8 hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${
                  active ? "text-acid" : "text-moss hover:text-bone"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          {/* Chrome extension download — header button */}
          <a
            href="/api/extension/download"
            className="group hidden items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3.5 py-1.5 text-[13px] text-bone transition-all hover:border-acid/50 hover:bg-acid/10 sm:inline-flex"
            title="Download ShopifyTrack Inspector for Chrome"
          >
            <Download className="size-3.5 text-acid transition-transform group-hover:translate-y-0.5" />
            Extension
          </a>

          <Link
            href="/wizard"
            className="group inline-flex items-center gap-1.5 rounded-full bg-acid px-4 py-2 text-[13px] font-semibold text-ink transition-all hover:glow-acid"
          >
            Launch Wizard
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          <button
            onClick={() => setOpen((v) => !v)}
            className="grid size-9 place-items-center rounded-full border border-line text-moss md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-line bg-ink/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-moss hover:bg-white/5 hover:text-bone"
                >
                  {l.label}
                </Link>
              ))}
              <a
                href="/api/extension/download"
                className="mt-2 inline-flex items-center gap-2 rounded-lg border border-acid/40 bg-acid/10 px-3 py-2.5 text-sm text-acid"
              >
                <Download className="size-4" /> Download Chrome Extension
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
