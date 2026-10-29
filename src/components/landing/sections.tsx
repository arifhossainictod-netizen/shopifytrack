import {
  BadgeCheck,
  Braces,
  ScanSearch,
  FileCode2,
  MousePointerClick,
  Server,
  ShieldCheck,
  Unplug,
  Wand2,
  Workflow,
} from "lucide-react";
import Reveal from "../reveal";

/* ------------------------------------------------------------------ */
/*  Problem                                                            */
/* ------------------------------------------------------------------ */

const PAINS = [
  {
    icon: MousePointerClick,
    stat: "47 clicks",
    text: "to wire a single GTM container by hand — per event, per platform.",
    broken: true,
  },
  {
    icon: Unplug,
    stat: "~30%",
    text: "of browser events vanish to ITP, ad blockers and checkout sandboxes.",
    broken: true,
  },
  {
    icon: Workflow,
    stat: "12 tabs",
    text: "open across GTM, Events Managers and Shopify admin — one typo kills the feed.",
    broken: true,
  },
  {
    icon: Wand2,
    stat: "3 minutes",
    text: "with ShopifyTrack Pro. One wizard, one compile, one zip. Zero typos.",
    broken: false,
  },
];

export function ProblemSection() {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <p className="font-mono2 text-[11px] uppercase tracking-[0.3em] text-acid">{"// the manual tax"}</p>
          <h2 className="mt-5 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Hand-wired tracking is a{" "}
            <span className="text-outline">bug factory.</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PAINS.map((p, i) => (
            <Reveal key={p.stat} delay={i * 0.08}>
              <div className="card-hover group relative h-full rounded-2xl border border-line bg-panel p-6">
                <p.icon className={`size-5 ${p.broken ? "text-rose" : "text-acid"}`} strokeWidth={1.8} />
                <div className="mt-6 font-display text-4xl font-semibold tracking-tight text-bone">
                  {p.stat}
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-moss">{p.text}</p>
                <div
                  className={`absolute right-5 top-5 font-mono2 text-[9px] uppercase tracking-[0.2em] ${
                    p.broken ? "text-rose/70" : "text-acid"
                  }`}
                >
                  {p.broken ? "manual" : "compiled"}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  How it works                                                       */
/* ------------------------------------------------------------------ */

const PHASES = [
  {
    n: "01",
    title: "Configure",
    body: "Pick your destinations — GA4, Meta, TikTok, Pinterest, Snap, Google Ads. Drop in IDs and tokens. Toggle events, consent defaults and SHA-256 hashing.",
    accent: "text-mint",
  },
  {
    n: "02",
    title: "Compile",
    body: "The template engine streams your parameters into master GTM container schemas and the Customer Events pixel — with pre-flight validation on every field.",
    accent: "text-acid",
  },
  {
    n: "03",
    title: "Deploy & verify",
    body: "Import both containers, paste one pixel, load the Inspector extension and watch every hit land — browser and server — in real time.",
    accent: "text-amber",
  },
];

export function HowSection() {
  return (
    <section id="how" className="relative border-t border-line bg-ink-2 py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <p className="font-mono2 text-[11px] uppercase tracking-[0.3em] text-acid">{"// pipeline"}</p>
          <h2 className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Configure. Compile. <span className="text-acid">Convert.</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-10 lg:grid-cols-3">
          {PHASES.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.12}>
              <div className="relative border-t border-line-strong pt-8">
                <div className={`font-mono2 text-sm ${p.accent}`}>{p.n}</div>
                <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight">{p.title}</h3>
                <p className="mt-3 text-[13.5px] leading-relaxed text-moss">{p.body}</p>
                <div className="pointer-events-none absolute -top-px left-0 h-px w-16 bg-acid/60" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Features                                                           */
/* ------------------------------------------------------------------ */

const FEATURES = [
  {
    icon: Braces,
    title: "Template compiler",
    body: "A placeholder engine streams your parameters into master GTM JSON schemas — every tag, trigger and variable pre-wired and import-ready.",
    tag: "engine",
  },
  {
    icon: Server,
    title: "Web + server containers",
    body: "Generate both exports in one pass: storefront web container and an sGTM server container with CAPI tags, event dedup and a pixel client.",
    tag: "gtm-web.json / gtm-server.json",
  },
  {
    icon: FileCode2,
    title: "Customer Events pixel",
    body: "A compact, production-shaped Shopify pixel that subscribes to all events, hashes PII and beacons straight to your tagging server.",
    tag: "custom-pixel-compact.js",
  },
  {
    icon: ShieldCheck,
    title: "Consent & hashing",
    body: "Consent Mode v2 defaults, CMP wiring for Shopify Customer Privacy, Cookiebot or OneTrust, plus SHA-256 user_data hashing at the edge.",
    tag: "privacy",
  },
  {
    icon: BadgeCheck,
    title: "Pre-flight checks",
    body: "12 automated warnings catch invalid IDs, missing tokens, HTTPS misconfig and disabled purchase events before you ever hit import.",
    tag: "qa",
  },
  {
    icon: ScanSearch,
    title: "Inspector extension",
    body: "A DevTools panel that watches dataLayer pushes and decodes every outgoing hit — GA4, Meta, TikTok, Pinterest, Snap, Google Ads.",
    tag: "chrome",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative border-t border-line py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono2 text-[11px] uppercase tracking-[0.3em] text-acid">{"// the stack"}</p>
              <h2 className="mt-5 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                Six tools. <span className="text-outline">One pipeline.</span>
              </h2>
            </div>
            <p className="max-w-sm text-[13.5px] leading-relaxed text-moss">
              Every artifact the wizard emits is a real file you own — import it, audit it,
              version it in git. No lock-in, no black boxes.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.08}>
              <div className="card-hover group relative h-full overflow-hidden rounded-2xl border border-line bg-panel p-6">
                <div className="flex items-start justify-between">
                  <span className="grid size-10 place-items-center rounded-xl border border-acid/25 bg-acid/[0.07] text-acid transition-colors group-hover:bg-acid group-hover:text-ink">
                    <f.icon className="size-4.5" strokeWidth={1.8} />
                  </span>
                  <span className="font-mono2 text-[9px] uppercase tracking-[0.2em] text-faint">
                    {f.tag}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-lg font-semibold tracking-tight text-bone">
                  {f.title}
                </h3>
                <p className="mt-2.5 text-[13px] leading-relaxed text-moss">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
