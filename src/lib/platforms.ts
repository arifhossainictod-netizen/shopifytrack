/* ------------------------------------------------------------------ */
/*  Platform & event catalogue for ShopifyTrack Pro                    */
/* ------------------------------------------------------------------ */

export type PlatformId = "ga4" | "meta" | "tiktok" | "pinterest" | "gads" | "snap";

export type TrackMode = "web" | "server" | "hybrid";

export interface PlatformField {
  key: string;
  label: string;
  placeholder: string;
  hint?: string;
  serverOnly?: boolean;
  optional?: boolean;
  secret?: boolean;
}

export interface Platform {
  id: PlatformId;
  name: string;
  short: string;
  tagline: string;
  color: string;
  fields: PlatformField[];
}

export const PLATFORMS: Platform[] = [
  {
    id: "ga4",
    name: "Google Analytics 4",
    short: "GA4",
    tagline: "Measurement Protocol + gtag",
    color: "#f9ab00",
    fields: [
      { key: "measurementId", label: "Measurement ID", placeholder: "G-XXXXXXXXXX", hint: "GA4 Admin → Data Streams" },
      { key: "apiSecret", label: "API Secret", placeholder: "••••••••••••", serverOnly: true, optional: true, secret: true, hint: "Data Stream → Measurement Protocol API secrets" },
    ],
  },
  {
    id: "meta",
    name: "Meta (Facebook & Instagram)",
    short: "Meta",
    tagline: "Pixel + Conversions API",
    color: "#1877f2",
    fields: [
      { key: "pixelId", label: "Pixel ID", placeholder: "1234567890123456", hint: "Events Manager → Data Sources" },
      { key: "capiToken", label: "CAPI Access Token", placeholder: "EAA…", serverOnly: true, secret: true, hint: "Events Manager → Settings → Generate access token" },
      { key: "testEventCode", label: "Test Event Code", placeholder: "TEST12345", serverOnly: true, optional: true, hint: "Optional — remove before going live" },
    ],
  },
  {
    id: "tiktok",
    name: "TikTok",
    short: "TikTok",
    tagline: "Pixel + Events API",
    color: "#25f4ee",
    fields: [
      { key: "pixelId", label: "Pixel ID", placeholder: "C4A1B2C3D4E5F6G7H8", hint: "TikTok Events Manager → Web Events" },
      { key: "accessToken", label: "Access Token", placeholder: "••••••••••••", serverOnly: true, optional: true, secret: true, hint: "Developer Settings → Generate Access Token" },
    ],
  },
  {
    id: "pinterest",
    name: "Pinterest",
    short: "Pinterest",
    tagline: "Tag + Conversions API",
    color: "#e60023",
    fields: [
      { key: "tagId", label: "Tag ID", placeholder: "2612345678901", hint: "Ads Manager → Conversions → Tag" },
      { key: "accessToken", label: "Access Token", placeholder: "pina_…", serverOnly: true, optional: true, secret: true },
    ],
  },
  {
    id: "gads",
    name: "Google Ads",
    short: "G.Ads",
    tagline: "Enhanced Conversions",
    color: "#4285f4",
    fields: [
      { key: "conversionId", label: "Conversion ID", placeholder: "AW-123456789", hint: "Google Ads → Goals → Conversions" },
      { key: "purchaseLabel", label: "Purchase Label", placeholder: "AbCdEfGhIjKlMnOp", optional: true, hint: "Label of your Purchase conversion action" },
    ],
  },
  {
    id: "snap",
    name: "Snapchat",
    short: "Snap",
    tagline: "Pixel + Conversions API",
    color: "#fffc00",
    fields: [
      { key: "pixelId", label: "Pixel ID", placeholder: "ab12cd34-ef56-…", hint: "Snap Ads Manager → Events Manager" },
      { key: "capiToken", label: "CAPI Token", placeholder: "••••••••••••", serverOnly: true, optional: true, secret: true },
    ],
  },
];

export const platformById = (id: PlatformId): Platform =>
  PLATFORMS.find((p) => p.id === id) as Platform;

