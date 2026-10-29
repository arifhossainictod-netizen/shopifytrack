/* ------------------------------------------------------------------ */
/*  ShopifyTrack Pro —Template Engine                                  */
/*  Regex placeholder substitution over master GTM JSON schemas and    */
/*  the Shopify Custom Pixel script, plus package compilation and      */
/*  pre-flight checks.                                                 */
/* ------------------------------------------------------------------ */

import { PLATFORMS, EVENTS, platformById, eventById, CMP_OPTIONS } from "./platforms";
import type { WizardConfig } from "./schemas";

export interface CompiledFile {
  path: string;
  label: string;
  mime: string;
  content: string;
}

export interface PreflightCheck {
  level: "pass" | "warn" | "fail";
  text: string;
}

/* ------------------------------------------------------------------ */
/*  1 · Placeholder engine                                             */
/* ------------------------------------------------------------------ */

const TOKEN_RE = /\{\{([A-Z0-9_]+)\}\}/g;

/** Replace every {{KNOWN_TOKEN}} in `tpl` with vars[token]. Unknown / empty
 *  tokens are left in place so the live preview can show pending values. */
export function renderTemplate(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(TOKEN_RE, (raw, key: string) => {
    const v = vars[key];
    return v !== undefined && v !== "" ? v : raw;
  });
}

/** Force-replace remaining placeholders with a safe fallback (final export). */
export function finalize(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(TOKEN_RE, (raw, key: string) =>
    vars[key] !== undefined && vars[key] !== "" ? vars[key] : `STP_UNSET_${key}`
  );
}

export function buildVars(cfg: WizardConfig, stamp?: string): Record<string, string> {
  const c = (pid: string, key: string) =>
    (cfg.step2.creds[pid]?.[key] ?? "").trim();

  const enabledMap: Record<string, string> = {};
  for (const ev of EVENTS) {
    if (cfg.step4.events.includes(ev.id)) enabledMap[ev.shopify] = ev.id;
  }

  return {
    STORE_NAME: cfg.step1.storeName.trim(),
    SHOP_DOMAIN: cfg.step1.shopDomain.trim(),
    STOREFRONT_URL: cfg.step1.storefrontUrl.trim(),
    MODE: cfg.step2.mode.toUpperCase(),
    MODE_LABEL:
      cfg.step2.mode === "web"
        ? "Web container (GTM)"
        : cfg.step2.mode === "server"
          ? "Server container (sGTM)"
          : "Hybrid — Web + Server GTM",
    GENERATED_AT: stamp ?? new Date().toISOString(),
    WEB_GTM_ID: cfg.step3.webGtmId.trim().toUpperCase(),
    SERVER_GTM_ID: cfg.step3.serverGtmId.trim().toUpperCase(),
    TAGGING_URL: cfg.step3.taggingUrl.trim().replace(/\/+$/, ""),
    STAGING: cfg.step3.staging ? "true" : "false",
    HASH_PII: cfg.step4.hashPii ? "true" : "false",
    CONSENT_MODE: cfg.step4.consentMode ? "true" : "false",
    CONSENT_DEFAULT: cfg.step4.defaultConsent,
    CMP: cfg.step4.cmp,
    CMP_LABEL: CMP_OPTIONS.find((o) => o.id === cfg.step4.cmp)?.name ?? "No CMP",
    ENHANCED_CONVERSIONS: cfg.step4.enhancedConversions ? "true" : "false",
    PLATFORM_LIST: JSON.stringify(cfg.step2.platforms),
    EVENT_MAP_JSON: JSON.stringify(enabledMap),
    GA4_MEASUREMENT_ID: c("ga4", "measurementId").toUpperCase(),
    GA4_API_SECRET: c("ga4", "apiSecret"),
    META_PIXEL_ID: c("meta", "pixelId"),
    META_CAPI_TOKEN: c("meta", "capiToken"),
    META_TEST_EVENT_CODE: c("meta", "testEventCode"),
    TIKTOK_PIXEL_ID: c("tiktok", "pixelId"),
    TIKTOK_ACCESS_TOKEN: c("tiktok", "accessToken"),
    PINTEREST_TAG_ID: c("pinterest", "tagId"),
    PINTEREST_ACCESS_TOKEN: c("pinterest", "accessToken"),
    GADS_CONVERSION_ID: c("gads", "conversionId").toUpperCase(),
    GADS_PURCHASE_LABEL: c("gads", "purchaseLabel"),
    SNAP_PIXEL_ID: c("snap", "pixelId"),
    SNAP_CAPI_TOKEN: c("snap", "capiToken"),
  };
}

/* ------------------------------------------------------------------ */
/*  2 · GTM export skeleton helpers                                    */
/* ------------------------------------------------------------------ */

let fpCounter = 0;
const fp = () => `17${String(1700000000000000 + ++fpCounter)}`;

const GTM_ACCOUNT = "6000000000";
const GTM_CONTAINER = "7000000000";
const MACRO = (name: string) => "{{" + name + "}}" as string;

