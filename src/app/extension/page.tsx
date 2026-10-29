import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Download,
  Eye,
  FileArchive,
  FolderOpen,
  Layers,
  ListFilter,
  ScanLine,
  ShieldCheck,
  ToggleRight,
} from "lucide-react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import Reveal from "@/components/reveal";
import { EXTENSION_VERSION, EXTENSION_FILES } from "@/lib/extension-files";
import { PLATFORMS } from "@/lib/platforms";

export const metadata: Metadata = {
  title: "ShopifyTrack Inspector — Chrome extension",
  description:
    "A DevTools panel that decodes every outgoing GA4, Meta, TikTok, Pinterest, Snap and Google Ads hit on your Shopify store — plus a live window.dataLayer mirror.",
};

const INSTALL_STEPS = [
  {
    n: "01",
    icon: FileArchive,
    title: "Download & unzip",
    body: "Grab shopifytrack-inspector.zip below and extract it anywhere on your machine.",
  },
  {
    n: "02",
    icon: ToggleRight,
    body: "Open chrome://extensions and toggle Developer mode on (top-right corner).",
    title: "Developer mode",
  },
  {
    n: "03",
    icon: FolderOpen,
    title: "Load unpacked",
    body: "Click “Load unpacked” and select the extracted folder. The puzzle icon is optional — this lives in DevTools.",
  },
  {
    n: "04",
    icon: ScanLine,
    title: "Inspect a store",
    body: "Open any Shopify store, press F12 and switch to the ShopifyTrack panel. Hits stream instantly.",
  },
];

export default function ExtensionPage() {
  const totalKb = (
    EXTENSION_FILES.reduce((a, f) => a + new Blob([f.content]).size, 0) / 1024
  ).toFixed(1);

  return (
    <main>
      <Nav />

      {/* hero */}
      <section className="relative overflow-hidden pt-36 pb-24 sm:pt-44">
        <div className="pointer-events-none absolute -top-32 right-0 h-[480px] w-[620px] rounded-full bg-acid/[0.07] blur-[130px]" />
        <div className="grid-bg pointer-events-none absolute inset-0 mask-fade-y" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <span className="chip">
                <span className="size-1.5 rounded-full bg-acid animate-pulse-dot" />
                Chrome · MV3 · DevTools
              </span>
              <span className="chip">v{EXTENSION_VERSION}</span>
              <span className="chip">{totalKb} KB unpacked</span>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-8 font-display text-[10vw] font-semibold leading-[0.95] tracking-tight sm:text-7xl">
              <span className="text-outline">See every hit.</span>
              <br />
              Trust your <span className="text-acid">pipeline.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-moss">
              The Inspector watches your store's network traffic and mirrors{" "}
              <span className="font-mono2 text-[13px] text-bone">window.dataLayer</span> inside a
              purpose-built DevTools panel. It is the fastest way to prove a fresh ShopifyTrack
              install — or to debug one that's already live.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="/api/extension/download"
                className="group inline-flex items-center gap-2.5 rounded-full bg-acid px-8 py-4 text-sm font-semibold text-ink transition-all hover:glow-acid"
              >
                <Download className="size-4 transition-transform group-hover:translate-y-0.5" />
                Download Inspector .zip
              </a>
              <Link
                href="/docs/inspector-extension"
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/[0.03] px-6 py-4 text-sm text-bone transition-colors hover:border-acid/40 hover:text-acid"
              >
                Full docs <ArrowUpRight className="size-4" />
              </Link>
            </div>
            <p className="mt-4 font-mono2 text-[11px] text-faint">
              free · runs 100% locally · signed source included in the zip
            </p>
          </Reveal>
        </div>
      </section>

      {/* capabilities */}
      <section className="border-t border-line bg-ink-2 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Decodes <span className="text-acid">six platforms</span> in real time
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PLATFORMS.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 0.07}>
                <div className="card-hover flex items-center gap-4 rounded-2xl border border-line bg-panel p-5">
                  <span
                    className="grid size-11 place-items-center rounded-xl border font-mono2 text-[11px] font-semibold"
                    style={{ borderColor: `${p.color}44`, color: p.color, background: `${p.color}0f` }}
                  >
                    {p.short.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[14px] font-medium text-bone">{p.name}</div>
                    <div className="truncate font-mono2 text-[10.5px] text-faint">{p.tagline}</div>
                  </div>
                  <span className="ml-auto size-2 rounded-full animate-pulse-dot" style={{ background: p.color }} />
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Eye,
                t: "dataLayer mirror",
                b: "The 12 most recent pushes, pretty-printed, with GTM presence detection per page.",
              },
              {
                icon: ListFilter,
                t: "Decoded event names",
                b: "en=, ev= and event= params parsed out of raw query strings into readable events.",
              },
              {
                icon: ShieldCheck,
                t: "Zero telemetry",
                b: "No permissions beyond DevTools. No external calls. Your data never leaves the tab.",
              },
            ].map((f, i) => (
              <Reveal key={f.t} delay={i * 0.07}>
                <div className="card-hover h-full rounded-2xl border border-line bg-panel p-6">
                  <f.icon className="size-5 text-acid" strokeWidth={1.8} />
                  <h3 className="mt-5 font-display text-[16px] font-semibold text-bone">{f.t}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-moss">{f.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* install steps */}
      <section className="border-t border-line py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <p className="font-mono2 text-[11px] uppercase tracking-[0.3em] text-acid">{"// 60-second install"}</p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Load it <span className="text-outline">unpacked.</span>
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {INSTALL_STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <div className="card-hover relative h-full rounded-2xl border border-line bg-panel p-6">
                  <div className="flex items-center justify-between">
                    <s.icon className="size-5 text-acid" strokeWidth={1.8} />
                    <span className="font-mono2 text-[11px] text-faint">{s.n}</span>
                  </div>
                  <h3 className="mt-6 font-display text-[16px] font-semibold text-bone">{s.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-moss">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-2xl border border-acid/30 bg-gradient-to-br from-acid/[0.08] to-transparent p-7 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-display text-lg font-semibold text-bone">
                  Pair it with a compiled package
                </h3>
                <p className="mt-1 max-w-lg text-[13px] text-moss">
                  Run the wizard, deploy your containers + pixel, then watch the Inspector confirm
                  every subscription and server hit live.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/api/extension/download"
                  className="group inline-flex items-center gap-2 rounded-full bg-acid px-6 py-3 text-sm font-semibold text-ink transition-all hover:glow-acid"
                >
                  <Download className="size-4 transition-transform group-hover:translate-y-0.5" />
                  Inspector .zip
                </a>
                <Link
                  href="/wizard"
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-6 py-3 text-sm text-bone transition-colors hover:border-acid/40 hover:text-acid"
                >
                  Open wizard <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="mt-10 flex items-center gap-2 font-mono2 text-[11px] text-faint">
              <Layers className="size-3.5" />
              also compatible with Edge, Brave and Arc (Chromium 100+)
            </p>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
