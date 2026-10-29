/* ------------------------------------------------------------------ */
/*  ShopifyTrack Inspector — Chrome extension (MV3) source files.      */
/*  Served as a zip by /api/extension/download.                        */
/* ------------------------------------------------------------------ */

export const EXTENSION_VERSION = "1.0.0";

const manifest = `{
  "manifest_version": 3,
  "name": "ShopifyTrack Inspector",
  "version": "${EXTENSION_VERSION}",
  "description": "Verify Shopify tracking setups: live dataLayer pushes and outgoing GA4, Meta, TikTok, Pinterest, Snap and Google Ads hits — right inside DevTools.",
  "devtools_page": "devtools.html"
}
`;

const devtoolsHtml = `<!doctype html>
<html>
  <head><meta charset="utf-8" /></head>
  <body><script src="devtools.js"></script></body>
</html>
`;

const devtoolsJs = `chrome.devtools.panels.create("ShopifyTrack", "", "panel.html", function () {});
`;

const panelHtml = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  :root {
    --ink: #050706;
    --panel: #0b110b;
    --line: rgba(210,255,170,.1);
    --acid: #c9f24e;
    --bone: #eef3ea;
    --moss: #8a978a;
    --faint: #5c685c;
    --amber: #ffb13d;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body {
    font-family: "SF Mono", ui-monospace, Menlo, Consolas, monospace;
    font-size: 11px;
    background: var(--ink);
    color: var(--bone);
    display: flex;
    flex-direction: column;
  }
  header {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--line);
    background: var(--panel);
  }
  .logo { color: var(--acid); font-weight: 700; letter-spacing: .04em; }
  .logo small { color: var(--moss); font-weight: 400; margin-left: 6px; }
  .spacer { flex: 1; }
  button {
    font: inherit; cursor: pointer;
    border: 1px solid var(--line); border-radius: 6px;
    background: rgba(255,255,255,.04); color: var(--bone);
    padding: 4px 10px;
  }
  button:hover { border-color: rgba(201,242,78,.5); color: var(--acid); }
  .chips { display: flex; gap: 6px; padding: 8px 12px; border-bottom: 1px solid var(--line); flex-wrap: wrap; }
  .chip {
    border: 1px solid var(--line); border-radius: 999px;
    padding: 3px 10px; cursor: pointer; color: var(--moss);
    background: transparent; font: inherit; font-size: 10px;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .chip .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--faint); }
  .chip.on { color: var(--bone); border-color: rgba(201,242,78,.4); background: rgba(201,242,78,.08); }
  .chip.on .dot { background: var(--acid); }
  main { flex: 1; display: grid; grid-template-columns: 1.5fr 1fr; min-height: 0; }
  section { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
  section + section { border-left: 1px solid var(--line); }
  .pane-title {
    padding: 7px 12px; color: var(--moss); text-transform: uppercase;
    letter-spacing: .12em; font-size: 9px; border-bottom: 1px solid var(--line);
    display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,.02);
  }
  .scroll { flex: 1; overflow: auto; padding: 6px 0; }
  .row {
    display: grid; grid-template-columns: 64px 82px 1fr 42px;
    gap: 8px; padding: 5px 12px; border-bottom: 1px dashed rgba(210,255,170,.05);
    align-items: center;
  }
  .row:hover { background: rgba(201,242,78,.04); }
  .time { color: var(--faint); }
  .plat { display: inline-flex; align-items: center; gap: 6px; }
  .plat .dot { width: 7px; height: 7px; border-radius: 50%; }
  .ev { color: var(--bone); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .status { text-align: right; color: var(--moss); }
  .status.ok { color: var(--acid); }
  .status.warn { color: var(--amber); }
  .empty { color: var(--faint); padding: 18px 12px; line-height: 1.7; }
  .dl-entry { padding: 8px 12px; border-bottom: 1px dashed rgba(210,255,170,.05); }
  .dl-head { display: flex; justify-content: space-between; color: var(--acid); margin-bottom: 4px; }
  .dl-head .idx { color: var(--faint); }
  pre { white-space: pre-wrap; word-break: break-word; color: rgba(238,243,234,.8); line-height: 1.5; }
  .kv { color: var(--moss); }
  .gtm-ok { color: var(--acid); } .gtm-no { color: var(--amber); }
  .url-line { color: var(--faint); font-size: 9px; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
</head>
<body>
  <header>
    <div class="logo">&#9889; ShopifyTrack<small>Inspector v${EXTENSION_VERSION}</small></div>
    <div class="spacer"></div>
    <button id="btn-dl">Refresh dataLayer</button>
    <button id="btn-clear">Clear</button>
  </header>

  <div class="chips" id="chips"></div>

  <main>
    <section>
      <div class="pane-title">Outgoing tracking hits <span id="hit-count" class="kv"></span></div>
      <div class="scroll" id="hits">
        <div class="empty">Waiting for tracking requests&hellip;<br/>Navigate the inspected Shopify store. GA4, Meta, TikTok, Pinterest, Snap, Google Ads and sGTM hits appear here in real time.</div>
      </div>
    </section>
    <section>
      <div class="pane-title">window.dataLayer <span id="dl-meta" class="kv"></span></div>
      <div class="scroll" id="dl">
        <div class="empty">No dataLayer detected yet.</div>
      </div>
    </section>
  </main>

  <script src="panel.js"></script>
</body>
</html>
`;

/* NOTE: panel.js is written without template literals on purpose — the file
   is embedded inside a TS template string and must stay backtick-free. */
const panelJs = `(function () {
  "use strict";

  var PLATFORMS = [
    { id: "ga4",    name: "GA4",      color: "#f9ab00",
      match: function (u) { return /google-analytics\\.com\\/(g\\/)?collect|region[0-9]*\\.google-analytics\\.com/.test(u); },
      event: function (u) { return pick(u, "en") || pick(u, "epn") || "collect"; } },
    { id: "meta",   name: "Meta",     color: "#1877f2",
      match: function (u) { return /facebook\\.com\\/tr[/?]/.test(u) || /facebook\\.com\\/privacy_sandbox/.test(u); },
      event: function (u) { return pick(u, "ev") || "pixel hit"; } },
    { id: "tiktok", name: "TikTok",   color: "#25f4ee",
      match: function (u) { return /analytics\\.tiktok\\.com\\/(api|i18n)\\/pixel/.test(u) || /analytics\\.tiktok\\.com\\/api\\/v2/.test(u); },
      event: function (u) { return pick(u, "event") || "pixel hit"; } },
    { id: "pin",    name: "Pinterest", color: "#e60023",
      match: function (u) { return /ct\\.pinterest\\.com\\//.test(u) || /pinimg\\.com\\/ct\\//.test(u); },
      event: function (u) { return pick(u, "event") || "tag hit"; } },
    { id: "snap",   name: "Snap",     color: "#fffc00",
      match: function (u) { return /tr\\.snapchat\\.com|sc-static\\.net/.test(u); },
      event: function (u) { return pick(u, "ev") || "pixel hit"; } },
    { id: "gads",   name: "G.Ads",    color: "#4285f4",
      match: function (u) { return /googleads\\.g\\.doubleclick\\.net|google\\.com\\/pagead|googleadservices\\.com/.test(u); },
      event: function (u) { return pick(u, "label") ? "conversion" : "gtag hit"; } },
    { id: "sgtm",   name: "sGTM",     color: "#c9f24e",
      match: function (u) { return /\\/collect\\?|\\/g\\/collect|first-party/.test(u) && !/google-analytics/.test(u); },
      event: function () { return "1st-party beacon"; } }
  ];

  var active = {};
  PLATFORMS.forEach(function (p) { active[p.id] = true; });

  var hits = [];
  var MAX = 300;

  function pick(url, key) {
    try {
      var q = url.split("?")[1] || "";
      var parts = q.split("&");
      for (var i = 0; i < parts.length; i++) {
        var kv = parts[i].split("=");
        if (decodeURIComponent(kv[0]) === key) return decodeURIComponent(kv[1] || "");
      }
    } catch (e) {}
    return "";
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  /* ---------- chips ---------- */
  var chipsEl = document.getElementById("chips");
  PLATFORMS.forEach(function (p) {
    var c = el("button", "chip on");
    var dot = el("span", "dot");
    dot.style.background = p.color;
    c.appendChild(dot);
    c.appendChild(document.createTextNode(p.name));
    c.appendChild(el("span", "kv", "0"));
    c.addEventListener("click", function () {
      active[p.id] = !active[p.id];
      c.classList.toggle("on", active[p.id]);
      render();
    });
    c.dataset.pid = p.id;
    chipsEl.appendChild(c);
  });

  function bumpCount(pid) {
    var chips = chipsEl.children;
    for (var i = 0; i < chips.length; i++) {
      if (chips[i].dataset.pid === pid) {
        var kv = chips[i].querySelector(".kv");
        kv.textContent = String(Number(kv.textContent) + 1);
      }
    }
  }

  /* ---------- network ---------- */
  chrome.devtools.network.onRequestFinished.addListener(function (req) {
    var url = req.request.url;
    for (var i = 0; i < PLATFORMS.length; i++) {
      var p = PLATFORMS[i];
      if (p.match(url)) {
        var status = req.response && req.response.status;
        hits.unshift({
          t: new Date(),
          pid: p.id,
          name: p.name,
          color: p.color,
          ev: p.event(url),
          status: status || 0,
          url: url
        });
        if (hits.length > MAX) hits.pop();
        bumpCount(p.id);
        document.getElementById("hit-count").textContent = "· " + hits.length + " captured";
        render();
        return;
      }
    }
  });

  function render() {
    var host = document.getElementById("hits");
    host.innerHTML = "";
    var shown = 0;
    for (var i = 0; i < hits.length && shown < 80; i++) {
      var h = hits[i];
      if (!active[h.pid]) continue;
      var row = el("div", "row");
      row.appendChild(el("span", "time", h.t.toLocaleTimeString("en-GB", { hour12: false })));
      var plat = el("span", "plat");
      var dot = el("span", "dot");
      dot.style.background = h.color;
      plat.appendChild(dot);
      plat.appendChild(document.createTextNode(h.name));
      row.appendChild(plat);
      var ev = el("span", "ev", h.ev);
      ev.title = h.url;
      row.appendChild(ev);
      var st = el("span", "status " + (h.status >= 200 && h.status < 300 ? "ok" : h.status === 0 ? "" : "warn"), h.status ? String(h.status) : "—");
      row.appendChild(st);
      host.appendChild(row);
      var urow = el("div", "url-line", h.url.length > 160 ? h.url.slice(0, 160) + "…" : h.url);
      urow.style.padding = "0 12px";
      host.appendChild(urow);
      shown++;
    }
    if (!shown) host.innerHTML = '<div class="empty">No matching hits yet.</div>';
  }

  /* ---------- dataLayer ---------- */
  function refreshDataLayer() {
    chrome.devtools.inspectedWindow.eval(
      "(function(){var o={dl:null,gtm:false};try{if(window.dataLayer&&window.dataLayer.length){o.dl=window.dataLayer.slice(-12);}o.gtm=!!window.google_tag_manager;}catch(e){}return JSON.stringify(o);})()",
      function (res, err) {
        var host = document.getElementById("dl");
        var meta = document.getElementById("dl-meta");
        if (err || !res) { host.innerHTML = '<div class="empty">Unable to read dataLayer on this page.</div>'; return; }
        var parsed;
        try { parsed = JSON.parse(res); } catch (e) { return; }
        meta.innerHTML = "· " + (parsed.dl ? parsed.dl.length + " recent" : "0") +
          ' · GTM <span class="' + (parsed.gtm ? "gtm-ok" : "gtm-no") + '">' + (parsed.gtm ? "detected" : "not found") + "</span>";
        if (!parsed.dl || !parsed.dl.length) {
          host.innerHTML = '<div class="empty">dataLayer is empty or missing.</div>';
          return;
        }
        host.innerHTML = "";
        for (var i = parsed.dl.length - 1; i >= 0; i--) {
          var entry = parsed.dl[i];
          var wrap = el("div", "dl-entry");
          var head = el("div", "dl-head");
          var label = "(object)";
          if (entry && entry.event) label = String(entry.event);
          else if (typeof entry === "object" && entry && entry[0]) label = String(entry[0]);
          head.appendChild(el("span", "", label));
          head.appendChild(el("span", "idx", "#" + i));
          wrap.appendChild(head);
          wrap.appendChild(el("pre", "", JSON.stringify(entry, null, 1).slice(0, 900)));
          host.appendChild(wrap);
        }
      }
    );
  }

  setInterval(refreshDataLayer, 1500);
  refreshDataLayer();

  document.getElementById("btn-dl").addEventListener("click", refreshDataLayer);
  document.getElementById("btn-clear").addEventListener("click", function () {
    hits = [];
    var chips = chipsEl.children;
    for (var i = 0; i < chips.length; i++) chips[i].querySelector(".kv").textContent = "0";
    document.getElementById("hit-count").textContent = "";
    render();
  });
})();
`;

const installTxt = `ShopifyTrack Inspector v${EXTENSION_VERSION}
=============================================

INSTALL (Chrome / Edge / Brave / Arc)

1. Unzip this package.
2. Open chrome://extensions
3. Toggle ON "Developer mode" (top right).
4. Click "Load unpacked" and select the unzipped folder.
5. Open your Shopify store, press F12, and switch
   to the "ShopifyTrack" DevTools panel.

WHAT YOU GET
- Live capture of outgoing GA4, Meta, TikTok, Pinterest,
  Snap and Google Ads tracking hits with decoded event names
- window.dataLayer inspector with the 12 most recent pushes
- GTM detection for the inspected page
- One-click privacy: everything runs locally, nothing is sent anywhere.

Happy tracking — ShopifyTrack Pro
`;

export interface SourceFile {
  path: string;
  content: string;
}

export const EXTENSION_FILES: SourceFile[] = [
  { path: "manifest.json", content: manifest },
  { path: "devtools.html", content: devtoolsHtml },
  { path: "devtools.js", content: devtoolsJs },
  { path: "panel.html", content: panelHtml },
  { path: "panel.js", content: panelJs },
  { path: "INSTALL.txt", content: installTxt },
];
