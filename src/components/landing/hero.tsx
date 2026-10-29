"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Play } from "lucide-react";
import { EASE } from "../reveal";

/* ------------------------------------------------------------------ */
/*  Typed terminal — simulates the compiler running                    */
/* ------------------------------------------------------------------ */

const LINES = [
  { text: "$ shopifytrack compile --store aurora-athletics", cls: "text-bone" },
  { text: "  ok  resolving destinations ..... ga4 · meta · tiktok", cls: "text-mint" },
  { text: "  ok  consent mode v2 ........... default: denied (EEA)", cls: "text-mint" },
  { text: "  ok  hashing user_data ......... sha256 @ edge", cls: "text-mint" },
  { text: "  ok  gtm-web.json .............. 34 nodes emitted", cls: "text-mint" },
  { text: "  ok  gtm-server.json ........... 11 nodes emitted", cls: "text-mint" },
  { text: "  ok  custom-pixel-compact.js ... 8 subscriptions live", cls: "text-mint" },
  { text: "  ▸ package ready in 2.9s — download started", cls: "text-acid" },
];

function TypedTerminal() {
  const [progress, setProgress] = useState(0); // total chars typed
  const total = LINES.reduce((acc, l) => acc + l.text.length + 1, 0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setProgress((p) => {
        if (p >= total + 46) return 0; // pause at end, then loop
        return p + 1;
      });
    }, 26);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [total]);

  let acc = 0;
  const rendered = LINES.map((l) => {
    const start = acc;
    acc += l.text.length + 1;
    const chars = Math.max(0, Math.min(l.text.length, progress - start));
    return { ...l, chars };
  }).filter((l) => l.chars > 0);

  return (
    <div className="code-block w-full shadow-2xl shadow-black/60">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-rose/70" />
        <span className="size-2.5 rounded-full bg-amber/70" />
        <span className="size-2.5 rounded-full bg-acid/70" />
        <span className="ml-2 font-mono2 text-[10px] tracking-wider text-faint">
          shopifytrack — compile.log
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 font-mono2 text-[10px] text-acid">
          <span className="size-1.5 rounded-full bg-acid animate-pulse-dot" />
          live
        </span>
      </div>
      <pre className="min-h-[248px] !p-5">
        {rendered.map((l, i) => (
          <div key={i} className={l.cls}>
            {l.text.slice(0, l.chars)}
            {i === rendered.length - 1 && <span className="animate-blink text-acid">▊</span>}
          </div>
        ))}
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Signal flow diagram — sources → edge → platforms                   */
/* ------------------------------------------------------------------ */

function SignalFlow() {
  const sources = ["Storefront", "Checkout", "Custom Pixel"];
  const targets = ["GA4", "Meta", "TikTok", "P+S", "G.Ads"];
  return (
    <div className="relative hidden xl:block">
      <svg width="420" height="300" viewBox="0 0 420 300" fill="none" className="overflow-visible">
        {sources.map((_, i) => {
          const y = 60 + i * 90;
          return (
            <g key={i}>
              <path
                d={`M 10 ${y} C 130 ${y}, 140 150, 210 150`}
                stroke="rgba(201,242,78,0.22)"
                strokeWidth="1"
                strokeDasharray="4 6"
              />
              <circle r="3" fill="#c9f24e">
                <animateMotion
                  dur={`${2.4 + i * 0.7}s`}
                  repeatCount="indefinite"
                  path={`M 10 ${y} C 130 ${y}, 140 150, 210 150`}
                />
              </circle>
            </g>
          );
        })}
        {targets.map((_, i) => {
          const y = 30 + i * 60;
          return (
            <g key={i}>
              <path
                d={`M 210 150 C 280 150, 290 ${y}, 410 ${y}`}
                stroke="rgba(125,249,200,0.22)"
                strokeWidth="1"
                strokeDasharray="4 6"
              />
              <circle r="3" fill="#7df9c8">
                <animateMotion
                  dur={`${2.0 + i * 0.5}s`}
                  repeatCount="indefinite"
                  path={`M 210 150 C 280 150, 290 ${y}, 410 ${y}`}
                />
              </circle>
            </g>
          );
        })}
        {/* edge node */}
        <rect x="185" y="126" width="50" height="48" rx="10" fill="#0b110b" stroke="rgba(201,242,78,0.5)" />
        <text x="210" y="147" textAnchor="middle" fill="#c9f24e" fontSize="8" fontFamily="monospace">SHA</text>
        <text x="210" y="159" textAnchor="middle" fill="#c9f24e" fontSize="8" fontFamily="monospace">256</text>
      </svg>
      {sources.map((s, i) => (
        <span
          key={s}
          className="absolute left-0 -translate-y-1/2 rounded-md border border-line bg-panel px-2 py-1 font-mono2 text-[9px] text-moss"
          style={{ top: 60 + i * 90 }}
        >
          {s}
        </span>
      ))}
      {targets.map((t, i) => (
        <span
          key={t}
          className="absolute right-0 -translate-y-1/2 rounded-md border border-line bg-panel px-2 py-1 font-mono2 text-[9px] text-bone"
          style={{ top: 30 + i * 60 }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-20 sm:pt-44">
      {/* ambient glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-acid/[0.07] blur-[120px]" />
      <div className="pointer-events-none absolute top-40 -left-40 h-[380px] w-[380px] rounded-full bg-mint/[0.05] blur-[100px]" />
      <div className="grid-bg pointer-events-none absolute inset-0 mask-fade-y" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="flex items-center gap-3"
        >
          <span className="chip">
            <span className="size-1.5 rounded-full bg-acid animate-pulse-dot" />
            GTM · CAPI · Customer Pixels — compiled
          </span>
          <span className="chip hidden sm:inline-flex">v2.4 — Consent Mode ready</span>
        </motion.div>

        <h1 className="mt-8 font-display text-[11vw] font-semibold leading-[0.95] tracking-tight sm:text-7xl lg:text-[86px]">
          <motion.span
            className="block text-outline-acid"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.05, ease: EASE }}
          >
            Server-side tracking,
          </motion.span>
          <motion.span
            className="block"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
          >
            compiled for <span className="text-acid">Shopify.</span>
          </motion.span>
        </h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
          >
            <p className="max-w-xl text-[15px] leading-relaxed text-moss sm:text-base">
              ShopifyTrack Pro turns a 3-hour ritual of GTM clicking, pixel pasting and CAPI
              plumbing into a <span className="text-bone">3-minute wizard</span>. Answer five
              questions — get an error-free web container, server container and a Customer
              Events pixel, zipped and ready to import.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/wizard"
                className="group inline-flex items-center gap-2 rounded-full bg-acid px-6 py-3.5 text-sm font-semibold text-ink transition-all hover:glow-acid"
              >
                <Play className="size-4 fill-ink" />
                Start the 3-minute setup
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-6 py-3.5 text-sm text-bone transition-colors hover:border-acid/40 hover:text-acid"
              >
                <BookOpen className="size-4" />
                Read the docs
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-6">
              {[
                ["6", "ad platforms"],
                ["8", "mapped events"],
                ["3 min", "avg. setup"],
                ["100%", "consent-ready"],
              ].map(([v, l]) => (
                <div key={l}>
                  <div className="font-display text-2xl font-semibold text-bone">{v}</div>
                  <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-faint">{l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, rotate: 1.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 1, delay: 0.35, ease: EASE }}
            className="relative"
          >
            <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-acid/[0.05] blur-2xl" />
            <TypedTerminal />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="mt-16 flex justify-center"
        >
          <SignalFlow />
        </motion.div>
      </div>
    </section>
  );
}
