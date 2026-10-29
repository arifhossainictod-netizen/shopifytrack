import { z } from "zod";

/* ------------------------------------------------------------------ */
/*  Wizard Zod schemas — server & client safe                          */
/* ------------------------------------------------------------------ */

export const step1Schema = z.object({
  storeName: z.string().min(2, "Store name needs at least 2 characters").max(60),
  shopDomain: z
    .string()
    .regex(/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i, "Must be a valid *.myshopify.com address"),
  storefrontUrl: z
    .string()
    .regex(/^(https:\/\/)?[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/, "Enter a valid domain (e.g. mystore.com)")
    .or(z.literal("")),
});

export const step2Schema = z.object({
  mode: z.enum(["web", "server", "hybrid"]),
  platforms: z.array(z.string()).min(1, "Select at least one destination platform"),
  creds: z.record(z.string(), z.record(z.string(), z.string())),
});

export const step3Schema = z.object({
  webGtmId: z.string(),
  serverGtmId: z.string(),
  taggingUrl: z.string(),
  staging: z.boolean(),
});

export const step4Schema = z.object({
  events: z.array(z.string()),
  hashPii: z.boolean(),
  enhancedConversions: z.boolean(),
  consentMode: z.boolean(),
  defaultConsent: z.enum(["granted", "denied"]),
  cmp: z.enum(["none", "shopify", "cookiebot", "onetrust"]),
});

export const wizardSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
  step4: step4Schema,
});

export type Step1 = z.infer<typeof step1Schema>;
export type Step2 = z.infer<typeof step2Schema>;
export type Step3 = z.infer<typeof step3Schema>;
export type Step4 = z.infer<typeof step4Schema>;
export type WizardConfig = z.infer<typeof wizardSchema>;

/* ------------------------------------------------------------------ */
/*  Per-step semantic validation                                       */
/* ------------------------------------------------------------------ */

export function validateStep(step: number, cfg: WizardConfig): Record<string, string> {
  const errors: Record<string, string> = {};

  if (step === 1) {
    const r = step1Schema.safeParse(cfg.step1);
    if (!r.success) {
      for (const issue of r.error.issues) errors[String(issue.path[0])] = issue.message;
    }
  }

  if (step === 2) {
    if (cfg.step2.platforms.length === 0) errors.platforms = "Select at least one destination platform";
    for (const pid of cfg.step2.platforms) {
      const c = cfg.step2.creds[pid] ?? {};
      if (pid === "ga4" && !(c.measurementId ?? "").trim()) errors["ga4.measurementId"] = "Measurement ID is required";
      if (pid === "ga4" && (c.measurementId ?? "").trim() && !/^G-[A-Z0-9]+$/i.test((c.measurementId ?? "").trim()))
        errors["ga4.measurementId"] = "Should look like G-XXXXXXXXXX";
      if (pid === "meta" && !(c.pixelId ?? "").trim()) errors["meta.pixelId"] = "Pixel ID is required";
      if (pid === "tiktok" && !(c.pixelId ?? "").trim()) errors["tiktok.pixelId"] = "Pixel ID is required";
      if (pid === "pinterest" && !(c.tagId ?? "").trim()) errors["pinterest.tagId"] = "Tag ID is required";
      if (pid === "gads" && !(c.conversionId ?? "").trim()) errors["gads.conversionId"] = "Conversion ID is required";
      if (pid === "gads" && (c.conversionId ?? "").trim() && !/^AW-\d+$/i.test((c.conversionId ?? "").trim()))
        errors["gads.conversionId"] = "Should look like AW-123456789";
      if (pid === "snap" && !(c.pixelId ?? "").trim()) errors["snap.pixelId"] = "Pixel ID is required";
    }
  }

  if (step === 3) {
    const needsWeb = cfg.step2.mode !== "server";
    const needsServer = cfg.step2.mode !== "web";
    if (needsWeb && !/^GTM-[A-Z0-9]+$/i.test(cfg.step3.webGtmId.trim()))
      errors.webGtmId = "Required — format GTM-XXXXXXX";
    if (needsServer && cfg.step3.serverGtmId.trim() && !/^GTM-[A-Z0-9]+$/i.test(cfg.step3.serverGtmId.trim()))
      errors.serverGtmId = "Format GTM-XXXXXXX (or leave empty to create later)";
    if (needsServer) {
      const u = cfg.step3.taggingUrl.trim();
      if (!u) errors.taggingUrl = "Tagging server URL is required for server-side mode";
      else if (!/^https:\/\/[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/.test(u))
        errors.taggingUrl = "Must be a full https:// URL (e.g. https://gtm.mystore.com)";
    }
  }

  if (step === 4) {
    if (cfg.step4.events.length === 0) errors.events = "Enable at least one event";
  }

  return errors;
}

/* ------------------------------------------------------------------ */
/*  Defaults + demo data                                               */
/* ------------------------------------------------------------------ */

export const defaultConfig: WizardConfig = {
  step1: { storeName: "", shopDomain: "", storefrontUrl: "" },
  step2: { mode: "hybrid", platforms: [], creds: {} },
  step3: { webGtmId: "", serverGtmId: "", taggingUrl: "", staging: false },
  step4: {
    events: ["page_view", "view_item", "add_to_cart", "begin_checkout", "purchase"],
    hashPii: true,
    enhancedConversions: true,
    consentMode: true,
    defaultConsent: "denied",
    cmp: "shopify",
  },
};

export const demoConfig: WizardConfig = {
  step1: {
    storeName: "Aurora Athletics",
    shopDomain: "aurora-athletics.myshopify.com",
    storefrontUrl: "auroraathletics.com",
  },
  step2: {
    mode: "hybrid",
    platforms: ["ga4", "meta", "tiktok"],
    creds: {
      ga4: { measurementId: "G-8X3KDEMOPR", apiSecret: "demo_secret_9f2k" },
      meta: { pixelId: "819203746501928", capiToken: "EAA_demo_token_7xk9p2", testEventCode: "" },
      tiktok: { pixelId: "C4DKDEMO77RC01", accessToken: "demo_tiktok_token_44z" },
    },
  },
  step3: {
    webGtmId: "GTM-P8KQX4D",
    serverGtmId: "GTM-SRVR42X",
    taggingUrl: "https://gtm.aurora-athletics.com",
    staging: false,
  },
  step4: {
    events: ["page_view", "view_item", "view_list", "add_to_cart", "view_cart", "begin_checkout", "add_payment_info", "purchase"],
    hashPii: true,
    enhancedConversions: true,
    consentMode: true,
    defaultConsent: "denied",
    cmp: "shopify",
  },
};
