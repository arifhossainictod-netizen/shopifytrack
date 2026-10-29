import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Info, Lightbulb, AlertTriangle } from "lucide-react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import DocsSidebar from "@/components/docs/sidebar";
import CodeBlock from "@/components/docs/code-block";
import { DOC_PAGES, docBySlug, type DocBlock } from "@/lib/docs-data";

export function generateStaticParams() {
  return DOC_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = docBySlug(slug);
  if (!page) return { title: "Not found" };
  return { title: `${page.title} — Docs`, description: page.blurb };
}

/* inline **bold** rendering */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

const CALLOUT = {
  info: { icon: Info, cls: "border-mint/30 bg-mint/[0.06] text-mint" },
  warn: { icon: AlertTriangle, cls: "border-amber/30 bg-amber/[0.06] text-amber" },
  tip: { icon: Lightbulb, cls: "border-acid/30 bg-acid/[0.06] text-acid" },
} as const;

function Block({ block }: { block: DocBlock }) {
  switch (block.type) {
    case "h2":
      return <h2>{block.text}</h2>;
    case "p":
      return (
        <p>
          <Rich text={block.text} />
        </p>
      );
    case "code":
      return <CodeBlock code={block.code} title={block.title} />;
    case "list":
      return block.ordered ? (
        <ol className="my-5 list-none space-y-3">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-3.5 text-[13.5px] leading-relaxed text-moss">
              <span className="grid size-6 shrink-0 place-items-center rounded-full border border-acid/40 bg-acid/10 font-mono2 text-[10px] text-acid">
                {i + 1}
              </span>
              <span className="pt-0.5">{it}</span>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="my-5 space-y-2.5">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-3 text-[13.5px] leading-relaxed text-moss">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-acid/70" />
              {it}
            </li>
          ))}
        </ul>
      );
    case "callout": {
      const c = CALLOUT[block.tone];
      const Icon = c.icon;
      return (
        <div className={`my-6 rounded-xl border p-4.5 ${c.cls.split(" ")[0]} ${c.cls.split(" ")[1]}`}>
          <div className={`flex items-center gap-2 font-mono2 text-[10px] uppercase tracking-[0.2em] ${c.cls.split(" ")[2]}`}>
            <Icon className="size-3.5" />
            {block.title}
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-moss">{block.text}</p>
        </div>
      );
    }
    case "table":
      return (
        <div className="my-6 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[560px] text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-line bg-white/[0.03]">
                {block.head.map((h) => (
                  <th key={h} className="px-4 py-2.5 font-mono2 text-[10px] font-medium uppercase tracking-[0.15em] text-faint">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="border-b border-line/60 last:border-0">
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`px-4 py-2.5 align-top ${j === 0 ? "whitespace-nowrap font-mono2 text-[11.5px] text-mint" : "text-moss"}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = docBySlug(slug);
  if (!page) notFound();

  const idx = DOC_PAGES.findIndex((p) => p.slug === slug);
  const prev = DOC_PAGES[idx - 1];
  const next = DOC_PAGES[idx + 1];

  return (
    <main>
      <Nav />
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <DocsSidebar active={slug} />
            </div>
          </aside>

          <article className="doc-prose min-w-0 max-w-3xl">
            <p className="font-mono2 text-[10px] uppercase tracking-[0.3em] text-acid">
              {"// "}{page.group.toLowerCase()}
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-bone sm:text-5xl">
              {page.title}
            </h1>
            <p className="!mt-3 text-[15px] !text-moss">{page.blurb}</p>

            <div className="mt-8 border-t border-line pt-2">
              {page.blocks.map((b, i) => (
                <Block key={i} block={b} />
              ))}
            </div>

            <div className="mt-14 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
              {prev ? (
                <Link
                  href={`/docs/${prev.slug}`}
                  className="group rounded-xl border border-line p-4 transition-colors hover:border-acid/40"
                >
                  <span className="flex items-center gap-1.5 font-mono2 text-[10px] uppercase tracking-[0.2em] text-faint">
                    <ArrowLeft className="size-3" /> previous
                  </span>
                  <span className="mt-2 block text-[14px] font-medium text-bone group-hover:text-acid">
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  href={`/docs/${next.slug}`}
                  className="group rounded-xl border border-line p-4 text-right transition-colors hover:border-acid/40"
                >
                  <span className="flex items-center justify-end gap-1.5 font-mono2 text-[10px] uppercase tracking-[0.2em] text-faint">
                    next <ArrowRight className="size-3" />
                  </span>
                  <span className="mt-2 block text-[14px] font-medium text-bone group-hover:text-acid">
                    {next.title}
                  </span>
                </Link>
              )}
            </div>
          </article>
        </div>
      </div>
      <Footer />
    </main>
  );
}
