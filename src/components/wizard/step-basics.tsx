"use client";

import { useWizard } from "@/lib/store";
import { Field, StepCard } from "./fields";

export default function StepBasics({ errors }: { errors: Record<string, string> }) {
  const { config, patchStep1 } = useWizard();
  const s1 = config.step1;
  const domainOk = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(s1.shopDomain);

  return (
    <div className="space-y-4">
      <StepCard
        title="Store identity"
        desc="Names and domains are compiled into every container, tag name and pixel header comment."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Store name"
            hint="Used in container names: “Aurora Athletics — Web”."
            error={errors.storeName}
            valid={s1.storeName.trim().length >= 2}
          >
            <input
              className="field"
              placeholder="Aurora Athletics"
              value={s1.storeName}
              onChange={(e) => patchStep1({ storeName: e.target.value })}
            />
          </Field>

          <Field
            label="Permanent store domain"
            hint="The *.myshopify.com address — checkout pixels require it."
            error={errors.shopDomain}
            valid={domainOk}
          >
            <input
              className="field"
              placeholder="your-store.myshopify.com"
              spellCheck={false}
              value={s1.shopDomain}
              onChange={(e) => patchStep1({ shopDomain: e.target.value.toLowerCase() })}
            />
          </Field>
        </div>

        <div className="mt-5">
          <Field
            label="Live storefront URL (optional)"
            hint="Your public custom domain — enables cross-domain carry-over and referral exclusions."
            error={errors.storefrontUrl}
            valid={!!s1.storefrontUrl}
          >
            <input
              className="field"
              placeholder="mystore.com"
              spellCheck={false}
              value={s1.storefrontUrl}
              onChange={(e) => patchStep1({ storefrontUrl: e.target.value.toLowerCase() })}
            />
          </Field>
        </div>
      </StepCard>

      <StepCard title="Why the permanent domain matters">
        <p className="text-[12.5px] leading-relaxed text-moss">
          Customer Event pixels always execute on{" "}
          <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono2 text-[11px] text-mint">
            {"<store>"}.myshopify.com
          </code>{" "}
          even when your storefront runs on a custom domain. Anchoring both domains keeps sessions
          stitched across checkout and storefront — the #1 cause of “ghost” GA4 sessions.
        </p>
      </StepCard>
    </div>
  );
}