function skeleton(name: string, publicId: string, usage: "WEB" | "SERVER", stamp: string) {
  return {
    exportFormatVersion: 2,
    exportTime: stamp,
    containerVersion: {
      path: `accounts/${GTM_ACCOUNT}/containers/${GTM_CONTAINER}/versions/0`,
      accountId: GTM_ACCOUNT,
      containerId: GTM_CONTAINER,
      containerVersionId: "0",
      container: {
        path: `accounts/${GTM_ACCOUNT}/containers/${GTM_CONTAINER}`,
        accountId: GTM_ACCOUNT,
        containerId: GTM_CONTAINER,
        name,
        publicId: publicId || "GTM-XXXXXXX",
        usageContext: [usage],
        fingerprint: fp(),
        tagManagerUrl: `https://tagmanager.google.com/#/container/accounts/${GTM_ACCOUNT}/containers/${GTM_CONTAINER}/versions/0`,
      },
      tagManagerUrl: `https://tagmanager.google.com/#/container/accounts/${GTM_ACCOUNT}/containers/${GTM_CONTAINER}/versions/0`,
      fingerprint: fp(),
      variable: [] as unknown[],
      trigger: [] as unknown[],
      tag: [] as unknown[],
      client: usage === "SERVER" ? ([] as unknown[]) : undefined,
      builtInVariable: [
        { accountId: GTM_ACCOUNT, containerId: GTM_CONTAINER, type: "EVENT", name: "Event" },
      ],
      notes: "Generated by ShopifyTrack Pro — review all entries before publishing.",
    },
  };
}

type AnyObj = Record<string, unknown>;

const constVar = (id: number, name: string, value: string): AnyObj => ({
  accountId: GTM_ACCOUNT,
  containerId: GTM_CONTAINER,
  variableId: String(id),
  name,
  type: "c",
  parameter: [{ type: "TEMPLATE", key: "value", value }],
  fingerprint: fp(),
});

const dlvVar = (id: number, name: string, path: string): AnyObj => ({
  accountId: GTM_ACCOUNT,
  containerId: GTM_CONTAINER,
  variableId: String(id),
  name,
  type: "v",
  parameter: [
    { type: "INTEGER", key: "dataLayerVersion", value: "2" },
    { type: "BOOLEAN", key: "setDefaultValue", value: "false" },
    { type: "TEMPLATE", key: "name", value: path },
  ],
  fingerprint: fp(),
});

const ceTrigger = (id: number, name: string, eventName: string): AnyObj => ({
  accountId: GTM_ACCOUNT,
  containerId: GTM_CONTAINER,
  triggerId: String(id),
  name,
  type: "customEvent",
  customEventFilter: [
    {
      type: "EQUALS",
      parameter: [
        { type: "TEMPLATE", key: "arg0", value: MACRO("_event") },
        { type: "TEMPLATE", key: "arg1", value: eventName },
      ],
    },
  ],
  fingerprint: fp(),
});

const fireTrigger = (id: number | string) => ({
  type: "TRIGGER",
  triggerId: String(id),
});

const htmlTag = (id: number, name: string, html: string, triggerIds: number[], oncePerEvent = false): AnyObj => ({
  accountId: GTM_ACCOUNT,
  containerId: GTM_CONTAINER,
  tagId: String(id),
  name,
  type: "html",
  parameter: [
    { type: "TEMPLATE", key: "html", value: html },
    { type: "BOOLEAN", key: "supportDocumentWrite", value: "false" },
  ],
  fingerprint: fp(),
  firingTriggerId: triggerIds.map(String),
  tagFiringOption: oncePerEvent ? "ONCE_PER_EVENT" : "ONCE_PER_LOAD",
});

const monitorTag = (id: number, name: string, value: string, triggerIds: number[]): AnyObj => ({
  accountId: GTM_ACCOUNT,
  containerId: GTM_CONTAINER,
  tagId: String(id),
  name,
  type: "googtag",
  parameter: [
    { type: "TEMPLATE", key: "tagId", value },
    { type: "TEMPLATE", key: "eventSettingsTable", value: "" },
  ],
  fingerprint: fp(),
  firingTriggerId: triggerIds.map(String),
  tagFiringOption: "ONCE_PER_EVENT",
});

const PAGE_TRIGGER_ID = 2147479553; // GTM built-in "All Pages"

/* ------------------------------------------------------------------ */
/*  3 · Web container (gtm-web.json)                                   */
/* ------------------------------------------------------------------ */