/* ------------------------------------------------------------------ */
/*  E-commerce event catalogue + per-platform name mapping             */
/* ------------------------------------------------------------------ */

export interface TrackEvent {
  id: string;
  shopify: string;
  label: string;
  desc: string;
  map: Partial<Record<PlatformId, string>>;
}

export const EVENTS: TrackEvent[] = [
  {
    id: "page_view",
    shopify: "page_viewed",
    label: "Page View",
    desc: "Every storefront & checkout page impression.",
    map: { ga4: "page_view", meta: "PageView", tiktok: "Pageview", pinterest: "PageVisit", snap: "PAGE_VIEW" },
  },
  {
    id: "view_item",
    shopify: "product_viewed",
    label: "View Item",
    desc: "A shopper lands on a product detail page.",
    map: { ga4: "view_item", meta: "ViewContent", tiktok: "ViewContent", pinterest: "ViewItem", snap: "VIEW_CONTENT", gads: "view_item" },
  },
  {
    id: "view_list",
    shopify: "collection_viewed",
    label: "View Collection",
    desc: "Collection / category listing impressions.",
    map: { ga4: "view_item_list", meta: "ViewCategory", tiktok: "ViewContent", pinterest: "ViewCategory", snap: "VIEW_CONTENT" },
  },
  {
    id: "add_to_cart",
    shopify: "product_added_to_cart",
    label: "Add To Cart",
    desc: "Item added to cart — the core retargeting signal.",
    map: { ga4: "add_to_cart", meta: "AddToCart", tiktok: "AddToCart", pinterest: "AddToCart", snap: "ADD_CART" },
  },
  {
    id: "view_cart",
    shopify: "cart_viewed",
    label: "View Cart",
    desc: "Cart page impressions with full line-item payload.",
    map: { ga4: "view_cart", meta: "ViewCart", tiktok: "ViewCart", pinterest: "ViewCart", snap: "VIEW_CONTENT" },
  },
  {
    id: "begin_checkout",
    shopify: "checkout_started",
    label: "Begin Checkout",
    desc: "Checkout initiated — feeds the intent audience.",
    map: { ga4: "begin_checkout", meta: "InitiateCheckout", tiktok: "InitiateCheckout", pinterest: "InitiateCheckout", snap: "START_CHECKOUT" },
  },
  {
    id: "add_payment_info",
    shopify: "payment_info_submitted",
    label: "Add Payment Info",
    desc: "Payment details submitted during checkout.",
    map: { ga4: "add_payment_info", meta: "AddPaymentInfo", tiktok: "AddPaymentInfo", snap: "ADD_BILLING" },
  },
  {
    id: "purchase",
    shopify: "checkout_completed",
    label: "Purchase",
    desc: "Order completed — deduplicated across browser + server.",
    map: { ga4: "purchase", meta: "Purchase", tiktok: "CompletePayment", pinterest: "Checkout", snap: "PURCHASE", gads: "conversion" },
  },
];

export const eventById = (id: string): TrackEvent =>
  EVENTS.find((e) => e.id === id) as TrackEvent;

export const CMP_OPTIONS = [
  { id: "none", name: "No CMP", desc: "Consent Mode defaults only" },
  { id: "shopify", name: "Shopify Customer Privacy", desc: "Native banner & consent API" },
  { id: "cookiebot", name: "Cookiebot", desc: "Auto-blocking + consent signals" },
  { id: "onetrust", name: "OneTrust", desc: "Enterprise consent platform" },
] as const;

export type CmpId = (typeof CMP_OPTIONS)[number]["id"];

export const STEPS = [
  { id: 1, slug: "basics", name: "Basics", desc: "Store identity & domains" },
  { id: 2, slug: "destinations", name: "Destinations", desc: "Mode & ad platforms" },
  { id: 3, slug: "containers", name: "Containers", desc: "GTM & tagging server" },
  { id: 4, slug: "events", name: "Events & Privacy", desc: "Signals & consent" },
  { id: 5, slug: "review", name: "Review & Package", desc: "Preflight & download" },
] as const;
