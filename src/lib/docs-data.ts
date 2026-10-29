/* ------------------------------------------------------------------ */
/*  Documentation content model                                        */
/* ------------------------------------------------------------------ */

export type DocBlock =
  | { type: "p"; text: string }
  | { type: "code"; title?: string; code: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "callout"; tone: "info" | "warn" | "tip"; title: string; text: string }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "h2"; text: string };

export interface DocPage {
  slug: string;
  title: string;
  blurb: string;
  group: string;
  blocks: DocBlock[];
}

export const DOC_PAGES: DocPage[] = [
  /* ---------------------------------------------------------------- */
  {
    slug: "getting-started",
    title: "Introduction",
    blurb: "What ShopifyTrack Pro compiles, and why the architecture looks the way it does.",
    group: "Getting started",
    blocks: [
      {
        type: "p",
        text: "ShopifyTrack Pro is a **tracking compiler** for Shopify. Instead of clicking through Google Tag Manager for hours, you answer five questions — the engine then streams your parameters into master container schemas and emits a versioned, import-ready package.",
      },
      {
        type: "table",
        head: ["Artifact", "Where it goes", "What it contains"],
        rows: [
          ["gtm-web.json", "Web container import", "GA4 config + event tags, Meta/TikTok/Pinterest/Snap bases & events, Consent Mode defaults"],
          ["gtm-server.json", "Server container import", "GA4 client, ShopifyTrack pixel client, CAPI/Events-API tags, dedup ledger"],
          ["custom-pixel-compact.js", "Shopify → Customer events", "8 sandboxed subscriptions (page → purchase), PII hashing, first-party beacons"],
          ["README.md", "Your repo / drive", "Ordered install runbook with verification steps"],
        ],
      },
      {
        type: "h2",
        text: "The data plane",
      },
      {
        type: "code",
        title: "signal flow",
        code: `storefront ─┐
            ├─→  web container (gtm-web.json) ──→ GA4 / Meta / TikTok …
checkout ───┤
            ├─→  custom pixel ──→ tagging server (gtm-server.json)
            │                        ├─→ SHA-256 hash user_data
            │                        ├─→ dedupe order/event ids (24 h)
            │                        └─→ CAPI fan-out: Meta · TikTok · Pinterest · Snap · GA4 MP
consent ────┴─→  Consent Mode v2 defaults + CMP updates`,
      },
      {
        type: "callout",
        tone: "tip",
        title: "Hybrid is the default for a reason",
        text: "Browser tags give you instant, rich context on the storefront. The server plane protects checkout, iOS and ad-blocked sessions. Running both with event-ID deduplication is the configuration ad platforms score highest.",
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    slug: "quickstart",
    title: "Quickstart",
    blurb: "From zero to a verified hybrid pipeline in under three minutes.",
    group: "Getting started",
    blocks: [
      { type: "p", text: "You need: a Shopify store, a GTM account, and about three minutes." },
      {
        type: "list",
        ordered: true,
        items: [
          "Open the wizard — Basics: store name, permanent *.myshopify.com domain and (optionally) your live storefront URL.",
          "Destinations: choose Hybrid, select platforms, paste IDs and CAPI tokens.",
          "Containers: enter your Web GTM ID, Server GTM ID and tagging server URL (https).",
          "Events & privacy: toggle the events you need; keep Consent Mode v2 + SHA-256 on.",
          "Review: clear the pre-flight checks and hit Generate & download .zip.",
          "Import both JSON files in GTM (Admin → Import Container), paste the pixel in Shopify → Settings → Customer events.",
          "Verify with the ShopifyTrack Inspector extension while clicking through a test order.",
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "No containers yet?",
        text: "Create two empty containers (one Web, one Server) in GTM first. Imports merge cleanly into blank workspaces, and you keep the GTM IDs stable for your team.",
      },
      {
        type: "code",
        title: "what the package looks like",
        code: `shopifytrack-pro-aurora-athletics.zip
├── gtm-web.json            # import → web container
├── gtm-server.json         # import → server container
├── custom-pixel-compact.js # paste → Shopify customer events
└── README.md               # ordered runbook`,
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    slug: "web-container",
    title: "Web container",
    blurb: "The storefront plane — tags, triggers and variables generated for gtm-web.json.",
    group: "Containers",
    blocks: [
      {
        type: "p",
        text: "The web export pins every credential into **constant variables**, builds one **custom-event trigger per Shopify event**, and wires the platform base codes plus mapped event tags. Consent Mode v2 defaults fire before everything else.",
      },
      {
        type: "table",
        head: ["Node type", "Examples", "Bound to"],
        rows: [
          ["Variables", "C - GA4 Measurement ID, DLV - ecommerce.items", "constants + dataLayer paths"],
          ["Triggers", "CE - Add To Cart (product_added_to_cart)", "Shopify event names"],
          ["Tags", "GA4 - purchase, Meta - Purchase", "mapped platform event names"],
        ],
      },
      { type: "h2", text: "Import & publish" },
      {
        type: "list",
        ordered: true,
        items: [
          "GTM → Admin → Import Container → choose gtm-web.json.",
          "Merge → Overwrite conflicting tags, triggers and variables.",
          "Open Preview on your storefront and run a test session.",
          "Publish with a version note (e.g. “ShopifyTrack Pro v1 — hybrid base”).",
        ],
      },
      {
        type: "callout",
        tone: "warn",
        title: "Theme snippet still required",
        text: "Containers only fire when the GTM snippet is in your theme: paste it into layout/theme.liquid right after <head>. The README in your package includes the exact snippet with your ID.",
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    slug: "server-container",
    title: "Server container",
    blurb: "The first-party data plane — clients, CAPI tags and the dedup ledger.",
    group: "Containers",
    blocks: [
      {
        type: "p",
        text: "The server export declares two **clients**: the standard GA4 client and the ShopifyTrack pixel client that answers the pixel's /collect beacons. Incoming events are normalized, hashed (when enabled), deduplicated by order/event ID and fanned out to each CAPI tag.",
      },
      {
        type: "table",
        head: ["Server node", "Purpose"],
        rows: [
          ["GA4 Client", "Claims /g/collect hits and forwards via Measurement Protocol"],
          ["ShopifyTrack Pixel Client", "Claims first-party beacons from the Customer Events pixel"],
          ["Meta CAPI tag", "event_id dedup against browser pixel; test code support"],
          ["TikTok / Pinterest / Snap tags", "Events API fan-out with hashed user_data"],
          ["Dedup ledger", "order_id keyed, 24h TTL — no double revenue"],
        ],
      },
      { type: "h2", text: "Tagging server URL & DNS" },
      {
        type: "list",
        ordered: true,
        items: [
          "Provision sGTM hosting (Google Cloud Run, Stape, etc.).",
          "Map a first-party subdomain, e.g. gtm.yourstore.com, via CNAME.",
          "Enter that URL in step 3 of the wizard — it is compiled into both files and the pixel endpoint.",
        ],
      },
      {
        type: "callout",
        tone: "tip",
        title: "First-party = durable",
        text: "Serving the tagging endpoint from your own domain makes cookies first-party and beacons unblockable by default. It is the single biggest durability win available to Shopify stores.",
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    slug: "custom-pixel",
    title: "Custom pixel",
    blurb: "The sandboxed Shopify Customer Events pixel that closes the checkout gap.",
    group: "Pixel",
    blocks: [
      {
        type: "p",
        text: "Shopify's checkout is sealed for classic theme scripts. The **Customer Events pixel** runs in a sandbox that exposes structured events — ShopifyTrack compiles one compact pixel that subscribes to all of them and beacons to your tagging server.",
      },
      {
        type: "code",
        title: "install (copy from README.md in your package)",
        code: `Shopify Admin → Settings → Customer events
  → Add custom pixel → name: "ShopifyTrack Pro"
  → paste custom-pixel-compact.js
  → permissions: "Not a data sale" (or per counsel)
  → Save → Connect`,
      },
      { type: "h2", text: "What the pixel guarantees" },
      {
        type: "list",
        items: [
          "Deduplication — the same event.id is never dispatched twice within 60 s.",
          "Consent state travels with every payload (default + CMP id).",
          "SHA-256 hashing of email/phone when supported by the sandbox; the edge re-verifies.",
          "Webhook-safe payloads: order_id, line items, value/currency, customer data.",
          "Graceful degradation: console-only debug in staging builds, silent retry-free sendBeacon in prod.",
        ],
      },
      {
        type: "callout",
        tone: "warn",
        title: "Sandbox crypto",
        text: "crypto.subtle is not guaranteed in the pixel sandbox. The pixel feature-detects it and hashes client-side when available; the server container always hashes again at the edge, so compliance never depends on the browser.",
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    slug: "events-reference",
    title: "Events reference",
    blurb: "Every Shopify event we subscribe to, mapped across all six platforms.",
    group: "Signals",
    blocks: [
      {
        type: "table",
        head: ["Shopify event", "GA4", "Meta", "TikTok", "Pinterest", "Snap", "Google Ads"],
        rows: [
          ["page_viewed", "page_view", "PageView", "Pageview", "PageVisit", "PAGE_VIEW", "—"],
          ["product_viewed", "view_item", "ViewContent", "ViewContent", "ViewItem", "VIEW_CONTENT", "view_item"],
          ["collection_viewed", "view_item_list", "ViewCategory", "ViewContent", "ViewCategory", "VIEW_CONTENT", "—"],
          ["product_added_to_cart", "add_to_cart", "AddToCart", "AddToCart", "AddToCart", "ADD_CART", "—"],
          ["cart_viewed", "view_cart", "ViewCart", "ViewCart", "ViewCart", "VIEW_CONTENT", "—"],
          ["checkout_started", "begin_checkout", "InitiateCheckout", "InitiateCheckout", "InitiateCheckout", "START_CHECKOUT", "—"],
          ["payment_info_submitted", "add_payment_info", "AddPaymentInfo", "AddPaymentInfo", "—", "ADD_BILLING", "—"],
          ["checkout_completed", "purchase", "Purchase", "CompletePayment", "Checkout", "PURCHASE", "conversion"],
        ],
      },
      {
        type: "p",
        text: "All payloads carry a normalized `ecommerce` object — `value`, `currency`, `items[]` with `item_id`, `item_name`, `price`, `quantity` — so downstream tags read one schema regardless of source.",
      },
      {
        type: "callout",
        tone: "info",
        title: "Naming discipline",
        text: "GA4 is snake_case because Measurement Protocol demands it. Browser pixels use each vendor's canonical casing. Never rename mapped events — audiences and conversions in the ad platforms bind to these exact names.",
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    slug: "privacy-consent",
    title: "Consent & privacy",
    blurb: "Consent Mode v2, CMP wiring and SHA-256 hashing — the compliance layer.",
    group: "Signals",
    blocks: [
      {
        type: "p",
        text: "The wizard compiles a **Consent Mode v2 defaults** tag into the web container and a consent block into every pixel payload. Choose your CMP in step 4; updates arrive as `consent_update` events.",
      },
      {
        type: "table",
        head: ["Consent key", "Denied default", "Granted"],
        rows: [
          ["ad_storage", "no ad cookies written", "full ads measurement"],
          ["ad_user_data", "no user data to Google ads", "enhanced signals"],
          ["ad_personalization", "no remarketing", "audience features"],
          ["analytics_storage", "cookieless pings only", "full analytics"],
        ],
      },
      { type: "h2", text: "CMP integrations" },
      {
        type: "list",
        items: [
          "Shopify Customer Privacy — native banner; we bridge its API into consent_update events.",
          "Cookiebot — auto-blocking plus Consent Mode wiring.",
          "OneTrust — enterprise consent groups mapped to ad/analytics storage.",
          "No CMP — static defaults only; you own the risk of never updating consent.",
        ],
      },
      {
        type: "callout",
        tone: "warn",
        title: "EEA default",
        text: "If you sell into the EEA/UK, keep the default state on denied with wait_for_update ≥ 500 ms. Regulators audit this exact configuration.",
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    slug: "inspector-extension",
    title: "Inspector extension",
    blurb: "The DevTools panel that proves your pipeline works — hit by hit.",
    group: "Tooling",
    blocks: [
      { type: "p", text: "ShopifyTrack Inspector is a Manifest-V3 Chrome extension. It adds a “ShopifyTrack” panel to DevTools that watches the network log and mirrors window.dataLayer — purpose-built for verifying wizard-generated setups." },
      { type: "h2", text: "Install from the .zip" },
      {
        type: "list",
        ordered: true,
        items: [
          "Download the zip (header button or extension page) and unzip it.",
          "Open chrome://extensions and enable Developer mode.",
          "Load unpacked → select the unzipped folder.",
          "Open any Shopify store, press F12 → switch to the ShopifyTrack panel.",
        ],
      },
      {
        type: "table",
        head: ["Pane", "What you see"],
        rows: [
          ["Outgoing hits", "GA4 /g/collect, Meta /tr, TikTok, Pinterest, Snap, Google Ads and sGTM beacons with decoded event names & status"],
          ["dataLayer", "Last 12 pushes, pretty-printed, with GTM presence detection"],
          ["Filters", "Per-platform chips with live counters; clear button resets the session"],
        ],
      },
      {
        type: "callout",
        tone: "tip",
        title: "Zero telemetry",
        text: "The extension runs entirely inside your browser. No permissions beyond DevTools, no external requests, nothing is collected or sent anywhere.",
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    slug: "faq",
    title: "FAQ & troubleshooting",
    blurb: "The five issues that cause 95% of tracking tickets — and their fixes.",
    group: "Help",
    blocks: [
      {
        type: "table",
        head: ["Symptom", "Cause", "Fix"],
        rows: [
          ["GA4 shows (not set) for checkout", "GTM snippet missing in theme", "Add the snippet to layout/theme.liquid (see README step 4)"],
          ["Meta double-counts purchases", "Browser + CAPI without shared event_id", "Keep the dedup ledger on; never remove eventID mapping"],
          ["Pixel 'not connected'", "Forgot the Connect button", "Customer events → ⋯ → Connect on the pixel card"],
          ["sGTM 404s on /collect", "Tagging URL wrong or DNS pending", "Re-check step 3; verify CNAME propagation"],
          ["No events in Inspector", "Panel opened after navigation", "Reload the store with DevTools open"],
        ],
      },
      { type: "h2", text: "Frequently asked" },
      {
        type: "list",
        items: [
          "Is this affiliated with Shopify? No — ShopifyTrack Pro is an independent compiler for Shopify stores.",
          "Do you store my tokens? Tokens stay in your browser (localStorage) and travel only inside your downloaded package; generation events are logged without credentials.",
          "Can I re-run the wizard? Yes — your answers persist locally; recompile any time and re-import.",
          "Plus vs non-Plus checkout? The Customer Events pixel works on every plan — that's the point of the sandbox.",
          "Where do files import? GTM → Admin → Import Container for both JSON files; Shopify admin for the pixel.",
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Still stuck?",
        text: "Re-run the wizard with Demo data to get a known-good reference package, diff it against yours, and the discrepancy will identify the misconfiguration.",
      },
    ],
  },
];

export const DOC_GROUPS = ["Getting started", "Containers", "Pixel", "Signals", "Tooling", "Help"];

export const docBySlug = (slug: string) => DOC_PAGES.find((p) => p.slug === slug);