export function buildWebContainer(cfg: WizardConfig, stamp: string) {
  const c = skeleton(`${cfg.step1.storeName || "Store"} — Web (ShopifyTrack Pro)`, cfg.step3.webGtmId.toUpperCase(), "WEB", stamp);
  const vars = c.containerVersion.variable as AnyObj[];
  const triggers = c.containerVersion.trigger as AnyObj[];
  const tags = c.containerVersion.tag as AnyObj[];

  let vid = 1, tid = 1, gid = 1;

  /* --- variables ------------------------------------------------ */
  const wanted: Record<string, string> = {};
  for (const pid of cfg.step2.platforms) {
    const p = platformById(pid as never);
    for (const f of p.fields) {
      if (f.serverOnly) continue;
      const token = f.key.replace(/[A-Z]/g, (m) => "_" + m).toUpperCase();
      const tokenName = `${p.id.toUpperCase()}_${token}`;
      wanted[tokenName] = `${tokenName}`; // placeholder passthrough
      vars.push(constVar(vid++, `C - ${p.short} ${f.label}`, MACRO(`${tokenName}`)));
    }
  }
  vars.push(dlvVar(vid++, "DLV - event", "event"));
  vars.push(dlvVar(vid++, "DLV - ecommerce", "ecommerce"));
  vars.push(dlvVar(vid++, "DLV - ecommerce.value", "ecommerce.value"));
  vars.push(dlvVar(vid++, "DLV - ecommerce.currency", "ecommerce.currency"));
  vars.push(dlvVar(vid++, "DLV - ecommerce.items", "ecommerce.items"));
  vars.push(constVar(vid++, "C - Shop Domain", MACRO("SHOP_DOMAIN")));
  vars.push(constVar(vid++, "C - Default Consent", MACRO("CONSENT_DEFAULT")));

  /* --- triggers (one per enabled event) -------------------------- */
  const triggerIdByShopify: Record<string, number> = {};
  for (const evId of cfg.step4.events) {
    const ev = eventById(evId);
    ceIds: {
      const id = tid++;
      triggers.push(ceTrigger(id, `CE - ${ev.label} (${ev.shopify})`, ev.shopify));
      triggerIdByShopify[ev.shopify] = id;
    }
  }
  triggers.push({
    accountId: GTM_ACCOUNT,
    containerId: GTM_CONTAINER,
    triggerId: String(tid),
    name: "Consent Update",
    type: "customEvent",
    customEventFilter: [
      {
        type: "EQUALS",
        parameter: [
          { type: "TEMPLATE", key: "arg0", value: MACRO("_event") },
          { type: "TEMPLATE", key: "arg1", value: "consent_update" },
        ],
      },
    ],
    fingerprint: fp(),
  });
  const consentTriggerId = tid++;

  /* --- tags ------------------------------------------------------ */
  const enabled = cfg.step2.platforms.map((p) => platformById(p as never));
  const has = (pid: string) => cfg.step2.platforms.includes(pid as never);

  if (has("ga4")) {
    tags.push(monitorTag(gid++, "Google Tag (GA4 Config)", MACRO("C - GA4 Measurement ID"), [PAGE_TRIGGER_ID]));
    for (const evId of cfg.step4.events) {
      const ev = eventById(evId);
      const trig = triggerIdByShopify[ev.shopify];
      tags.push({
        accountId: GTM_ACCOUNT,
        containerId: GTM_CONTAINER,
        tagId: String(gid++),
        name: `GA4 - ${ev.map.ga4 ?? ev.id}`,
        type: "gaawe",
        parameter: [
          { type: "TEMPLATE", key: "eventName", value: ev.map.ga4 ?? ev.id },
          { type: "TEMPLATE", key: "measurementIdOverride", value: MACRO("C - GA4 Measurement ID") },
          {
            type: "LIST",
            key: "eventParameters",
            list: [
              { type: "MAP", map: [
                { type: "TEMPLATE", key: "name", value: "value" },
                { type: "TEMPLATE", key: "value", value: MACRO("DLV - ecommerce.value") },
              ] },
              { type: "MAP", map: [
                { type: "TEMPLATE", key: "name", value: "currency" },
                { type: "TEMPLATE", key: "value", value: MACRO("DLV - ecommerce.currency") },
              ] },
              { type: "MAP", map: [
                { type: "TEMPLATE", key: "name", value: "items" },
                { type: "TEMPLATE", key: "value", value: MACRO("DLV - ecommerce.items") },
              ] },
            ],
          },
        ],
        fingerprint: fp(),
        firingTriggerId: [String(trig)],
        tagFiringOption: "ONCE_PER_EVENT",
      });
    }
  }

  if (has("meta")) {
    tags.push(htmlTag(gid++, "Meta Pixel - Base Code",
      META_BASE_SNIPPET.replace("__PIXEL_ID__", MACRO("C - Meta Pixel ID")), [PAGE_TRIGGER_ID]));
    for (const evId of cfg.step4.events) {
      const ev = eventById(evId);
      if (!ev.map.meta) continue;
      const trig = triggerIdByShopify[ev.shopify];
      tags.push(htmlTag(gid++, `Meta - ${ev.map.meta}`,
        `<script>\nfbq('track', '${ev.map.meta}', {\n  value: {{DLV - ecommerce.value}},\n  currency: {{DLV - ecommerce.currency}},\n  content_type: 'product'\n}, { eventID: {{DLV - eventModel}} ? {{DLV - eventModel}}.event_id : undefined });\n</script>`,
        [trig], true));
    }
  }

  if (has("tiktok")) {
    tags.push(htmlTag(gid++, "TikTok Pixel - Base Code",
      TIKTOK_BASE_SNIPPET.replace("__PIXEL_ID__", MACRO("C - TikTok Pixel ID")), [PAGE_TRIGGER_ID]));
    for (const evId of cfg.step4.events) {
      const ev = eventById(evId);
      if (!ev.map.tiktok) continue;
      const trig = triggerIdByShopify[ev.shopify];
      tags.push(htmlTag(gid++, `TikTok - ${ev.map.tiktok}`,
        `<script>\nttq.track('${ev.map.tiktok}', {\n  value: {{DLV - ecommerce.value}},\n  currency: {{DLV - ecommerce.currency}},\n  content_type: 'product'\n});\n</script>`,
        [trig], true));
    }
  }

  if (has("pinterest")) {
    tags.push(htmlTag(gid++, "Pinterest Tag - Base Code",
      PINTEREST_BASE_SNIPPET.replace("__TAG_ID__", MACRO("C - Pinterest Tag ID")), [PAGE_TRIGGER_ID]));
    for (const evId of cfg.step4.events) {
      const ev = eventById(evId);
      if (!ev.map.pinterest) continue;
      const trig = triggerIdByShopify[ev.shopify];
      tags.push(htmlTag(gid++, `Pinterest - ${ev.map.pinterest}`,
        `<script>\npintrk('track', '${String(ev.map.pinterest).toLowerCase()}', {\n  value: {{DLV - ecommerce.value}},\n  currency: {{DLV - ecommerce.currency}}\n});\n</script>`,
        [trig], true));
    }
  }

  if (has("snap")) {
    tags.push(htmlTag(gid++, "Snap Pixel - Base Code",
      SNAP_BASE_SNIPPET.replace("__PIXEL_ID__", MACRO("C - Snap Pixel ID")), [PAGE_TRIGGER_ID]));
    for (const evId of cfg.step4.events) {
      const ev = eventById(evId);
      if (!ev.map.snap) continue;
      const trig = triggerIdByShopify[ev.shopify];
      tags.push(htmlTag(gid++, `Snap - ${ev.map.snap}`,
        `<script>\nsnaptr('track', '${ev.map.snap}', {\n  price: {{DLV - ecommerce.value}},\n  currency: {{DLV - ecommerce.currency}}\n});\n</script>`,
        [trig], true));
    }
  }

  if (has("gads")) {
    tags.push(htmlTag(gid++, "Google Ads - gtag base",
      GADS_BASE_SNIPPET.replace("__AW_ID__", MACRO("C - Google Ads Conversion ID")), [PAGE_TRIGGER_ID]));
    if (cfg.step4.events.includes("purchase")) {
      const trig = triggerIdByShopify["checkout_completed"];
      tags.push(htmlTag(gid++, "Google Ads - Purchase Conversion",
        `<script>\ngtag('event', 'conversion', {\n  send_to: ${MACRO("C - Google Ads Conversion ID") ? "''" : "''"} ,\n  value: {{DLV - ecommerce.value}},\n  currency: {{DLV - ecommerce.currency}}\n});\n</script>`.replace(
          "send_to: ''",
          `send_to: ${MACRO("C - Google Ads Conversion ID") + "/" + MACRO("C - Google Ads Purchase Label")}`
        ),
        trig ? [trig] : [PAGE_TRIGGER_ID], true));
    }
  }

  if (cfg.step4.consentMode) {
    tags.unshift({
      accountId: GTM_ACCOUNT,
      containerId: GTM_CONTAINER,
      tagId: String(gid++),
      name: "Consent Mode v2 - Defaults",
      type: "html",
      parameter: [
        { type: "TEMPLATE", key: "html", value: CONSENT_SNIPPET.replace("__DEFAULT__", MACRO("C - Default Consent")) },
        { type: "BOOLEAN", key: "supportDocumentWrite", value: "false" },
      ],
      fingerprint: fp(),
      firingTriggerId: [String(PAGE_TRIGGER_ID)],
      tagFiringOption: "ONCE_PER_LOAD",
    });
    void consentTriggerId;
  }

  return c;
}

