import Link from "next/link";
import { ArrowUpRight, Zap } from "lucide-react";
import { PLATFORMS } from "@/lib/platforms";

export default function Footer() {
  return (
    <footer className="relative border-t border-line bg-ink-2">
      {/* giant CTA */}
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <p className="font-mono2 text-[11px] uppercase tracking-[0.3em] text-acid">
          {"// ready when you are"}
        </p>
        <Link href="/wizard" className="group mt-6 block">
          <h2 className="font-display text-[13vw] font-semibold leading-[0.92] tracking-tight sm:text-8xl">
            <span className="text-outline transition-colors duration-500 group-hover:text-acid group-hover:[-webkit-text-stroke:0px]">
              Ship tracking
            </span>
            <br />
            <span className="inline-flex items-center gap-4 text-bone">
              that converts
              <span className="grid size-[0.9em] place-items-center rounded-full bg-acid text-ink transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight className="size-[0.5em]" />
              </span>
            </span>
          </h2>
        </Link>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-md bg-acid/10 text-acid">
                <Zap className="size-3.5" />
              </span>
              <span className="font-display text-sm font-semibold">ShopifyTrack Pro</span>
            </div>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-moss">
              The tracking compiler for Shopify. GTM web + server containers, CAPI templates and
              Customer Pixels — generated, not hand-wired.
            </p>
          </div>

          <div>
            <h4 className="font-mono2 text-[10px] uppercase tracking-[0.25em] text-faint">Product</h4>
            <ul className="mt-4 space-y-2.5 text-[13px] text-moss">
              <li><Link className="hover:text-acid" href="/wizard">Tracking Wizard</Link></li>
              <li><Link className="hover:text-acid" href="/extension">Inspector Extension</Link></li>
              <li><Link className="hover:text-acid" href="/docs">Documentation</Link></li>
              <li><a className="hover:text-acid" href="/api/extension/download">Download .zip</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono2 text-[10px] uppercase tracking-[0.25em] text-faint">Signals</h4>
            <ul className="mt-4 space-y-2.5 text-[13px] text-moss">
              {PLATFORMS.map((p) => (
                <li key={p.id} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full" style={{ background: p.color }} />
                  {p.short}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono2 text-[10px] uppercase tracking-[0.25em] text-faint">Protocol</h4>
            <ul className="mt-4 space-y-2.5 font-mono2 text-[12px] text-moss">
              <li>// consent-mode-v2</li>
              <li>// sha256-user-data</li>
              <li>// event-dedup-24h</li>
              <li>// first-party-beacons</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-[11px] text-faint sm:px-6">
          <span>© {new Date().getFullYear()} ShopifyTrack Pro — not affiliated with Shopify Inc.</span>
          <span className="font-mono2">built for merchants who measure twice ✕ ship once</span>
        </div>
      </div>
    </footer>
  );
}
