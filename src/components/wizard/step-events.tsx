"use client";

import { Check, Fingerprint, ShieldCheck } from "lucide-react";
import { CMP_OPTIONS, EVENTS, platformById } from "@/lib/platforms";
import { useWizard } from "@/lib/store";
import { StepCard, Toggle } from "./fields";

export default function StepEvents({ errors }: { errors: Record<string, string> }) {
  const { config, toggleEvent, patchStep4, setCmp } = useWizard();
  const { step2: s2, step4: s4 } = config;

  return (
    <div className="space-y-4">
      <StepCard
        title="E-commerce events"
        desc="Each toggle becomes a Shopify pixel subscription, a GTM trigger and per-platform mapped tags."
        aside={
          <span className="rounded-full border border-line px-2.5 py-1 font-mono2 text-[10px] text-moss">
            {s4.events.length}/{EVENTS.length} on
          </span>
        }
      >
        {errors.events && (
          <p className="mb-4 rounded-lg border border-rose/30 bg-rose/10 px-3 py-2 text-[12px] text-rose">
            {errors.events}
          </p>
        )}
        <div className="space-y-2">
          {EVENTS.map((ev) => {
            const on = s4.events.includes(ev.id);
            const mapped = s2.platforms
              .map((pid) => {
                const m = ev.map[pid as never];
                return m ? `${platformById(pid as never).short}: ${m}` : null;
              })
              .filter(Boolean)
              .join("  ·  ");
            return (
              <button
                key={ev.id}
                type="button"
                onClick={() => toggleEvent(ev.id)}
                className={`flex w-full items-center gap-3.5 rounded-xl border px-4 py-3 text-left transition-all duration-300 ${
                  on ? "border-acid/40 bg-acid/[0.05]" : "border-line bg-white/[0.02] hover:border-line-strong"
                }`}
              >
                <span
                  className={`grid size-5 shrink-0 place-items-center rounded-md border transition-all ${
                    on ? "border-acid bg-acid text-ink" : "border-line-strong text-transparent"
                  }`}
                >
                  <Check className="size-3" strokeWidth={3.2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className={`text-[13.5px] font-medium ${on ? "text-bone" : "text-moss"}`}>
                      {ev.label}
                    </span>
                    <span className="font-mono2 text-[10px] text-faint">{ev.shopify}</span>
                  </span>
                  <span className="block text-[11px] text-faint">{ev.desc}</span>
                  {on && mapped && (
                    <span className="mt-1 block truncate font-mono2 text-[10px] text-mint/80">
                      → {mapped}
                    </span>
                  )}
                </span>
                {ev.id === "purchase" && (
                  <span className="hidden rounded-full border border-acid/40 px-2 py-0.5 font-mono2 text-[9px] uppercase tracking-wider text-acid sm:block">
                    revenue
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </StepCard>

      <StepCard
        title="Privacy & consent"
        desc="Compiled directly into the pixel payload and Consent Mode defaults tag."
        aside={<Fingerprint className="size-4 text-mint" />}
      >
        <div className="space-y-3">
          <Toggle
            checked={s4.hashPii}
            onChange={(v) => patchStep4({ hashPii: v })}
            label="SHA-256 hash customer data"
            desc="email & phone hashed before leaving the pixel (edge-verified in server mode). Required by Meta/TikTok CAPI."
          />
          <Toggle
            checked={s4.enhancedConversions}
            onChange={(v) => patchStep4({ enhancedConversions: v })}
            label="Enhanced conversions"
            desc="Passes hashed first-party data to Google Ads purchase conversions for resilient attribution."
          />
          <Toggle
            checked={s4.consentMode}
            onChange={(v) => patchStep4({ consentMode: v })}
            label="Google Consent Mode v2"
            desc="Emits consent defaults before any tag fires; listens for consent_update events from your CMP."
          />

          {s4.consentMode && (
            <div className="grid gap-3 rounded-xl border border-line bg-white/[0.02] p-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 font-mono2 text-[10px] uppercase tracking-[0.18em] text-moss">
                  Default consent state
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(["denied", "granted"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => patchStep4({ defaultConsent: v })}
                      className={`rounded-lg border px-3 py-2.5 font-mono2 text-[12px] transition-all ${
                        s4.defaultConsent === v
                          ? "border-acid/60 bg-acid/10 text-acid"
                          : "border-line text-faint hover:border-line-strong"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[10.5px] leading-relaxed text-faint">
                  “denied” + wait_for_update is the EEA-safe default.
                </p>
              </div>
              <div>
                <div className="mb-2 font-mono2 text-[10px] uppercase tracking-[0.18em] text-moss">
                  Consent management platform
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {CMP_OPTIONS.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setCmp(o.id)}
                      className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-left transition-all ${
                        s4.cmp === o.id
                          ? "border-acid/60 bg-acid/10"
                          : "border-line hover:border-line-strong"
                      }`}
                    >
                      <ShieldCheck
                        className={`mt-0.5 size-3.5 shrink-0 ${s4.cmp === o.id ? "text-acid" : "text-faint"}`}
                      />
                      <span>
                        <span className={`block text-[11.5px] font-medium ${s4.cmp === o.id ? "text-bone" : "text-moss"}`}>
                          {o.name}
                        </span>
                        <span className="block text-[9.5px] text-faint">{o.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </StepCard>
    </div>
  );
}