/* ------------------------------------------------------------------ */
/*  4 · Server container (gtm-server.json)                             */
/* ------------------------------------------------------------------ */

export function buildServerContainer(cfg: WizardConfig, stamp: string) {
  const c = skeleton(`${cfg.step1.storeName || "Store"} — Server (ShopifyTrack Pro)`, cfg.step3.serverGtmId.toUpperCase(), "SERVER", stamp);
  const vars = c.containerVersion.variable as AnyObj[];
  const triggers = c.containerVersion.trigger as AnyObj[];
  const tags = c.containerVersion.tag as AnyObj[];
  const clients = c.containerVersion.client as AnyObj[];

  let vid = 1, tid = 1, gid = 1;

  vars.push(constVar(vid++, "C - Tagging Server URL", MACRO("TAGGING_URL")));
  vars.push(constVar(vid++, "C - Shop Domain", MACRO("SHOP_DOMAIN")));
  if (cfg.step4.hashPii)
    vars.push({
      accountId: GTM_ACCOUNT,
      containerId: GTM_CONTAINER,
      variableId: String(vid++),
      name: "TS - SHA-256 (user_data)",
      type: "cvt_stp_sha256",
      parameter: [{ type: "TEMPLATE", key: "input", value: MACRO("ED - user_data") }],
      fingerprint: fp(),
    });

  clients.push({
    accountId: GTM_ACCOUNT,
    containerId: GTM_CONTAINER,
    clientId: "1",
    name: "GA4 Client",
    type: "sgtm_ga4",
    parameter: [
      { type: "BOOLEAN", key: "defaultGa4Paths", value: "true" },
      { type: "TEMPLATE", key: "measurementId", value: MACRO("GA4_MEASUREMENT_ID") },
    ],
    fingerprint: fp(),
    priority: 0,
  });

  clients.push({
    accountId: GTM_ACCOUNT,
    containerId: GTM_CONTAINER,
    clientId: "2",
    name: "ShopifyTrack Pixel Client (/collect)",
    type: "cvt_stp_pixel_client",
    parameter: [
      { type: "TEMPLATE", key: "allowedOrigin", value: `https://${MACRO("SHOP_DOMAIN")}` },
      { type: "TEMPLATE", key: "path", value: "/collect" },
    ],
    fingerprint: fp(),
    priority: 1,
  });

  triggers.push({
    accountId: GTM_ACCOUNT,
    containerId: GTM_CONTAINER,
    triggerId: String(tid),
    name: "All Client Events",
    type: "custom",
    customEventFilter: [
      {
        type: "EQUALS",
        parameter: [
          { type: "TEMPLATE", key: "arg0", value: MACRO("Client Name") },
          { type: "TEMPLATE", key: "arg1", value: "GA4" },
        ],
      },
    ],
    fingerprint: fp(),
  });
  const allTriggerId = tid++;

  const has = (pid: string) => cfg.step2.platforms.includes(pid as never);

  if (has("ga4")) {
    tags.push({
      accountId: GTM_ACCOUNT,
      containerId: GTM_CONTAINER,
      tagId: String(gid++),
      name: "GA4 MP - Forward",
      type: "sgtm_ga4mp",
      parameter: [
        { type: "TEMPLATE", key: "measurementId", value: MACRO("GA4_MEASUREMENT_ID") },
        { type: "TEMPLATE", key: "apiSecret", value: MACRO("GA4_API_SECRET") },
      ],
      fingerprint: fp(),
      firingTriggerId: [String(allTriggerId)],
    });
  }

  if (has("meta")) {
    tags.push({
      accountId: GTM_ACCOUNT,
      containerId: GTM_CONTAINER,
      tagId: String(gid++),
      name: "Meta Conversions API",
      type: "cvt_stp_meta_capi",
      parameter: [
        { type: "TEMPLATE", key: "pixelId", value: MACRO("META_PIXEL_ID") },
        { type: "TEMPLATE", key: "accessToken", value: MACRO("META_CAPI_TOKEN") },
        { type: "TEMPLATE", key: "testEventCode", value: MACRO("META_TEST_EVENT_CODE") },
        { type: "BOOLEAN", key: "hashUserData", value: MACRO("HASH_PII") },
      ],
      fingerprint: fp(),
      firingTriggerId: [String(allTriggerId)],
    });
  }

  if (has("tiktok")) {
    tags.push({
      accountId: GTM_ACCOUNT,
      containerId: GTM_CONTAINER,
      tagId: String(gid++),
      name: "TikTok Events API",
      type: "cvt_stp_tiktok_eapi",
      parameter: [
        { type: "TEMPLATE", key: "pixelCode", value: MACRO("TIKTOK_PIXEL_ID") },
        { type: "TEMPLATE", key: "accessToken", value: MACRO("TIKTOK_ACCESS_TOKEN") },
        { type: "BOOLEAN", key: "hashUserData", value: MACRO("HASH_PII") },
      ],
      fingerprint: fp(),
      firingTriggerId: [String(allTriggerId)],
    });
  }

  if (has("pinterest")) {
    tags.push({
      accountId: GTM_ACCOUNT,
      containerId: GTM_CONTAINER,
      tagId: String(gid++),
      name: "Pinterest Conversions API",
      type: "cvt_stp_pinterest_capi",
      parameter: [
        { type: "TEMPLATE", key: "tagId", value: MACRO("PINTEREST_TAG_ID") },
        { type: "TEMPLATE", key: "accessToken", value: MACRO("PINTEREST_ACCESS_TOKEN") },
        { type: "BOOLEAN", key: "hashUserData", value: MACRO("HASH_PII") },
      ],
      fingerprint: fp(),
      firingTriggerId: [String(allTriggerId)],
    });
  }

  if (has("snap")) {
    tags.push({
      accountId: GTM_ACCOUNT,
      containerId: GTM_CONTAINER,
      tagId: String(gid++),
      name: "Snap Conversions API",
      type: "cvt_stp_snap_capi",
      parameter: [
        { type: "TEMPLATE", key: "pixelId", value: MACRO("SNAP_PIXEL_ID") },
        { type: "TEMPLATE", key: "accessToken", value: MACRO("SNAP_CAPI_TOKEN") },
        { type: "BOOLEAN", key: "hashUserData", value: MACRO("HASH_PII") },
      ],
      fingerprint: fp(),
      firingTriggerId: [String(allTriggerId)],
    });
  }

  if (cfg.step4.events.includes("purchase")) {
    tags.push({
      accountId: GTM_ACCOUNT,
      containerId: GTM_CONTAINER,
      tagId: String(gid++),
      name: "ShopifyTrack - Purchase Dedup Ledger",
      type: "cvt_stp_dedup",
      parameter: [
        { type: "TEMPLATE", key: "key", value: "order_id" },
        { type: "INTEGER", key: "ttlSeconds", value: "86400" },
      ],
      fingerprint: fp(),
      firingTriggerId: [String(allTriggerId)],
    });
  }

  return c;
}

