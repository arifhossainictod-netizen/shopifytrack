"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Globe, Server, Layers, Check, KeyRound } from "lucide-react";
import { PLATFORMS, type TrackMode } from "@/lib/platforms";
import { useWizard } from "@/lib/store";
import { StepCard, Field } from "./fields";

const MODES: { id: TrackMode; name: string; desc: string; icon: typeof Globe; badge?: string }[] = [
  {
    id: "web",
    name: "Web only",
    desc: "gtm-web.json + pixel. Fastest to ship; loses checkout signal.",
    icon: Globe,
  },
  {
    id: "server",
    name: "Server only",
    desc: "gtm-server.json + pixel → tagging server. Max durability, no storefront tags.",
    icon: Server,
  },
  {
    id: "hybrid",
    name: "Hybrid",
    desc: "Both containers + pixel with dedup. The setup ad platforms reward.",
    icon: Layers,
    badge: "Recommended",
  },
];

export default function StepDestinations({ errors }: { errors: Record<string, string> }) {
  const { config, setMode, togglePlatform, setCred } = useWizard();
  const s2 = config.step2;
  const showServer = s2.mode !== "web";

  return (
    <div className="space-y-4">
      <StepCard title="Tracking architecture" desc="Decides which container exports your package contains.">
        <div className="grid gap-3 sm:grid-cols-3">
          {MODES.map((m) => {
            const active = s2.mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`relative rounded-xl border p-4 text-left transition-all duration-300 ${
                  active
                    ? "border-acid/60 bg-acid/[0.07]"
                    : "border-line bg-white/[0.02] hover:border-line-strong"
                }`}
              >
                {m.badge && (
                  <span
                    className={`absolute -top-2.5 right-3 rounded-full px-2 py-0.5 font-mono2 text-[9px] uppercase tracking-wider ${
                      active ? "bg-acid text-ink" : "border border-line bg-panel text-faint"
                    }`}
                  >
                    {m.badge}
                  </span>
                )}
                <m.icon className={`size-5 ${active ? "text-acid" : "text-moss"}`} strokeWidth={1.8} />
                <div className={`mt-3 text-[13.5px] font-semibold ${active ? "text-bone" : "text-moss"}`}>
                  {m.name}
                </div>
                <div className="mt-1.5 text-[11px] leading-relaxed text-faint">{m.desc}</div>
              </button>
            );
          })}
        </div>
      </StepCard>

      <StepCard
        title="Destination platforms"
        desc="Select every platform you advertise or analyze on. Fields adapt to your architecture."
        aside={
          <span className="rounded-full border border-line px-2.5 py-1 font-mono2 text-[10px] text-moss">
            {s2.platforms.length}/6 selected
          </span>
        }
      >
        {errors.platforms && (
          <p className="mb-4 rounded-lg border border-rose/30 bg-rose/10 px-3 py-2 text-[12px] text-rose">
            {errors.platforms}
          </p>
        )}

        <div className="space-y-3">
          {PLATFORMS.map((p) => {
            const active = s2.platforms.includes(p.id);
            const creds = s2.creds[p.id] ?? {};
            const fields = p.fields.filter((f) => !f.serverOnly || showServer);
            return (
              <div
                key={p.id}
                className={`overflow-hidden rounded-xl border transition-colors duration-300 ${
                  active ? "border-acid/40 bg-acid/[0.04]" : "border-line bg-white/[0.02]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => togglePlatform(p.id)}
                  className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left"
                >
                  <span
                    className="grid size-8 place-items-center rounded-lg border font-mono2 text-[10px] font-semibold"
                    style={{
                      borderColor: active ? `${p.color}66` : "var(--color-line)",
                      color: active ? p.color : "var(--color-faint)",
                      background: active ? `${p.color}14` : "transparent",
                    }}
                  >
                    {p.short.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-[13.5px] font-medium ${active ? "text-bone" : "text-moss"}`}>
                      {p.name}
                    </span>
                    <span className="block text-[11px] text-faint">{p.tagline}</span>
                  </span>
                  <span
                    className={`grid size-5 place-items-center rounded-full border transition-all ${
                      active ? "border-acid bg-acid text-ink" : "border-line-strong text-transparent"
                    }`}
                  >
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {active && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="grid gap-4 border-t border-line px-4 py-4 sm:grid-cols-2">
                        {fields.map((f) => (
                          <div key={f.key} className={f.secret ? "sm:col-span-2" : ""}>
                            <Field
                              label={`${f.label}${f.optional ? " · optional" : ""}${f.serverOnly ? " · server" : ""}`}
                              hint={f.hint}
                              error={errors[`${p.id}.${f.key}`]}
                              valid={!!(creds[f.key] ?? "").trim()}
                            >
                              <div className="relative">
                                <input
                                  className="field pr-9"
                                  type={f.secret ? "password" : "text"}
                                  placeholder={f.placeholder}
                                  spellCheck={false}
                                  value={creds[f.key] ?? ""}
                                  onChange={(e) => setCred(p.id, f.key, e.target.value)}
                                />
                                {f.secret && (
                                  <KeyRound className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-faint" />
                                )}
                              </div>
                            </Field>
                          </div>
                        ))}
                        {fields.some((f) => f.serverOnly) && !showServer && (
                          <p className="text-[11px] text-faint sm:col-span-2">
                            Server tokens hidden — switch to Hybrid to unlock{" "}
                            {p.name.split(" ")[0]} server-side delivery.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </StepCard>
    </div>
  );
}
