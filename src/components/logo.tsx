import Link from "next/link";
import { Zap } from "lucide-react";

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-lg border border-acid/40 bg-acid/10 text-acid transition-all duration-300 group-hover:bg-acid group-hover:text-ink group-hover:glow-acid">
        <Zap className="size-4" strokeWidth={2.4} />
      </span>
      {!compact && (
        <span className="font-display text-[15px] font-semibold tracking-tight text-bone">
          Shopify<span className="text-acid">Track</span>{" "}
          <span className="font-mono2 text-[10px] font-normal uppercase tracking-[0.2em] text-moss">Pro</span>
        </span>
      )}
    </Link>
  );
}