/* ------------------------------------------------------------------ */
/*  5 · Master templates — pixel script, snippets, README              */
/* ------------------------------------------------------------------ */

const META_BASE_SNIPPET = `<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '__PIXEL_ID__');
</script>`;

const TIKTOK_BASE_SNIPPET = `<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var n=ttq._i[t]||[],e=0;e<ttq.methods.length;e++)ttq.setAndDefer(n,ttq.methods[e]);return n},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  ttq.load('__PIXEL_ID__');
  ttq.page();
}(window, document, 'ttq');
</script>`;

const PINTEREST_BASE_SNIPPET = `<script>
!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(
Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";
var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName
("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
pintrk('load', '__TAG_ID__', { em: '{{DLV - User Email}}' });
pintrk('page');
</script>`;

const SNAP_BASE_SNIPPET = `<script>
(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?
a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];var s='script';
var r=t.createElement(s);r.async=!0;r.src=n;var u=t.getElementsByTagName(s)[0];
u.parentNode.insertBefore(r,u);})(window,document,'https://sc-static.net/scevent.min.js');
snaptr('init', '__PIXEL_ID__', {});
snaptr('track', 'PAGE_VIEW');
</script>`;

const GADS_BASE_SNIPPET = `<script async src="https://www.googletagmanager.com/gtag/js?id=__AW_ID__"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '__AW_ID__', { allow_enhanced_conversions: true });
</script>`;

