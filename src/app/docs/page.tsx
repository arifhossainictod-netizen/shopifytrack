import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Download } from "lucide-react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import DocsSidebar from "@/components/docs/sidebar";
import { DOC_PAGES } from "@/lib/docs-data";

export const metadata: Metadata = {
  title: "Docs — containers, pixels, consent & verification",
  description:
    "Full documentation for ShopifyTrack Pro: web & server GTM containers, the Customer Events pixel, event mappings, consent mode and the Inspector extension.",
};

export default function DocsIndex() {
  const featured = DOC_PAGES.slice(0, 3);
  return (
    <main>
      <Nav />
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6">
        <p className="font-mono2 text-[11px] uppercase tracking-[0.3em] text-acid">{"// documentation"}</p>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
          Ship it <span className="text-outline-acid">right,</span>
          <br />
          the first time.
        </h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-moss">
          Everything the wizard generates, where it installs, and how to verify it — from
          container imports to consent wiring to hit-level QA.
        </p>

        <div className="mt-14 grid gap-10 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <DocsSidebar />
            </div>
          </aside>

          <div>
            <div className="grid gap-4 sm:grid-cols-3">
              {featured.map((p) => (
                <Link
                  key={p.slug}
                  href={`/docs/${p.slug}`}
                  className="card-hover group rounded-2xl border border-line bg-panel p-5"
                >
                  <BookOpen className="size-4 text-acid" />
                  <h3 className="mt-4 font-display text-[15px] font-semibold text-bone">{p.title}</h3>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-faint">{p.blurb}</p>
                  <span className="mt-4 inline-flex items-center gap-1 font-mono2 text-[10px] uppercase tracking-[0.18em] text-moss transition-colors group-hover:text-acid">
                    read <ArrowRight className="size-3" />
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-10 space-y-1 rounded-2xl border border-line bg-panel">
              {DOC_PAGES.map((p) => (
                <Link
                  key={p.slug}
                  href={`/docs/${p.slug}`}
                  className="group flex items-center gap-4 border-b border-line px-5 py-4 transition-colors last:border-0 hover:bg-acid/[0.04]"
                >
                  <span className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-faint w-28 shrink-0">
                    {p.group}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-medium text-bone group-hover:text-acid">
                      {p.title}
                    </span>
                    <span className="block truncate text-[12px] text-faint">{p.blurb}</span>
                  </span>
                  <ArrowUpRight className="size-4 shrink-0 text-faint transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-acid" />
                </Link>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-acid/30 bg-acid/[0.05] px-6 py-5">
              <div className="text-[13px] text-moss">
                <span className="font-semibold text-bone">Verifying an install?</span> Grab the
                Inspector extension and watch every hit land.
              </div>
              <a
                href="/api/extension/download"
                className="inline-flex items-center gap-2 rounded-full bg-acid px-5 py-2.5 text-[13px] font-semibold text-ink transition-all hover:glow-acid"
              >
                <Download className="size-4" /> Inspector .zip
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
