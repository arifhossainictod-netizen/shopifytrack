import Link from "next/link";
import { DOC_GROUPS, DOC_PAGES } from "@/lib/docs-data";

export default function DocsSidebar({ active }: { active?: string }) {
  return (
    <nav className="space-y-7">
      {DOC_GROUPS.map((group) => {
        const pages = DOC_PAGES.filter((p) => p.group === group);
        if (!pages.length) return null;
        return (
          <div key={group}>
            <h4 className="font-mono2 text-[10px] uppercase tracking-[0.25em] text-faint">
              {group}
            </h4>
            <ul className="mt-3 space-y-0.5 border-l border-line">
              {pages.map((p) => {
                const on = p.slug === active;
                return (
                  <li key={p.slug}>
                    <Link
                      href={`/docs/${p.slug}`}
                      className={`-ml-px block border-l py-1.5 pl-4 text-[13px] transition-colors ${
                        on
                          ? "border-acid font-medium text-acid"
                          : "border-transparent text-moss hover:text-bone"
                      }`}
                    >
                      {p.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