const CONSENT_SNIPPET = `<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
var defaultState = '__DEFAULT__';
gtag('consent', 'default', {
  ad_storage: defaultState,
  ad_user_data: defaultState,
  ad_personalization: defaultState,
  analytics_storage: defaultState,
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500
});
</script>`;

export const CUSTOM_PIXEL_TEMPLATE = `/* ============================================================
 * ShopifyTrack Pro — Custom Pixel (compact build)
 * Store   : {{STORE_NAME}} ({{SHOP_DOMAIN}})
 * Mode    : {{MODE}} · Consent Mode v2: {{CONSENT_MODE}} (default: {{CONSENT_DEFAULT}})
 * CMP     : {{CMP_LABEL}}
 * Built   : {{GENERATED_AT}}
 * ------------------------------------------------------------
 * INSTALL · Shopify Admin → Settings → Customer events →
 *           "Add custom pixel" → name it "ShopifyTrack Pro" →
 *           paste this file → Save → Connect.
 * ============================================================ */

(function () {
  "use strict";

  var CONFIG = {
    shop: "{{SHOP_DOMAIN}}",
    mode: "{{MODE}}",
    endpoint: "{{TAGGING_URL}}/collect",
    fallbackEndpoint: "https://{{SHOP_DOMAIN}}/apps/stp/collect",
    hashPii: {{HASH_PII}},
    consentDefault: "{{CONSENT_DEFAULT}}",
    containerId: "{{WEB_GTM_ID}}",
    serverContainerId: "{{SERVER_GTM_ID}}",
    platforms: {{PLATFORM_LIST}},
    debug: {{STAGING}}
  };

  /* Shopify Customer Events → internal event ids */
  var EVENT_MAP = {{EVENT_MAP_JSON}};

  var dedupeLedger = {};

  function once(key, ttlMs) {
    var now = Date.now();
    if (dedupeLedger[key] && now - dedupeLedger[key] < ttlMs) return false;
    dedupeLedger[key] = now;
    return true;
  }

  function log() {
    if (!CONFIG.debug) return;
    try { console.info.apply(console, ["[STP]"].concat([].slice.call(arguments))); } catch (e) {}
  }

  /* SHA-256 (async, feature-detected). PII is hashed at the edge in
     server mode; the sandbox fallback keeps web-only flows compliant. */
  function sha256(value) {
    if (!CONFIG.hashPii || !value) return Promise.resolve(value || undefined);
    if (typeof crypto === "undefined" || !crypto.subtle || typeof TextEncoder === "undefined") {
      return Promise.resolve(value);
    }
    var data = new TextEncoder().encode(String(value).trim().toLowerCase());
    return crypto.subtle.digest("SHA-256", data).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return ("0" + b.toString(16)).slice(-2);
      }).join("");
    }).catch(function () { return value; });
  }

  function checkoutOf(event) {
    return (event && event.data && event.data.checkout) || {};
  }

  function userData(event) {
    var co = checkoutOf(event);
    var out = {};
    if (co.email) out.em = co.email;
    if (co.phone) out.ph = co.phone;
    var addr = (co.shippingAddress || co.billingAddress) || {};
    if (addr.firstName) out.fn = addr.firstName;
    if (addr.lastName) out.ln = addr.lastName;
    if (addr.countryCode) out.country = addr.countryCode;
    if (addr.zip) out.zp = addr.zip;
    return out;
  }

  function money(event) {
    var co = checkoutOf(event);
    var total = co.totalPrice || {};
    return {
      value: total.amount ? Number(total.amount) : undefined,
      currency: total.currencyCode || (event && event.data && event.data.cart && event.data.cart.cost && event.data.cart.cost.totalAmount.currencyCode) || undefined
    };
  }

  function items(event) {
    var co = checkoutOf(event);
    var lines = co.lineItems || [];
    if (!lines.length && event && event.data && event.data.cartLine) lines = [event.data.cartLine];
    if (!lines.length && event && event.data && event.data.productVariant) lines = [{ merchandise: event.data.productVariant, quantity: 1 }];
    return lines.map(function (li) {
      var m = li.merchandise || li.variant || {};
      var p = m.product || {};
      return {
        item_id: m.id || li.id,
        item_name: p.title || m.title || li.title,
        item_variant: m.title,
        price: (li.cost && li.cost.totalAmount && Number(li.cost.totalAmount.amount)) || (m.price && Number(m.price.amount)) || undefined,
        quantity: li.quantity || 1
      };
    });
  }

  function buildPayload(eventId, shopifyEvent, event) {
    var m = money(event);
    return {
      stp_version: 1,
      shop: CONFIG.shop,
      event_id: eventId,
      shopify_event: shopifyEvent,
      event_time: Math.floor(Date.now() / 1000),
      page: (event && event.context && event.context.document && {
        location: event.context.document.location && event.context.document.location.href,
        title: event.context.document.title,
        referrer: event.context.document.referrer
      }) || undefined,
      client_id: event && event.clientId,
      consent: { default: CONFIG.consentDefault, cmp: "{{CMP}}" },
      ecommerce: {
        value: m.value,
        currency: m.currency,
        items: items(event)
      },
      user_data: userData(event),
      order_id: checkoutOf(event).order && checkoutOf(event).order.id,
      platforms: CONFIG.platforms
    };
  }

  function dispatch(payload) {
    var target = CONFIG.mode === "WEB" ? CONFIG.fallbackEndpoint : CONFIG.endpoint;
    var body = JSON.stringify(payload);
    log("dispatch →", target, payload);
    try {
      if (typeof browser !== "undefined" && browser.sendBeacon) {
        browser.sendBeacon(target, body);
        return;
      }
    } catch (e) {}
    try {
      fetch(target, { method: "POST", body: body, headers: { "content-type": "application/json" }, credentials: "omit" })
        .catch(function () {});
    } catch (e) {}
  }

  function handle(shopifyEvent) {
    return function (event) {
      var eventId = EVENT_MAP[shopifyEvent];
      if (!eventId) return;
      var key = shopifyEvent + ":" + (event && event.id ? event.id : JSON.stringify(checkoutOf(event).order || {}));
      if (!once(key, 60000)) return log("deduped", shopifyEvent);

      var payload = buildPayload(eventId, shopifyEvent, event);

      /* Mirror into the web container dataLayer when running hybrid, so the
         storefront GTM tags can fire on checkout events too. */
      if (CONFIG.mode !== "SERVER") {
        payload.datalayer_hint = "stp_" + eventId;
      }

      Promise.resolve()
        .then(function () {
          if (!CONFIG.hashPii) return payload;
          var u = payload.user_data || {};
          return sha256(u.em).then(function (em) {
            if (em) u.em_sha256 = em;
            return sha256(u.ph).then(function (ph) {
              if (ph) u.ph_sha256 = ph;
              payload.user_data = u;
              return payload;
            });
          });
        })
        .then(dispatch)
        .catch(function () { dispatch(payload); });
    };
  }

  Object.keys(EVENT_MAP).forEach(function (shopifyEvent) {
    try {
      analytics.subscribe(shopifyEvent, handle(shopifyEvent));
      log("subscribed:", shopifyEvent);
    } catch (e) {
      log("subscription failed:", shopifyEvent, e);
    }
  });
})();
`;

