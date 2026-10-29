"use client";

import { Globe, Server, AlertTriangle, FlaskConical } from "lucide-react";
import { useWizard } from "@/lib/store";
import { Field, StepCard, Toggle } from "./fields";

export default function StepContainers({ errors }: { errors: Record<string, string> }) {
  const { config, patchStep3, setStep } = useWizard();
  const { step2: s2, step3: s3 } = config;
  const needsWeb = s2.mode !== "server";
  const needsServer = s2.mode !== "web";
  const gtmOk = (v: string) => /^GTM-[A-Z0-9]+$/i.test(v.trim());
  const urlOk = (v: string) => /^https:\/\/[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/.test(v.trim());

  return (
    <div className="space-y-4">
      {needsWeb && (
        <StepCard
          title="Web container"
          desc="The storefront container — tags for every selected platform plus Consent Mode defaults."
          aside={<Globe className="size-4 text-mint" />}
        >
          <Field
            label="Web GTM ID"
            hint="GTM Admin → your web container → ID in the header."
            error={errors.webGtmId}
            valid={gtmOk(s3.webGtmId)}
          >
            <input
              className="field"
              placeholder="GTM-XXXXXXX"
              spellCheck={false}
              value={s3.webGtmId}
              onChange={(e) => patchStep3({ webGtmId: e.target.value.toUpperCase() })}
            />
          </Field>
          <p className="mt-4 rounded-lg border border-line bg-white/[0.02] px-3.5 py-3 text-[11.5px] leading-relaxed text-faint">
            No web container yet? Create an empty one at{" "}
            <span className="font-mono2 text-moss">tagmanager.google.com</span> — the import merges
            into a blank workspace cleanly.
          </p>
        </StepCard>
      )}

      {needsServer && (
        <StepCard
          title="Server container & tagging endpoint"
          desc="Your first-party data plane. ShopifyTrack compiles clients, CAPI tags and the dedup ledger."
          aside={<Server className="size-4 text-acid" />}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Server GTM ID · optional"
              hint="Empty = scaffold a fresh container on import."
              error={errors.serverGtmId}
              valid={gtmOk(s3.serverGtmId)}
            >
              <input
                className="field"
                placeholder="GTM-XXXXXXX"
                spellCheck={false}
                value={s3.serverGtmId}
                onChange={(e) => patchStep3({ serverGtmId: e.target.value.toUpperCase() })}
              />
            </Field>
            <Field
              label="Tagging server URL"
              hint="Custom domain mapped to sGTM, e.g. Cloud Run / Stape / Google Cloud."
              error={errors.taggingUrl}
              valid={urlOk(s3.taggingUrl)}
            >
              <input
                className="field"
                placeholder="https://gtm.mystore.com"
                spellCheck={false}
                value={s3.taggingUrl}
                onChange={(e) => patchStep3({ taggingUrl: e.target.value })}
              />
            </Field>
          </div>
        </StepCard>
      )}

      {!needsServer && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber/30 bg-amber/[0.06] p-5 sm:flex-row sm:items-center">
          <AlertTriangle className="size-5 shrink-0 text-amber" />
          <p className="flex-1 text-[12.5px] leading-relaxed text-moss">
            <span className="font-semibold text-bone">Web-only mode loses checkout & iOS signal.</span>{" "}
            Hybrid adds a first-party tagging server and lifts match rates ~20–30% on Meta
            (EMQ) and TikTok attribution windows.
          </p>
          <button
            type="button"
            onClick={() => {
              useWizard.getState().setMode("hybrid");
              setStep(2);
            }}
            className="shrink-0 rounded-full border border-amber/50 px-4 py-2 text-[12px] font-medium text-amber transition-colors hover:bg-amber/10"
          >
            Switch to Hybrid
          </button>
        </div>
      )}

      <StepCard title="Build flags">
        <Toggle
          checked={s3.staging}
          onChange={(v) => patchStep3({ staging: v })}
          label="Staging / debug build"
          desc="Pixel logs every dispatch to the console and sGTM tags include debug_mode. Turn off for production."
        />
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-white/[0.02] px-4 py-3 text-[11px] text-faint">
          <FlaskConical className="size-3.5 text-mint" />
          DNS reminder: CNAME your tagging domain to your sGTM host before connecting the pixel.
        </div>
      </StepCard>
    </div>
  );
}
