import { PLATFORMS } from "@/lib/platforms";

const EXTRAS = ["GTM Web", "GTM Server", "Custom Pixel", "Consent Mode v2", "Enhanced Conversions", "Event Dedup"];

export default function Marquee() {
  const items = [...PLATFORMS.map((p) => p.name), ...EXTRAS];
  const doubled = [...items, ...items];
  return (
    <div className="relative border-y border-line bg-ink-2 py-4">
      <div className="mask-fade-x overflow-hidden">
        <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
          {doubled.map((item, i) => (
            <span key={i} className="flex items-center gap-10">
              <span className="font-mono2 text-[12px] uppercase tracking-[0.25em] text-moss">
                {item}
              </span>
              <span className="size-1 rounded-full bg-acid/50" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