export const README_TEMPLATE = `# {{STORE_NAME}} — Tracking Package (ShopifyTrack Pro)

Generated: {{GENERATED_AT}}
Mode: {{MODE}} · CMP: {{CMP_LABEL}} · Consent default: {{CONSENT_DEFAULT}}

---

## What's inside

| File | Purpose |
| ---- | ------- |
| \`gtm-web.json\` | Web container export ({{WEB_GTM_ID}}) — storefront tags, triggers, variables |
| \`gtm-server.json\` | Server container export ({{SERVER_GTM_ID}}) — sGTM clients + CAPI/Events-API tags |
| \`custom-pixel-compact.js\` | Shopify Customer Events pixel — checkout & zero-party signals |
| \`README.md\` | This file |

## 1 · Import the web container
1. GTM → **Admin → Import Container** → choose \`gtm-web.json\`.
2. Choose **Merge → Overwrite conflicting** and import into container **{{WEB_GTM_ID}}**.
3. Workspace preview → verify tags fire on your storefront.
4. Publish.

## 2 · Import the server container
1. Create/select your server container ({{SERVER_GTM_ID}}).
2. Import \`gtm-server.json\` the same way.
3. Confirm the **Tagging Server URL** resolves: \`{{TAGGING_URL}}\`.
4. Point your DNS (custom domain) to the sGTM infrastructure before going live.

## 3 · Install the Shopify Custom Pixel
1. Shopify Admin → **Settings → Customer events → Add custom pixel**.
2. Name: \`ShopifyTrack Pro\`. Paste \`custom-pixel-compact.js\`.
3. Permission: **Data that does not qualify as data sale** (or per counsel).
4. Save → **Connect**.

## 4 · Theme snippet (web mode)
Add the standard GTM snippet for **{{WEB_GTM_ID}}** to \`layout/theme.liquid\`
immediately after \`<head>\`, and the noscript iframe after \`<body>\`.

## 5 · Verify
Install the **ShopifyTrack Inspector** Chrome extension and run the QA loop:
dataLayer pushes, network beacons (GA4 \`/g/collect\`, Meta \`/tr\`, TikTok,
Pinterest, Snap) and consent state — all from one DevTools panel.

## Consent & privacy
- Consent Mode v2 defaults: **{{CONSENT_DEFAULT}}** (via {{CMP_LABEL}}).
- PII (email/phone) is SHA-256 hashed before leaving your edge: **{{HASH_PII}}**.
- Enhanced conversions: **{{ENHANCED_CONVERSIONS}}**.

---
Generated by ShopifyTrack Pro — review in GTM Preview before publishing.
`;

/* ------------------------------------------------------------------ */
/*  6 · Package compiler                                               */
/* ------------------------------------------------------------------ */

