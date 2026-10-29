import Link from "next/link";
import { ArrowUpRight, Download, MousePointerClick, Puzzle, ScanLine } from "lucide-react";
import Reveal from "../reveal";

const MOCK_ROWS = [
  { t: "14:02:11", p: "GA4", c: "#f9ab00", e: "view_item", s: "200" },
  { t: "14:02:11", p: "Meta", c: "#1877f2", e: "ViewContent", s: "200" },
  { t: "14:02:14", p: "TikTok", c: "#25f4ee", e: "ViewContent", s: "200" },
  { t: "14:02:20", p: "GA4", c: "#f9ab00", e: "add_to_cart", s: "200" },
  { t: "14:02:20", p: "Meta", c: "#1877f2", e: "AddToCart", s: "200" },
  { t: "14:02:20", p: "sGTM", c: "#c9f24e", e: "/collect", s: "204" },
  { t: "14:02:31", p: "Meta", c: "#1877f2", e: "Purchase · dedup_ok", s: "200" },
];

export default function ExtensionPromo() {
  return (
    <section className="relative overflow-hidden border-t border-line bg-ink-2 py-28">
      <div className="pointer-events-none absolute -right-40 top-20 h-[420px] w-[420px] rounded-full bg-acid/[0.06] blur-[110px]" />
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
        {/* mock DevTools panel */}
        <Reveal>
          <div className="relative">
            <div className="pointer-events-none absolute -inset-8 rounded-3xl bg-acid/[0.05] blur-2xl" />
            <div className="code-block relative shadow-2xl shadow-black/60">
              <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
                <span className="size-2.5 rounded-full bg-rose/70" />
                <span className="size-2.5 rounded-full bg-amber/70" />
                <span className="size-2.5 rounded-full bg-acid/70" />
                <span className="ml-2 rounded border border-line bg-white/5 px-2 py-0.5 font-mono2 text-[9px] text-faint">
                  aurora-athletics.myshopify.com
                </span>
                <span className="ml-auto font-mono2 text-[10px] text-acid">
                  ⚡ ShopifyTrack
                </span>
              </div>
              <div className="grid grid-cols-[1.35fr_1fr]">
                <div className="border-r border-line">
                  <div className="border-b border-line px-3 py-1.5 font-mono2 text-[9px] uppercase tracking-[0.2em] text-faint">
                    Outgoing hits
                  </div>
                  <div className="divide-y divide-line/50">
                    {MOCK_ROWS.map((r, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[52px_56px_1fr_32px] items-center gap-2 px-3 py-[7px] font-mono2 text-[10px]"
                      >
                        <span className="text-faint">{r.t}</span>
                        <span className="flex items-center gap-1.5 text-moss">
                          <span className="size-1.5 rounded-full" style={{ background: r.c }} />
                          {r.p}
                        </span>
                        <span className="truncate text-bone">{r.e}</span>
                        <span className="text-right text-acid">{r.s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="border-b border-line px-3 py-1.5 font-mono2 text-[9px] uppercase tracking-[0.2em] text-faint">
                    dataLayer
                  </div>
                  <div className="space-y-2 p-3 font-mono2 text-[9.5px] leading-relaxed">
                    <div className="rounded-md border border-line bg-ink p-2">
                      <span className="tok-key">event</span>: <span className="tok-str">"purchase"</span>
                      <br />
                      <span className="tok-key">ecommerce</span>: {"{"}
                      <br />
                      &nbsp;&nbsp;<span className="tok-key">value</span>: <span className="tok-fn">149.00</span>,
                      <br />
                      &nbsp;&nbsp;<span className="tok-key">currency</span>: <span className="tok-str">"USD"</span>
                      <br />
                      {"}"}
                    </div>
                    <div className="rounded-md border border-line bg-ink p-2 text-moss">
                      <span className="tok-key">event</span>: <span className="tok-str">"add_to_cart"</span> …
                    </div>
                    <div className="flex items-center gap-2 px-1 pt-1 text-[9px] text-acid">
                      <span className="size-1.5 rounded-full bg-acid animate-pulse-dot" />
                      GTM detected · consent: denied→granted
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* copy */}
        <Reveal delay={0.1}>
          <p className="font-mono2 text-[11px] uppercase tracking-[0.3em] text-acid">{"// verify everything"}</p>
          <h2 className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Trust, but <span className="text-acid">inspect.</span>
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-moss">
            The ShopifyTrack Inspector is a free Chrome extension that lives in DevTools. It
            decodes every outgoing analytics hit and mirrors{" "}
            <span className="text-bone">window.dataLayer</span> — so you can prove your new
            pipeline works before you scale spend.
          </p>

          <ul className="mt-7 space-y-3.5">
            {[
              [ScanLine, "Decodes GA4 /g/collect, Meta /tr, TikTok, Pinterest, Snap and Google Ads hits"],
              [MousePointerClick, "Event names parsed from query params — no more guessing payloads"],
              [Puzzle, "Manifest V3, runs 100% locally. Nothing leaves your browser."],
            ].map(([Icon, text], i) => {
              const I = Icon as typeof ScanLine;
              return (
                <li key={i} className="flex items-start gap-3 text-[13.5px] text-moss">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border border-acid/25 bg-acid/[0.07] text-acid">
                    <I className="size-3" />
                  </span>
                  {text as string}
                </li>
              );
            })}
          </ul>

          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="/api/extension/download"
              className="group inline-flex items-center gap-2 rounded-full bg-acid px-6 py-3 text-sm font-semibold text-ink transition-all hover:glow-acid"
            >
              <Download className="size-4 transition-transform group-hover:translate-y-0.5" />
              Download Inspector
            </a>
            <Link
              href="/extension"
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/[0.03] px-6 py-3 text-sm text-bone transition-colors hover:border-acid/40 hover:text-acid"
            >
              Install guide
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