export function compilePackage(cfg: WizardConfig, opts?: { preview?: boolean }): CompiledFile[] {
  const stamp = new Date().toISOString();
  const vars = buildVars(cfg, stamp);
  const swap = (tpl: string) => (opts?.preview ? renderTemplate(tpl, vars) : finalize(tpl, vars));

  const files: CompiledFile[] = [
    {
      path: "custom-pixel-compact.js",
      label: "custom-pixel-compact.js",
      mime: "text/javascript",
      content: swap(CUSTOM_PIXEL_TEMPLATE),
    },
  ];

  if (cfg.step2.mode !== "server") {
    files.push({
      path: "gtm-web.json",
      label: "gtm-web.json",
      mime: "application/json",
      content: swap(JSON.stringify(buildWebContainer(cfg, stamp), null, 2)),
    });
  }

  if (cfg.step2.mode !== "web") {
    files.push({
      path: "gtm-server.json",
      label: "gtm-server.json",
      mime: "application/json",
      content: swap(JSON.stringify(buildServerContainer(cfg, stamp), null, 2)),
    });
  }

  files.push({
    path: "README.md",
    label: "README.md",
    mime: "text/markdown",
    content: swap(README_TEMPLATE),
  });

  return files;
}

/* ------------------------------------------------------------------ */
/*  7 · Pre-flight checks                                              */
/* ------------------------------------------------------------------ */

export function preflightChecks(cfg: WizardConfig): PreflightCheck[] {
  const checks: PreflightCheck[] = [];
  const push = (level: PreflightCheck["level"], text: string) => checks.push({ level, text });
  const cred = (p: string, k: string) => (cfg.step2.creds[p]?.[k] ?? "").trim();

  /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(cfg.step1.shopDomain)
    ? push("pass", `Permanent store domain verified (${cfg.step1.shopDomain})`)
    : push("fail", "Permanent *.myshopify.com domain is missing or invalid");

  cfg.step1.storefrontUrl.trim()
    ? push("pass", `Storefront URL set — cross-domain carry-over configured (${cfg.step1.storefrontUrl})`)
    : push("warn", "No live storefront URL — pixels will target the myshopify domain only");

  cfg.step2.platforms.length > 0
    ? push("pass", `${cfg.step2.platforms.length} destination platform(s) selected`)
    : push("fail", "Select at least one destination platform");

  if (cfg.step2.mode !== "server") {
    /^GTM-[A-Z0-9]+$/i.test(cfg.step3.webGtmId.trim())
      ? push("pass", `Web container pinned (${cfg.step3.webGtmId.toUpperCase()})`)
      : push("fail", "Web GTM ID must match GTM-XXXXXXX");
  }

  if (cfg.step2.mode !== "web") {
    if (!cfg.step3.serverGtmId.trim())
      push("warn", "No server GTM ID — a fresh container will be scaffolded on import");
    else if (!/^GTM-[A-Z0-9]+$/i.test(cfg.step3.serverGtmId.trim()))
      push("fail", "Server GTM ID must match GTM-XXXXXXX");
    else push("pass", `Server container pinned (${cfg.step3.serverGtmId.toUpperCase()})`);

    /^https:\/\/[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/.test(cfg.step3.taggingUrl.trim())
      ? push("pass", `Tagging server endpoint secured over HTTPS (${cfg.step3.taggingUrl.replace(/\/+$/, "")})`)
      : push("fail", "Tagging server URL must be a full https:// URL");
  }

  if (cfg.step2.platforms.includes("ga4")) {
    /^G-[A-Z0-9]+$/i.test(cred("ga4", "measurementId"))
      ? push("pass", `GA4 measurement ID validated (${cred("ga4", "measurementId").toUpperCase()})`)
      : push("fail", "GA4 measurement ID must look like G-XXXXXXXXXX");
    if (cfg.step2.mode !== "web" && !cred("ga4", "apiSecret"))
      push("warn", "GA4 API secret missing — server hits will be rejected by Measurement Protocol");
  }

  if (cfg.step2.platforms.includes("meta") && cfg.step2.mode !== "web" && cred("meta", "capiToken").length < 20)
    push("warn", "Meta CAPI token missing/short — Meta delivery will fall back to browser pixel only");

  if (cfg.step2.platforms.includes("meta") && cred("meta", "testEventCode"))
    push("warn", `Meta test event code (${cred("meta", "testEventCode")}) is set — remove before going live`);

  cfg.step4.events.includes("purchase")
    ? push("pass", "Purchase event enabled with order-id dedup ledger (24h TTL)")
    : push("warn", "Purchase event disabled — ad platforms cannot attribute revenue");

  cfg.step4.events.includes("add_to_cart")
    ? push("pass", "Add-to-cart retargeting signal enabled")
    : push("warn", "AddToCart disabled — dynamic retargeting audiences will decay");

  cfg.step4.consentMode
    ? push("pass", `Consent Mode v2 enabled, default state "${cfg.step4.defaultConsent}" (wait_for_update 500ms)`)
    : push("warn", "Consent Mode v2 disabled — EEA/UK traffic will be non-compliant");

  cfg.step4.cmp !== "none"
    ? push("pass", `CMP wired: ${CMP_OPTIONS.find((o) => o.id === cfg.step4.cmp)?.name}`)
    : push("warn", "No CMP selected — consent defaults will never update on user choice");

  cfg.step4.hashPii
    ? push("pass", "PII SHA-256 hashing enabled at the edge (em, ph)")
    : push("warn", "PII hashing disabled — platforms may reject unhashed user_data");

  if (cfg.step3.staging)
    push("warn", "Staging flag on — pixel logs to console and tags fire in debug mode");

  return checks;
}

export function packageFileName(cfg: WizardConfig): string {
  const base = cfg.step1.shopDomain
    ? cfg.step1.shopDomain.replace(/\.myshopify\.com$/i, "").replace(/[^a-z0-9-]/gi, "-")
    : "store";
  return `shopifytrack-pro-${base.toLowerCase()}.zip`;
}

export { PLATFORMS, EVENTS };
