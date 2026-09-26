// ==UserScript==
// @name         SHIFT
// @namespace    https://github.com/ExtraPotions
// @version      3.4.0-dev.9
// @description  Accessible semantic themes that paint host pages first, with conservative classification and site enhancements.
// @icon         https://raw.githubusercontent.com/ExtraPotions/SHIFT/main/assets/shift-launcher.svg
// @tag          accessibility
// @tag          themes
// @tag          customization
// @author       ExtraPotions
// @license      PolyForm-Noncommercial-1.0.0
// @homepageURL  https://github.com/ExtraPotions/SHIFT
// @supportURL   https://github.com/ExtraPotions/SHIFT/issues
// @updateURL    https://github.com/ExtraPotions/SHIFT/releases/latest/download/shift.user.js
// @downloadURL  https://github.com/ExtraPotions/SHIFT/releases/latest/download/shift.user.js
// @match        http://*/*
// @match        https://*/*
// @run-at       document-start
// @inject-into  content
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_addElement
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      api.github.com
// @connect      m.media-amazon.com
// @connect      images-na.ssl-images-amazon.com
// @connect      images-eu.ssl-images-amazon.com
// @connect      images-fe.ssl-images-amazon.com
// @connect      images.amazon.com
// ==/UserScript==
// SHIFT Manager Metadata
// Description: Accessible semantic themes that paint host pages first, with conservative classification and site enhancements.
// Tags: accessibility, themes, customization

(() => {
'use strict';
const EXP = Object.create(null);

// Generated from the approved Dropper v3.3.2 install artifact. Do not edit.
const DropperReference = (() => {
const LAUNCHER_ORDER_KEY = "exp:v3:launcher-order";
const LAUNCHER_GRID_DELTA_KEY = "exp:v3:launcher-grid-delta";
const PRIDE_RAINBOW = "linear-gradient(90deg,#c84e66,#d07840,#be9f37,#3b8a5f,#3d79a6,#7455a4)";

const PRIDE_RAINBOW_VERTICAL = "linear-gradient(180deg,#c84e66,#d07840,#be9f37,#3b8a5f,#3d79a6,#7455a4)";

const CRIMSON_THEME = Object.freeze({ id:"crimson", name:"Crimson", swatch:"linear-gradient(135deg,#0c0508 0 38%,#941f2f 38% 69%,#2f746e 69% 100%)", canvas:"#0c0508", surface:"#1d090f", primary:"#941f2f", companion:"#5e2144", counterpoint:"#2f746e", interactive:"#b63243", bg:"#0c0508", panel:"#1d090f", line:"#4a1b28", text:"#e5d2d7", muted:"#ae8b94", accent:"#941f2f", accent2:"#b63243", skin:"linear-gradient(135deg,#941f2f 0%,#5e2144 52%,#2f746e 100%)", skinVertical:"linear-gradient(180deg,#941f2f 0%,#5e2144 52%,#2f746e 100%)" });

const UI_THEMES = Object.freeze([
    { id:"ember", name:"Ember", swatch:"linear-gradient(135deg,#120807 0 38%,#c9512c 38% 69%,#b68a32 69% 100%)", canvas:"#120807", surface:"#24100c", primary:"#c9512c", companion:"#8f2d3f", counterpoint:"#b68a32", interactive:"#e16a3b", bg:"#120807", panel:"#24100c", line:"#4e2a22", text:"#f1ddd2", muted:"#b99787", accent:"#c9512c", accent2:"#e16a3b", skin:"linear-gradient(135deg,#c9512c 0%,#8f2d3f 52%,#b68a32 100%)", skinVertical:"linear-gradient(180deg,#c9512c 0%,#8f2d3f 52%,#b68a32 100%)" },
    { id:"midnight", name:"Midnight", swatch:"linear-gradient(135deg,#050a12 0 38%,#3563a3 38% 69%,#348f8b 69% 100%)", canvas:"#050a12", surface:"#0c1726", primary:"#3563a3", companion:"#65558f", counterpoint:"#348f8b", interactive:"#477abd", bg:"#050a12", panel:"#0c1726", line:"#26364b", text:"#d4deeb", muted:"#91a2b7", accent:"#3563a3", accent2:"#477abd", skin:"linear-gradient(135deg,#3563a3 0%,#65558f 52%,#348f8b 100%)", skinVertical:"linear-gradient(180deg,#3563a3 0%,#65558f 52%,#348f8b 100%)" },
    { id:"glacier", name:"Glacier", swatch:"linear-gradient(135deg,#061216 0 38%,#4a9eaa 38% 69%,#92b85b 69% 100%)", canvas:"#061216", surface:"#0d252a", primary:"#4a9eaa", companion:"#5c76a4", counterpoint:"#92b85b", interactive:"#67b7c1", bg:"#061216", panel:"#0d252a", line:"#29464b", text:"#d8ebee", muted:"#8fa9ae", accent:"#4a9eaa", accent2:"#67b7c1", skin:"linear-gradient(135deg,#4a9eaa 0%,#5c76a4 52%,#92b85b 100%)", skinVertical:"linear-gradient(180deg,#4a9eaa 0%,#5c76a4 52%,#92b85b 100%)" },
    { id:"contrast", name:"High contrast", swatch:"linear-gradient(135deg,#000000 0 48%,#ffffff 48% 78%,#ffd400 78% 100%)", canvas:"#000000", surface:"#0a0a0a", primary:"#ffffff", companion:"#bfbfbf", counterpoint:"#ffd400", interactive:"#ffd400", bg:"#000000", panel:"#0a0a0a", line:"#ffffff", text:"#ffffff", muted:"#e0e0e0", accent:"#ffffff", accent2:"#ffd400", skin:"linear-gradient(135deg,#ffffff 0%,#bfbfbf 55%,#ffd400 100%)", skinVertical:"linear-gradient(180deg,#ffffff 0%,#bfbfbf 55%,#ffd400 100%)" },
    { id:"verdant", name:"Verdant", swatch:"linear-gradient(135deg,#06110d 0 38%,#318c61 38% 69%,#2f7f86 69% 100%)", canvas:"#06110d", surface:"#0d2218", primary:"#318c61", companion:"#667c3c", counterpoint:"#2f7f86", interactive:"#49a879", bg:"#06110d", panel:"#0d2218", line:"#28483a", text:"#d7e9df", muted:"#93aa9e", accent:"#318c61", accent2:"#49a879", skin:"linear-gradient(135deg,#318c61 0%,#667c3c 52%,#2f7f86 100%)", skinVertical:"linear-gradient(180deg,#318c61 0%,#667c3c 52%,#2f7f86 100%)" },
    { id:"pride", name:"Pride", swatch:"linear-gradient(135deg,#c84e66 0%,#d07840 16.6%,#be9f37 33.3%,#3b8a5f 50%,#3d79a6 66.6%,#7455a4 100%)", canvas:"#100a12", surface:"#1d1222", primary:"#c34f7d", companion:"#7555a6", counterpoint:"#328c82", interactive:"#dd6793", bg:"#100a12", panel:"#1d1222", line:"#4a2b50", text:"#f0ddea", muted:"#b89db4", accent:"#c34f7d", accent2:"#dd6793", skin:PRIDE_RAINBOW, skinVertical:PRIDE_RAINBOW_VERTICAL },
    { id:"twitch", name:"Twitch", swatch:"linear-gradient(135deg,#18181b 0 48%,#9147ff 48% 78%,#bf94ff 78% 100%)", canvas:"#111114", surface:"#19191e", primary:"#9147ff", companion:"#772ce8", counterpoint:"#bf94ff", interactive:"#bf94ff", bg:"#111114", panel:"#19191e", line:"#34343b", text:"#efeff1", muted:"#adadb8", accent:"#9147ff", accent2:"#bf94ff", skin:"linear-gradient(135deg,#9147ff,#bf94ff)", skinVertical:"linear-gradient(180deg,#9147ff,#bf94ff)", skinMode:"flat" },
    { id:"dropper", name:"Dropper gem", swatch:"linear-gradient(135deg,#0b0713 0 38%,#7a46c8 38% 69%,#2a8c9b 69% 100%)", canvas:"#0b0713", surface:"#171025", primary:"#7a46c8", companion:"#b14589", counterpoint:"#2a8c9b", interactive:"#9864dc", bg:"#0b0713", panel:"#171025", line:"#3c2850", text:"#e8ddf2", muted:"#aa98bb", accent:"#7a46c8", accent2:"#9864dc", skin:"linear-gradient(135deg,#7a46c8 0%,#b14589 52%,#2a8c9b 100%)", skinVertical:"linear-gradient(180deg,#7a46c8 0%,#b14589 52%,#2a8c9b 100%)" }
  ]);

function css() {
    return `
      :host { all: initial; }
      * { box-sizing: border-box; }
      .cluster {
        position: fixed; right: 12px; z-index: 2147483600;
        display: flex; flex-direction: column-reverse; align-items: flex-end;
        width: max-content; max-width: calc(100vw - 24px); gap: 8px;
        --theme-bg:#111114; --theme-panel:#19191e; --theme-line:#34343b; --theme-text:#efeff1; --theme-muted:#adadb8; --theme-accent:#9147ff; --theme-accent2:#bf94ff; --theme-skin:linear-gradient(135deg,#d9b5ff,#9b5af9,#7428e8); --theme-skin-vertical:linear-gradient(180deg,#d9b5ff,#9b5af9,#7428e8); --dropper-ui-opacity:1;
        font: 13px/1.42 ui-sans-serif, system-ui, "Segoe UI", sans-serif; color: var(--theme-text);
      }
      .cluster.open-up { flex-direction: column; }
      #tdh-tools-dock,
      #tdh-drop-card,
      .update-notice {
        opacity:var(--dropper-ui-opacity,1);
        transition:opacity .15s ease;
      }
      .progress-stack {
        width:min(var(--dropper-width, 312px), calc(100vw - 24px));
        display:flex; flex-direction:column; align-items:stretch;
        transition:.15s width;
        gap:6px;
      }
      .progress-stack[data-collapsed-width="compact"] { width:min(260px, calc(100vw - 24px)); }
      .progress-stack[data-collapsed-width="narrow"] { width:min(220px, calc(100vw - 24px)); }
      .progress-stack[data-collapsed-width="full"] { width:min(var(--dropper-width, 312px), calc(100vw - 24px)); }
      .cluster[data-panel-width="compact"] #tdh-tools-dock,
      .cluster[data-panel-width="compact"] > .update-notice[data-placement="menu"] {
        width:min(260px, calc(100vw - 24px));
      }
      .cluster[data-panel-width="narrow"] #tdh-tools-dock,
      .cluster[data-panel-width="narrow"] > .update-notice[data-placement="menu"] {
        width:min(220px, calc(100vw - 24px));
      }
      .cluster[data-panel-width="full"] #tdh-tools-dock,
      .cluster[data-panel-width="full"] > .update-notice[data-placement="menu"] {
        width:min(var(--dropper-width, 312px), calc(100vw - 24px));
      }
      .progress-stack.badge-only .badge-row { justify-content:flex-end; min-height:48px!important; }
      .progress-stack.badge-only #tdh-settings-launcher {
        border-radius:12px;
        border-left:1px solid color-mix(in srgb, var(--theme-accent) 47%, transparent);
      }
      .badge-only-progress-slot{display:block;width:100%;margin:0 0 5px;min-width:0}
      .badge-only-progress-slot[hidden]{display:none!important}
      .badge-only-progress-slot #tdh-drop-card{position:relative!important;inset:auto!important;display:block!important;width:100%!important;min-width:0!important;max-width:none!important;margin:0!important}
      .compact-line { height:auto; min-height:48px; padding:6px 10px; display:grid; grid-template-columns:6px minmax(0,1fr) auto auto; gap:7px; align-items:center; cursor:pointer; }
      .compact-dot { width:6px; height:6px; border-radius:2px; background:#9147ff; }
      .compact-reward { font-size:10px; font-weight:800; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .compact-extra { font-size:9px; color:#b8b8c0; white-space:nowrap; }
      .state-pill { display:inline-flex; align-items:center; border:1px solid #34343a; border-radius:5px; padding:1px 5px; font-size:8px; font-weight:800; color:#d0d0d5; background:#1c1c21; white-space:nowrap; }
      .state-pill.good { color:#c8ffd7; border-color:#22c55e66; background:#22c55e18; }
      .state-pill.warn { color:#ffe5a8; border-color:#f59e0b66; background:#f59e0b18; }
      .state-pill.bad { color:#ffd1d1; border-color:#ef444466; background:#ef444418; }
      .stream-info { padding:7px 9px 6px; display:grid; grid-template-columns:32px minmax(0,1fr); gap:7px; align-items:center; }
      .stream-info-hidden { display:none; }
      .stream-head { min-width:0; display:flex; align-items:center; gap:5px; }
      .stream-channel { font-size:11px; font-weight:800; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .stream-live { font-size:8px; font-weight:900; background:#eb0400; color:#fff; border-radius:4px; padding:1px 4px; }
      .stream-title { display:none; }
      .stream-game { font-size:9px; color:#adadb8; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .stream-badges { display:flex; gap:4px; flex-wrap:nowrap; align-items:center; justify-self:end; font-size:8px; color:#8f8f98; }
      .stream-badges[hidden] { display:none !important; }
      .stream-badge { padding:1px 4px; border:1px solid #34343b; border-radius:99px; }
      .stream-badge.drops-enabled { color:#d7ffd7; border-color:#22c55e66; background:#22c55e18; }
      .stream-dot { color:#5f5f68; }
      .drop-section { padding:7px 9px 8px; border-top:1px solid #29292f; }
      .drop-kicker { font-size:8px; color:#bf94ff; font-weight:900; letter-spacing:.07em; text-transform:uppercase; margin-bottom:2px; }
      .drop-head { display:flex; align-items:center; justify-content:space-between; gap:8px; padding-right:24px; }
      .drop-name { font-size:11px; font-weight:800; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .drop-game { display:none; }
      .drop-bar-row { margin-top:6px; display:grid; grid-template-columns:minmax(0,1fr) auto; gap:7px; align-items:center; }
      .drop-bar { height:6px; border-radius:99px; background:#2b2b31; overflow:hidden; }
      .drop-bar > span { display:block; height:100%; width:0; background:#9147ff; transition:.2s width,.2s background; }
      .drop-percent { font-size:10px; font-weight:800; color:#bf94ff; min-width:28px; text-align:right; }
      .drop-meta { font-size:8px; color:#9c9ca5; margin-top:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .drop-status-row { margin-top:4px; display:flex; align-items:center; gap:6px; flex-wrap:wrap; font-size:8px; color:#a7a7b0; }
      .progress-age { color:#a7a7b0; }
      .progress-age.warn { color:#f59e0b; }
      .progress-age.bad { color:#ef4444; font-weight:800; }
      /* 3.2.0 progress panel */
      .cluster{pointer-events:none!important}
      .cluster :is(#tdh-tools-dock,.update-notice,#tdh-drop-card,#tdh-settings-launcher){pointer-events:auto!important}
      .cluster .progress-stack{height:auto;min-height:48px;pointer-events:none!important}
      .cluster .badge-row{position:fixed!important;min-height:112px!important;height:auto!important;justify-content:flex-end!important;align-items:center!important;pointer-events:none!important}
      .cluster #tdh-drop-card[data-presentation="page-card"]{position:relative!important;inset:auto!important;right:auto!important;left:auto!important;top:auto!important;bottom:auto!important;flex:0 0 auto!important;margin:0!important}
      .cluster .badge-only-progress-slot #tdh-drop-card[data-presentation="menu-card"]{position:relative!important;inset:auto!important;right:auto!important;left:auto!important;width:100%!important;min-width:0!important;max-width:none!important;margin:0!important}

      .badge-row {display:flex!important;flex-wrap:nowrap!important;align-items:center!important;gap:8px!important;width:100%!important;min-height:112px!important;height:auto!important;position:relative!important}
      #tdh-drop-card {position:relative!important;order:0!important;flex:1 1 auto!important;width:auto!important;min-width:0!important;max-width:none!important;min-height:112px!important;margin:0!important;overflow:hidden!important;isolation:isolate!important;cursor:default!important;background:var(--theme-panel)!important;border:1px solid color-mix(in srgb,var(--theme-line) 94%,var(--theme-accent) 6%)!important;border-radius:12px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.03),inset 0 0 18px rgba(255,255,255,.012),0 8px 28px #0006!important;opacity:1!important;transition:border-color .16s ease,box-shadow .16s ease!important}
      #tdh-drop-card:focus-within{border-color:color-mix(in srgb,var(--theme-line) 72%,var(--theme-accent) 28%)!important}
      #tdh-drop-card::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;border-radius:inherit;background-image:radial-gradient(circle,rgba(255,255,255,.045) .6px,transparent .7px);background-size:4px 4px;opacity:.18;mix-blend-mode:soft-light}
      #tdh-drop-card::after{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;border-radius:inherit;background:linear-gradient(to bottom,rgba(255,255,255,.018),rgba(255,255,255,.004) 28%,transparent 55%);opacity:1}
      #tdh-drop-card .expanded-content{position:relative!important;z-index:1!important;display:block!important}
      #tdh-drop-card .compact-line{display:none!important}
      .stream-info,.stream-info-hidden{min-height:110px!important;padding:10px 11px!important;display:block!important}
      .progress-copy{width:100%!important;min-width:0!important;display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;grid-template-areas:"head head" "category category" "bar bar" "reward reward" "status status"!important;column-gap:10px!important;row-gap:7px!important}
      .progress-head{grid-area:head!important;min-width:0!important;display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:10px!important;align-items:center!important}
      .stream-channel{min-width:0!important;color:var(--theme-text)!important;font-size:12px!important;font-weight:850!important;line-height:1.15!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
      .progress-head .drop-percent{min-width:38px!important;color:var(--theme-accent2)!important;font-size:12px!important;font-weight:900!important;line-height:1!important;text-align:right!important;white-space:nowrap!important}
      .progress-category{grid-area:category!important;min-width:0!important;color:var(--theme-muted)!important;font-size:9px!important;line-height:1.15!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
      .drop-bar{grid-area:bar!important;height:7px!important;margin:1px 0 0!important;border-radius:3px!important;background:color-mix(in srgb,var(--theme-line) 62%,transparent)!important;overflow:hidden!important}
      .drop-bar>span{display:block!important;height:100%!important;width:0;border-radius:inherit!important;background:var(--theme-accent)!important}
      .progress-reward-row{grid-area:reward!important;min-width:0!important;display:flex!important;align-items:center!important;gap:6px!important;color:var(--theme-muted)!important;font-size:9px!important;line-height:1.15!important}
      .progress-reward-row .drop-meta{margin:0!important;flex:0 0 auto!important;color:var(--theme-muted)!important;font-size:9px!important;white-space:nowrap!important}
      .progress-dot{flex:0 0 auto!important;color:color-mix(in srgb,var(--theme-muted) 78%,transparent)!important}
      .progress-reward-row .drop-name{min-width:0!important;color:var(--theme-muted)!important;font-size:9px!important;font-weight:650!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
      .drop-status-row{grid-area:status!important;min-width:0!important;margin:0!important;display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:8px!important;align-items:center!important;color:var(--theme-muted)!important;font-size:8px!important;line-height:1!important}
      .status-meta-chip{box-sizing:border-box!important;min-width:0!important;height:24px!important;display:flex!important;align-items:center!important;overflow:hidden!important;border:1px solid color-mix(in srgb,var(--theme-line) 88%,var(--theme-accent) 12%)!important;border-radius:6px!important;background:color-mix(in srgb,var(--theme-bg) 94%,var(--theme-panel) 6%)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.018)!important}
      .drop-status-row .state-pill{box-sizing:border-box!important;min-width:0!important;min-height:0!important;height:22px!important;display:inline-flex!important;align-items:center!important;gap:5px!important;padding:0 8px!important;border:0!important;border-radius:0!important;background:transparent!important;color:var(--theme-muted)!important;font-size:8px!important;font-weight:800!important;line-height:1!important;white-space:nowrap!important}
      .drop-status-row .state-pill::before{content:""!important;flex:0 0 auto!important;width:6px!important;height:6px!important;border-radius:2px!important;background:currentColor!important;box-shadow:0 0 7px color-mix(in srgb,currentColor 42%,transparent)!important}
      .drop-status-row .state-pill.good{color:#8fd7a0!important}
      .drop-status-row .state-pill.warn{color:#e4bd6c!important}
      .drop-status-row .state-pill.bad{color:#dc9393!important}
      .status-chip-divider{flex:0 0 auto!important;width:1px!important;height:12px!important;background:color-mix(in srgb,var(--theme-line) 82%,transparent)!important}
      .status-clock-icon{flex:0 0 auto!important;width:10px!important;height:10px!important;margin-left:7px!important;color:color-mix(in srgb,var(--theme-muted) 86%,var(--theme-text) 14%)!important}
      #tdh-updated-ago{box-sizing:border-box!important;min-width:0!important;max-width:100%!important;padding:0 8px 0 4px!important;border:0!important;color:var(--theme-muted)!important;font-size:7.5px!important;font-weight:600!important;font-variant-numeric:tabular-nums!important;line-height:1!important;text-align:left!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
      .skip-streamer-chip{appearance:none!important;box-sizing:border-box!important;height:24px!important;min-height:24px!important;min-width:64px!important;max-width:82px!important;padding:0 9px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:5px!important;border:1px solid color-mix(in srgb,var(--theme-line) 72%,var(--theme-accent) 28%)!important;border-radius:6px!important;background:color-mix(in srgb,var(--theme-bg) 95%,var(--theme-accent) 5%)!important;color:color-mix(in srgb,var(--theme-text) 84%,var(--theme-accent) 16%)!important;font:800 8px/1 ui-sans-serif,system-ui,sans-serif!important;cursor:pointer!important;white-space:nowrap!important;overflow:hidden!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.018)!important;transition:border-color .14s ease,background .14s ease,color .14s ease,box-shadow .14s ease!important}
      .skip-streamer-chip:hover,.skip-streamer-chip:focus-visible{border-color:color-mix(in srgb,var(--theme-accent) 72%,var(--theme-line) 28%)!important;background:color-mix(in srgb,var(--theme-panel) 88%,var(--theme-accent) 12%)!important;color:var(--theme-accent2)!important;box-shadow:0 0 0 1px color-mix(in srgb,var(--theme-accent) 16%,transparent)!important;outline:none!important}
      .skip-streamer-chip:disabled{opacity:.36!important;cursor:default!important;box-shadow:none!important}
      .skip-streamer-chip .skip-icon{flex:0 0 auto!important;width:10px!important;height:10px!important;fill:currentColor!important}
      .skip-streamer-chip .skip-label{min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
      .skip-streamer-chip .skip-countdown{display:inline-grid!important;place-items:center!important;min-width:18px!important;height:16px!important;margin-left:1px!important;padding:0 4px!important;border-radius:4px!important;background:#ef4444!important;color:#fff!important;font-size:6px!important;font-weight:900!important;line-height:1!important}
      .skip-streamer-chip .skip-countdown[hidden]{display:none!important}
      .skip-streamer-chip.is-armed{min-width:78px!important;max-width:92px!important;border-color:color-mix(in srgb,#ef4444 62%,var(--theme-line))!important;background:color-mix(in srgb,var(--theme-panel) 90%,#ef4444 10%)!important;color:#efb0b0!important}
      .skip-streamer-chip.is-armed .skip-icon{display:none!important}
      .progress-stack[data-collapsed-width="compact"] .stream-info{padding:9px 10px!important}
      .progress-stack[data-collapsed-width="compact"] .progress-copy{row-gap:6px!important}
      .progress-stack[data-collapsed-width="compact"] .stream-channel,.progress-stack[data-collapsed-width="compact"] .progress-head .drop-percent{font-size:11px!important}
      .progress-stack[data-collapsed-width="compact"] .progress-category,.progress-stack[data-collapsed-width="compact"] .progress-reward-row,.progress-stack[data-collapsed-width="compact"] .progress-reward-row .drop-meta,.progress-stack[data-collapsed-width="compact"] .progress-reward-row .drop-name{font-size:8px!important}
      .progress-stack[data-collapsed-width="compact"] .drop-status-row{grid-template-columns:minmax(0,1fr) auto!important;gap:5px!important}
      .progress-stack[data-collapsed-width="compact"] .status-meta-chip{height:22px!important}
      .progress-stack[data-collapsed-width="compact"] .drop-status-row .state-pill{height:20px!important;gap:4px!important;padding-inline:6px!important;font-size:7.25px!important}
      .progress-stack[data-collapsed-width="compact"] .drop-status-row .state-pill::before{width:5px!important;height:5px!important}
      .progress-stack[data-collapsed-width="compact"] .status-chip-divider{height:10px!important}
      .progress-stack[data-collapsed-width="compact"] .status-clock-icon{width:8.5px!important;height:8.5px!important;margin-left:5px!important}
      .progress-stack[data-collapsed-width="compact"] #tdh-updated-ago{padding:0 6px 0 3px!important;font-size:6.75px!important}
      .progress-stack[data-collapsed-width="compact"] .skip-streamer-chip{height:22px!important;min-height:22px!important;min-width:49px!important;max-width:56px!important;padding-inline:7px!important;gap:4px!important;font-size:7px!important}
      .progress-stack[data-collapsed-width="compact"] .skip-streamer-chip .skip-icon{width:9px!important;height:9px!important}
      .progress-stack[data-collapsed-width="compact"] .skip-streamer-chip.is-armed{min-width:67px!important;max-width:76px!important;padding-inline:6px!important}
      .progress-stack[data-collapsed-width="narrow"] .stream-info{padding:8px 9px!important}
      .progress-stack[data-collapsed-width="narrow"] .progress-copy{row-gap:5px!important}
      .progress-stack[data-collapsed-width="narrow"] .stream-channel,.progress-stack[data-collapsed-width="narrow"] .progress-head .drop-percent{font-size:10px!important}
      .progress-stack[data-collapsed-width="narrow"] .progress-category,.progress-stack[data-collapsed-width="narrow"] .progress-reward-row,.progress-stack[data-collapsed-width="narrow"] .progress-reward-row .drop-meta,.progress-stack[data-collapsed-width="narrow"] .progress-reward-row .drop-name{font-size:7.25px!important}
      .progress-stack[data-collapsed-width="narrow"] .drop-status-row{grid-template-columns:minmax(0,1fr) auto!important;gap:4px!important}
      .progress-stack[data-collapsed-width="narrow"] .status-meta-chip{height:21px!important}
      .progress-stack[data-collapsed-width="narrow"] .drop-status-row .state-pill{height:19px!important;gap:3px!important;padding-inline:5px!important;font-size:6.6px!important}
      .progress-stack[data-collapsed-width="narrow"] .drop-status-row .state-pill::before{width:4.5px!important;height:4.5px!important;box-shadow:none!important}
      .progress-stack[data-collapsed-width="narrow"] .status-chip-divider{height:9px!important}
      .progress-stack[data-collapsed-width="narrow"] .status-clock-icon{width:8px!important;height:8px!important;margin-left:4px!important}
      .progress-stack[data-collapsed-width="narrow"] #tdh-updated-ago{padding:0 5px 0 2px!important;font-size:6.25px!important}
      .progress-stack[data-collapsed-width="narrow"] .skip-streamer-chip{width:26px!important;min-width:26px!important;max-width:26px!important;height:21px!important;min-height:21px!important;padding:0!important;gap:0!important}
      .progress-stack[data-collapsed-width="narrow"] .skip-streamer-chip .skip-icon{width:10px!important;height:10px!important}
      .progress-stack[data-collapsed-width="narrow"] .skip-streamer-chip:not(.is-armed) .skip-label{display:none!important}
      .progress-stack[data-collapsed-width="narrow"] .skip-streamer-chip.is-armed{width:auto!important;min-width:64px!important;max-width:72px!important;padding-inline:5px!important;gap:3px!important}
      .progress-stack[data-collapsed-width="narrow"] .skip-streamer-chip.is-armed .skip-label{display:inline!important}
      .progress-stack[data-collapsed-width="narrow"] .skip-streamer-chip .skip-countdown{min-width:16px!important;height:14px!important;padding-inline:3px!important;font-size:5.5px!important}

      #tdh-settings-launcher {
        position:relative; width:48px; min-width:48px; height:48px; min-height:48px; align-self:flex-end; padding:0; margin:0;
        display:grid; place-items:center; border:1px solid color-mix(in srgb,var(--theme-accent) 30%,transparent); border-radius:10px;
        background:var(--theme-panel,#18181b); box-shadow:0 6px 22px #0006; cursor:grab; touch-action:none; user-select:none;
        transition:.14s border-color,.14s box-shadow,.14s background,.14s transform;
      }
      .action-pair{display:grid;grid-column:1/-1;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-top:6px}
      #tdh-clear-activity{grid-column:1/-1}
      .action-separator{grid-column:1/-1;width:100%;border:0;border-top:1px solid var(--theme-line,#34343b);margin:8px 0 0}
      .mini-row:has(#tdh-queue-preference){grid-column:1/-1}
      #tdh-queue-preference{width:124px;min-width:124px;max-width:124px;flex:0 0 124px}
      .action-pair>.life-btn{min-width:0;margin:0;white-space:normal}
      .stream-subsection-label{grid-column:1/-1;min-width:0;margin:1px 0 2px;color:var(--theme-accent2);font-size:8px;font-weight:900;line-height:1.2;letter-spacing:.08em;text-transform:uppercase}
      .stream-subsection-label.with-divider{margin-top:7px;padding-top:8px;border-top:1px solid var(--theme-line,#34343b)}
      #tdh-streams-body>.queue-switches,
      #tdh-streams-body>.queue-collapsible,
      #tdh-clear-skipped-streamers{grid-column:1/-1}
      .queue-switches{display:grid;grid-template-columns:minmax(58px,.7fr) minmax(0,1.3fr);column-gap:10px;row-gap:0;min-width:0;margin:6px 0;padding:2px 0;border:0;align-items:stretch}
      .queue-switches-label{grid-column:1;grid-row:1/span 3;display:flex;align-items:center;min-width:0;font-size:11px;font-weight:700;line-height:1.2;color:var(--theme-text,#efeff1)}
      .queue-switches>.fl-switch{grid-column:2;display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:space-between!important;gap:10px;min-width:0;padding:5px 0!important;text-align:left!important}
      .queue-switches>.fl-switch>span:first-child{display:block;flex:1 1 auto;width:auto!important;min-width:0!important;min-height:0!important;white-space:normal!important;word-break:normal!important;overflow-wrap:normal!important;line-height:1.25;text-align:left}
      .queue-switches>.fl-switch>.toggleSwitch{flex:0 0 34px;margin-left:auto}
      #tdh-collapsed-width{box-sizing:border-box;width:104px;min-width:0!important;max-width:104px!important;flex:0 1 104px}
      #tdh-progress-body{padding-bottom:5px}
      #tdh-progress-body>.fl-switch,
      #tdh-progress-body>.mini-row{padding:4px 0}
      #tdh-progress-body>.mini-row:has(#tdh-collapsed-width){grid-column:1/-1;align-items:center;flex-wrap:wrap}
      #tdh-progress-body>.mini-row:has(#tdh-collapsed-width)>span{flex:1 1 120px;min-width:0;white-space:normal;overflow-wrap:normal}
      #tdh-progress-body>.theme-row{min-height:22px;padding:3px 0;gap:6px}
      #tdh-progress-body .exp-theme-swatches{gap:3px;flex-wrap:nowrap;min-width:0}
      #tdh-progress-body .exp-theme-swatch{flex:0 0 18px!important;width:18px!important;height:18px!important;min-width:18px!important;min-height:18px!important;max-width:18px!important;max-height:18px!important;border-radius:4px!important}
      .cluster[data-panel-width="compact"] #tdh-progress-body>.theme-row>span,
      .cluster[data-panel-width="narrow"] #tdh-progress-body>.theme-row>span{display:none}
      .cluster[data-panel-width="compact"] #tdh-progress-body>.theme-row,
      .cluster[data-panel-width="narrow"] #tdh-progress-body>.theme-row{gap:0}
      .cluster[data-panel-width="compact"] #tdh-progress-body .exp-theme-swatches,
      .cluster[data-panel-width="narrow"] #tdh-progress-body .exp-theme-swatches{width:100%;justify-content:space-between}
      .cluster[data-panel-width="narrow"] #tdh-progress-body>.mini-row:has(#tdh-collapsed-width){flex-direction:column;align-items:stretch;gap:4px}
      .cluster[data-panel-width="narrow"] #tdh-progress-body>.mini-row:has(#tdh-collapsed-width)>span{flex:0 0 auto;width:100%}
      .cluster[data-panel-width="narrow"] #tdh-collapsed-width{width:100%;max-width:100%!important;flex:0 0 auto;margin:0}
      .cluster[data-panel-width="narrow"] #tdh-progress-body>.theme-row{gap:4px}
      .cluster[data-panel-width="narrow"] #tdh-progress-body .exp-theme-swatch{flex-basis:16px!important;width:16px!important;height:16px!important;min-width:16px!important;min-height:16px!important;max-width:16px!important;max-height:16px!important}
      .appearance-separator{grid-column:1/-1;width:100%;border:0;border-top:1px solid var(--theme-line,#34343b);margin:3px 0 1px}
      .opacity-row{grid-column:1/-1;display:grid;grid-template-columns:auto minmax(72px,1fr) auto;align-items:center;gap:6px;min-width:0;padding:4px 0;border-top:1px solid #26262b}
      .opacity-row[hidden]{display:none!important}
      .opacity-row>span{font-size:11px;line-height:1.25;white-space:nowrap}
      #tdh-opacity-range{width:100%;min-width:0;accent-color:var(--theme-accent)}
      #tdh-opacity-value{min-width:34px;text-align:right;font-size:10px;font-weight:800;color:var(--theme-muted)}
      .cluster[data-panel-width="narrow"] .opacity-row{grid-template-columns:1fr auto}
      .cluster[data-panel-width="narrow"] #tdh-opacity-range{grid-column:1/-1}
      #tdh-refresh-now,#tdh-reset-session{border-color:#cb6868!important;background:#402020!important;color:#ffd7d7!important}
      #tdh-settings-launcher:hover {
        border-color:color-mix(in srgb,var(--theme-accent) 58%,transparent);
        background:color-mix(in srgb,var(--theme-panel,#18181b) 96%,var(--theme-accent) 4%);
        box-shadow:0 8px 24px #0007; transform:scale(1.015);
      }
      #tdh-settings-launcher[aria-expanded="true"] {
        border-color:color-mix(in srgb,var(--theme-accent) 72%,transparent);
        background:var(--theme-panel,#18181b);
        box-shadow:0 0 0 1px color-mix(in srgb,var(--theme-accent) 22%,transparent),0 8px 26px #0008;
        transform:scale(1.01);
      }
      #tdh-settings-launcher.is-dragging {
        cursor:grabbing; transform:scale(1.03); box-shadow:0 10px 28px #0009;
      }
      #tdh-settings-launcher.update-available::after {
        content:"↑"; position:absolute; top:-4px; right:-4px; width:14px; height:14px; display:grid; place-items:center;
        border:2px solid var(--theme-panel,#18181b); border-radius:4px; background:#f59e0b; color:#111114; font-size:8px; font-weight:950;
        box-shadow:0 2px 6px #0007; z-index:4; pointer-events:none;
      }
      #tdh-settings-launcher .ring { position:absolute; top:50%; left:50%; width:44px; height:44px; pointer-events:none; transform:translate(-50%,-50%); }
      #tdh-settings-launcher .track { fill:none; stroke:color-mix(in srgb,var(--theme-line,#34343b) 72%,transparent); stroke-width:2.5; }
      #tdh-settings-launcher .fill { fill:none; stroke:var(--theme-accent,#9147ff); stroke-width:2.5; stroke-linecap:round; transition:.2s stroke; }
      #tdh-settings-launcher .icon { position:absolute; top:50%; left:50%; width:40px; height:40px; pointer-events:none; z-index:1; transform:translate(-50%,-50%); }
      #tdh-tools-dock {
        position:fixed; right:12px; top:auto; bottom:auto;
        display:none; width:min(var(--dropper-width, 312px), calc(100vw - 24px)); max-width:calc(100vw - 24px);
        height:max-content; min-height:0; max-height:none; overflow:visible; flex:0 0 auto;
        transition:.15s width;
        padding:9px 9px 4px; background:var(--theme-bg); border:0; border-radius:14px; box-shadow:0 18px 50px #0008; color-scheme:dark;
      }
      #tdh-tools-dock.fl-rail-open { display:block; height:max-content; min-height:0; max-height:none; }
      #tdh-tools-dock:focus { outline:none; }
      .menu-head {
        position:relative;
        display:grid; grid-template-columns:minmax(0,1fr) auto;
        align-items:start; gap:8px; width:100%;
      }
      .header-actions { display:flex; align-items:flex-start; gap:5px; position:static; }
      .support-wrap { position:static; }
      #tdh-support-button, #tdh-rail-close {
        width:30px; height:30px; min-width:30px; padding:0;
        border:1px solid #3a3a42; border-radius:8px; background:#151519; color:#b8b8c0;
        cursor:pointer;
      }
      #tdh-support-button { display:grid; place-items:center; }
      #tdh-support-button svg { width:15px; height:15px; fill:currentColor; }
      #tdh-support-button:hover, #tdh-support-button:focus-visible {
        border-color:var(--theme-accent); color:var(--theme-accent2); background:#211b2b; outline:none;
      }
      .support-popover {
        position:absolute; z-index:14; top:35px; right:0;
        width:min(190px,100%); max-width:100%;
        box-sizing:border-box; padding:8px 9px;
        border:1px solid color-mix(in srgb,var(--theme-accent) 46%,var(--theme-line));
        border-radius:9px; background:var(--theme-panel); color:var(--theme-text);
        box-shadow:0 10px 28px #0009;
      }
      .support-popover[hidden] { display:none; }
      .support-popover strong { display:block; margin-bottom:3px; font-size:10px; }
      .support-popover span { display:block; color:var(--theme-muted); font-size:8px; line-height:1.35; }
      .support-popover a {
        display:flex; align-items:center; justify-content:center; min-height:26px; margin-top:7px; padding:0 9px;
        border:1px solid color-mix(in srgb,var(--theme-accent) 58%,var(--theme-line));
        border-radius:7px; background:color-mix(in srgb,var(--theme-panel) 76%,var(--theme-accent) 24%);
        color:var(--theme-text); text-decoration:none; font-size:9px; font-weight:800;
      }
      .support-popover a:hover, .support-popover a:focus-visible {
        border-color:var(--theme-accent2); outline:none;
        background:color-mix(in srgb,var(--theme-panel) 66%,var(--theme-accent) 34%);
      }
      .header-brand {
        display:grid; grid-template-columns:38px minmax(0,1fr);
        align-items:center; gap:8px; min-width:0; width:100%;
      }
      .header-icon {
        box-sizing:border-box; width:38px; height:38px; display:grid; place-items:center;
        border:1px solid color-mix(in srgb,var(--theme-accent) 48%,var(--theme-line));
        border-radius:9px; background:var(--theme-panel);
        box-shadow:inset 0 0 0 1px color-mix(in srgb,#000 22%,transparent);
      }
      .header-icon .menu-icon { width:38px; height:38px; display:block; }
      .header-copy { min-width:0; overflow:hidden; }
      .header-title-row { display:flex; align-items:center; gap:6px; min-width:0; flex-wrap:wrap; }
      #tdh-rail-title { margin:0; font-size:15px; font-weight:800; line-height:1.1; }
      #tdh-header-version {
        min-height:18px; padding:1px 6px; border:1px solid #4a3b61; border-radius:5px;
        background:#1b1721; color:#c9a7ff; cursor:pointer; font:800 8px/1 ui-sans-serif,system-ui,sans-serif;
        white-space:nowrap;
      }
      #tdh-header-version:hover, #tdh-header-version:focus-visible {
        border-color:#9147ff; background:#251d31; color:#fff; outline:none;
      }
      #tdh-rail-subtitle {
        margin-top:2px; font-size:9px; line-height:1.2; color:#adadb8;
        white-space:normal; overflow-wrap:anywhere;
      }
      #tdh-rail-close { font:18px/1 Arial,sans-serif; }
      #tdh-rail-close:hover, #tdh-rail-close:focus-visible { border-color:#9147ff; color:#fff; background:#211b2b; outline:none; }
      .header-divider { height:1px; width:100%; margin:5px 0; background:linear-gradient(90deg,transparent,#9147ff88 50%,transparent); }
      .update-notice {
        position:fixed; display:block; width:100%; max-width:calc(100vw - 24px); margin:0; padding:10px;
        box-sizing:border-box;
        border:1px solid color-mix(in srgb,var(--theme-accent) 62%,var(--theme-line)); border-radius:10px;
        background:
          linear-gradient(
            180deg,
            color-mix(in srgb,var(--theme-panel) 88%,var(--theme-accent) 12%),
            var(--theme-bg) 76%
          );
        color:var(--theme-text);
        box-shadow:0 10px 28px #0008; z-index:12;
      }
      .update-notice[hidden] { display:none; }
      .update-head { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; padding-right:22px; }
      .update-heading { min-width:0; }
      .update-kicker { margin-bottom:2px; color:var(--theme-accent2); font-size:8px; font-weight:900; letter-spacing:.08em; text-transform:uppercase; }
      .update-title { font-size:12px; line-height:1.25; font-weight:850; color:var(--theme-text); }
      .update-version {
        flex:none; padding:2px 6px;
        border:1px solid color-mix(in srgb,var(--theme-accent) 62%,var(--theme-line));
        border-radius:5px;
        background:color-mix(in srgb,var(--theme-panel) 82%,var(--theme-accent) 18%);
        color:var(--theme-text);
        font-size:8px; font-weight:800; white-space:nowrap;
      }
      .update-text { margin-top:6px; font-size:9px; line-height:1.45; color:var(--theme-muted); white-space:normal; overflow:visible; }
      .update-list { margin:7px 0 0; padding:0 0 0 15px; max-height:86px; overflow:auto; color:var(--theme-text); font-size:9px; line-height:1.4; scrollbar-width:thin; }
      .update-list li::marker { color:var(--theme-accent); }
      .update-list li + li { margin-top:3px; }
      .update-footer { display:flex; justify-content:flex-end; gap:6px; margin-top:8px; padding-top:7px; border-top:1px solid var(--theme-line); }
      .update-action, .update-release, .update-dismiss, .life-btn {
        border:1px solid var(--theme-line); border-radius:7px;
        background:var(--theme-bg); color:var(--theme-text); cursor:pointer;
      }
      .update-action, .update-release { min-height:27px; padding:0 10px; font-size:9px; font-weight:800; }
      .update-action { display:inline-flex; align-items:center; justify-content:center; text-decoration:none; }
      .update-action[hidden], .update-release[hidden] { display:none; }
      .update-action {
        border-color:var(--theme-accent);
        background:color-mix(in srgb,var(--theme-panel) 68%,var(--theme-accent) 32%);
        color:var(--theme-text);
      }
      .update-release {
        border-color:color-mix(in srgb,var(--theme-line) 78%,var(--theme-accent) 22%);
        background:var(--theme-panel);
        color:var(--theme-text);
      }
      .update-dismiss {
        position:absolute; top:7px; right:7px; width:23px; height:23px; padding:0;
        border-color:transparent; background:transparent; color:var(--theme-muted); font-size:15px; line-height:1;
      }
      .update-action:hover,
      .update-action:focus-visible,
      .update-release:hover,
      .update-release:focus-visible,
      .update-dismiss:hover,
      .update-dismiss:focus-visible,
      .life-btn:hover {
        border-color:var(--theme-accent);
        color:var(--theme-text);
        outline:none;
      }
      .update-action:hover,
      .update-action:focus-visible {
        background:color-mix(in srgb,var(--theme-panel) 55%,var(--theme-accent) 45%);
      }
      .update-release:hover,
      .update-release:focus-visible {
        background:color-mix(in srgb,var(--theme-panel) 88%,var(--theme-accent) 12%);
      }
            .cluster[data-theme-skin="gradient"] .update-notice {
        border:1px solid transparent;
        background-image:linear-gradient(var(--theme-panel),var(--theme-panel)),var(--theme-skin);
        background-origin:border-box;
        background-clip:padding-box,border-box;
      }
      .cluster[data-theme-skin="gradient"] .update-version,
      .cluster[data-theme-skin="gradient"] .update-action {
        border-color:transparent;
        background-image:linear-gradient(var(--theme-panel),var(--theme-panel)),var(--theme-skin);
        background-origin:border-box;
        background-clip:padding-box,border-box;
      }
      .toast { margin-bottom:7px; padding:6px 8px; border:1px solid #34343b; border-radius:8px; background:#18181b; color:#efeff1; font-size:9px; box-shadow:0 8px 24px #0006; }
      .toast[hidden] { display:none; }
      .fl-tool-panel { position:relative; margin-top:5px; border:1px solid #27272d; background:#19191e; border-radius:9px; overflow:visible; }
      .fl-tool-header { display:flex; justify-content:space-between; align-items:flex-start; height:auto; min-height:0; padding:7px 8px; cursor:pointer; border-radius:8px; }
      .fl-tool-header:hover { background:#9147ff18; }
      .fl-tool-header.last-opened { box-shadow:inset 3px 0 0 #b783ff; }
      .fl-tool-title { min-width:0; flex:1; font-size:12px; font-weight:700; white-space:normal; overflow-wrap:anywhere; }
      .fl-tool-chevron { background:none; border:0; color:#adadb8; cursor:pointer; }
      .fl-tool-body { padding:0 10px 8px; }
      .fl-tool-body:not(.fl-tool-hidden) { display:grid; height:auto; min-height:0; max-height:none; overflow:visible; grid-template-columns:repeat(2,minmax(0,1fr)); align-items:stretch; column-gap:8px; }
      .cluster[data-panel-width="compact"] .fl-tool-body:not(.fl-tool-hidden),
      .cluster[data-panel-width="narrow"] .fl-tool-body:not(.fl-tool-hidden) { grid-template-columns:minmax(0,1fr); }
      .cluster[data-panel-width="compact"] .fl-tool-body:not(.fl-tool-hidden) > *,
      .cluster[data-panel-width="narrow"] .fl-tool-body:not(.fl-tool-hidden) > * { grid-column:1/-1; }
      .fl-tool-body > :is(.fl-switch,.mini-row,.life-btn) { min-width:0; }
      .fl-tool-body > :is(.compact-inventory,.campaign-manager,.diag) { grid-column:1/-1; }
      #tdh-diagnostics-body { padding-bottom:2px; }
      .fl-tool-hidden { display:none !important; }
      .fl-switch, .mini-row { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; height:auto; min-height:0; padding:6px 0; }
      .fl-switch + .fl-switch, .mini-row + .mini-row { border-top:1px solid #26262b; }
      .fl-switch-text, .mini-row > span {
        min-width:0;
        font-size:11px;
        line-height:1.25;
        white-space:normal;
        word-break:normal;
        overflow-wrap:break-word;
        hyphens:none;
      }
      .toggleSwitch {
        position:relative; box-sizing:border-box; flex:none; width:34px; height:20px;
        border:1px solid color-mix(in srgb,var(--theme-line) 88%,var(--theme-muted) 12%);
        border-radius:6px;
        background:color-mix(in srgb,var(--theme-bg) 84%,var(--theme-panel) 16%);
        box-shadow:inset 0 1px 0 rgba(255,255,255,.018);
        cursor:pointer;
        transition:.15s background,.15s border-color;
      }
      .toggleSwitch::after {
        content:""; position:absolute; top:2px; left:2px; width:14px; height:14px;
        box-sizing:border-box; border:0; border-radius:4px;
        background:color-mix(in srgb,var(--theme-muted) 82%,var(--theme-text) 18%);
        box-shadow:none;
        transition:.15s transform,.15s background;
      }
      .toggleSwitch[aria-checked="true"] {
        border-color:color-mix(in srgb,var(--theme-line) 52%,var(--theme-accent) 48%);
        background:color-mix(in srgb,var(--theme-panel) 72%,var(--theme-accent) 28%);
      }
      .toggleSwitch[aria-checked="true"]::after {
        transform:translateX(14px);
        background:var(--theme-text);
      }
      .life-btn { width:100%; min-height:28px; margin-top:6px; font-size:11px; }
      .life-btn.last-opened { box-shadow:inset 3px 0 0 #b783ff; }
      .select-lite { min-width:0; max-width:72px; background:#111114; color:#efeff1; border:1px solid #34343b; border-radius:6px; padding:4px 6px; font-size:11px; }
      .auth-required {
        grid-column:1/-1;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
        margin-top:6px;
        padding:7px 8px;
        border:1px solid color-mix(in srgb,#f59e0b 46%,var(--theme-line));
        border-radius:7px;
        background:color-mix(in srgb,var(--theme-panel) 84%,#f59e0b 16%);
        color:#ffe5a8;
        font-size:10px;
        font-weight:800;
      }
      .auth-required[hidden] { display:none !important; }
      .auth-required .life-btn {
        width:auto;
        min-width:112px;
        margin:0;
        flex:0 0 auto;
      }
      #tdh-toggle-inventory,
      #tdh-refresh-campaign-data { grid-column:1/-1; }
      .auth-advanced { margin-top:2px; border:1px solid var(--theme-line); border-radius:7px; background:var(--theme-bg); padding:6px 8px; }
      .auth-advanced > summary { cursor:pointer; list-style:none; color:var(--theme-muted); font-size:11px; font-weight:600; user-select:none; }
      .auth-advanced > summary::-webkit-details-marker { display:none; }
      .auth-advanced[open] > summary { margin-bottom:6px; color:var(--theme-text); }
      .auth-advanced-body { display:flex; flex-direction:column; gap:6px; }
      .auth-hint { color:var(--theme-muted); font-size:10px; line-height:1.35; }
      .auth-input { width:100%; min-height:30px; border:1px solid var(--theme-line); border-radius:6px; background:var(--theme-panel); color:var(--theme-text); padding:6px 8px; font-size:11px; }
      .auth-input:focus { outline:none; border-color:var(--theme-accent); }
      .theme-row { grid-column:1/-1; display:flex; align-items:center; justify-content:space-between; gap:10px; min-height:28px; padding:6px 0; font-size:11px; }
      .exp-theme-swatch{box-sizing:border-box!important;flex:0 0 22px!important;width:22px!important;height:22px!important;min-width:22px!important;min-height:22px!important;max-width:22px!important;max-height:22px!important;padding:0!important;border-radius:5px!important}
      .exp-theme-swatches { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
      .exp-theme-swatch { appearance:none; width:18px; height:18px; min-width:18px; padding:0; border:2px solid var(--theme-line); border-radius:4px; box-sizing:border-box; cursor:pointer; }
      .exp-theme-swatch.is-on { border-color:var(--theme-text); box-shadow:0 0 0 2px var(--theme-accent); }
      .fl-tool-panel { border-color:var(--theme-line); background:var(--theme-panel); }
      .fl-tool-body, .select-lite, .life-btn { border-color:var(--theme-line); background:var(--theme-bg); color:var(--theme-text); }
      .fl-tool-chevron, #tdh-rail-subtitle, .compact-extra { color:var(--theme-muted); }
      .cluster[data-ui-theme="contrast"] .toggleSwitch { border:2px solid #fff; background:#050505; }
      .cluster[data-ui-theme="contrast"] .toggleSwitch::after { top:0; left:0; border:1px solid #050505; background:#fff; }
      .cluster[data-ui-theme="contrast"] .toggleSwitch[aria-checked="true"] { background:#fff; border-color:#fff; }
      .cluster[data-ui-theme="contrast"] .toggleSwitch[aria-checked="true"]::after { background:#050505; border-color:#fff; transform:translateX(14px); }
      @media (forced-colors: active) {
        .toggleSwitch { forced-color-adjust:none; border:1px solid CanvasText; background:Canvas; }
        .toggleSwitch::after { border-color:CanvasText; background:CanvasText; }
        .toggleSwitch[aria-checked="true"] { border-color:Highlight; background:Highlight; }
        .toggleSwitch[aria-checked="true"]::after { border-color:HighlightText; background:HighlightText; }
      }
            .cluster[data-theme-skin="gradient"] #tdh-tools-dock {
        border:1px solid transparent !important;
        background-origin:border-box !important;
        background-clip:padding-box, border-box !important;
        background-image:linear-gradient(var(--theme-bg),var(--theme-bg)),var(--theme-skin) !important;
      }
      .cluster[data-theme-skin="gradient"] #tdh-settings-launcher {
        border-color:color-mix(in srgb,var(--theme-accent) 30%,transparent) !important;
        background:var(--theme-panel) !important;
        background-image:none !important;
      }
      .cluster[data-theme-skin="gradient"] #tdh-settings-launcher:hover {
        border-color:color-mix(in srgb,var(--theme-accent) 58%,transparent) !important;
        background:color-mix(in srgb,var(--theme-panel) 96%,var(--theme-accent) 4%) !important;
        background-image:none !important;
      }
      .cluster[data-theme-skin="gradient"] #tdh-settings-launcher[aria-expanded="true"] {
        border:1px solid transparent !important;
        background-image:linear-gradient(var(--theme-panel),var(--theme-panel)),var(--theme-skin) !important;
        background-origin:border-box !important;
        background-clip:padding-box,border-box !important;
      }
      .cluster[data-theme-skin="gradient"] #tdh-header-version {
        border:1px solid var(--theme-line);
        background:var(--theme-bg);
        color:var(--theme-text);
        border-radius:6px;
      }
      .cluster[data-theme-skin="gradient"] #tdh-header-version:hover,
      .cluster[data-theme-skin="gradient"] #tdh-header-version:focus-visible {
        border-color:transparent;
        background-image:linear-gradient(var(--theme-panel),var(--theme-panel)),var(--theme-skin);
        background-origin:border-box;
        background-clip:padding-box,border-box;
      }
      .cluster[data-theme-skin="gradient"] .header-divider {
        height:2px;
        border-radius:2px;
        opacity:.9;
        background:var(--theme-skin);
        -webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 16%,#000 84%,transparent 100%);
        mask-image:linear-gradient(90deg,transparent 0%,#000 16%,#000 84%,transparent 100%);
      }
      .cluster[data-theme-skin="gradient"] .drop-bar > span {
        background:var(--theme-accent) !important;
      }
      .cluster[data-theme-skin="gradient"] .progress-head .drop-percent {
        color:var(--theme-accent2) !important;
      }
      .cluster[data-theme-skin="gradient"]:not([data-ui-theme="contrast"]) .toggleSwitch[aria-checked="true"] {
        border-color:color-mix(in srgb,var(--theme-line) 52%,var(--theme-accent) 48%);
        background:color-mix(in srgb,var(--theme-panel) 72%,var(--theme-accent) 28%);
      }
      .cluster[data-theme-skin="gradient"] .exp-theme-swatch.is-on {
        border-color:var(--theme-text);
        box-shadow:0 0 0 2px var(--theme-accent2);
      }
      .cluster[data-theme-skin="gradient"] :is(.fl-tool-header,.life-btn).last-opened {
        box-shadow:none;
        position:relative;
      }
      .cluster[data-theme-skin="gradient"] :is(.fl-tool-header,.life-btn).last-opened::before {
        content:"";
        position:absolute;
        left:0;
        top:4px;
        bottom:4px;
        width:2px;
        border-radius:2px;
        background:var(--theme-skin-vertical);
      }
      .cluster[data-theme-skin="gradient"] .fl-tool-header:hover,
      .cluster[data-theme-skin="gradient"] .fl-tool-header:focus-visible,
      .cluster[data-theme-skin="gradient"] .fl-tool-header[aria-expanded="true"] {
        background:color-mix(in srgb,var(--theme-panel) 88%,var(--theme-accent) 12%);
      }
      .cluster[data-theme-skin="gradient"] :is(.life-btn,.select-lite,.auth-input):focus-visible,
      .cluster[data-theme-skin="gradient"] .skip-streamer-chip:focus-visible {
        outline:2px solid transparent !important;
        border-color:transparent !important;
        background-origin:border-box !important;
        background-clip:padding-box,border-box !important;
        background-image:linear-gradient(var(--theme-bg),var(--theme-bg)),var(--theme-skin) !important;
      }
      .cluster[data-ui-theme="warm"] #tdh-tools-dock {
        border:1px solid color-mix(in srgb,var(--theme-line) 84%,var(--theme-accent) 16%) !important;
        background-image:
          radial-gradient(120% 65% at 50% -18%,color-mix(in srgb,var(--theme-accent) 9%,transparent),transparent 72%),
          linear-gradient(180deg,color-mix(in srgb,var(--theme-panel) 42%,var(--theme-bg) 58%),var(--theme-bg) 44%) !important;
        background-clip:padding-box !important;
        box-shadow:0 18px 50px #0009,inset 0 1px 0 #ffedcf12;
      }
      .cluster[data-ui-theme="warm"] .header-icon {
        background:linear-gradient(155deg,color-mix(in srgb,var(--theme-accent) 13%,var(--theme-panel)),var(--theme-panel) 70%);
        box-shadow:inset 0 1px 0 #ffedcf20,0 2px 9px #0005;
      }
      .cluster[data-ui-theme="warm"] #tdh-header-version {
        border-color:color-mix(in srgb,var(--theme-line) 66%,var(--theme-accent) 34%);
        background:color-mix(in srgb,var(--theme-panel) 88%,var(--theme-accent) 12%);
        color:var(--theme-accent2);
      }
      .cluster[data-ui-theme="warm"] #tdh-rail-close {
        border-color:var(--theme-line);background:var(--theme-panel);color:var(--theme-muted);
      }
      .cluster[data-ui-theme="warm"] .header-divider {
        background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--theme-accent) 55%,transparent) 50%,transparent);
      }
      .cluster[data-ui-theme="warm"] :is(.fl-tool-header,.life-btn):not(.last-opened) {
        box-shadow:inset 0 1px 0 #ffedcf0a;
      }
      .cluster[data-ui-theme="contrast"] .toggleSwitch[aria-checked="true"] {
        background:#fff;
        border-color:#fff;
      }
      .cluster[data-ui-theme="contrast"] .toggleSwitch[aria-checked="true"]::after {
        background:#050505;
        border-color:#fff;
      }
      .compact-inventory { display:none; margin-top:6px; border:1px solid #9147ff55; background:#111114; border-radius:9px; overflow:hidden; }
      .compact-inventory.open { display:block; }
      .campaign-manager { margin-top:6px; border:1px solid color-mix(in srgb,var(--theme-accent) 34%,var(--theme-line)); border-radius:9px; background:var(--theme-bg); overflow:hidden; }
      .campaign-manager > summary { list-style:none; display:flex; align-items:center; justify-content:space-between; gap:8px; padding:7px 8px; cursor:pointer; }
      .campaign-manager > summary::-webkit-details-marker { display:none; }
      .campaign-manager-title { min-width:0; font-size:11px; font-weight:800; color:var(--theme-text); }
      .campaign-manager-summary { flex:0 0 auto; font-size:8px; font-weight:700; color:var(--theme-muted); }
      .campaign-manager[open] > summary { border-bottom:1px solid var(--theme-line); }
      .campaign-manager-note { padding:6px 8px 3px; font-size:8px; line-height:1.35; color:var(--theme-muted); }
      .eligibility-chip {
        grid-column:1/-1; margin-top:6px;
        border:1px solid color-mix(in srgb,var(--theme-line) 68%,var(--theme-accent) 32%);
        border-radius:8px; background:var(--theme-panel); overflow:hidden;
      }
      .eligibility-chip > summary {
        list-style:none; display:flex; align-items:center; gap:6px; min-height:28px;
        box-sizing:border-box; padding:5px 8px; cursor:pointer;
        color:var(--theme-text); font-size:9px; font-weight:800;
      }
      .eligibility-chip > summary::-webkit-details-marker { display:none; }
      .eligibility-chip > summary::after {
        content:"▸"; margin-left:auto; color:var(--theme-muted); font-size:9px; transition:.12s transform;
      }
      .eligibility-chip[open] > summary::after { transform:rotate(90deg); }
      .eligibility-chip[data-tone="good"] { border-color:color-mix(in srgb,#3ac978 58%,var(--theme-line)); }
      .eligibility-chip[data-tone="warn"] { border-color:color-mix(in srgb,#e2b34a 58%,var(--theme-line)); }
      .eligibility-chip[data-tone="bad"] { border-color:color-mix(in srgb,#df5b65 58%,var(--theme-line)); }
      .eligibility-chip[data-tone="muted"] { border-color:var(--theme-line); }
      .eligibility-detail {
        padding:0 8px 7px; border-top:1px solid var(--theme-line);
        color:var(--theme-muted); font-size:8px; line-height:1.4;
      }
      .eligibility-detail[hidden] { display:none; }
      .campaign-game-list { max-height:240px; overflow:auto; padding:2px 7px 6px; }
      .campaign-game-row { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:8px; align-items:center; min-height:36px; padding:6px 0; }
      .campaign-game-row + .campaign-game-row { border-top:1px solid #242429; }
      .campaign-game-copy { min-width:0; }
      .campaign-game-name { overflow:hidden; color:var(--theme-text); font-size:10px; font-weight:800; text-overflow:ellipsis; white-space:nowrap; }
      .campaign-game-meta { margin-top:2px; color:var(--theme-muted); font-size:8px; line-height:1.3; }
      .campaign-ignore-check { position:relative; box-sizing:border-box; width:22px; height:22px; padding:0; border:1px solid var(--theme-line); border-radius:6px; background:var(--theme-panel); color:var(--theme-text); cursor:pointer; }
      .campaign-ignore-check::after { content:""; position:absolute; inset:4px; border-radius:3px; background:transparent; }
      .campaign-ignore-check[aria-checked="true"] { border-color:var(--theme-accent); background:color-mix(in srgb,var(--theme-panel) 70%,var(--theme-accent) 30%); }
      .campaign-ignore-check[aria-checked="true"]::after { content:"✓"; display:grid; place-items:center; inset:0; background:transparent; color:var(--theme-text); font-size:13px; font-weight:900; }
      .campaign-ignore-check:focus-visible { outline:2px solid var(--theme-accent2); outline-offset:2px; }
      .inventory-head { padding:7px 8px; border-bottom:1px solid #2a2a30; display:flex; align-items:center; justify-content:space-between; gap:8px; }
      .inventory-head strong { font-size:11px; }
      .inventory-head span { font-size:9px; color:#adadb8; }
      .inventory-list { padding:3px 7px 6px; }
      .inventory-item { display:grid; grid-template-columns:24px minmax(0,1fr) auto; gap:7px; align-items:center; padding:6px 0; }
      .inventory-item + .inventory-item { border-top:1px solid #242429; }
      .reward-thumb { width:24px; height:24px; border-radius:6px; background:linear-gradient(135deg,#9147ff,#5c16c5); display:grid; place-items:center; font-size:9px; font-weight:900; color:#fff; }
      .reward-copy { min-width:0; }
      .reward-name { font-size:10px; font-weight:800; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .reward-meta { margin-top:1px; font-size:8px; color:#adadb8; }
      .reward-state { font-size:8px; font-weight:800; color:#bf94ff; white-space:nowrap; }
      .queue-list { display:block; }
      .queue-collapsible {
        grid-column:1/-1;
        margin-top:6px;
        border:1px solid color-mix(in srgb,var(--theme-accent) 34%,var(--theme-line));
        border-radius:9px;
        background:var(--theme-bg);
        overflow:hidden;
      }
      .queue-collapsible > summary {
        list-style:none;
      }
      .queue-collapsible > summary::-webkit-details-marker {
        display:none;
      }
      .queue-summary-head {
        min-height:32px;
        padding:7px 8px;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
        cursor:pointer;
        user-select:none;
      }
      .queue-summary-head:hover,
      .queue-summary-head:focus-visible {
        background:color-mix(in srgb,var(--theme-panel) 88%,var(--theme-accent) 12%);
        outline:none;
      }
      .queue-summary-head > div {
        min-width:0;
        display:flex;
        align-items:baseline;
        gap:4px;
      }
      .queue-summary-head strong {
        font-size:10px;
        white-space:nowrap;
      }
      .queue-summary-head span:not(.queue-summary-chevron) {
        min-width:0;
        color:var(--theme-muted);
        font-size:8px;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      }
      .queue-summary-chevron {
        flex:0 0 auto;
        color:var(--theme-muted);
        font-size:11px;
        transition:.15s transform;
      }
      .queue-collapsible[open] .queue-summary-chevron {
        transform:rotate(90deg);
      }
      .queue-collapsible[open] .inventory-list {
        border-top:1px solid var(--theme-line);
      }
      .diag { display:none; box-sizing:border-box;width:100%;min-width:0;height:160px;max-height:160px;overflow:auto;overscroll-behavior:contain;overflow-wrap:anywhere;box-shadow:inset 0 2px 6px #0006; margin-top:6px; padding:7px; border:1px solid #2b2b31; border-radius:7px; background:#101014; font:9px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace; color:#b8b8c0; white-space:pre-wrap; }
      .diag.open { display:block; }
      .has-tooltip { position:relative; }
      .has-tooltip::after { content:attr(data-tip); position:absolute; left:0; top:calc(100% + 4px); width:min(190px, calc(100vw - 48px)); max-width:100%; padding:6px 8px; border:1px solid #3b3b44; border-radius:7px; background:#0e0e10; color:#efeff1; box-shadow:0 6px 18px #0007; box-sizing:border-box; font-size:10px; line-height:1.35; white-space:normal; overflow-wrap:anywhere; opacity:0; pointer-events:none; z-index:999; transform:translateY(-2px); transition:.12s opacity,.12s transform; }
      .has-tooltip:hover::after, .has-tooltip:focus-visible::after { opacity:1; transform:translateY(0); }
      .reduce-motion *, .reduce-motion *::before, .reduce-motion *::after { animation:none !important; transition:none !important; }
      @media (max-width:700px) {
        .badge-row { width:100%; }
        #tdh-drop-card { flex:1 1 auto; width:auto; min-width:0; max-width:none; }
      }
    `;
  }

function protectLauncherHost(host) {
    host = host?.getRootNode?.().host || host;
    if (!host || host.nodeType !== 1) return () => {};
    host.dataset.expOwned = '1';
    const shadow = host.shadowRoot;
    const hostCss = `:host{all:initial!important;position:fixed!important;top:0!important;left:0!important;right:auto!important;bottom:auto!important;display:block!important;width:0!important;height:0!important;min-width:0!important;min-height:0!important;max-width:none!important;max-height:none!important;margin:0!important;padding:0!important;border:0!important;overflow:visible!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;z-index:2147483647!important;isolation:isolate!important;transform:none!important;filter:none!important;clip:auto!important;clip-path:none!important;contain:none!important;content-visibility:visible!important;mix-blend-mode:normal!important}`;
    let protectionSheet = null;
    let protectionStyle = null;
    let repairing = false;
    const installHostCss = () => {
      if (!shadow) return;
      try {
        const current = shadow.adoptedStyleSheets;
        if (protectionSheet && current?.includes?.(protectionSheet)) return;
        const view = host.ownerDocument?.defaultView || window;
        const Sheet = view.CSSStyleSheet || (typeof CSSStyleSheet === 'function' ? CSSStyleSheet : null);
        if (typeof Sheet === 'function' && Sheet.prototype?.replaceSync && current && typeof current[Symbol.iterator] === 'function') {
          if (!protectionSheet) {
            protectionSheet = new Sheet();
            protectionSheet.replaceSync(hostCss);
          }
          if (![...current].includes(protectionSheet)) shadow.adoptedStyleSheets = [...current, protectionSheet];
          return;
        }
      } catch {}
      if (!protectionStyle) {
        protectionStyle = document.createElement('style');
        protectionStyle.dataset.expHostProtection = '1';
        protectionStyle.textContent = hostCss;
      }
      if (!protectionStyle.isConnected) {
        try { shadow.prepend(protectionStyle); } catch {}
      }
    };
    const ensure = () => {
      if (repairing) return;
      repairing = true;
      try {
        const root = document.documentElement;
        if (root && host.parentNode !== root) root.append(host);
        if (host.hidden) host.hidden = false;
        host.removeAttribute('hidden');
        host.removeAttribute('inert');
        if (host.getAttribute('aria-hidden') === 'true') host.removeAttribute('aria-hidden');
        installHostCss();
        if (typeof host.showPopover === 'function') {
          if (host.getAttribute('popover') !== 'manual') host.setAttribute('popover', 'manual');
          let open = false;
          try { open = host.matches(':popover-open'); } catch {}
          if (!open) { try { host.showPopover(); } catch {} }
        }
      } catch {}
      repairing = false;
    };
    ensure();
    const hostObserver = new MutationObserver(() => queueMicrotask(ensure));
    hostObserver.observe(host, { attributes: true, attributeFilter: ['hidden', 'inert', 'aria-hidden', 'popover'] });
    const rootObserver = new MutationObserver(() => {
      if (host.parentNode !== document.documentElement) queueMicrotask(ensure);
    });
    rootObserver.observe(document.documentElement, { childList: true });
    const timer = setInterval(ensure, 2000);
    const onToggle = () => queueMicrotask(ensure);
    host.addEventListener('toggle', onToggle);
    return () => {
      hostObserver.disconnect();
      rootObserver.disconnect();
      clearInterval(timer);
      host.removeEventListener('toggle', onToggle);
      if (protectionSheet && shadow?.adoptedStyleSheets) {
        try { shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets].filter((sheet) => sheet !== protectionSheet); } catch {}
      }
      try { protectionStyle?.remove(); } catch {}
    };
  }

function compareVersions(a, b) {
    const pa = String(a).split(".").map(Number), pb = String(b).split(".").map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) { const diff = (pa[i] || 0) - (pb[i] || 0); if (diff) return diff; }
    return 0;
  }
return Object.freeze({ PRIDE_RAINBOW, PRIDE_RAINBOW_VERTICAL, CRIMSON_THEME, UI_THEMES, css, protectLauncherHost, compareVersions });
})();

/* Local diagnostic capture shared at build time by ExtraPotions products. */
const ExtraPotionsDiagnostics = (() => {
  const LIMIT = 100;
  const supportedProducts = ['ward', 'dropper', 'prisma', 'shift'];
  const protocol = 'exp-core-coordination-v1';
  const entries = [], hooks = [], registrations = new Map();
  const startedAt = new Date().toISOString();
  let omitted = 0, recording = false, active = true;
  const redact = value => String(value)
    .replace(/https?:\/\/[^\s"<>]+/gi, '[url]')
    .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '[email]')
    .replace(/\b(Bearer|OAuth)\s+\S+/gi, '$1 [redacted]')
    .replace(/\b(token|password|secret|authorization|cookie)\s*[:=]\s*[^\s,;]+/gi, '$1=[redacted]')
    .replace(/\b\d{3}-\d{7}-\d{7}\b/g, '[order-id]')
    .replace(/\b[A-Za-z0-9_-]{40,}\b/g, '[opaque-id]')
    .slice(0, 2000);
  function clean(value, depth = 0, seen = new WeakSet()) {
    if (depth > 8) return '[depth limit]';
    if (typeof value === 'string') return redact(value);
    if (typeof value === 'bigint') return String(value);
    if (typeof value === 'function' || typeof value === 'symbol') return undefined;
    if (!value || typeof value !== 'object') return value;
    if (value instanceof Node || value === window) return undefined;
    if (seen.has(value)) return '[circular]';
    seen.add(value);
    try {
      if (value instanceof Error) return { name: redact(value.name), message: redact(value.message), stack: redact(value.stack || '') };
      if (Array.isArray(value)) return value.slice(0, 100).map(item => clean(item, depth + 1, seen));
      const result = {};
      for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value)).slice(0, 150)) {
        if (/token|cookie|authorization|password|secret|pageText|innerHTML|outerHTML|formValue|matchText|__proto__|constructor|prototype/i.test(key)) continue;
        if (!('value' in descriptor)) continue;
        const item = clean(descriptor.value, depth + 1, seen);
        if (item !== undefined) result[key] = item;
      }
      return result;
    } catch { return '[unavailable]'; } finally { seen.delete(value); }
  }
  function record(level, kind, values) {
    if (recording || !active) return;
    recording = true;
    try {
      entries.push({ at: new Date().toISOString(), level, kind, values: clean(values.slice(0, 10)) });
      if (entries.length > LIMIT) { entries.shift(); omitted += 1; }
    } catch {} finally { recording = false; }
  }
  for (const level of ['debug', 'log', 'info', 'warn', 'error']) {
    try {
      const original = console[level];
      if (typeof original !== 'function') continue;
      const wrapped = function(...args) { record(level, 'console', args); return Reflect.apply(original, this, args); };
      console[level] = wrapped;
      if (console[level] === wrapped) hooks.push({ level, original, wrapped });
    } catch {}
  }
  function resourceErrorDetails(target) {
    const element = target?.tagName || 'unknown';
    const root = target?.getRootNode?.();
    const host = root?.host || null;
    const productId = host?.dataset?.productId || host?.dataset?.expDiagnosticsProduct || null;
    const owned = Boolean(
      productId ||
      host?.dataset?.expOwned === '1' ||
      target?.dataset?.expOwned === '1'
    );
    let assetHost = null;
    try {
      const raw = target?.currentSrc || target?.src || target?.href || '';
      assetHost = raw ? new URL(raw, location.href).hostname : null;
    } catch {}
    return {
      element,
      owner: owned ? (productId || 'extrapotions') : 'page',
      assetHost,
    };
  }
  const onError = event => record('error', event.target === window ? 'runtime-error' : 'resource-error',
    event.target === window
      ? [event.error || event.message, { line: event.lineno, column: event.colno }]
      : [resourceErrorDetails(event.target)]);
  const onRejection = event => record('error', 'unhandled-rejection', [event.reason]);
  addEventListener('error', onError, true);
  addEventListener('unhandledrejection', onRejection);

  function registerProduct(id, version, host) {
    id = String(id).toLowerCase();
    if (!supportedProducts.includes(id)) return null;
    let marker = registrations.get(id);
    if (!marker) {
      marker = document.createElement('meta');
      marker.dataset.expOwned = '1';
      marker.dataset.expDiagnosticsProduct = id;
      marker.dataset.expProductVersion = String(version || 'unknown').slice(0, 40);
      marker.dataset.expCoordinationProtocol = protocol;
      marker.dataset.expDiagnosticsInstance = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      registrations.set(id, marker);
    }
    if (!marker.isConnected) (document.head || document.documentElement)?.append(marker);
    if (host) host.dataset.expDiagnosticsInstance = marker.dataset.expDiagnosticsInstance;
    return marker;
  }
  addEventListener('DOMContentLoaded', () => { for (const marker of registrations.values()) if (!marker.isConnected) (document.head || document.documentElement)?.append(marker); }, { once: true });
  function compatibility() {
    const markers = [...document.querySelectorAll('meta[data-exp-diagnostics-product]')];
    const hosts = [...document.querySelectorAll('[data-exp-product-launcher="1"][data-product-id]')];
    const conflicts = [];
    const products = supportedProducts.map(id => {
      const records = markers.filter(n => n.dataset.expDiagnosticsProduct === id);
      const launchers = hosts.filter(n => n.dataset.productId === id);
      const versions = [...new Set(records.map(n => redact(n.dataset.expProductVersion || 'unknown')))];
      const protocols = [...new Set(records.map(n => redact(n.dataset.expCoordinationProtocol || 'unknown')))];
      if (records.length > 1 || launchers.length > 1) conflicts.push({ type: 'duplicate-product', products: [id], instances: Math.max(records.length, launchers.length) });
      if (protocols.some(p => p !== protocol && p !== 'unknown')) conflicts.push({ type: 'protocol-mismatch', products: [id], protocols });
      return { id, status: records.length || launchers.length ? 'observed' : 'not-observed', versions, protocols, instances: Math.max(records.length, launchers.length), launchers: launchers.length };
    });
    const boxes = hosts.map(host => {
      // An inaccessible shadow or unknown box is not evidence of a collision.
      const launcher = host.shadowRoot?.querySelector('[data-exp-part="launcher"],.ward-launcher,.launcher,#tdh-settings-launcher');
      if (!launcher || !launcher.getClientRects().length || getComputedStyle(launcher).visibility === 'hidden') return null;
      return { id: host.dataset.productId, box: launcher.getBoundingClientRect() };
    }).filter(x => x && supportedProducts.includes(x.id));
    for (let a = 0; a < boxes.length; a++) for (let b = a + 1; b < boxes.length; b++) {
      const x = boxes[a], y = boxes[b];
      if (Math.min(x.box.right, y.box.right) - Math.max(x.box.left, y.box.left) > 2 && Math.min(x.box.bottom, y.box.bottom) - Math.max(x.box.top, y.box.top) > 2)
        conflicts.push({ type: 'launcher-overlap', products: [x.id, y.id] });
    }
    return { scope: 'current-page', installationInventory: 'unavailable', products, conflicts,
      status: conflicts.length ? 'conflicts-detected' : 'no-conflicts-observed',
      limitations: ['Disabled products and products outside their match rules cannot be enumerated.', 'Only reported registrations, protocol mismatches, duplicate instances and observable launcher overlap are checked.'] };
  }
  function createReport(product, details = {}, core = {}) {
    const { host, shadow: suppliedShadow, ...rest } = details;
    const shadow = suppliedShadow || host?.shadowRoot;
    const id = String(product || 'ExtraPotions').toLowerCase();
    const registration = registerProduct(id, details.product?.version || details.version, host);
    const data = clean(rest);
    const count = selector => document.querySelectorAll(selector).length;
    const navigation = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource');
    const byType = {};
    for (const entry of resources) {
      const summary = byType[entry.initiatorType || 'other'] ||= { count: 0, durationMs: 0, transferBytes: 0 };
      summary.count++; summary.durationMs += Math.round(entry.duration); summary.transferBytes += entry.transferSize || 0;
    }
    const page = { origin: location.origin, protocol: location.protocol, readyState: document.readyState, contentType: document.contentType, characterSet: document.characterSet, compatibilityMode: document.compatMode, language: document.documentElement?.lang || null, direction: document.documentElement?.dir || 'auto',
      structure: { elements: count('*'), headings: count('h1,h2,h3,h4,h5,h6'), links: count('a[href]'), forms: count('form'), inputs: count('input,select,textarea'), buttons: count('button,[role="button"]'), images: count('img'), videos: count('video'), audio: count('audio'), frames: count('iframe'), scripts: count('script'), stylesheets: document.styleSheets.length },
      layout: { documentWidth: document.documentElement?.scrollWidth || 0, documentHeight: document.documentElement?.scrollHeight || 0, scrollX, scrollY, horizontalOverflow: (document.documentElement?.scrollWidth || 0) > innerWidth },
      preferences: { reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, darkColorScheme: matchMedia('(prefers-color-scheme: dark)').matches, forcedColors: matchMedia('(forced-colors: active)').matches },
      performance: { navigation: navigation ? { type: navigation.type, durationMs: Math.round(navigation.duration), responseMs: Math.round(navigation.responseEnd), domInteractiveMs: Math.round(navigation.domInteractive), domContentLoadedMs: Math.round(navigation.domContentLoadedEventEnd), loadMs: Math.round(navigation.loadEventEnd), redirectCount: navigation.redirectCount } : null, resources: { count: resources.length, byType }, paint: performance.getEntriesByType('paint').map(e => ({ name: e.name, startMs: Math.round(e.startTime) })) },
      privacy: { pageText: 'excluded', formValues: 'excluded', urlPathsAndQueries: 'excluded', resourceUrls: 'excluded', cookiesAndStorage: 'excluded; sanitized plugin state supplied separately' } };
    const environment = { hostname: location.hostname, topLevelContext: window.top === window.self, visibility: document.visibilityState, online: navigator.onLine, language: navigator.language, userAgent: navigator.userAgent, viewport: { width: innerWidth, height: innerHeight, pixelRatio: devicePixelRatio } };
    const rect = n => { const b = n.getBoundingClientRect(); return { width: b.width, height: b.height, x: b.x, y: b.y, visible: !!n.getClientRects().length && getComputedStyle(n).visibility !== 'hidden' }; };
    const first = selector => shadow?.querySelector(selector) || null;
    const visibleFirst = selector => [...(shadow?.querySelectorAll(selector) || [])].find(n => !n.hidden && n.getClientRects().length) || first(selector);
    const progressCard = first('#tdh-drop-card,[data-exp-part="progress-card"]');
    const launcher = first('[data-exp-part="launcher"],.ward-launcher,.launcher,#tdh-settings-launcher');
    const launcherRow = first('[data-exp-part="launcher-row"],.badge-row');
    const menu = first('[data-exp-part="dock"],#tdh-tools-dock,.panel,.ward');
    const notice = visibleFirst('#tdh-update-notice,[data-exp-update-notice],.update-notice,.changelog');
    const uiGeometry = {
      progressCardRect: progressCard ? rect(progressCard) : null,
      launcherRect: launcher ? rect(launcher) : null,
      launcherRowRect: launcherRow ? rect(launcherRow) : null,
      menuRect: menu ? rect(menu) : null,
      noticeRect: notice ? rect(notice) : null,
    };
    const ui = {
      mounted: !!host?.isConnected,
      menuWidthMode: host?.dataset.menuWidth || null,
      uiGeometry,
      progressPanelWidth: progressCard ? Math.round(progressCard.getBoundingClientRect().width) : null,
      launcherRowWidth: launcherRow ? Math.round(launcherRow.getBoundingClientRect().width) : null,
      menuWidth: menu ? Math.round(menu.getBoundingClientRect().width) : null,
      noticeWidth: notice && !notice.hidden ? Math.round(notice.getBoundingClientRect().width) : null,
      surfaces: [...(shadow?.querySelectorAll('.panel,.ward,#tdh-tools-dock,[data-exp-part="dock"]') || [])].map(rect),
      categories: [...(shadow?.querySelectorAll('.route,.nav-item,.fl-tool-header') || [])].map(n => ({ name: redact(n.textContent.trim()), expanded: n.getAttribute('aria-expanded') })),
      swatches: [...(shadow?.querySelectorAll('.exp-theme-swatch') || [])].map(n => ({ name: n.getAttribute('aria-label'), selected: n.getAttribute('aria-pressed'), ...rect(n) })),
    };
    let manager = null;
    try { if (typeof GM_info === 'object') manager = { name: GM_info.scriptHandler || null, version: GM_info.version || null, injectInto: GM_info.injectInto || null }; } catch {}
    return { ...data, report: `${product} Diagnostics`, schemaVersion: 3, generatedAt: new Date().toISOString(), page,
      technical: { environment, manager, core: clean(core), ui, capabilities: { mutationObserver: typeof MutationObserver === 'function', constructedStylesheets: typeof CSSStyleSheet === 'function' && 'replaceSync' in CSSStyleSheet.prototype, clipboard: !!navigator.clipboard, trustedTypes: !!globalThis.trustedTypes } },
      console: { startedAt, scope: 'accessible-userscript-realm-and-window-events', limit: LIMIT, omitted, hooks: hooks.map(h => ({ level: h.level, installed: console[h.level] === h.wrapped })), entries: clean(entries), limitations: ['No DevTools history, browser-internal logs, or inaccessible isolated-world console messages.', 'Messages are redacted and bounded; attribution to another script is not inferred.'] },
      plugin: { id, version: data.product?.version || data.version || registration?.dataset.expProductVersion || null, state: data, compatibility: compatibility() },
      environment, ui, core: data.core || clean(core) };
  }
  function dispose() {
    active = false;
    for (const {level, original, wrapped} of hooks) if (console[level] === wrapped) console[level] = original;
    removeEventListener('error', onError, true); removeEventListener('unhandledrejection', onRejection);
    for (const marker of registrations.values()) marker.remove();
  }
  // Dropper is the source of truth: Show/Hide first, Copy second, transient
  // Diagnostics Copied / Copy Failed feedback, and fresh reports per action.
  function bindControls({ show, copy, output, getReport, notify = () => {}, onShow = () => {}, onCopy = () => {} }) {
    let timer, generation = 0;
    output.hidden = true; output.setAttribute('role', 'region');
    output.setAttribute('aria-label', 'Page, technical, console, and plugin diagnostics'); output.tabIndex = 0;
    show.setAttribute('aria-expanded', 'false');
    const showClick = async () => {
      const opening = output.hidden, ticket = ++generation;
      output.hidden = !opening; output.classList.toggle('open', opening);
      show.textContent = opening ? 'Hide Diagnostics' : 'Show Diagnostics';
      show.setAttribute('aria-expanded', String(opening)); show.classList.toggle('last-opened', opening);
      if (opening) {
        try { const report = await getReport(); if (ticket === generation) output.textContent = JSON.stringify(report, null, 2); }
        catch { if (ticket === generation) output.textContent = 'Diagnostics unavailable.'; notify('Could not generate diagnostics.'); }
      }
      onShow(opening);
    };
    const copyClick = async () => {
      copy.disabled = true; clearTimeout(timer);
      try {
        await navigator.clipboard.writeText(JSON.stringify(await getReport(), null, 2));
        copy.textContent = 'Diagnostics Copied'; onCopy();
      } catch { copy.textContent = 'Copy Failed'; notify('Could not copy diagnostics. Use Show Diagnostics.'); }
      finally { copy.disabled = false; timer = setTimeout(() => { copy.textContent = 'Copy Diagnostics'; }, 1600); }
    };
    show.addEventListener('click', showClick); copy.addEventListener('click', copyClick);
    return () => { ++generation; clearTimeout(timer); show.removeEventListener('click', showClick); copy.removeEventListener('click', copyClick); };
  }
  function createControls(getReport, notify) {
    const wrapper = document.createElement('div'); wrapper.className = 'diagnostics-controls';
    const actions = document.createElement('div'); actions.className = 'action-pair';
    const show = document.createElement('button'), copy = document.createElement('button'), output = document.createElement('pre');
    for (const button of [show, copy]) { button.type = 'button'; button.className = 'life-btn action'; }
    show.textContent = 'Show Diagnostics'; copy.textContent = 'Copy Diagnostics'; output.className = 'diag';
    bindControls({ show, copy, output, getReport, notify });
    actions.append(show, copy); wrapper.append(actions, output); return wrapper;
  }
  return Object.freeze({ createReport, registerProduct, compatibility, bindControls, createControls, dispose });
})();

/* exp-core 3.2.19: canonical ExtraPotions shared runtime. */
function createProductLifecycle(shared) {
  const VERSION = shared.version;
  const PROTOCOL = 'exp-core-coordination-v1';
  const CAPABILITIES = new Set(['lifecycle', 'settings', 'diagnostics', 'dom-scheduler', 'navigation', 'launcher', 'ui']);
  const products = new Map();
  const cleanups = new Set();
  const errors = [];
  const metrics = { batches: 0, roots: 0, startedAt: Date.now() };
  let coordinator;
  const navigationSubscribers = new Set();
  let stopNavigationHooks;

  function compareVersions(left, right) {
    const a = String(left).split(/[.-]/).slice(0, 3).map((part) => Number(part) || 0);
    const b = String(right).split(/[.-]/).slice(0, 3).map((part) => Number(part) || 0);
    for (let index = 0; index < 3; index += 1) if (a[index] !== b[index]) return a[index] > b[index] ? 1 : -1;
    return 0;
  }

  function negotiate(peerVersion, peerProtocol = PROTOCOL) {
    if (peerProtocol !== PROTOCOL || !/^\d+\.\d+\.\d+/.test(peerVersion || '')) return { compatible: false, selection: 'isolated', reason: 'PROTOCOL_INCOMPATIBLE' };
    const comparison = compareVersions(VERSION, peerVersion);
    return { compatible: true, selection: comparison < 0 ? 'peer-newer' : comparison > 0 ? 'local-newer' : 'equal', reason: 'COMPATIBLE' };
  }

  const safeError = (error, source = 'core') => {
    const message = String(error && error.message || error || 'Unknown error').replace(/https?:\/\/\S+/g, '[url]').slice(0, 180);
    errors.push({ source, code: error && error.code || 'UNEXPECTED', message, at: Date.now() });
    if (errors.length > 12) errors.shift();
  };

  function ensureCoordinator() {
    if (!document.documentElement) return null;
    coordinator = document.querySelector('[data-exp-core-coordinator="1"]');
    if (!coordinator) {
      coordinator = document.createElement('meta');
      coordinator.dataset.expCoreCoordinator = '1';
      coordinator.dataset.protocol = PROTOCOL;
      coordinator.dataset.protocolVersion = '1';
      document.documentElement.append(coordinator);
    }
    const selected = coordinator.dataset.activeCoreVersion;
    if (!selected || compareVersions(VERSION, selected) > 0) coordinator.dataset.activeCoreVersion = VERSION;
    return coordinator;
  }

  function announce(type, detail = {}) {
    const node = ensureCoordinator();
    if (!node) return;
    const payload = { protocol: PROTOCOL, protocolVersion: 1, coreVersion: VERSION, type, ...detail };
    document.dispatchEvent(new CustomEvent('exp-core:coordination', { detail: payload }));
  }

  function publishProduct(manifest, state) {
    const node = ensureCoordinator();
    if (!node) return;
    const key = `product${manifest.id.replace(/[^a-z0-9]/gi, '')}`;
    node.dataset[key] = JSON.stringify({ id: manifest.id, version: manifest.version, state, capabilities: manifest.capabilities });
    announce('product-state', { productId: manifest.id, productVersion: manifest.version, state });
  }

  function validateManifest(manifest) {
    if (!manifest || !/^[a-z][a-z0-9-]+$/.test(manifest.id || '')) throw Object.assign(new Error('Invalid product ID'), { code: 'MANIFEST_ID' });
    if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(manifest.version || '')) throw Object.assign(new Error('Invalid product version'), { code: 'MANIFEST_VERSION' });
    if (!Array.isArray(manifest.capabilities)) throw Object.assign(new Error('Capabilities must be an array'), { code: 'MANIFEST_CAPABILITIES' });
    const missing = manifest.capabilities.filter((item) => !CAPABILITIES.has(item));
    if (missing.length) throw Object.assign(new Error(`Missing Core capability: ${missing.join(', ')}`), { code: 'CAPABILITY_MISSING' });
  }

  function register(manifest, hooks) {
    validateManifest(manifest);
    if (products.has(manifest.id)) return products.get(manifest.id).public;
    const record = { manifest: Object.freeze({ ...manifest }), hooks, state: 'registered', queue: Promise.resolve() };
    const transition = (allowed, next, action) => {
      record.queue = record.queue.catch(() => {}).then(async () => {
        if (!allowed.includes(record.state)) return;
        try {
          await action?.();
          record.state = next;
          publishProduct(record.manifest, next);
        } catch (error) {
          record.state = 'failed';
          safeError(error, manifest.id);
          publishProduct(record.manifest, 'failed');
          throw error;
        }
      });
      return record.queue;
    };
    record.public = Object.freeze({
      manifest: record.manifest,
      get state() { return record.state; },
      initialize: () => transition(['registered', 'failed'], 'initialized', hooks.initialize),
      enable: () => transition(['initialized', 'disabled'], 'enabled', hooks.enable),
      disable: () => transition(['enabled'], 'disabled', hooks.disable),
      cleanup: () => transition(['registered', 'initialized', 'enabled', 'disabled', 'failed'], 'cleaned', hooks.cleanup)
    });
    products.set(manifest.id, record);
    publishProduct(record.manifest, 'registered');
    return record.public;
  }

  function createScheduler(callback, options = {}) {
    let observer;
    let frame = 0;
    let active = false;
    const roots = new Set();
    const flush = () => {
      frame = 0;
      if (!active || !roots.size) return;
      const batch = [...roots];
      roots.clear();
      metrics.batches += 1;
      metrics.roots += batch.length;
      try { callback(batch); } catch (error) { safeError(error, options.source || 'scheduler'); }
    };
    const schedule = (root) => {
      if (!active || !root || root.closest?.('[data-exp-owned="1"]')) return;
      const target = root.nodeType === Node.TEXT_NODE ? root.parentElement : root;
      if (!target) return;
      roots.add(target);
      if (!frame) frame = requestAnimationFrame(flush);
    };
    return Object.freeze({
      start() {
        if (active) return;
        active = true;
        observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            const target = mutation.target?.nodeType === Node.TEXT_NODE ? mutation.target.parentElement : mutation.target;
            if (!target) continue;
            // Ignore SHIFT-owned style/UI writes. These are implementation output, not page
            // changes, and feeding them back into the scheduler creates self-rescan loops.
            if (target.closest?.('[data-exp-owned="1"]')) continue;
            if (target.matches?.('style[data-exp-shift-page-style],style[data-exp-shift-sheet-style],style[data-exp-shift-adopted-style],style[data-exp-shift-adapter-style]')) continue;
            if (mutation.type === 'childList') {
              const changed = [...mutation.addedNodes, ...mutation.removedNodes];
              if (changed.length && changed.every((node) => node.nodeType === 1 && (node.matches?.('[data-exp-owned="1"],style[data-exp-shift-page-style],style[data-exp-shift-sheet-style],style[data-exp-shift-adopted-style],style[data-exp-shift-adapter-style]') || node.closest?.('[data-exp-owned="1"]')))) continue;
            }
            schedule(target);
          }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true, attributes: Boolean(options.attributes), characterData: Boolean(options.characterData), attributeFilter: options.attributeFilter });
        schedule(document.documentElement);
      },
      stop() { active = false; observer?.disconnect(); observer = null; roots.clear(); if (frame) cancelAnimationFrame(frame); frame = 0; },
      schedule,
      flush
    });
  }

  function onNavigation(callback) {
    if (typeof callback !== 'function') throw new TypeError('Navigation callback must be a function');
    let previous=location.href;
    const subscriber=({href})=>{if(href!==previous){previous=href;callback({href});}};
    if (!stopNavigationHooks) {
      const originals={},wrappers={};
      const check=()=>{const href=location.href;for(const notify of [...navigationSubscribers])notify({href});};
      for(const name of ['pushState','replaceState']){const original=history[name];originals[name]=original;const wrapped=function(...args){const result=Reflect.apply(original,this,args);check();return result;};wrappers[name]=wrapped;history[name]=wrapped;}
      addEventListener('popstate',check);addEventListener('hashchange',check);globalThis.navigation?.addEventListener('currententrychange',check);
      stopNavigationHooks=()=>{for(const name of Object.keys(wrappers))if(history[name]===wrappers[name])history[name]=originals[name];removeEventListener('popstate',check);removeEventListener('hashchange',check);globalThis.navigation?.removeEventListener('currententrychange',check);stopNavigationHooks=null;};
    }
    navigationSubscribers.add(subscriber);
    let disposed=false;
    const cleanup=()=>{if(disposed)return;disposed=true;navigationSubscribers.delete(subscriber);cleanups.delete(cleanup);if(!navigationSubscribers.size)stopNavigationHooks?.();};
    cleanups.add(cleanup);return cleanup;
  }


  function protectLauncherHost(host) { return shared.reference.protectLauncherHost(host); }

  function registerLauncher(host, options) { const cleanup = shared.registerLauncher(host, options); cleanups.add(cleanup); return cleanup; }

  function pageView() {
    try { if (typeof unsafeWindow !== 'undefined' && unsafeWindow?.document) return unsafeWindow; } catch {}
    return window;
  }

  function isShadowRoot(node) {
    return Boolean(node && node.nodeType === 11 && node.host);
  }

  function appendShadowStyle(root, css, data) {
    const node = document.createElement('style');
    try { node.textContent = css; } catch (error) { safeError(error, 'shift.style'); }
    node.dataset.expOwned = '1';
    for (const [key, value] of Object.entries(data || {})) node.dataset[key] = String(value);
    root.append(node);
    return node;
  }

  function paintToken() {
    return `expink${Math.random().toString(36).slice(2, 10)}`;
  }

  function withPaintProbe(css, token) {
    return `${css}\n[data-${token}]{color:rgb(1, 2, 3)!important}`;
  }

  function isConnectedNode(node) {
    try { return Boolean(node && (node.isConnected || node.host?.isConnected)); } catch { return false; }
  }

  function sheetHasRules(sheet) {
    try { return sheet.cssRules.length > 0; } catch { return null; }
  }

  function sawPaint(token, parent) {
    if (!parent || !isConnectedNode(parent)) return false;
    const probe = document.createElement('span');
    probe.setAttribute(`data-${token}`, '');
    parent.append(probe);
    let painted = false;
    try { painted = getComputedStyle(probe).color === 'rgb(1, 2, 3)'; } catch {}
    try { probe.remove(); } catch { probe.parentNode?.removeChild(probe); }
    return painted;
  }

  function writeSheet(sheet, text, view) {
    const source = String(text || '');
    try { sheet.replaceSync(source); return; } catch {}
    view.Function('sheet', 'css', 'sheet.replaceSync(css)')(sheet, source);
  }

  function setAdopted(host, sheets) {
    try { host.adoptedStyleSheets = sheets; return; } catch {}
    const view = pageView();
    const proto = isShadowRoot(host) ? (view.ShadowRoot || ShadowRoot).prototype : (view.Document || Document).prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, 'adoptedStyleSheets');
    if (!desc?.set) throw new Error('adoptedStyleSheets unavailable');
    desc.set.call(host, sheets);
  }

  function adoptConstructable(host, css, shadow) {
    const view = pageView();
    const Ctor = view.CSSStyleSheet || (typeof CSSStyleSheet === 'function' ? CSSStyleSheet : null);
    if (typeof Ctor !== 'function' || !Ctor.prototype.replaceSync) return null;
    const current = host.adoptedStyleSheets;
    if (!current || typeof current[Symbol.iterator] !== 'function') return null;
    const sheet = new Ctor();
    const token = paintToken();
    writeSheet(sheet, withPaintProbe(css, token), view);
    const before = current.length;
    setAdopted(host, [...current, sheet]);
    const sample = shadow || host.documentElement || host;
    if (host.adoptedStyleSheets.length !== before + 1) {
      try { setAdopted(host, [...host.adoptedStyleSheets].filter((item) => item !== sheet)); } catch {}
      throw new Error('adoptedStyleSheets ignored');
    }
    const painted = isConnectedNode(sample) ? sawPaint(token, sample) : sheetHasRules(sheet) !== false;
    if (!painted) {
      try { setAdopted(host, [...host.adoptedStyleSheets].filter((item) => item !== sheet)); } catch {}
      throw new Error('adoptedStyleSheets did not paint');
    }
    writeSheet(sheet, css, view);
    return {
      sheet,
      write: (text) => writeSheet(sheet, text, view),
      detach() {
        try { setAdopted(host, [...host.adoptedStyleSheets].filter((item) => item !== sheet)); } catch {}
      }
    };
  }

  function injectShadowStyle(root, css, data) {
    const mark = (node) => {
      node.dataset.expOwned = '1';
      for (const [key, value] of Object.entries(data || {})) node.dataset[key] = String(value);
      return node;
    };
    const fail = (error) => safeError(Object.assign(error || new Error('Style injection failed'), { code: 'STYLE_INJECTION' }), 'shift.style');
    // Adopted sheets stay inside the shadow and still apply when the page CSP
    // blocks <style>. GM_addElement / GM_addStyle are not used here: managers
    // attach those to the document and leak header/nav/button/* onto the site.
    try {
      const adopted = adoptConstructable(root, css, root);
      if (adopted) {
        const node = document.createElement('style');
        let current = css;
        Object.defineProperty(node, 'textContent', {
          configurable: true,
          enumerable: true,
          get() { return current; },
          set(value) {
            current = String(value || '');
            try { adopted.write(current); } catch (error) { fail(error); }
          }
        });
        node.remove = () => {
          try { adopted.detach(); } catch {}
          if (node.parentNode) node.parentNode.removeChild(node);
        };
        try { root.append(node); } catch {}
        return mark(node);
      }
    } catch (error) { fail(error); }
    return appendShadowStyle(root, css, data);
  }

  function injectStyle(root, cssText, data = {}) {
    const css = String(cssText || '');
    if (isShadowRoot(root)) return injectShadowStyle(root, css, data);
    const isShadow = false;
    const view = pageView();
    const doc = view.document || document;
    const parent = isShadow ? root : (doc.documentElement || doc.head || doc.body);
    const host = isShadow ? root : doc;
    const sample = isShadow ? root : (doc.body || doc.documentElement);
    const mark = (node) => {
      node.dataset.expOwned = '1';
      for (const [key, value] of Object.entries(data || {})) node.dataset[key] = String(value);
      return node;
    };
    const fail = (error) => safeError(Object.assign(error || new Error('Style injection failed'), { code: 'STYLE_INJECTION' }), 'shift.style');
    const handle = (write, detach) => {
      const node = document.createElement('style');
      let current = css;
      Object.defineProperty(node, 'textContent', {
        configurable: true,
        enumerable: true,
        get() { return current; },
        set(value) {
          current = String(value || '');
          try { write(current); } catch (error) { fail(error); }
        }
      });
      node.remove = () => {
        try { detach(); } catch {}
        if (node.parentNode) node.parentNode.removeChild(node);
      };
      parent.append(node);
      return mark(node);
    };
    try {
      if (typeof GM_addElement === 'function') {
        const token = paintToken();
        let live = GM_addElement(parent, 'style', { textContent: withPaintProbe(css, token) });
        if (live && sawPaint(token, sample)) {
          try { live.textContent = css; } catch {}
          return handle(
            (text) => {
              try { live.textContent = text; } catch {
                const next = GM_addElement(parent, 'style', { textContent: text });
                try { live.remove(); } catch {}
                live = next;
              }
            },
            () => { try { live.remove(); } catch {} }
          );
        }
        try { live?.remove(); } catch {}
      }
    } catch (error) { fail(error); }
    try {
      if (!isShadow && typeof GM_addStyle === 'function') {
        const token = paintToken();
        let live = GM_addStyle(withPaintProbe(css, token));
        if (live && sawPaint(token, sample)) {
          try { live.textContent = css; } catch {}
          return handle(
            (text) => {
              try { live.textContent = text; } catch { live = GM_addStyle(text); }
            },
            () => { try { live.remove(); } catch {} }
          );
        }
        try { live?.remove(); } catch {}
      }
    } catch (error) { fail(error); }
    try {
      const adopted = adoptConstructable(host, css, sample);
      if (adopted) return handle((text) => adopted.write(text), () => adopted.detach());
    } catch (error) { fail(error); }
    const node = document.createElement('style');
    try { node.textContent = css; } catch (error) { fail(error); }
    parent.append(node);
    return mark(node);
  }

  function diagnosticSnapshot() {
    return {
      core: { version: VERSION, protocol: PROTOCOL, capabilities: [...CAPABILITIES] },
      products: [...products.values()].map(({ manifest, state }) => ({ id: manifest.id, version: manifest.version, state })),
      metrics: { ...metrics, uptimeMs: Date.now() - metrics.startedAt },
      errors: errors.map(({ source, code, message }) => ({ source, code, message }))
    };
  }

  function focusMenuSurface(surface) { if (!(surface instanceof HTMLElement)) return false; if (!surface.hasAttribute('tabindex')) surface.setAttribute('tabindex', '-1'); surface.style.outline='none'; surface.focus({ preventScroll: true }); return true; }

  addEventListener('pagehide', () => { for (const cleanup of cleanups) { try { cleanup(); } catch {} } }, { once: true });
  return Object.freeze({
    VERSION, PROTOCOL, register, createScheduler, onNavigation, registerLauncher, announce, negotiate, safeError,
    diagnosticSnapshot, diagnostics: diagnosticSnapshot, focusMenuSurface, injectStyle,
    registerFloatingNotice: shared.registerFloatingNotice,
    layoutFloatingNotices: shared.layoutFloatingNotices,
    claimNotice: shared.claimNotice,
    consumeVersionChange: shared.consumeVersionChange,
  });
}

// Product-neutral host for the code extracted from Dropper 3.3.2.
// Product engines own their settings, content, and actions. Core owns shared UI.
const ExtraPotionsCore = (() => {
  'use strict';
  const version = '3.3.2';
  const sourceVersion = '3.3.2';
  const protocol = 'exp-core-coordination-v1';
  const gridProtocol = 'exp-launcher-grid-v3';
  const GRID_ORDER = 'exp:v3:launcher-order';
  const GRID_DELTA = 'exp:v3:launcher-grid-delta';
  const PRIORITY = { shift: 100, dropper: 90, ward: 60, prisma: 40 };
  const THEME_PRIORITY = { dropper: 4, shift: 3, prisma: 2, ward: 1 };
  const registrations = new WeakMap();
  const floatingNoticeRegistrations = new WeakMap();
  const controllers = new WeakMap();
  const tokenNames = ['bg', 'panel', 'line', 'text', 'muted', 'accent', 'accent2'];
  function menuWidthForMode(mode = 'compact', fullWidth = 312) {
    if (mode === 'narrow') return 220;
    if (mode === 'compact') return 260;
    const full = Number(fullWidth);
    return Number.isFinite(full) ? Math.max(280, Math.min(full, 340)) : 312;
  }
  const partIds = {
    'tdh-tools-dock': 'dock', 'tdh-settings-launcher': 'launcher',
    'tdh-rail-title': 'title', 'tdh-header-version': 'version',
    'tdh-rail-subtitle': 'subtitle', 'tdh-rail-close': 'close',
    'tdh-opacity-range': 'opacity-range', 'tdh-opacity-value': 'opacity-value'
  };
  const canonicalCss = Object.entries(partIds).reduce((css, [id, part]) =>
    css.replaceAll('#' + id, '[data-exp-part="' + part + '"]'), DropperReference.css())
    .replaceAll('.cluster', '.exp-core-theme');
  const compositionCss = `
    :host{color-scheme:dark}
    [data-exp-part="launcher"]{box-sizing:border-box!important;width:48px!important;min-width:48px!important;max-width:48px!important;height:48px!important;min-height:48px!important;max-height:48px!important}
    [data-exp-part="launcher"] .launcher-icon{width:40px!important;height:40px!important}
    .header-icon{width:38px!important;height:38px!important}
    .header-icon .menu-icon{width:38px!important;height:38px!important}
    :host([data-exp-theme-deprioritized="1"]) .theme-row:has(.exp-theme-swatches),:host([data-exp-theme-deprioritized="1"]) #mb-theme-dots{display:none!important}
    :host([data-exp-theme-deprioritized="1"]) #mb-cluster{--mb-bg:var(--theme-bg)!important;--mb-surface:var(--theme-panel)!important;--mb-chip:var(--theme-panel)!important;--mb-ink:var(--theme-text)!important;--mb-muted:var(--theme-muted)!important;--mb-line:var(--theme-line)!important;--mb-brand:var(--theme-accent)!important;--mb-brand-ink:var(--theme-bg)!important;--mb-hover:var(--theme-panel)!important;--mb-track:var(--theme-line)!important}
    [hidden]{display:none!important}
    .exp-core-theme{position:static;display:contents;color:var(--theme-text);font:13px/1.42 ui-sans-serif,system-ui,"Segoe UI",sans-serif}
    [data-exp-part="dock"],[data-exp-part="launcher"]{position:fixed}
    [data-exp-part="dock"]{color:var(--theme-text);scrollbar-width:thin}
    [data-exp-part="dock"] [data-exp-part="title"]{color:var(--theme-text)}
    button,input,select,textarea{font-family:inherit}
    button{color:inherit}
    button:disabled{opacity:.5;cursor:not-allowed}
    button:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:2px solid var(--theme-accent2);outline-offset:2px}
    button.fl-tool-header{width:100%;border:0;background:transparent;color:var(--theme-text);text-align:left;font:inherit}
    .fl-tool-header .fl-tool-chevron{font:11px/1.42 system-ui}
    .fl-tool-body[hidden]{display:none!important}
    .fl-tool-body>.group,.fl-tool-body>.section,.fl-tool-body>.flat-group{grid-column:1/-1;min-width:0}
    .fl-tool-body :is(.group,.section,.flat-group){display:grid!important;grid-template-columns:minmax(0,1fr)!important}
    .fl-tool-body :is(.group,.section,.flat-group)>*{grid-column:1/-1!important;min-width:0}
    .group,.section,.flat-group{margin:0;padding:0;border:0;background:transparent}
    .group>h3,.section>h3,.section>h2{margin:8px 0 3px;font-size:10px;font-weight:800;color:var(--theme-muted)}
    .group:first-child>h3,.section:first-child>h3{margin-top:6px}
    .group>.row,.section>.row,.flat-group>.row{min-width:0}
    .row>.copy,.row>.row-copy,.row>.setting-label,.row>div:first-child{min-width:0;flex:1}
    .label,.copy>strong,.row-copy>strong,.setting-label{font-size:11px;font-weight:500;line-height:1.25}
    .copy>.help,.row-copy>small,.help,.empty,.note,.meta{font-size:9px;line-height:1.4;color:var(--theme-muted)}
    .copy>.help,.row-copy>small{display:block;margin-top:3px}
    .toggleSwitch{padding:0;min-width:34px;max-width:34px;min-height:20px;max-height:20px}
    .toggleSwitch>span{display:none}
    .row>.life-btn,.mini-row>.life-btn{width:auto;min-width:50px;margin:0;padding:3px 7px}
    .row>select,.mini-row>select{max-width:55%}
    .button-grid,.actions,.profile-actions,.menu-footer,.diagnostics-controls>div,.rules-transfer{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;min-width:0}
    .button-grid>*{min-width:0}
    .life-btn.warn{border-color:#cb6868!important;background:#402020!important;color:#ffd7d7!important}
    input:not([type=file]),textarea{box-sizing:border-box;max-width:100%;min-width:0;border:1px solid var(--theme-line);border-radius:6px;background:var(--theme-bg);color:var(--theme-text);padding:5px 6px;font-size:11px}
    input[type=search],textarea{width:100%}
    .identity{display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid var(--theme-line)}
    .identity>.copy{flex:1;min-width:0}
    .identity-actions{display:flex;gap:6px;align-items:center}
    .identity-actions>.life-btn{width:auto;margin:0;padding:3px 6px}
    .theme-row{flex-wrap:wrap}
    .exp-theme-swatches{min-width:0}
    .appearance-group,.auth-advanced,.rule-card,.stat-card{grid-column:1/-1;min-width:0;border:1px solid var(--theme-line);border-radius:7px;margin-top:6px;padding:6px;background:var(--theme-bg)}
    summary{cursor:pointer;font-size:11px}
    .feature-pair,.category-grid{display:block}
    .status-value,output{font-size:10px;color:var(--theme-muted)}
    .live,.sr-only,.status{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
    .toast{position:fixed;z-index:2147483647;right:12px;max-width:calc(100vw - 24px)}
    .update-notice{position:fixed;z-index:2147483647}
    .diag{margin:6px 0 0}
    .diag[hidden]{display:none!important}
    .diag:not([hidden]){display:block}
    .ward-shell{display:contents}
    .utility-grid,.stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
    .workspace-actions{grid-column:1/-1}
    .setting-arrow,.step-btn{width:25px;min-height:25px;border:1px solid var(--theme-line);border-radius:6px;background:var(--theme-bg);color:var(--theme-text)}
    .step-value{flex:1;text-align:center;font-size:10px}
    .stepper{display:flex;align-items:center;gap:5px}
  `;
  const TOGGLE = ':is(.toggleSwitch,.switch,[role="switch"])';
  const TOGGLE_BG = 'var(--theme-bg,var(--dropper-bg,var(--bg,#111114)))';
  const TOGGLE_PANEL = 'var(--theme-panel,var(--dropper-panel,var(--panel,var(--surface,#18181d))))';
  const TOGGLE_LINE = 'var(--theme-line,var(--dropper-line,var(--line,var(--border,#41434d))))';
  const TOGGLE_MUTED = 'var(--theme-muted,var(--dropper-muted,var(--muted,#9aa0a6)))';
  const TOGGLE_TEXT = 'var(--theme-text,var(--dropper-text,var(--text,#f4f4f6)))';
  const TOGGLE_ACCENT = 'var(--theme-accent,var(--dropper-accent,var(--accent,var(--teal,#8b5cf6))))';
  const MATTE_TOGGLE_CHROME_CSS = `${TOGGLE}{position:relative!important;box-sizing:border-box!important;flex:none!important;width:34px!important;height:20px!important;min-width:34px!important;min-height:20px!important;padding:0!important;border:1px solid color-mix(in srgb,${TOGGLE_LINE} 88%,${TOGGLE_MUTED} 12%)!important;border-radius:6px!important;background:color-mix(in srgb,${TOGGLE_BG} 84%,${TOGGLE_PANEL} 16%)!important;background-image:none!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.018)!important;cursor:pointer!important}${TOGGLE}:not(:has(> span))::after{content:""!important;position:absolute!important;top:2px!important;left:2px!important;width:14px!important;height:14px!important;box-sizing:border-box!important;border:0!important;border-radius:4px!important;background:color-mix(in srgb,${TOGGLE_MUTED} 82%,${TOGGLE_TEXT} 18%)!important;box-shadow:none!important}${TOGGLE}>span{display:block!important;position:absolute!important;top:2px!important;left:2px!important;width:14px!important;height:14px!important;box-sizing:border-box!important;border:0!important;border-radius:4px!important;background:color-mix(in srgb,${TOGGLE_MUTED} 82%,${TOGGLE_TEXT} 18%)!important;box-shadow:none!important}${TOGGLE}[aria-checked="true"]{border-color:color-mix(in srgb,${TOGGLE_LINE} 52%,${TOGGLE_ACCENT} 48%)!important;background:color-mix(in srgb,${TOGGLE_PANEL} 72%,${TOGGLE_ACCENT} 28%)!important;background-image:none!important}${TOGGLE}[aria-checked="true"]:not(:has(> span))::after{transform:translateX(14px)!important;background:${TOGGLE_TEXT}!important}${TOGGLE}[aria-checked="true"]>span{transform:translateX(14px)!important;background:${TOGGLE_TEXT}!important}:host([data-ui-theme="pride"]) ${TOGGLE}[aria-checked="true"],.exp-core-theme[data-ui-theme="pride"] ${TOGGLE}[aria-checked="true"],:host([data-theme-skin="gradient"]) ${TOGGLE}[aria-checked="true"],.exp-core-theme[data-theme-skin="gradient"]:not([data-ui-theme="contrast"]) ${TOGGLE}[aria-checked="true"]{background-image:none!important;border-color:color-mix(in srgb,${TOGGLE_LINE} 52%,${TOGGLE_ACCENT} 48%)!important;background:color-mix(in srgb,${TOGGLE_PANEL} 72%,${TOGGLE_ACCENT} 28%)!important}:host([data-ui-theme="contrast"]) ${TOGGLE},:host([data-ui-theme="obsidian"]) ${TOGGLE},.exp-core-theme[data-ui-theme="contrast"] ${TOGGLE},.exp-core-theme[data-ui-theme="obsidian"] ${TOGGLE}{border:2px solid #fff!important;background:#050505!important;background-image:none!important}:host([data-ui-theme="contrast"]) ${TOGGLE}:not(:has(> span))::after,:host([data-ui-theme="obsidian"]) ${TOGGLE}:not(:has(> span))::after,.exp-core-theme[data-ui-theme="contrast"] ${TOGGLE}:not(:has(> span))::after,.exp-core-theme[data-ui-theme="obsidian"] ${TOGGLE}:not(:has(> span))::after{top:0!important;left:0!important;border:1px solid #050505!important;background:#fff!important}:host([data-ui-theme="contrast"]) ${TOGGLE}>span,:host([data-ui-theme="obsidian"]) ${TOGGLE}>span,.exp-core-theme[data-ui-theme="contrast"] ${TOGGLE}>span,.exp-core-theme[data-ui-theme="obsidian"] ${TOGGLE}>span{top:0!important;left:0!important;border:1px solid #050505!important;background:#fff!important}:host([data-ui-theme="contrast"]) ${TOGGLE}[aria-checked="true"],:host([data-ui-theme="obsidian"]) ${TOGGLE}[aria-checked="true"],.exp-core-theme[data-ui-theme="contrast"] ${TOGGLE}[aria-checked="true"],.exp-core-theme[data-ui-theme="obsidian"] ${TOGGLE}[aria-checked="true"]{background:#fff!important;border-color:#fff!important;background-image:none!important}:host([data-ui-theme="contrast"]) ${TOGGLE}[aria-checked="true"]:not(:has(> span))::after,:host([data-ui-theme="obsidian"]) ${TOGGLE}[aria-checked="true"]:not(:has(> span))::after,.exp-core-theme[data-ui-theme="contrast"] ${TOGGLE}[aria-checked="true"]:not(:has(> span))::after,.exp-core-theme[data-ui-theme="obsidian"] ${TOGGLE}[aria-checked="true"]:not(:has(> span))::after{background:#050505!important;border-color:#fff!important;transform:translateX(14px)!important}:host([data-ui-theme="contrast"]) ${TOGGLE}[aria-checked="true"]>span,:host([data-ui-theme="obsidian"]) ${TOGGLE}[aria-checked="true"]>span,.exp-core-theme[data-ui-theme="contrast"] ${TOGGLE}[aria-checked="true"]>span,.exp-core-theme[data-ui-theme="obsidian"] ${TOGGLE}[aria-checked="true"]>span{background:#050505!important;border-color:#fff!important;transform:translateX(14px)!important}@media (forced-colors: active){${TOGGLE}{forced-color-adjust:none;border:1px solid CanvasText!important;background:Canvas!important;background-image:none!important}${TOGGLE}:not(:has(> span))::after{border-color:CanvasText!important;background:CanvasText!important}${TOGGLE}>span{border-color:CanvasText!important;background:CanvasText!important}${TOGGLE}[aria-checked="true"]{border-color:Highlight!important;background:Highlight!important;background-image:none!important}${TOGGLE}[aria-checked="true"]:not(:has(> span))::after{border-color:HighlightText!important;background:HighlightText!important}${TOGGLE}[aria-checked="true"]>span{border-color:HighlightText!important;background:HighlightText!important}}`;
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
  const emit = (type, productId) => document.dispatchEvent(new CustomEvent('exp-core:coordination', { detail: { protocol, type, productId } }));
  function menuThemeOwner() {
    return [...document.querySelectorAll('[data-exp-product-launcher="1"][data-product-id]')]
      .filter(node => node.isConnected && THEME_PRIORITY[node.dataset.productId])
      .sort((a,b) => THEME_PRIORITY[b.dataset.productId] - THEME_PRIORITY[a.dataset.productId])[0] || null;
  }
  function menuPalette(host) {
    if (host?.dataset.productId === 'dropper') {
      const selected = host.shadowRoot?.querySelector('#tdh-cluster')?.dataset.uiTheme;
      const theme = DropperReference.UI_THEMES.find(item => item.id === selected);
      if (theme) return theme;
    }
    try {
      const value = JSON.parse(host.dataset.expMenuPalette || 'null');
      if (!value || !['bg','panel','line','text','muted','accent','accent2'].every(key => /^#[0-9a-f]{3,8}$/i.test(value[key]))) return null;
      if (value.skin && (/url\(|var\(|;|\/\*/i.test(value.skin) || value.skin.length > 300)) return null;
      return value;
    } catch { return null; }
  }
  function publishMenuPalette(host, theme) {
    if (!host || !theme) return;
    const palette = Object.fromEntries([...tokenNames,'id','skin','skinVertical','skinMode'].map(key => [key, theme[key]]));
    const serialized = JSON.stringify(palette);
    if (host.dataset.expMenuPalette === serialized) return;
    host.dataset.expMenuPalette = serialized;
    emit('menu-theme', host.dataset.productId);
  }
  function injectStyle(shadow, css, data = {}) {
    const node = document.createElement('style');
    Object.assign(node.dataset, data);
    node.textContent = css;
    shadow.append(node);
    // Constructed sheets survive pages that block style elements. Keep the style
    // node as a fallback and as the editable public handle used by product code.
    let sheet;
    try { sheet = new CSSStyleSheet(); sheet.replaceSync(css); shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets, sheet]; } catch {}
    const observe = new MutationObserver(() => { if (sheet) { try { sheet.replaceSync(node.textContent); } catch {} } });
    observe.observe(node, { childList: true, characterData: true, subtree: true });
    node.dispose = () => { observe.disconnect(); if (sheet) shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets].filter(s => s !== sheet); node.remove(); };
    return node;
  }
  function resolveShadowRoot(target) {
    if (target instanceof ShadowRoot) return target;
    if (target instanceof Element) {
      if (target.shadowRoot instanceof ShadowRoot) return target.shadowRoot;
      const root = target.getRootNode?.();
      if (root instanceof ShadowRoot) return root;
    }
    return null;
  }
  function applyMatteToggleChrome(target) {
    const shadow = resolveShadowRoot(target);
    if (!shadow) return false;
    if (shadow.querySelector('style[data-exp-matte-toggle-chrome]')) return true;
    injectStyle(shadow, MATTE_TOGGLE_CHROME_CSS, { expMatteToggleChrome: '1' });
    return true;
  }
  function applyTwoColumnSettingsGrid(container) {
    if (!(container instanceof HTMLElement)) return false;
    const root = resolveShadowRoot(container);
    if (root && !root.querySelector('style[data-exp-settings-grid]')) {
      injectStyle(root, '[data-exp-settings-grid="two-column"]{display:grid!important;grid-template-columns:minmax(0,1fr)!important;align-items:stretch!important;column-gap:0!important}[data-exp-settings-grid="two-column"]>*{grid-column:1/-1!important;min-width:0!important}[data-exp-settings-grid="two-column"]>[data-exp-grid-cell="compact"]{grid-column:1/-1!important}', { expSettingsGrid: '1' });
    }
    container.dataset.expSettingsGrid = 'two-column';
    if (root) applyMatteToggleChrome(root);
    return true;
  }
  function applyContentDrivenMenuLayout(shadow) {
    if (!(shadow instanceof ShadowRoot)) return false;
    shadow.host.dataset.expContentDrivenMenu = '1';
    if (!shadow.querySelector('style[data-exp-content-driven-menu]')) {
      injectStyle(shadow, '.fl-tool-body .action.warn{border-color:#cb6868!important;background:#402020!important;color:#ffd7d7!important}.fl-tool-body .action.warn:hover{background:#582828!important;color:#fff!important}:host([data-exp-content-driven-menu="1"]) :is(.panel,.ward,#mb-dock,[data-exp-part="dock"]){height:auto!important;min-height:0!important}:host([data-exp-content-driven-menu="1"]) :is(.fl-tool-body,.panel-body,.route-body){height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}:host([data-exp-content-driven-menu="1"]) :is(.fl-tool-header,.panel-head,.route,.nav-item,.group>summary){height:auto!important;min-height:0!important;white-space:normal!important}:host([data-exp-content-driven-menu="1"]) :is(.fl-tool-title,.label,.setting-label,.setting-value,.copy strong,.copy .label){overflow:visible!important;text-overflow:clip!important;white-space:normal!important;word-break:normal!important;overflow-wrap:normal!important}:host([data-exp-content-driven-menu="1"]) :is(.row,.mini-row,.setting-row){height:auto!important;min-height:0!important;align-items:center!important}:host([data-exp-content-driven-menu="1"]) :is(.group,.section,.panel-body:not(.hidden)){grid-template-columns:minmax(0,1fr)!important}:host([data-exp-content-driven-menu="1"]) :is(.group,.section,.panel-body:not(.hidden))>*{grid-column:1/-1!important}.fl-tool-body .row:has(>select){display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr)!important;min-width:0!important}.fl-tool-body .row>select{width:100%!important;min-width:0!important;max-width:100%!important}', { expContentDrivenMenu: '1' });
    }
    applyMatteToggleChrome(shadow);
    return true;
  }
  function layoutGrid() {
    const order = read(GRID_ORDER, []);
    const sorted = [...document.querySelectorAll('[data-exp-product-launcher="1"]')].sort((a,b) => {
      const ai = Array.isArray(order) ? order.indexOf(a.dataset.productId) : -1;
      const bi = Array.isArray(order) ? order.indexOf(b.dataset.productId) : -1;
      if (a.dataset.productId !== 'dropper' && b.dataset.productId !== 'dropper' && ai !== bi) return ai < 0 ? 1 : bi < 0 ? -1 : ai - bi;
      return Number(b.dataset.launcherPriority || 0) - Number(a.dataset.launcherPriority || 0) || a.dataset.productId.localeCompare(b.dataset.productId);
    });
    const dropper = sorted.find(node => node.dataset.productId === 'dropper');
    const products = sorted.filter(node => node !== dropper);
    const assign = (node, slot, span = 1) => {
      const row = Math.floor(slot / 3), column = slot % 3;
      Object.assign(node.dataset, { launcherSlot:String(slot), launcherRow:String(row), launcherColumn:String(column), launcherSpan:String(span) });
      node.style.setProperty('--exp-launcher-x', column * 56 + 'px');
      node.style.setProperty('--exp-launcher-y', row * 56 + 'px');
      node.style.setProperty('--exp-launcher-offset', row * 56 + 'px');
    };
    if (dropper) assign(dropper, 0);
    products.forEach((node, index) => assign(node, (dropper ? 1 : 0) + index));
    write(GRID_ORDER, products.map(node => node.dataset.productId));
  }
  function storageRead(key, fallback = null) {
    try { if (typeof GM_getValue === 'function') return GM_getValue(key, fallback); } catch {}
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  }
  function storageWrite(key, value) {
    try { if (typeof GM_setValue === 'function') { GM_setValue(key, value); return; } } catch {}
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
  function claimNotice(productId, changeId) {
    const key = `exp:v3:${String(productId || 'product')}:notice:${String(changeId || 'change')}`;
    if (storageRead(key, false) === true) return false;
    storageWrite(key, true);
    return true;
  }
  function consumeVersionChange(productId, currentVersion, legacyKey = '') {
    const key = `exp:v3:${String(productId || 'product')}:installed-version`;
    let previous = String(storageRead(key, '') || '');
    if (!previous && legacyKey) { try { previous = String(localStorage.getItem(legacyKey) || ''); } catch {} }
    storageWrite(key, String(currentVersion || ''));
    return previous && previous !== currentVersion && claimNotice(productId, `updated:${currentVersion}`) ? previous : '';
  }
  function visibleFloatingNotices() {
    return [...document.querySelectorAll('[data-exp-product-launcher="1"][data-product-id]')]
      .flatMap(host => [...(host.shadowRoot?.querySelectorAll('[data-exp-floating-notice="1"]') || [])].map(notice => ({ host, notice })))
      .filter(({ notice }) => !notice.hidden && notice.getClientRects().length)
      .sort((a,b) => Number(a.host.dataset.launcherSlot || 0) - Number(b.host.dataset.launcherSlot || 0) || a.host.dataset.productId.localeCompare(b.host.dataset.productId));
  }
  function layoutFloatingNotices() {
    const launchers = [...document.querySelectorAll('[data-exp-product-launcher="1"][data-product-id]')]
      .map(host => host.shadowRoot?.querySelector('[data-exp-part="launcher"],.ward-launcher,.launcher,#tdh-settings-launcher'))
      .filter(Boolean).map(node => node.getBoundingClientRect()).filter(box => box.width && box.height);
    const notices = visibleFloatingNotices();
    if (!launchers.length || !notices.length) return;
    const anchor = document.documentElement.dataset.expLauncherAnchor === 'top' ? 'top' : 'bottom';
    const gridTop = Math.min(...launchers.map(box => box.top));
    const gridBottom = Math.max(...launchers.map(box => box.bottom));
    const gridRight = Math.max(...launchers.map(box => box.right));
    let cursor = anchor === 'top' ? gridBottom + 8 : gridTop - 8;
    for (const { notice } of notices) {
      const width = Math.min(notice.offsetWidth || notice.scrollWidth || 260, Math.max(0, innerWidth - 24));
      const height = notice.offsetHeight || notice.scrollHeight || 72;
      const top = anchor === 'top' ? cursor : cursor - height;
      notice.style.setProperty('width', `${width}px`, 'important');
      notice.style.setProperty('left', `${Math.max(8, Math.min(innerWidth - width - 8, gridRight - width))}px`, 'important');
      notice.style.setProperty('right', 'auto', 'important');
      notice.style.setProperty('top', `${Math.max(8, Math.min(innerHeight - height - 8, top))}px`, 'important');
      notice.style.setProperty('bottom', 'auto', 'important');
      cursor = anchor === 'top' ? top + height + 8 : top - 8;
    }
  }
  function registerFloatingNotice(host, notice) {
    if (!(host instanceof Element) || !(notice instanceof Element)) return () => {};
    if (floatingNoticeRegistrations.has(notice)) return floatingNoticeRegistrations.get(notice);
    notice.dataset.expFloatingNotice = '1';
    const refresh = () => requestAnimationFrame(layoutFloatingNotices);
    const mutation = new MutationObserver(refresh); mutation.observe(notice, { attributes:true, attributeFilter:['hidden','class'] });
    const resize = new ResizeObserver(refresh); resize.observe(notice);
    addEventListener('resize', refresh, { passive:true }); document.addEventListener('exp-core:coordination', refresh);
    const dispose = () => { mutation.disconnect(); resize.disconnect(); removeEventListener('resize', refresh); document.removeEventListener('exp-core:coordination', refresh); floatingNoticeRegistrations.delete(notice); };
    floatingNoticeRegistrations.set(notice, dispose); refresh(); return dispose;
  }
  function registerLauncher(host, options = {}) {
    if (registrations.has(host)) return registrations.get(host);
    const id = options.productId || options.id || host.dataset.productId;
    Object.assign(host.dataset, { expProductLauncher:'1', productId:id, launcherPriority:String(options.priority ?? PRIORITY[id] ?? 0) });
    applyMatteToggleChrome(host);
    const stopProtect = DropperReference.protectLauncherHost(host);
    let frame = 0;
    const refresh = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; layoutGrid(); controllers.get(host)?.layout(); }); };
    document.addEventListener('exp-core:coordination', refresh);
    addEventListener('resize', refresh);
    layoutGrid(); emit('launcher-added', id);
    const dispose = () => { stopProtect(); cancelAnimationFrame(frame); document.removeEventListener('exp-core:coordination', refresh); removeEventListener('resize', refresh); delete host.dataset.expProductLauncher; registrations.delete(host); layoutGrid(); emit('launcher-removed', id); };
    registrations.set(host, dispose);
    return dispose;
  }
  function themes(productTheme) {
    const common = DropperReference.UI_THEMES.filter(t => !['twitch', 'dropper'].includes(t.id));
    return Object.freeze([...common, DropperReference.CRIMSON_THEME, ...(productTheme ? [productTheme] : [DropperReference.UI_THEMES.at(-1)])].map(t => Object.freeze({ ...t, vars: Object.fromEntries(tokenNames.map(k => [k, t[k]])) })));
  }
  function createThemeSwatches({ container, themes: choices, value, onChange = () => {} }) {
    const root = resolveShadowRoot(container);
    if (root && !root.querySelector('style[data-exp-theme-swatches]')) {
      injectStyle(root, '.exp-theme-swatches{display:flex;align-items:center;gap:6px;min-height:28px;flex-wrap:wrap}.exp-theme-swatch{appearance:none;box-sizing:border-box!important;flex:0 0 22px!important;width:22px!important;height:22px!important;min-width:22px!important;min-height:22px!important;max-width:22px!important;max-height:22px!important;padding:0!important;border:2px solid var(--theme-line,var(--line,#41434d));border-radius:5px!important;cursor:pointer}.exp-theme-swatch:hover,.exp-theme-swatch:focus-visible{outline:2px solid var(--theme-accent,var(--accent,#8b5cf6));outline-offset:2px}.exp-theme-swatch.is-on{border-color:var(--theme-text,var(--text,#fff));box-shadow:0 0 0 2px var(--theme-accent,var(--accent,#8b5cf6))}', { expThemeSwatches: '1' });
      applyMatteToggleChrome(root);
    }
    container.classList.add('exp-theme-swatches'); container.setAttribute('role', 'radiogroup'); container.setAttribute('aria-label', 'Menu Theme');
    const buttons = choices.map(theme => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'exp-theme-swatch';
      for (const property of ['width','height','min-width','min-height','max-width','max-height']) button.style.setProperty(property, '22px', 'important');
      button.style.setProperty('border-radius', '5px', 'important');
      button.style.setProperty('padding', '0', 'important');
      button.style.setProperty('box-sizing', 'border-box', 'important');
      button.style.setProperty('flex', '0 0 22px', 'important');
      button.setAttribute('role', 'radio'); button.setAttribute('aria-label', theme.name); button.title = theme.name;
      button.dataset.theme = button.dataset.swatch = theme.id; button.style.background = theme.swatch;
      button.addEventListener('click', () => { paint(theme.id); onChange(theme.id); }); container.append(button); return button;
    });
    function paint(next) { value = next; buttons.forEach((b,i) => { const on = choices[i].id === value; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', String(on)); b.setAttribute('aria-pressed', String(on)); b.tabIndex = on || !choices.some(t => t.id === value) && i === 0 ? 0 : -1; }); }
    const keyboard = event => { const current = buttons.indexOf(event.target); if (current < 0 || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return; event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (current + (['ArrowRight','ArrowDown'].includes(event.key) ? 1 : -1) + buttons.length) % buttons.length; buttons[next].click(); buttons[next].focus(); };
    container.addEventListener('keydown', keyboard); paint(value);
    return { setValue: paint, destroy() { container.removeEventListener('keydown', keyboard); buttons.forEach(b => b.remove()); } };
  }
  function focusMenuSurface(panel) { if (!(panel instanceof HTMLElement)) return false; panel.tabIndex = -1; panel.style.outline = 'none'; panel.focus({ preventScroll: true }); return true; }
  function createFloatingNotice(options = {}) {
    const { shadow, panel, notice, versionButton = null } = options;
    const host = options.host || shadow?.host;
    if (!(shadow instanceof ShadowRoot) || !(panel instanceof Element) || !(notice instanceof Element)) return Object.freeze({ show() {}, hide() {}, toggle() {}, layout() {}, setMenuOpen() {}, destroy() {} });
    const durationMs = Math.max(0, Number(options.durationMs ?? 30000));
    const manageVersion = options.manageVersion !== false;
    let timer = 0, menuOpen = false, destroyed = false;
    if (!shadow.querySelector('style[data-exp-floating-notice]')) {
      injectStyle(shadow, '.exp-floating-update{position:fixed;z-index:2147483647;box-sizing:border-box;width:min(312px,calc(100vw - 24px));max-width:calc(100vw - 24px);margin:0;padding:10px 32px 10px 10px;border:1px solid var(--exp-notice-border,var(--dropper-accent,#6f42b4));border-radius:10px;background:linear-gradient(180deg,var(--exp-notice-top,#251a35),var(--exp-notice-bottom,#18181d) 70%);color:var(--exp-notice-text,#f4f4f6);box-shadow:0 10px 28px #0008;font:500 9px/1.45 system-ui,sans-serif}.exp-floating-update[hidden]{display:none!important}.exp-floating-update-dismiss{position:absolute;top:7px;right:7px;width:23px;height:23px;padding:0;border:1px solid transparent;border-radius:7px;background:transparent;color:inherit;cursor:pointer;font:15px/1 Arial,sans-serif}.exp-floating-update-dismiss:hover,.exp-floating-update-dismiss:focus-visible{border-color:var(--exp-notice-border,var(--dropper-accent,#6f42b4));outline:none}', { expFloatingNotice: '1' });
    }
    applyMatteToggleChrome(shadow);
    notice.classList.add('update-notice','exp-floating-update'); notice.setAttribute('role','status');
    let dismiss = notice.querySelector(':scope > .exp-floating-update-dismiss');
    if (!dismiss) { dismiss=document.createElement('button'); dismiss.type='button'; dismiss.className='exp-floating-update-dismiss'; dismiss.setAttribute('aria-label','Dismiss changelog'); dismiss.textContent='×'; notice.prepend(dismiss); }
    shadow.append(notice); const unregisterNotice = registerFloatingNotice(host, notice);
    const themeSource = options.themeSource instanceof Element ? options.themeSource : panel;
    function syncTheme() {
      const theme=getComputedStyle(themeSource); const first=(names,fallback)=>names.map(name=>theme.getPropertyValue(name).trim()).find(Boolean)||fallback;
      notice.style.setProperty('--exp-notice-border',first(['--exp-notice-border','--theme-accent','--dropper-accent','--accent','--accent2','--teal','--mb-brand'],theme.borderTopColor||'#6f42b4'));
      notice.style.setProperty('--exp-notice-top',first(['--exp-notice-top','--theme-panel','--surface','--panel','--raised','--mb-surface','--bg','--mb-bg'],theme.backgroundColor||'#251a35'));
      notice.style.setProperty('--exp-notice-bottom',first(['--exp-notice-bottom','--theme-bg','--bg','--mb-bg','--surface','--mb-surface'],theme.backgroundColor||'#18181d'));
      notice.style.setProperty('--exp-notice-text',first(['--exp-notice-text','--theme-text','--text','--mb-ink'],theme.color||'#f4f4f6'));
    }
    const clearTimer=()=>{clearTimeout(timer);timer=0;};
    function layout(){if(destroyed||notice.hidden)return;syncTheme();layoutFloatingNotices();}
    function hide(){clearTimer();notice.hidden=true;versionButton?.setAttribute('aria-expanded','false');layoutFloatingNotices();}
    function show(){notice.hidden=false;versionButton?.setAttribute('aria-expanded','true');clearTimer();if(durationMs)timer=setTimeout(hide,durationMs);requestAnimationFrame(layoutFloatingNotices);}
    function toggle(){if(notice.hidden)show();else hide();}
    function versionClick(){if(manageVersion)toggle();else if(!notice.hidden)show();}
    function setMenuOpen(value){menuOpen=Boolean(value);if(!menuOpen)hide();else requestAnimationFrame(layout);}
    const coordination=()=>requestAnimationFrame(layout);
    dismiss.addEventListener('click',hide);versionButton?.addEventListener('click',versionClick);addEventListener('resize',layout,{passive:true});document.addEventListener('exp-core:coordination',coordination);
    return Object.freeze({show,hide,toggle,layout,setMenuOpen,destroy(){destroyed=true;clearTimer();unregisterNotice();dismiss.removeEventListener('click',hide);versionButton?.removeEventListener('click',versionClick);removeEventListener('resize',layout);document.removeEventListener('exp-core:coordination',coordination);}});
  }
  // Core-owned update and changelog cards use Dropper's menu-width notice
  // geometry directly. The legacy floating-notice coordinator remains exported
  // for compatibility, but it no longer owns these product notices.
  function createMenuNotice(options = {}) {
    const { shadow, panel, notice, versionButton = null } = options;
    const host = options.host || shadow?.host;
    if (!(shadow instanceof ShadowRoot) || !(panel instanceof Element) || !(notice instanceof Element)) {
      return Object.freeze({ show() {}, hide() {}, toggle() {}, layout() {}, setMenuOpen() {}, destroy() {} });
    }
    const durationMs = Math.max(0, Number(options.durationMs ?? 30000));
    const manageVersion = options.manageVersion !== false;
    let timer = 0, menuOpen = false, destroyed = false, frame = 0;

    if (!shadow.querySelector('style[data-exp-floating-notice]')) {
      injectStyle(shadow, '.exp-floating-update{position:fixed;z-index:2147483647;box-sizing:border-box;width:min(312px,calc(100vw - 24px));max-width:calc(100vw - 24px);margin:0;padding:10px 32px 10px 10px;border:1px solid var(--exp-notice-border,var(--dropper-accent,#6f42b4));border-radius:10px;background:linear-gradient(180deg,var(--exp-notice-top,#251a35),var(--exp-notice-bottom,#18181d) 70%);color:var(--exp-notice-text,#f4f4f6);box-shadow:0 10px 28px #0008;font:500 9px/1.45 system-ui,sans-serif}.exp-floating-update[hidden]{display:none!important}.exp-floating-update-dismiss{position:absolute;top:7px;right:7px;width:23px;height:23px;padding:0;border:1px solid transparent;border-radius:7px;background:transparent;color:inherit;cursor:pointer;font:15px/1 Arial,sans-serif}.exp-floating-update-dismiss:hover,.exp-floating-update-dismiss:focus-visible{border-color:var(--exp-notice-border,var(--dropper-accent,#6f42b4));outline:none}', { expFloatingNotice: '1' });
    }
    applyMatteToggleChrome(shadow);
    notice.classList.add('update-notice', 'exp-floating-update');
    notice.dataset.placement = 'menu';
    delete notice.dataset.expFloatingNotice;
    notice.setAttribute('role', 'status');

    let dismiss = notice.querySelector(':scope > .exp-floating-update-dismiss,.update-dismiss');
    if (!dismiss) {
      dismiss = document.createElement('button');
      dismiss.type = 'button';
      dismiss.className = 'exp-floating-update-dismiss';
      dismiss.setAttribute('aria-label', 'Dismiss changelog');
      dismiss.textContent = '×';
      notice.prepend(dismiss);
    }

    const themeSource = options.themeSource instanceof Element ? options.themeSource : panel;
    function syncTheme() {
      const theme = getComputedStyle(themeSource);
      const first = (names, fallback) => names.map(name => theme.getPropertyValue(name).trim()).find(Boolean) || fallback;
      notice.style.setProperty('--exp-notice-border', first(['--exp-notice-border','--theme-accent','--dropper-accent','--accent','--accent2','--teal','--mb-brand'], theme.borderTopColor || '#6f42b4'));
      notice.style.setProperty('--exp-notice-top', first(['--exp-notice-top','--theme-panel','--surface','--panel','--raised','--mb-surface','--bg','--mb-bg'], theme.backgroundColor || '#251a35'));
      notice.style.setProperty('--exp-notice-bottom', first(['--exp-notice-bottom','--theme-bg','--bg','--mb-bg','--surface','--mb-surface'], theme.backgroundColor || '#18181d'));
      notice.style.setProperty('--exp-notice-text', first(['--exp-notice-text','--theme-text','--text','--mb-ink'], theme.color || '#f4f4f6'));
    }
    function widthForMode() {
      return menuWidthForMode(host?.dataset.menuWidth || 'compact');
    }
    function clearTimer() { clearTimeout(timer); timer = 0; }
    function queueLayout() {
      if (destroyed || frame) return;
      frame = requestAnimationFrame(() => { frame = 0; layout(); });
    }
    function layout() {
      if (destroyed || notice.hidden) return;
      syncTheme();
      const width = Math.min(widthForMode(), Math.max(0, innerWidth - 24));
      notice.style.setProperty('width', width + 'px', 'important');

      const panelBox = menuOpen && !panel.hidden && panel.getClientRects().length ? panel.getBoundingClientRect() : null;
      const launcher = shadow.querySelector('[data-exp-part="launcher"],.ward-launcher,.launcher,#tdh-settings-launcher');
      const launcherBox = launcher?.getBoundingClientRect?.();
      const anchorBox = panelBox?.width && panelBox?.height ? panelBox : launcherBox;
      if (!anchorBox?.width || !anchorBox?.height) return;

      const height = notice.offsetHeight || notice.scrollHeight || 72;
      const anchor = document.documentElement.dataset.expLauncherAnchor === 'top' ? 'top' : 'bottom';
      let top;
      if (panelBox?.width && panelBox?.height) {
        const above = panelBox.top - height - 8;
        top = above >= 8 ? above : Math.min(innerHeight - height - 8, panelBox.bottom + 8);
      } else if (anchor === 'top') {
        top = Math.min(innerHeight - height - 8, anchorBox.bottom + 8);
      } else {
        top = Math.max(8, anchorBox.top - height - 8);
      }
      const left = Math.max(8, Math.min(innerWidth - width - 8, anchorBox.right - width));
      notice.style.setProperty('left', left + 'px', 'important');
      notice.style.setProperty('right', 'auto', 'important');
      notice.style.setProperty('top', Math.max(8, top) + 'px', 'important');
      notice.style.setProperty('bottom', 'auto', 'important');
    }
    function hide() {
      clearTimer();
      notice.hidden = true;
      versionButton?.setAttribute('aria-expanded', 'false');
    }
    function show() {
      notice.hidden = false;
      versionButton?.setAttribute('aria-expanded', 'true');
      clearTimer();
      if (durationMs) timer = setTimeout(hide, durationMs);
      queueLayout();
    }
    function toggle() { if (notice.hidden) show(); else hide(); }
    function versionClick() { if (manageVersion) toggle(); else if (!notice.hidden) show(); }
    function setMenuOpen(value) { menuOpen = Boolean(value); queueLayout(); }

    const resize = new ResizeObserver(queueLayout);
    resize.observe(panel);
    resize.observe(notice);
    const mutation = new MutationObserver(queueLayout);
    mutation.observe(notice, { attributes:true, attributeFilter:['hidden'], childList:true, subtree:true });
    const coordination = () => queueLayout();
    dismiss.addEventListener('click', hide);
    versionButton?.addEventListener('click', versionClick);
    addEventListener('resize', queueLayout, { passive:true });
    document.addEventListener('exp-core:coordination', coordination);

    return Object.freeze({
      show, hide, toggle, layout, setMenuOpen,
      destroy() {
        destroyed = true;
        cancelAnimationFrame(frame);
        clearTimer();
        resize.disconnect();
        mutation.disconnect();
        dismiss.removeEventListener('click', hide);
        versionButton?.removeEventListener('click', versionClick);
        removeEventListener('resize', queueLayout);
        document.removeEventListener('exp-core:coordination', coordination);
      },
    });
  }

  function applyTheme(host, value, choices) {
    const controller = controllers.get(host); if (!controller) return;
    controller.setTheme(value, choices);
  }
  function normalizeControls(panel) {
    panel.querySelectorAll('button[role="switch"],button.toggle').forEach(button => {
      button.classList.add('toggleSwitch'); button.setAttribute('role', 'switch');
      if (!button.hasAttribute('aria-checked')) button.setAttribute('aria-checked', 'false');
      const row = button.closest('.row,.mini-row,.fl-switch,.setting-row');
      if (row) { row.classList.add('fl-switch'); const label = row.querySelector('.label,.copy>strong,.row-copy>strong,.setting-label,span'); if (label) label.classList.add('fl-switch-text'); if (!button.hasAttribute('aria-label') && !button.hasAttribute('aria-labelledby')) button.setAttribute('aria-label', label?.textContent || row.textContent.trim()); }
    });
    panel.querySelectorAll('.row,.mini-row,.setting-row').forEach(row => { if (!row.classList.contains('fl-switch')) row.classList.add('mini-row'); });
    panel.querySelectorAll('select').forEach(node => node.classList.add('select-lite'));
    panel.querySelectorAll('button.action,button.secondary,button.primary,button.compact,.diagnostics-controls button,.button-grid button,.menu-footer button').forEach(node => { if (!node.dataset.expPart) node.classList.add('life-btn'); });
    panel.querySelectorAll('.route-body').forEach(body => body.classList.toggle('fl-tool-hidden', body.hidden));
    const active = panel.querySelector('.fl-tool-header[aria-expanded="true"]');
    panel.querySelectorAll('.fl-tool-header').forEach(header => { if (active) header.classList.toggle('last-opened', header === active); const chevron = header.querySelector('.fl-tool-chevron'); if (chevron) chevron.textContent = header.getAttribute('aria-expanded') === 'true' ? '▾' : '▸'; });
  }
  function normalizeHeader(panel) {
    const head = panel.querySelector('.menu-head,header,.head,.ward-header'); if (!head) return;
    head.classList.add('menu-head');
    const brand = head.querySelector('.header-brand,.identity,.brand'); if (!brand) return;
    brand.classList.add('header-brand');
    let icon = brand.firstElementChild;
    if (icon?.tagName === 'IMG' || icon?.tagName.toLowerCase() === 'svg') { const frame = document.createElement('div'); frame.className = 'header-icon'; icon.before(frame); frame.append(icon); icon.classList.add('menu-icon'); icon = frame; }
    if (icon) { icon.classList.add('header-icon'); icon.querySelector('img,svg')?.classList.add('menu-icon'); }
    const copy = brand.children[1]; if (copy) copy.classList.add('header-copy');
    const row = copy?.firstElementChild; row?.classList.add('header-title-row');
    const title = row?.querySelector('h1,h2,h3,strong,.menu-title'); if (title) title.dataset.expPart = 'title';
    const ver = head.querySelector('.version,.header-version,[id$="header-version"]'); if (ver) ver.dataset.expPart = 'version';
    const subtitle = copy?.querySelector('small,.subtitle,.menu-subtitle,[id$="subtitle"]'); if (subtitle) subtitle.dataset.expPart = 'subtitle';
    const close = head.querySelector('.close,.menu-close,[id$="rail-close"]'); if (close) close.dataset.expPart = 'close';
    panel.querySelector('.divider')?.classList.add('header-divider');
    for (const section of panel.querySelectorAll('nav>.tool-panel,nav>section')) {
      section.classList.add('fl-tool-panel'); const control = section.querySelector(':scope>button'); const body = section.querySelector(':scope>div'); if (!control || !body) continue;
      control.classList.add('fl-tool-header'); body.classList.add('fl-tool-body');
      if (!control.querySelector('.fl-tool-title')) { let title = control.querySelector('span:not(.chevron)'); if (!title) { title = document.createElement('span'); title.textContent = control.textContent; control.replaceChildren(title); } title.classList.add('fl-tool-title'); }
      let chevron = control.querySelector('.chevron,.fl-tool-chevron'); if (!chevron) { chevron = document.createElement('span'); chevron.textContent = '▸'; control.append(chevron); } chevron.classList.add('fl-tool-chevron');
    }
  }
  function makeLauncher(launcher, launcherSrc) {
    if (launcher.dataset.expCoreLauncher) return;
    const image = launcher.querySelector('img,.launcher-gem svg,.icon,svg:not(.launcher-ring):not(.ring)');
    if (!image) throw new Error('Core launcher requires the product launcher artwork');
    const mark = image.cloneNode(true); mark.removeAttribute('style'); mark.removeAttribute('id'); mark.setAttribute('class','icon launcher-icon');
    if (launcherSrc && mark.tagName === 'IMG') mark.src = launcherSrc;
    launcher.replaceChildren(mark); launcher.dataset.expCoreLauncher = '1'; launcher.dataset.expPart = 'launcher';
    launcher.removeAttribute('data-help');
  }
  function create(options) {
    const { id, host, shadow, launcher, panel, getSettings = () => ({}), setOpen, shortcutKey = '', productTheme, launcherSrc } = options;
    if (controllers.has(host)) return controllers.get(host);
    // All styling comes from the reference and the composition adapter. Remove
    // product copies and their constructed sheets before mounting the canonical UI.
    shadow.querySelectorAll('style').forEach(node => node.dispose ? node.dispose() : node.remove());
    try { shadow.adoptedStyleSheets = []; } catch {}
    const styles = injectStyle(shadow, canonicalCss + compositionCss, { expCoreStyle:version });
    const themeRoot = document.createElement('div'); themeRoot.className = 'exp-core-theme';
    [...shadow.childNodes].filter(node => node !== styles).forEach(node => themeRoot.append(node)); shadow.append(themeRoot);
    panel.dataset.expPart = 'dock'; panel.classList.add('dropper-menu-surface'); makeLauncher(launcher,launcherSrc); normalizeHeader(panel); normalizeControls(panel);
    applyContentDrivenMenuLayout(shadow);
    applyMatteToggleChrome(shadow);
    const versionButton=panel.querySelector('.version,[data-exp-part="version"]');
    const menuNotices=[...themeRoot.querySelectorAll('.update-notice,.changelog')].map(notice=>createMenuNotice({host,shadow,panel,notice,versionButton:notice.classList.contains('changelog')?versionButton:null,manageVersion:false,durationMs:30000}));
    if (launcherSrc) panel.querySelectorAll('.header-icon img').forEach(image => image.src = launcherSrc);
    host.dataset.coreVersion = version; host.dataset.coreSource = 'Dropper/3.3.2';
    let choices = themes(productTheme), selected = choices.at(-1), open = false, destroyed = false, timer = 0, deadline = 0, frame = 0;
    const removers = [];
    const on = (node,type,fn,opts) => { node.addEventListener(type,fn,opts); removers.push(() => node.removeEventListener(type,fn,opts)); };
    let localTheme = null;
    function paintTheme(theme) {
      selected = theme;
      for (const key of tokenNames) { themeRoot.style.setProperty('--theme-' + key, selected[key]); host.style.setProperty('--' + key, selected[key]); host.style.setProperty('--dropper-' + key, selected[key]); }
      themeRoot.style.setProperty('--theme-skin', selected.skin || selected.swatch || selected.accent);
      themeRoot.style.setProperty('--theme-skin-vertical', selected.skinVertical || selected.skin || selected.swatch || selected.accent);
      Object.assign(themeRoot.dataset, { uiTheme:selected.id, themeSkin:selected.skinMode === 'flat' ? 'flat' : 'gradient' });
      host.dataset.uiTheme = selected.id;
    }
    let observedDropper = null;
    const dropperThemeObserver = new MutationObserver(syncThemeOwner);
    function syncThemeOwner() {
      const owner = menuThemeOwner();
      const dropperThemeSurface = owner?.dataset.productId === 'dropper'
        ? owner.shadowRoot?.querySelector('#tdh-cluster')
        : null;
      if (dropperThemeSurface !== observedDropper) {
        dropperThemeObserver.disconnect();
        observedDropper = dropperThemeSurface;
        if (observedDropper) dropperThemeObserver.observe(observedDropper, { attributes:true, attributeFilter:['data-ui-theme'] });
      }
      const deprioritized = Boolean(owner && owner !== host);
      host.dataset.expThemeDeprioritized = deprioritized ? '1' : '0';
      host.dataset.expThemeOwner = owner?.dataset.productId || id;
      paintTheme(deprioritized && menuPalette(owner) || localTheme);
    }
    function setTheme(value, supplied) {
      if (supplied) choices = supplied.map(t => ({ ...t, ...t.vars, skin:t.skin || t.swatch, skinVertical:t.skinVertical || t.skin || t.swatch }));
      const alias = ({warm:'ember',discord:'glacier',pine:'verdant',obsidian:'contrast'})[value] || value;
      localTheme = choices.find(t => t.id === alias) || choices.at(-1);
      publishMenuPalette(host, localTheme);
      syncThemeOwner();
    }
    function clearTimer() { clearTimeout(timer); timer = 0; deadline = 0; }
    function scheduleDismiss() { clearTimer(); if (!open || getSettings().menuAutoClose === false) return; deadline = Date.now()+15000; timer = setTimeout(() => { if (open && Date.now() >= deadline) setOpen(false,false); },15020); }
    function layout() {
      if (destroyed || !launcher.isConnected) return;
      const state = getSettings(); const width = ['full','compact','narrow'].includes(state.menuWidth) ? state.menuWidth : 'compact';
      host.dataset.menuWidth = width; themeRoot.dataset.panelWidth = width;
      themeRoot.classList.toggle('reduce-motion', state.reduceMotion === true || state.reduceMotion === 'on' || state.reducedMotion === 'reduce' || (state.reduceMotion === 'system' || state.reducedMotion === 'system') && matchMedia('(prefers-reduced-motion:reduce)').matches);
      const opacityValue = Number(state.opacityPercent);
      const opacity = state.customOpacity ? (Number.isFinite(opacityValue) ? Math.max(40, Math.min(100, Math.round(opacityValue / 5) * 5)) : 85)/100 : 1;
      themeRoot.style.setProperty('--dropper-ui-opacity',String(opacity));
      const offset = parseFloat(getComputedStyle(host).getPropertyValue('--exp-launcher-offset')) || 0;
      const x = parseFloat(getComputedStyle(host).getPropertyValue('--exp-launcher-x')) || 0;
      const delta = Math.max(8-(innerHeight-60), Math.min(4, Number(read(GRID_DELTA,0)) || 0));
      const origin = innerHeight-60+delta, anchor = origin <= (innerHeight-48)/2 ? 'top':'bottom';
      document.documentElement.dataset.expLauncherAnchor = anchor;
      let top = anchor === 'top' ? origin+offset : origin-offset;

      top = Math.max(8,Math.min(innerHeight-56,top));
      Object.assign(launcher.style,{top:top+'px',right:(12+x)+'px',bottom:'auto',left:'auto',zIndex:open?'2147483647':'2147483600'});
      const maxWidth = Math.max(0,innerWidth-24), panelWidth = Math.min(menuWidthForMode(width),maxWidth);
      Object.assign(panel.style,{width:panelWidth+'px',maxHeight:Math.max(80,innerHeight-80)+'px',overflowY:'auto',right:'12px',left:'auto',bottom:'auto',zIndex:open?'2147483647':'2147483599'});
      if (!open) return;
      const h = panel.offsetHeight, below = innerHeight-top-56, above = top-8;
      const up = below < h+12 && above >= below;
      host.dataset.openDirection = up?'up':'down';
      panel.style.top = Math.max(8, up ? top-h-8 : Math.min(innerHeight-h-8,top+56))+'px';
      menuNotices.forEach(notice=>notice.layout());
    }
    function queueLayout() { if (!frame && !destroyed) frame = requestAnimationFrame(() => { frame = 0; normalizeControls(panel); layout(); }); }
    let startX=0,startY=0,startDelta=0,pointer=null,dragged=false,axis='',order=[];
    on(launcher,'pointerdown',e=>{if(e.button!==0)return;pointer=e.pointerId;startX=e.clientX;startY=e.clientY;startDelta=Number(read(GRID_DELTA,0))||0;order=read(GRID_ORDER,[]);if(!Array.isArray(order))order=[];if(!order.includes(id))order.push(id);dragged=false;axis='';e.preventDefault();});
    on(document,'pointermove',e=>{if(e.pointerId!==pointer)return;const dx=e.clientX-startX,dy=e.clientY-startY;if(!axis&&Math.max(Math.abs(dx),Math.abs(dy))>4)axis=Math.abs(dx)>Math.abs(dy)?'order':'group';if(!axis)return;dragged=true;e.preventDefault();launcher.classList.add('is-dragging');if(axis==='order'){const from=order.indexOf(id),to=Math.max(0,Math.min(order.length-1,from+Math.round(-dx/56))),next=[...order];next.splice(from,1);next.splice(to,0,id);write(GRID_ORDER,next);}else write(GRID_DELTA,startDelta+dy);layoutGrid();emit('launcher-grid-moved',id);layout();},{passive:false});
    const end=e=>{if(e.pointerId===pointer){pointer=null;launcher.classList.remove('is-dragging');}};
    on(document,'pointerup',end);on(document,'pointercancel',end);
    on(launcher,'click',e=>{if(dragged){e.preventDefault();e.stopImmediatePropagation();dragged=false;}},true);
    for(const type of ['pointerdown','click','wheel','keydown','input','change'])on(panel,type,scheduleDismiss,{passive:type==='wheel'});
    on(window,'keydown',e=>{if(shortcutKey&&e.altKey&&e.shiftKey&&e.key.toLowerCase()===shortcutKey.toLowerCase()&&!e.repeat){e.preventDefault();setOpen(!open,true);} });
    on(window,'resize',queueLayout);on(document,'exp-core:coordination',queueLayout);
    on(document,'exp-core:coordination',syncThemeOwner);
    const resize = new ResizeObserver(queueLayout); resize.observe(panel);
    const mutation = new MutationObserver(records=>{if(records.some(r=>r.type==='childList'||r.attributeName==='hidden'))queueLayout();}); mutation.observe(panel,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
    const controller = {
      layout, setTheme,
      state(value) {open=Boolean(value);panel.classList.toggle('fl-rail-open',open);menuNotices.forEach(notice=>notice.setMenuOpen(open));if(open)scheduleDismiss();else clearTimer();queueLayout();},
      update(){normalizeControls(panel);queueLayout();},
      get dismissAt(){return deadline;},
      destroy(){destroyed=true;clearTimer();cancelAnimationFrame(frame);resize.disconnect();mutation.disconnect();dropperThemeObserver.disconnect();menuNotices.forEach(notice=>notice.destroy());removers.forEach(f=>f());styles.dispose();controllers.delete(host);}
    };
    controllers.set(host,controller);setTheme(getSettings().uiTheme || getSettings().theme || id);
    queueLayout();return controller;
  }
  function createReleaseUpdateChecker(options = {}) {
    const productId = String(options.productId || '').toLowerCase();
    const repository = String(options.repository || '');
    const currentVersion = String(options.currentVersion || '');
    const enabled = typeof options.enabled === 'function' ? options.enabled : () => true;
    const onError = typeof options.onError === 'function' ? options.onError : () => {};
    if (!productId || !repository || !currentVersion) throw new Error('Incomplete update checker configuration');

    const ENDPOINT = String(options.endpoint || ('https://api.github.com/repos/' + repository + '/releases/latest'));
    const CACHE_KEY = 'exp:v3:' + productId + ':update-cache';
    const CHECK_INTERVAL = 15 * 60 * 1000;
    const CHECK_LEASE = 30 * 1000;
    let memory = {};

    function readState() {
      try {
        if (typeof GM_getValue === 'function') {
          const value = GM_getValue(CACHE_KEY, null);
          if (value && typeof value === 'object' && !Array.isArray(value)) return { ...value };
        }
      } catch {}
      try {
        const value = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
        if (value && typeof value === 'object' && !Array.isArray(value)) return { ...value };
      } catch {}
      return { ...memory };
    }
    function writeState(value) {
      memory = { ...(value || {}) };
      try { if (typeof GM_setValue === 'function') GM_setValue(CACHE_KEY, memory); } catch {}
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(memory)); } catch {}
    }
    function releaseDetails(body) {
      const details = [];
      let section = false;
      for (const line of String(body || '').split(/\r?\n/)) {
        if (/^##\s+/.test(line)) { if (section) break; section = true; continue; }
        if (!section) continue;
        const match = line.match(/^\s*[-*]\s+(.+)/);
        if (!match) continue;
        const detail = match[1].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[`*_]/g, '').trim();
        if (detail) details.push(detail.slice(0, 220));
        if (details.length === 4) break;
      }
      return details;
    }
    function normalize(state) {
      const next = { ...(state || {}) };
      if (!Object.hasOwn(next, 'lastCheckAt') && next.checkedAt) next.lastCheckAt = Number(next.checkedAt) || 0;
      if (!Object.hasOwn(next, 'lastRemoteVersion') && next.latest) next.lastRemoteVersion = String(next.latest || '');
      if (!Array.isArray(next.details)) next.details = [];
      return next;
    }
    function snapshot(state, stateName) {
      const next = normalize(state);
      const latest = String(next.lastRemoteVersion || '');
      return {
        checkedAt: Number(next.lastCheckAt || 0),
        latest: latest || null,
        state: stateName || next.state || 'idle',
        current: currentVersion,
        available: Boolean(latest && DropperReference.compareVersions(latest, currentVersion) > 0),
        details: next.details.slice(0, 4),
        checkedForVersion: next.checkedForVersion || null,
        lastRemoteVersion: latest || null,
        lastHttpStatus: Number(next.lastHttpStatus || 0),
        lastError: String(next.lastError || ''),
      };
    }
    function request() {
      return new Promise((resolve, reject) => {
        if (typeof GM_xmlhttpRequest !== 'function') return reject(Object.assign(new Error('Update request capability unavailable'), { code:'UPDATE_CAPABILITY' }));
        GM_xmlhttpRequest({
          method:'GET',
          url:ENDPOINT,
          timeout:10000,
          headers:{ Accept:'application/vnd.github+json', 'Cache-Control':'no-cache', Pragma:'no-cache' },
          onload(response) {
            if (response.status >= 200 && response.status < 300) return resolve(response);
            reject(Object.assign(new Error('Update metadata request failed'), { code:'UPDATE_HTTP_' + response.status, status:response.status }));
          },
          onerror:() => reject(Object.assign(new Error('Update metadata request failed'), { code:'UPDATE_NETWORK' })),
          ontimeout:() => reject(Object.assign(new Error('Update metadata request timed out'), { code:'UPDATE_TIMEOUT' })),
        });
      });
    }
    async function check(force = false) {
      let state = normalize(readState());
      if (!enabled() && !force) return snapshot(state, 'disabled');

      const now = Date.now();
      const checkedForCurrentVersion = state.checkedForVersion === currentVersion;
      if (!checkedForCurrentVersion) {
        state.checkedForVersion = currentVersion;
        state.lastCheckAt = 0;
        state.checkLeaseUntil = 0;
        state.lastRemoteVersion = '';
        state.lastHttpStatus = 0;
        state.lastError = '';
        state.details = [];
        state.availableVersion = '';
        state.availableAt = 0;
      }
      writeState(state);

      if (!force && Number(state.checkLeaseUntil || 0) > now) return snapshot(state, 'checking');
      if (!force && checkedForCurrentVersion && now - Number(state.lastCheckAt || 0) < CHECK_INTERVAL) return snapshot(state, 'cached');

      state.checkedForVersion = currentVersion;
      state.lastCheckAt = now;
      state.checkLeaseUntil = now + CHECK_LEASE;
      state.lastError = '';
      state.state = 'checking';
      writeState(state);

      try {
        const response = await request();
        const payload = JSON.parse(String(response.responseText || '{}'));
        const latest = String(payload.tag_name || '').replace(/^v/, '');
        if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(latest)) throw Object.assign(new Error('Invalid update metadata'), { code:'UPDATE_METADATA' });

        state = normalize(readState());
        state.checkedForVersion = currentVersion;
        state.lastCheckAt = Date.now();
        state.checkLeaseUntil = 0;
        state.lastRemoteVersion = latest;
        state.lastHttpStatus = Number(response.status || 0);
        state.lastError = '';
        state.details = releaseDetails(payload.body);
        state.state = 'checked';
        if (DropperReference.compareVersions(latest, currentVersion) > 0) {
          state.availableVersion = latest;
          state.availableAt = Date.now();
        } else {
          state.availableVersion = '';
          state.availableAt = 0;
        }
        writeState(state);
        return snapshot(state, 'checked');
      } catch (error) {
        state = normalize(readState());
        state.checkedForVersion = currentVersion;
        state.lastCheckAt = Date.now();
        state.checkLeaseUntil = 0;
        state.lastError = String(error?.message || 'Update check failed');
        state.state = 'failed';
        writeState(state);
        try { onError(error); } catch {}
        return snapshot(state, 'failed');
      }
    }
    function status() { return snapshot(readState()); }
    return Object.freeze({
      CURRENT_VERSION: currentVersion,
      ENDPOINT,
      CHECK_INTERVAL,
      check,
      status,
      compare: DropperReference.compareVersions,
    });
  }

  function createSupportControl({ url, label = 'Support' } = {}) {
    if (!url) return null;
    const wrapper = document.createElement('div');
    wrapper.className = 'support-wrap';
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'tdh-support-button';
    button.className = 'support-button';
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', 'tdh-support-popover');
    button.title = label;
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.2-4.35-9.55-8.45C.42 9.02 2.3 5 6.25 5c2.15 0 3.56 1.21 4.33 2.3C11.36 6.21 12.77 5 14.92 5c3.95 0 5.83 4.02 3.8 7.55C16.36 16.65 12 21 12 21Z"/></svg>';
    const popover = document.createElement('div');
    popover.id = 'tdh-support-popover';
    popover.className = 'support-popover';
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-label', label);
    popover.hidden = true;
    const strong = document.createElement('strong');
    strong.textContent = label;
    const copy = document.createElement('span');
    copy.textContent = 'Donations are optional. All features stay free.';
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.textContent = 'Open Ko-fi';
    popover.append(strong, copy, anchor);
    wrapper.append(button, popover);
    const toggle = event => {
      event?.stopPropagation?.();
      popover.hidden = !popover.hidden;
      button.setAttribute('aria-expanded', String(!popover.hidden));
    };
    const outside = event => {
      if (popover.hidden || event.composedPath().includes(wrapper)) return;
      popover.hidden = true;
      button.setAttribute('aria-expanded', 'false');
    };
    button.addEventListener('click', toggle);
    document.addEventListener('pointerdown', outside, true);
    return Object.freeze({
      element: wrapper,
      button,
      popover,
      hide() { popover.hidden = true; button.setAttribute('aria-expanded', 'false'); },
      destroy() { button.removeEventListener('click', toggle); document.removeEventListener('pointerdown', outside, true); wrapper.remove(); },
    });
  }

  function createProductNotice(options = {}) {
    const { host, shadow, panel, versionButton = null } = options;
    if (!(host instanceof Element) || !(shadow instanceof ShadowRoot) || !(panel instanceof Element)) {
      throw new Error('Product notice requires a mounted Core product');
    }
    const notice = document.createElement('div');
    notice.className = 'update-notice';
    notice.hidden = true;
    notice.innerHTML = '<button type="button" class="update-dismiss" aria-label="Dismiss Update Notice">×</button><div class="update-head"><div class="update-heading"><div class="update-kicker">What\'s New</div><div class="update-title"></div></div><div class="update-version"></div></div><div class="update-text"></div><ul class="update-list"></ul><div class="update-footer"><a class="update-release" target="_blank" rel="noopener noreferrer">GitHub Release</a><a class="update-action" target="_blank" rel="noopener noreferrer">Install Update</a></div>';
    (shadow.querySelector('.exp-core-theme') || shadow).append(notice);
    const controller = createMenuNotice({
      host,
      shadow,
      panel,
      notice,
      versionButton: null,
      manageVersion: false,
      durationMs: options.durationMs ?? 30000,
    });
    function show(state = {}) {
      notice.querySelector('.update-kicker').textContent = state.kicker || "What's New";
      notice.querySelector('.update-title').textContent = state.title || '';
      notice.querySelector('.update-version').textContent = state.version ? 'v' + state.version : '';
      notice.querySelector('.update-text').textContent = state.text || '';
      const list = notice.querySelector('.update-list');
      list.replaceChildren();
      const details = Array.isArray(state.details) ? state.details.slice(0, 4) : [];
      for (const detail of details) {
        const item = document.createElement('li');
        item.textContent = detail;
        list.append(item);
      }
      list.hidden = !details.length;
      const release = notice.querySelector('.update-release');
      const releaseUrl = state.releaseUrl || options.releaseUrl || '';
      release.hidden = !releaseUrl;
      if (releaseUrl) release.href = releaseUrl;
      const action = notice.querySelector('.update-action');
      const actionUrl = state.actionUrl || options.installUrl || '';
      action.hidden = !actionUrl || state.showAction === false;
      if (actionUrl) action.href = actionUrl;
      action.textContent = state.actionText || 'Install Update';
      notice.dataset.noticeKind = state.kind || 'current';
      controller.setMenuOpen(!panel.hidden);
      controller.show();
    }
    const versionClick = () => {
      if (typeof options.onVersion === 'function') options.onVersion();
      else controller.toggle();
    };
    versionButton?.addEventListener('click', versionClick);
    return Object.freeze({
      element: notice,
      show,
      hide: controller.hide,
      toggle: controller.toggle,
      layout: controller.layout,
      setMenuOpen: controller.setMenuOpen,
      destroy() {
        versionButton?.removeEventListener('click', versionClick);
        controller.destroy();
        notice.remove();
      },
    });
  }

  function createDiagnosticsReport(product, details = {}) {
    return ExtraPotionsDiagnostics.createReport(product, details, { version, source: 'Dropper', sourceVersion });
  }
  function downloadDiagnostics(report) {
    const name=`${String(report.report||'Diagnostics').toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
    const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return; } catch {}
    const area=document.createElement('textarea');area.value=text;area.style.cssText='position:fixed;left:-9999px';document.documentElement.append(area);area.select();const success=document.execCommand('copy');area.remove();if(!success)throw new Error('Clipboard unavailable');
  }
  function createDiagnosticsControls(getReport, notify = () => {}) { return ExtraPotionsDiagnostics.createControls(getReport, notify); }
  function createProduct({id,name,version:productVersion,subtitle='',artwork,theme,sections=[],getSettings,onSettings=()=>{},priority,supportUrl=''}) {
    const host=document.createElement('div');host.id='exp-'+id+'-root';host.dataset.expOwned='1';const shadow=host.attachShadow({mode:'open'});const panel=document.createElement('aside');panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-label',name+' settings');
    const header=document.createElement('header');header.className='menu-head';const brand=document.createElement('div');brand.className='header-brand';const image=document.createElement('img');image.src=artwork;image.alt='';const copy=document.createElement('div');const titleRow=document.createElement('div');const title=document.createElement('strong');title.textContent=name;const v=document.createElement('button');v.type='button';v.className='version';v.textContent='v'+productVersion;titleRow.append(title,v);const sub=document.createElement('small');sub.textContent=subtitle;copy.append(titleRow,sub);brand.append(image,copy);const close=document.createElement('button');close.className='close';close.textContent='×';close.setAttribute('aria-label','Close '+name);const actions=document.createElement('div');actions.className='header-actions';const support=createSupportControl({url:supportUrl,label:'Support '+name});if(support)actions.append(support.element);actions.append(close);header.append(brand,actions);const divider=document.createElement('div');divider.className='header-divider';const nav=document.createElement('nav');
    let isOpen=false, activeId='';let chrome;
    const sectionMap=new Map();
    function renderSection(section,body){const content=section.render({core:api,onSettings});body.replaceChildren(content);chrome?.update();}
    function renderActive(){if(!activeId)return false;const entry=sectionMap.get(activeId);if(!entry||entry.body.hidden)return false;renderSection(entry.section,entry.body);return true;}
    function setOpen(value,focus=true){isOpen=Boolean(value);panel.hidden=!isOpen;launcher.setAttribute('aria-expanded',String(isOpen));if(isOpen){activeId='';nav.querySelectorAll('.route-body').forEach(n=>n.hidden=true);nav.querySelectorAll('button[data-section]').forEach(n=>n.setAttribute('aria-expanded','false'));}chrome.state(isOpen);if(focus)(isOpen?focusMenuSurface(panel):launcher.focus());}
    for(const section of sections){const group=document.createElement('section');group.className='tool-panel';const button=document.createElement('button');button.type='button';button.textContent=section.label;button.dataset.section=section.id;const body=document.createElement('div');body.className='route-body';body.hidden=true;sectionMap.set(section.id,{section,body,button});button.addEventListener('click',()=>{const opening=body.hidden;nav.querySelectorAll('.route-body').forEach(n=>n.hidden=true);nav.querySelectorAll('button[data-section]').forEach(n=>{n.classList.toggle('last-opened',n===button);n.setAttribute('aria-expanded',String(opening&&n===button));});body.hidden=!opening;activeId=opening?section.id:'';if(opening)renderSection(section,body);chrome.update();});group.append(button,body);nav.append(group);}
    const launcher=document.createElement('button');launcher.className='launcher';launcher.type='button';launcher.setAttribute('aria-label','Open '+name);const mark=image.cloneNode(true);launcher.append(mark);launcher.addEventListener('click',()=>setOpen(!isOpen));close.addEventListener('click',()=>setOpen(false));panel.append(header,divider,nav);shadow.append(panel,launcher);document.documentElement.append(host);chrome=create({id,host,shadow,panel,launcher,getSettings,setOpen,productTheme:theme});const unregister=registerLauncher(host,{productId:id,priority});
    const key=e=>{if(e.key==='Escape'&&isOpen)setOpen(false);};document.addEventListener('keydown',key);
    return {host,shadow,panel,launcher,versionButton:v,open:()=>setOpen(true),close:()=>setOpen(false),toggle:()=>setOpen(!isOpen),refresh:()=>chrome.update(),renderActive,get isOpen(){return isOpen;},destroy(){document.removeEventListener('keydown',key);support?.destroy();chrome.destroy();unregister();host.remove();}};
  }
  let gridFrame=0;
  const scheduleGrid=()=>{if(!gridFrame)gridFrame=requestAnimationFrame(()=>{gridFrame=0;layoutGrid();});};
  const gridObserver=new MutationObserver(scheduleGrid);
  const startGrid=()=>{if(!document.documentElement)return;gridObserver.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['data-exp-product-launcher','data-product-id','data-launcher-priority','data-launcher-reserved-rows']});scheduleGrid();};
  if(document.documentElement)startGrid();else addEventListener('DOMContentLoaded',startGrid,{once:true});
  document.addEventListener('exp-core:coordination',scheduleGrid);
  addEventListener('resize',scheduleGrid,{passive:true});
  const api = Object.freeze({version,sourceVersion,protocol,gridProtocol,reference:DropperReference,css:canonicalCss,themes,create,createProduct,createSupportControl,createProductNotice,createLifecycle:()=>createProductLifecycle(api),registerLauncher,layout:layoutGrid,menuWidthForMode,injectStyle,applyTheme,applyMatteToggleChrome,applyTwoColumnSettingsGrid,applyContentDrivenMenuLayout,createThemeSwatches,createFloatingNotice,createMenuNotice,createReleaseUpdateChecker,registerFloatingNotice,layoutFloatingNotices,claimNotice,consumeVersionChange,focusMenuSurface,registerDiagnosticsProduct:ExtraPotionsDiagnostics.registerProduct,productCompatibility:ExtraPotionsDiagnostics.compatibility,createDiagnosticsReport,downloadDiagnostics,createDiagnosticsControls,compareVersions:DropperReference.compareVersions});
  return api;
})();

// The verified, bundled Core owns lifecycle and shared services.
EXP.Core = ExtraPotionsCore.createLifecycle();

EXP.Settings = (() => {
  const PREFIX = 'exp:v3:shift';
  const SCHEMA = 1;
  const memory = new Map();
  const defaults = Object.freeze({
    schema: SCHEMA,
    theme: 'original',
    accent: 'site-default',
    themeStrength: 'normal',
    surfaceLevel: 'conservative',
    preserveArt: true,
    repairSurfaces: true,
    linkVisibility: 'enhanced',
    textContrast: 'normal',
    mutedRecovery: true,
    formReadability: true,
    focusVisibility: 'enhanced',
    reduceMotion: 'system',
    reduceShadows: false,
    reduceTransparency: false,
    simplifyGradients: false,
    reduceBlur: false,
    safeMode: false,
    shortcut: '',
    launcherPosition: 'automatic-end-bottom',
    menuWidth: 'compact',
    menuAutoClose: true,
    menuNotifications: true,
    updateNotifications: false,
    profiles: [{ id: 'original', name: 'Original', appearance: { theme: 'original', accent: 'site-default' }, builtIn: true }],
    customThemes: [],
    customAccents: [],
    currentProfile: 'original',
    adapterSettings: {},
    siteOverrides: {},
    exclusions: []
  });
  let state;
  const listeners = new Set();
  const key = (name) => `${PREFIX}:${name}`;
  function rawRead(name) {
    const storageKey = key(name);
    try {
      if (typeof GM_getValue === 'function') {
        const value = GM_getValue(storageKey, undefined);
        if (value !== undefined) return value;
      }
    } catch {}
    try {
      const value = localStorage.getItem(storageKey);
      if (value !== null) {
        const parsed = JSON.parse(value);
        memory.set(storageKey, parsed);
        try { if (typeof GM_setValue === 'function') GM_setValue(storageKey, parsed); } catch {}
        return parsed;
      }
    } catch {}
    return memory.get(storageKey);
  }
  function rawWrite(name, value) {
    const storageKey = key(name);
    memory.set(storageKey, value);
    try { if (typeof GM_setValue === 'function') GM_setValue(storageKey, value); } catch {}
    try { localStorage.setItem(storageKey, JSON.stringify(value)); } catch {}
  }
  const validTheme = (value) => typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,63}$/.test(value);
  function validate(candidate) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) throw Object.assign(new Error('Settings must be an object'), { code: 'SETTINGS_TYPE' });
    const result = structuredClone(defaults);
	const themeAliases = { warm: 'ember', discord: 'glacier', pine: 'verdant', obsidian: 'obsidian' };
	const normalizedTheme = themeAliases[candidate.theme] || candidate.theme;
    const enums = {
      theme: EXP.Themes ? [...Object.keys(EXP.Themes.catalog), ...(candidate.customThemes || []).map((item) => item?.id).filter(Boolean)] : ['original'], accent: [...Object.keys(EXP.Themes?.accents || { 'site-default': null }), ...(candidate.customAccents || []).map((item) => item?.id).filter(Boolean)],
      themeStrength: ['soft', 'normal', 'strong'],
      surfaceLevel: ['off', 'conservative', 'balanced', 'aggressive'], linkVisibility: ['site', 'enhanced', 'high'], textContrast: ['normal', 'enhanced'],
      focusVisibility: ['site', 'enhanced', 'high'], reduceMotion: ['off', 'system', 'on'], launcherPosition: ['automatic-end-bottom', 'end-top', 'end-bottom', 'start-top', 'start-bottom'], menuWidth: ['full', 'compact', 'narrow']
    };
    for (const [name, allowed] of Object.entries(enums)) {
	  const value = name === 'theme' ? normalizedTheme : candidate[name];
	  if (value !== undefined && allowed.includes(value)) result[name] = value;
	}
    for (const name of ['preserveArt', 'repairSurfaces', 'mutedRecovery', 'formReadability', 'reduceShadows', 'reduceTransparency', 'simplifyGradients', 'reduceBlur', 'safeMode', 'updateNotifications', 'menuAutoClose', 'menuNotifications']) if (typeof candidate[name] === 'boolean') result[name] = candidate[name];
    if (typeof candidate.shortcut === 'string' && candidate.shortcut.length <= 40) result.shortcut = candidate.shortcut;
    if (Array.isArray(candidate.exclusions)) result.exclusions = [...new Set(candidate.exclusions.filter((item) => typeof item === 'string' && item.length <= 253))].slice(0, 500);
    if (candidate.siteOverrides && typeof candidate.siteOverrides === 'object' && !Array.isArray(candidate.siteOverrides)) result.siteOverrides = structuredClone(candidate.siteOverrides);
    if (candidate.adapterSettings && typeof candidate.adapterSettings === 'object' && !Array.isArray(candidate.adapterSettings)) {
      for (const [adapterId, values] of Object.entries(candidate.adapterSettings)) {
        if (!/^[a-z][a-z0-9-]+$/.test(adapterId) || !values || typeof values !== 'object' || Array.isArray(values)) continue;
        result.adapterSettings[adapterId] = Object.fromEntries(Object.entries(values).filter(([, value]) => typeof value === 'boolean'));
      }
    }
    if (Array.isArray(candidate.profiles)) {
      const profiles = candidate.profiles.filter((profile) => profile && validTheme(profile.id) && typeof profile.name === 'string' && profile.name.trim() && profile.name.length <= 80 && profile.appearance && validTheme(profile.appearance.theme)).slice(0, 100);
      if (profiles.some((profile) => profile.id === 'original')) result.profiles = structuredClone(profiles);
    }
    if (Array.isArray(candidate.customThemes)) result.customThemes = candidate.customThemes.filter((item) => item && validTheme(item.id) && typeof item.name === 'string' && item.name.trim() && item.name.length <= 80 && ['page', 'surface', 'raised', 'overlay', 'navigation', 'input', 'interactive', 'text', 'muted'].every((key) => EXP.Themes?.hex(item[key]))).slice(0, 50).map((item) => structuredClone(item));
    if (Array.isArray(candidate.customAccents)) result.customAccents = candidate.customAccents.filter((item) => item && validTheme(item.id) && typeof item.name === 'string' && item.name.trim() && item.name.length <= 80 && EXP.Themes?.hex(item.color)).slice(0, 50).map((item) => structuredClone(item));
    if (typeof candidate.currentProfile === 'string' && result.profiles.some((profile) => profile.id === candidate.currentProfile)) result.currentProfile = candidate.currentProfile;
    return result;
  }
  function load() {
    const stored = rawRead('settings');
    state = validate(stored || defaults);
    rawWrite('settings', state);
    return snapshot();
  }
  function snapshot() { return structuredClone(state || defaults); }
  function replace(next, reason = 'replace') { const valid = validate(next); rawWrite('settings', valid); state = valid; for (const listener of listeners) listener(snapshot(), reason); return snapshot(); }
  function update(patch, reason = 'update') { return replace({ ...snapshot(), ...patch }, reason); }
  function subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
  function hostExcluded(hostname, exclusions = []) {
    return exclusions.some((host) => {
      const needle = String(host || '').trim().toLowerCase();
      if (!needle) return false;
      const haystack = String(hostname || '').trim().toLowerCase();
      return haystack === needle || haystack.endsWith(`.${needle}`);
    });
  }
  function effective(hostname = location.hostname) {
    const current = snapshot();
    const site = current.siteOverrides[hostname] || {};
    const profile = current.profiles.find((item) => item.id === (site.profileId || current.currentProfile)) || current.profiles[0];
    const profileAppearance = site.profileId || current.currentProfile !== 'original' ? profile.appearance : {};
    return { ...current, ...profileAppearance, ...site, excluded: hostExcluded(hostname, current.exclusions) };
  }
  function exportData() { return { product: 'shift', generation: 3, schema: SCHEMA, settings: snapshot() }; }
  function importData(payload) {
    if (!payload || payload.product !== 'shift' || payload.generation !== 3 || payload.schema !== SCHEMA) throw Object.assign(new Error('This is not a supported SHIFT V3 export'), { code: 'IMPORT_SCHEMA' });
    return replace(payload.settings, 'import');
  }
  return Object.freeze({ PREFIX, SCHEMA, defaults, load, snapshot, update, replace, subscribe, effective, exportData, importData });
})();

EXP.Themes = (() => {
  const catalog = Object.freeze({
    original: { name: 'Original', original: true },
    system: { name: 'System', system: true },
    ember: { name: 'Ember', page: '#120807', surface: '#24100c', raised: '#351914', overlay: '#47231c', text: '#f1ddd2', muted: '#b99787', highlight: '#e16a3b' },
    midnight: { name: 'Midnight', page: '#050a12', surface: '#0c1726', raised: '#142238', overlay: '#1d2e49', text: '#d4deeb', muted: '#91a2b7', highlight: '#477abd' },
    glacier: { name: 'Glacier', page: '#061216', surface: '#0d252a', raised: '#17363d', overlay: '#214952', text: '#d8ebee', muted: '#8fa9ae', highlight: '#67b7c1' },
    obsidian: { name: 'High contrast', page: '#000000', surface: '#0a0a0a', raised: '#171717', overlay: '#242424', text: '#ffffff', muted: '#e0e0e0', highlight: '#ffd400' },
    verdant: { name: 'Verdant', page: '#06110d', surface: '#0d2218', raised: '#173326', overlay: '#214735', text: '#d7e9df', muted: '#93aa9e', highlight: '#49a879' },
    pride: {
      name: 'Pride',
      page: '#100a12',
      pageFill: 'linear-gradient(180deg,#2a1930 0%,#100a12 42%)',
      pageEdge: 'linear-gradient(90deg,#c84e66 0%,#d07840 16.6%,#be9f37 33.3%,#3b8a5f 50%,#3d79a6 66.6%,#7455a4 100%)',
      surface: '#1d1222', raised: '#2a1930', overlay: '#39213f', navigation: '#18101c', input: '#25162b', interactive: '#312039',
      text: '#f0ddea', muted: '#b89db4', highlight: '#dd6793'
    },
    crimson: { name: 'Crimson', page: '#0c0508', surface: '#1d090f', raised: '#2d1019', overlay: '#401725', text: '#e5d2d7', muted: '#ae8b94', highlight: '#b63243' },
    shift: {
      name: 'SHIFT gem',
      page: '#041313',
      pageFill: 'linear-gradient(180deg,#0d3032 0%,#041313 40%)',
      pageEdge: 'linear-gradient(90deg,#1e938f,#3f6fa8 55%,#c34766)',
      surface: '#082427', raised: '#10363a', overlay: '#17494f', navigation: '#071c1e', input: '#0d2d31', interactive: '#143d42',
      text: '#d7eeec', muted: '#8aacaa', highlight: '#2eaaa5'
    }
  });
  const accents = Object.freeze({
    'site-default': null, teal: '#2f7f86', coral: '#c9512c', sky: '#477abd', mint: '#49a879', amber: '#b68a32', violet: '#7555a6', silver: '#bfbfbf', pride: '#dd6793', 'ember-default': '#e16a3b', 'midnight-default': '#477abd', 'glacier-default': '#67b7c1', 'contrast-default': '#ffd400', 'verdant-default': '#49a879', 'pride-default': '#dd6793', 'crimson-default': '#b63243', 'shift-default': '#2eaaa5'
  });
  const aliases = Object.freeze({ warm: 'ember', discord: 'glacier', pine: 'verdant' });
  const hex = (value) => /^#[0-9a-f]{6}$/i.test(value || '');
  function themeOptions(state) { return [...Object.entries(catalog).map(([id, item]) => [id, item.name]), ...(state?.customThemes || []).map((item) => [item.id, item.name])]; }
  function accentOptions(state) { return [...Object.entries(accents).map(([id]) => [id, id === 'site-default' ? 'Site default' : id[0].toUpperCase() + id.slice(1)]), ...(state?.customAccents || []).map((item) => [item.id, item.name])]; }
  function resolve(themeId, accentId, state = {}) {
    themeId = aliases[themeId] || themeId;
    let theme = catalog[themeId] || state.customThemes?.find((item) => item.id === themeId) || catalog.original;
    if (theme.system) theme = matchMedia('(prefers-color-scheme: dark)').matches ? catalog.glacier : catalog.original;
    const accent = accents[accentId] || state.customAccents?.find((item) => item.id === accentId)?.color || (theme.original ? '#287a74' : theme.highlight || '#2eaaa5');
    return { ...theme, id: themeId, accent, highlight: theme.highlight || accent, navigation: theme.navigation || theme.surface, input: theme.input || theme.raised, interactive: theme.interactive || theme.raised };
  }
  return Object.freeze({ catalog, accents, hex, resolve, themeOptions, accentOptions });
})();

EXP.Preload = (() => {
  const STYLE_ID = 'exp-shift-preload';
  let style;

  function cachedSettings() {
    try {
      if (typeof GM_getValue === 'function') {
        const value = GM_getValue('exp:v3:shift:settings', null);
        if (value && typeof value === 'object') return value;
      }
    } catch {}
    try {
      const raw = localStorage.getItem('exp:v3:shift:settings');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function excluded(hostname, list) {
    return Array.isArray(list) && list.some((item) => {
      const needle = String(item || '').trim().toLowerCase();
      const host = String(hostname || '').trim().toLowerCase();
      return needle && (host === needle || host.endsWith('.' + needle));
    });
  }

  function effectiveAppearance(saved) {
    if (!saved || saved.safeMode || excluded(location.hostname, saved.exclusions)) return null;
    const site = saved.siteOverrides?.[location.hostname] || {};
    const profileId = site.profileId || saved.currentProfile;
    const profile = saved.profiles?.find?.((item) => item.id === profileId);
    const appearance = profileId && profileId !== 'original' ? profile?.appearance || {} : {};
    return { ...saved, ...appearance, ...site };
  }

  function start() {
    try {
      const html = document.documentElement;
      if (html && !html.dataset.expShiftNativeBaseline) {
        const root = getComputedStyle(html);
        const body = document.body ? getComputedStyle(document.body) : null;
        const meta = [...document.querySelectorAll('meta[name="color-scheme"]')].map((node) => node.content || '').join(' ');
        html.dataset.expShiftNativeBaseline = JSON.stringify({
          meta,
          rootScheme: root.colorScheme || '',
          bodyScheme: body?.colorScheme || '',
          rootBg: root.backgroundColor || '',
          bodyBg: body?.backgroundColor || '',
        });
      }
    } catch {}
    const state = effectiveAppearance(cachedSettings());
    if (!state || !state.theme || state.theme === 'original') return false;
    const theme = EXP.Themes.resolve(state.theme, state.accent, state);
    if (!theme || theme.original || !theme.page || !theme.text) return false;
    const css = `html{background:${theme.page}!important;background-color:${theme.page}!important;color:${theme.text}!important;color-scheme:dark!important}body{background-color:${theme.page}!important;color:${theme.text}!important}`;
    try {
      style = document.createElement('style');
      style.id = STYLE_ID;
      style.dataset.expOwned = '1';
      style.dataset.expShiftPreload = '1';
      style.textContent = css;
      (document.head || document.documentElement).append(style);
      document.documentElement?.setAttribute('data-exp-shift-preloading', state.theme);
      return true;
    } catch { return false; }
  }

  function finish() {
    try { style?.remove(); } catch {}
    style = null;
    document.documentElement?.removeAttribute('data-exp-shift-preloading');
  }

  return Object.freeze({ start, finish });
})();

EXP.ColorEngine = (() => {
  const cache = new Map();
  const transformCache = new Map();
  const INLINE_ATTR = 'data-exp-shift-inline';
  const INLINE_VARS_ATTR = 'data-exp-shift-vars';
  const COLOR_PROPS = Object.freeze({
    'background-color': 'background',
    color: 'foreground',
    'border-color': 'border',
    'border-top-color': 'border',
    'border-right-color': 'border',
    'border-bottom-color': 'border',
    'border-left-color': 'border',
    'outline-color': 'border',
    'text-decoration-color': 'foreground',
    'column-rule-color': 'border',
    'caret-color': 'foreground',
    fill: 'foreground',
    stroke: 'border',
    'stop-color': 'background',
    'flood-color': 'background',
    'lighting-color': 'foreground',
  });
  const COLOR_FUNCTION = /(?:#(?:[0-9a-f]{3,8})\b|rgba?\([^)]*\)|hsla?\([^)]*\)|\b(?:white|black|silver|gray|grey|maroon|red|purple|fuchsia|green|lime|olive|yellow|navy|blue|teal|aqua)\b)/ig;
  let context;
  const inlineStyleLedger = new Map();

  function parse(value) {
    const raw = String(value || '').trim();
    if (!raw || /^(transparent|none|inherit|initial|unset|currentcolor)$/i.test(raw)) return null;
    const key = raw.toLowerCase();
    if (cache.has(key)) return cache.get(key);
    try {
      context ||= (() => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        return canvas.getContext('2d', { willReadFrequently: true });
      })();
      if (!context) return null;
      context.fillStyle = '#000';
      context.fillStyle = raw;
      const normalized = String(context.fillStyle);
      let result = null;
      if (/^#[0-9a-f]{6}$/i.test(normalized)) {
        result = {
          r: parseInt(normalized.slice(1, 3), 16),
          g: parseInt(normalized.slice(3, 5), 16),
          b: parseInt(normalized.slice(5, 7), 16),
          a: 1,
        };
      } else {
        const match = normalized.match(/^rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/i);
        if (match) result = { r: +match[1], g: +match[2], b: +match[3], a: match[4] === undefined ? 1 : +match[4] };
      }
      cache.set(key, result);
      if (cache.size > 512) cache.delete(cache.keys().next().value);
      return result;
    } catch {
      return null;
    }
  }

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const linear = (channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  const luminance = (color) => color ? 0.2126 * linear(color.r) + 0.7152 * linear(color.g) + 0.0722 * linear(color.b) : 0;
  const saturation = (color) => color ? (Math.max(color.r, color.g, color.b) - Math.min(color.r, color.g, color.b)) / 255 : 0;
  const contrastRatio = (left, right) => {
    const a = luminance(typeof left === 'string' ? parse(left) : left);
    const b = luminance(typeof right === 'string' ? parse(right) : right);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  };
  const rgba = (color) => color.a < 0.999 ? `rgba(${color.r}, ${color.g}, ${color.b}, ${Math.round(color.a * 1000) / 1000})` : `rgb(${color.r}, ${color.g}, ${color.b})`;

  function mix(left, right, amount) {
    const a = parse(left);
    const b = parse(right);
    if (!a || !b) return right || left;
    const t = clamp(amount);
    return rgba({
      r: Math.round(a.r + (b.r - a.r) * t),
      g: Math.round(a.g + (b.g - a.g) * t),
      b: Math.round(a.b + (b.b - a.b) * t),
      a: a.a + (b.a - a.a) * t,
    });
  }

  function composite(foregroundColor, backgroundColor) {
    const fg = typeof foregroundColor === 'string' ? parse(foregroundColor) : foregroundColor;
    const bg = typeof backgroundColor === 'string' ? parse(backgroundColor) : backgroundColor;
    if (!fg) return bg;
    if (!bg || fg.a >= 0.999) return { ...fg, a: 1 };
    const fa = clamp(fg.a), ba = clamp(bg.a);
    const a = fa + ba * (1 - fa);
    if (a <= 0.001) return { r: 0, g: 0, b: 0, a: 0 };
    return {
      r: Math.round((fg.r * fa + bg.r * ba * (1 - fa)) / a),
      g: Math.round((fg.g * fa + bg.g * ba * (1 - fa)) / a),
      b: Math.round((fg.b * fa + bg.b * ba * (1 - fa)) / a),
      a,
    };
  }

  function effectiveBackground(value, fallback) {
    const source = parse(value);
    const base = parse(fallback);
    if (!source) return fallback;
    if (source.a >= 0.999) return rgba(source);
    return rgba(composite(source, base || parse('#000000')));
  }

  function background(value, theme, parentBackground = theme.page) {
    let source = parse(value);
    if (!source || source.a < 0.08) return value;
    if (source.a < 0.999) source = composite(source, parse(parentBackground) || parse(theme.page));
    const l = luminance(source);
    const sat = saturation(source);
    const low = parse(theme.page);
    const high = parse(theme.overlay || theme.raised || theme.surface);
    if (!low || !high) return theme.surface;
    const sourceDepth = clamp((l - 0.08) / 0.92);
    // Keep structural depth visible even in very dark/high-contrast palettes.
    const depth = 0.28 + sourceDepth * 0.66;
    const neutralTarget = mix(theme.page, theme.overlay || theme.raised || theme.surface, depth);
    // Structural backgrounds belong to the selected SHIFT palette. Source saturation is
    // useful for recognizing hierarchy, but must not tint whole interfaces toward the site's
    // brand color. Semantic color is preserved by foreground/status/artwork paths instead.
    if (sat < 0.12) return neutralTarget;
    const chromaLift = clamp(sat * 0.12, 0.02, 0.08);
    return mix(neutralTarget, theme.raised || theme.surface, chromaLift);
  }

  function ensureContrast(candidate, backgroundValue, theme, minimum = 4.5) {
    const bg = parse(backgroundValue);
    let fg = parse(candidate);
    if (!bg || !fg || contrastRatio(fg, bg) >= minimum) return candidate;
    const light = parse(theme.text || '#ffffff');
    const dark = parse(theme.page || '#000000');
    const lightRatio = light ? contrastRatio(light, bg) : 0;
    const darkRatio = dark ? contrastRatio(dark, bg) : 0;
    const target = lightRatio >= darkRatio ? theme.text : theme.page;
    if (!parse(target)) return candidate;
    let best = target;
    for (let step = 1; step <= 10; step += 1) {
      const mixed = mix(candidate, target, step / 10);
      best = mixed;
      if (contrastRatio(mixed, bg) >= minimum) break;
    }
    return best;
  }

  function foreground(value, theme, backgroundValue = theme.page, minimum = 4.5) {
    const source = parse(value);
    if (!source || source.a < 0.08) return value;
    const l = luminance(source);
    const sat = saturation(source);
    const candidate = sat > 0.2 && l > 0.08
      ? mix(theme.muted, rgba({ ...source, a: 1 }), Math.min(0.38, sat * 0.42))
      : (l < 0.5 ? theme.text : mix(theme.text, theme.muted, 0.22));
    return ensureContrast(candidate, backgroundValue, theme, minimum);
  }

  function border(value, theme) {
    const source = parse(value);
    if (!source || source.a < 0.08) return value;
    const sat = saturation(source);
    // Ordinary borders reinforce theme hierarchy instead of carrying the source site's hue.
    // Accent/status borders are handled by semantic host CSS and protected status elements.
    return sat > 0.2 ? mix(theme.raised, theme.muted, 0.58) : mix(theme.raised, theme.muted, 0.48);
  }

  function transform(value, role, theme, backgroundValue) {
    const key = [theme.id || theme.page, theme.accent, role, String(value).toLowerCase(), backgroundValue || ''].join('|');
    if (transformCache.has(key)) return transformCache.get(key);
    const result = role === 'background'
      ? background(value, theme, backgroundValue || theme.page)
      : role === 'foreground'
        ? foreground(value, theme, backgroundValue || theme.page)
        : border(value, theme);
    transformCache.set(key, result);
    if (transformCache.size > 2048) transformCache.delete(transformCache.keys().next().value);
    return result;
  }

  function transformColorTokens(value, role, theme, backgroundValue) {
    const source = String(value || '');
    if (!source || /url\s*\(/i.test(source)) return source;
    return source.replace(COLOR_FUNCTION, (token) => transform(token, role, theme, backgroundValue));
  }

  function variableRole(name) {
    const key = String(name || '').toLowerCase();
    if (key.startsWith('--exp-shift-')) return null;
    if (/(?:bg|background|surface|canvas|panel|card|layer|elevation|base|container)/.test(key)) return 'background';
    if (/(?:text|foreground|fg|label|copy|font|ink|content)/.test(key)) return 'foreground';
    if (/(?:border|outline|divider|stroke|rule|separator)/.test(key)) return 'border';
    return null;
  }

  const inlineLedger = new Map();

  function rememberInline(element, property) {
    if (!inlineStyleLedger.has(element)) inlineStyleLedger.set(element, element.getAttribute('style'));
    let saved = inlineLedger.get(element);
    if (!saved) { saved = new Map(); inlineLedger.set(element, saved); }
    if (!saved.has(property)) saved.set(property, [element.style.getPropertyValue(property), element.style.getPropertyPriority(property)]);
  }

  function setOverride(element, property, value) {
    rememberInline(element, property);
    element.style.setProperty(property, value, 'important');
  }

  function sourceValue(element, property) {
    const saved = inlineLedger.get(element)?.get(property);
    return saved ? saved[0] : element.style.getPropertyValue(property);
  }

  function transformedElementBackground(element, theme) {
    try {
      const inline = sourceValue(element, 'background-color');
      if (inline) return background(inline, theme);
      const computed = getComputedStyle(element).backgroundColor;
      const parsed = parse(computed);
      if (parsed && parsed.a >= 0.08) return background(computed, theme);
      const parent = element.parentElement;
      return parent ? transformedElementBackground(parent, theme) : theme.page;
    } catch { return theme.page; }
  }

  function inspectInline(element, theme) {
    if (!element?.style || element.closest?.('[data-exp-owned="1"],[data-exp-shift-preserve]')) return;
    const declarationNames = [];
    const transformedBg = transformedElementBackground(element, theme);
    for (const [property, role] of Object.entries(COLOR_PROPS)) {
      const value = sourceValue(element, property);
      if (!value || /var\s*\(/i.test(value)) continue;
      const next = transformColorTokens(value, role, theme, role === 'foreground' ? transformedBg : undefined);
      if (next !== value) { setOverride(element, property, next); declarationNames.push(property); }
    }
    const variableNames = [];
    const names = new Set([...Array.from({ length: element.style.length }, (_, index) => element.style.item(index)), ...(inlineLedger.get(element)?.keys() || [])]);
    for (const name of names) {
      if (!name?.startsWith('--')) continue;
      const role = variableRole(name);
      if (!role) continue;
      const value = sourceValue(element, name).trim();
      if (!value || /var\s*\(/i.test(value) || /url\s*\(/i.test(value)) continue;
      const next = transformColorTokens(value, role, theme);
      if (next !== value) { setOverride(element, name, next); variableNames.push(name); }
    }
    if (declarationNames.length) element.setAttribute(INLINE_ATTR, declarationNames.join(','));
    else element.removeAttribute(INLINE_ATTR);
    if (variableNames.length) element.setAttribute(INLINE_VARS_ATTR, variableNames.join(','));
    else element.removeAttribute(INLINE_VARS_ATTR);
  }

  function clear(root = document) {
    for (const [element, saved] of [...inlineLedger]) {
      if (root !== document && root !== element && !root.contains?.(element)) continue;
      const originalStyle = inlineStyleLedger.get(element);
      if (originalStyle === null) element.removeAttribute('style');
      else element.setAttribute('style', originalStyle);
      element.removeAttribute(INLINE_ATTR);
      element.removeAttribute(INLINE_VARS_ATTR);
      inlineLedger.delete(element);
      inlineStyleLedger.delete(element);
    }
  }

  function health(root = document) {
    return {
      inline: root.querySelectorAll?.(`[${INLINE_ATTR}]`).length || 0,
      variables: root.querySelectorAll?.(`[${INLINE_VARS_ATTR}]`).length || 0,
      cache: cache.size,
      transformCache: transformCache.size,
    };
  }

  return Object.freeze({
    parse, luminance, saturation, contrastRatio, ensureContrast, transform, background, foreground, border,
    inspectInline, clear, health,
    INLINE_ATTR, INLINE_VARS_ATTR,
  });
})();

EXP.SiteFixes = (() => {
  const fixes = Object.freeze({
    amazon: {
      hosts: ['amazon.com'],
      // Small, declarative exceptions. Dynamic Engine remains primary.
      preserve: [
        '#imgTagWrapperId img','.a-dynamic-image','.s-image','img.a-lazy-loaded',
        '[class*="image"] img','video','canvas'
      ],
      preserveSurfaces: [
        '#imgTagWrapperId','.s-product-image-container',
        '[class*="product-image" i]','[class*="image-container" i]',
        '.a-cardui :is(.a-section,.a-row):has(> img)',
        '.a-carousel-card :is(.a-section,.a-row):has(> img)'
      ],
      surfaces: [
        '#nav-main','#navbar','#nav-belt','#nav-subnav','.nav-search','.nav-search-field',
        '.nav-flyout','.nav-flyout-content','.a-box','.a-cardui','.a-popover-inner','.a-modal-scroller',
        '.s-result-item','.s-card-container','.s-widget-container','.a-section.a-spacing-base',
        '.a-alert-container','.a-alert-content','.a-tabs','.a-tab-heading',
        '.a-dropdown-container select','.a-dropdown-prompt','.a-menu-item','.a-button','.a-button-inner',
        '.a-input-text','.nav-input','input:not([type="checkbox"]):not([type="radio"])','textarea'
      ],
      text: [
        '.a-color-base','.a-color-secondary','.a-color-tertiary','.a-size-base','.a-text-normal',
        '.a-size-base-plus','.a-size-medium','.a-size-large',
        '.a-price','.a-price-whole','.a-price-fraction','.a-price-symbol',
        '.s-title-instructions-style','.a-link-normal:not(:has(img))'
      ],
      forceText: [
        '.a-cardui :is(.a-size-base,.a-size-base-plus,.a-size-medium,.a-size-large,.a-text-normal,.a-price,.a-price-whole,.a-price-fraction,.a-price-symbol)',
        '.s-card-container :is(.a-size-base,.a-size-base-plus,.a-size-medium,.a-size-large,.a-text-normal,.a-price,.a-price-whole,.a-price-fraction,.a-price-symbol)',
        '.s-widget-container :is(.a-size-base,.a-size-base-plus,.a-size-medium,.a-size-large,.a-text-normal,.a-price,.a-price-whole,.a-price-fraction,.a-price-symbol)',
        '.a-carousel-card :is(.a-size-base,.a-size-base-plus,.a-size-medium,.a-size-large,.a-text-normal,.a-price,.a-price-whole,.a-price-fraction,.a-price-symbol)',
        '.a-cardui a.a-link-normal:not(:has(img))',
        '.s-card-container a.a-link-normal:not(:has(img))',
        '.s-widget-container a.a-link-normal:not(:has(img))',
        '.a-carousel-card a.a-link-normal:not(:has(img))'
      ],
      ignoreInline: ['[style*="background-image"]','.a-dynamic-image'],
      css: `
        :is(#nav-main,#navbar,#nav-belt,#nav-subnav,.nav-flyout,.nav-flyout-content){
          background-color:var(--exp-shift-navigation)!important;color:var(--exp-shift-text)!important;
          border-color:color-mix(in srgb,var(--exp-shift-muted) 40%,transparent)!important
        }
        :is(.a-box,.a-cardui,.s-card-container,.s-widget-container,.a-popover-inner,.a-modal-scroller,.a-alert-container,.a-alert-content,.a-tabs,.a-menu-item){
          background-color:var(--exp-shift-surface)!important;color:var(--exp-shift-text)!important;
          border-color:color-mix(in srgb,var(--exp-shift-muted) 38%,transparent)!important
        }
        :is(.nav-search-field,.a-input-text,.a-dropdown-container select,.a-dropdown-prompt,.nav-input,input:not([type="checkbox"]):not([type="radio"]),textarea){
          background-color:var(--exp-shift-input)!important;color:var(--exp-shift-text)!important;
          border-color:color-mix(in srgb,var(--exp-shift-accent) 65%,var(--exp-shift-muted))!important
        }
        :is(.a-button,.a-button-inner,#nav-search-submit-button){
          background-color:var(--exp-shift-interactive)!important;color:var(--exp-shift-text)!important;
          border-color:color-mix(in srgb,var(--exp-shift-muted) 45%,transparent)!important
        }
        :is(.a-color-base,.a-color-secondary,.a-color-tertiary,.a-size-base,.a-text-normal,.a-size-base-plus,.a-size-medium,.a-size-large,.a-price,.a-price-whole,.a-price-fraction,.a-price-symbol,.s-title-instructions-style){
          color:var(--exp-shift-text)!important
        }
        :is(.a-dynamic-image,.s-image,#imgTagWrapperId img,[class*="image"] img,[class*="asin-image" i]){
          filter:none!important;opacity:1!important;mix-blend-mode:normal!important
        }
        :is(#imgTagWrapperId,.s-product-image-container,[class*="product-image" i],[class*="image-container" i],[class*="asin-image-wrapper" i],[class*="asin-image-container" i]){
          opacity:1!important;filter:none!important;mix-blend-mode:normal!important
        }
        :is([class*="asin-metadata" i],[class*="asin-title" i],[class*="asin-price" i]){
          opacity:1!important;filter:none!important;mix-blend-mode:normal!important
        }
      `,
    },
    steamgifts: {
      hosts: ['steamgifts.com'],
      // SteamGifts uses pale gradient heading/notice strips over an otherwise dark layout.
      // Keep those strips and their controls together instead of darkening only their text.
      css: `:is(.page__heading,.page__heading__breadcrumbs,.table__heading,.table__column__heading){background-color:var(--exp-shift-raised)!important;background-image:none!important;color:var(--exp-shift-text)!important}
        .notification{background-color:color-mix(in srgb,#b88718 30%,var(--exp-shift-surface))!important;background-image:none!important;color:#fff3c4!important;border-color:#b88718!important}
        :is(.page__heading,.page__heading__breadcrumbs,.notification,.table__heading,.table__column__heading) :is(a,span,small,button){color:var(--exp-shift-text)!important}
        .notification :is(a,span,small,button){color:#fff3c4!important}
        .table__row-outer-wrap :is(.table__column__heading,.table__column__secondary-link){color:var(--exp-shift-text)!important}
        :is(.giveaway__row-outer-wrap,.featured__container) :is(.giveaway__heading__thin,.giveaway__heading__name,.giveaway__column--contributor-level){color:var(--exp-shift-text)!important;text-shadow:none!important}
        :is(.giveaway__row-outer-wrap,.featured__container) .giveaway__column--contributor-level{background-image:none!important;background-color:var(--exp-shift-raised)!important;border-color:var(--exp-shift-muted)!important}`,
    }
  });
  function match(host=location.hostname){
    return Object.entries(fixes).find(([,f])=>f.hosts.some(h=>host===h||host.endsWith('.'+h)))||null;
  }
  function active(){const m=match();return m?{id:m[0],...m[1]}:null;}
  function css(){return active()?.css||'';}
  return Object.freeze({active,match,css});
})();

EXP.DynamicEngine = (() => {
  const handles = new Map();
  const remoteHandles = new Map();
  const remoteCache = new Map();
  const cache = new Map();
  const stats = { runs:0, sheets:0, rulesSeen:0, rulesGenerated:0, inaccessible:0, remoteSheets:0, remoteRules:0, remoteFailures:0, remoteSkippedNoHref:0, cacheHits:0, cacheMisses:0, variables:0, groups:0, shadowRoots:0, adoptedSheets:0, inferredVariables:0, skippedSemanticVariables:0, gradients:0, layeredBackgrounds:0, preservedImages:0, currentColor:0, colorMix:0, masks:0, filters:0 };
  const remoteLifetime = { attempts:0, successes:0, failures:0, skippedNoHref:0, recoveredRules:0, lastSuccessAt:0, lastFailure:null, hosts:new Set() };
  let observer=null, timer=0, active=false, theme=null, lastThemeKey='', generation=0;
  const pendingRemote = new Map();

  const signature = (sheet) => {
    try {
      const rules=sheet.cssRules; let hash=2166136261;
      for(let i=0;i<rules.length;i+=Math.max(1,Math.floor(rules.length/48))){
        const text=rules[i]?.cssText||'';
        for(let j=0;j<text.length;j+=Math.max(1,Math.floor(text.length/32))){hash^=text.charCodeAt(j);hash=Math.imul(hash,16777619);}
      }
      return `${rules.length}:${hash>>>0}`;
    } catch { return 'x'; }
  };
  const themeKey = (t) => [t.id,t.page,t.surface,t.raised,t.overlay,t.text,t.muted,t.accent].join('|');

  function role(property,name='',value=''){
    if(String(name).startsWith('--exp-shift-'))return null;
    const key=`${property} ${name}`.toLowerCase();
    const semantic=/(?:success|danger|error|warning|info|brand|logo|rating|star|sale|discount|promo|price|positive|negative|favorite|heart|selected|active-state)/.test(key);
    if(semantic){stats.skippedSemanticVariables++;return null;}
    if(/background|\bbg\b|surface|canvas|panel|card|layer|container|popover|dialog|menu/.test(key))return'background';
    if(/color|text|foreground|\bfg\b|label|ink|content|fill|lighting|copy|font/.test(key))return'foreground';
    if(/border|outline|divider|stroke|rule|separator/.test(key))return'border';
    if(name&&String(name).startsWith('--')){
      const parsed=EXP.ColorEngine.parse(String(value).trim());
      if(parsed&&(parsed.a??1)>.08){
        const lum=EXP.ColorEngine.luminance(parsed),sat=EXP.ColorEngine.saturation(parsed);
        if(sat<.14&&lum>.42){stats.inferredVariables++;return'background';}
        if(sat<.12&&lum<.42){stats.inferredVariables++;return'foreground';}
      }
    }
    return null;
  }
  function resolve(value,vars,seen=new Set()){
    return String(value||'').replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]+))?\)/g,(m,n,f)=>{
      if(seen.has(n))return f||m;const v=vars.get(n);if(!v)return f||m;const next=new Set(seen);next.add(n);return resolve(v,vars,next);
    });
  }
  function transformValue(property,value,vars,background){
    let resolved=resolve(value,vars);
    if(/currentcolor/i.test(resolved)){stats.currentColor++;return value;}
    if(/color-mix\s*\(/i.test(resolved)){stats.colorMix++;return value;}
    const hasUrl=/url\s*\(/i.test(resolved),hasGradient=/(?:repeating-)?(?:linear|radial|conic)-gradient\s*\(/i.test(resolved);
    if(hasUrl&&!hasGradient){stats.preservedImages++;return value;}
    if(hasGradient){
      stats.gradients++;
      if(hasUrl)stats.layeredBackgrounds++;
      return resolved.replace(/(?:#(?:[0-9a-f]{3,8})\b|rgba?\([^)]*\)|hsla?\([^)]*\)|\b(?:white|black|silver|gray|grey)\b)/ig,c=>EXP.ColorEngine.transform(c,'background',theme,background));
    }
    if(/mask(?:-image)?$/i.test(property)){stats.masks++;return value;}
    if(/^filter$/i.test(property)){
      stats.filters++;
      return resolved.replace(/drop-shadow\(([^)]*)\)/ig,(m,body)=>`drop-shadow(${body.replace(/(?:#(?:[0-9a-f]{3,8})\b|rgba?\([^)]*\)|hsla?\([^)]*\))/ig,c=>EXP.ColorEngine.transform(c,'border',theme,background))})`);
    }
    if(/shadow/i.test(property)) return resolved.replace(/(?:#(?:[0-9a-f]{3,8})\b|rgba?\([^)]*\)|hsla?\([^)]*\))/ig,c=>EXP.ColorEngine.transform(c,'border',theme,background));
    const r=role(property,'',resolved);if(!r)return value;
    return resolved.replace(/(?:#(?:[0-9a-f]{3,8})\b|rgba?\([^)]*\)|hsla?\([^)]*\)|\b(?:white|black|silver|gray|grey|red|green|blue|yellow|teal|aqua)\b)/ig,c=>EXP.ColorEngine.transform(c,r,theme,background));
  }
  function walk(rules,out,vars=new Map(),budget=5000){
    if (typeof budget === 'number') budget = { remaining: budget };
    if(!rules||budget.remaining<=0)return;
    const scope=new Map(vars);
    for(const rule of rules){try{if(rule.type===CSSRule.STYLE_RULE)for(let i=0;i<rule.style.length;i++){const p=rule.style.item(i);if(p.startsWith('--'))scope.set(p,rule.style.getPropertyValue(p));}}catch{}}
    for(const rule of rules){
      if(budget.remaining<=0)break;budget.remaining--;stats.rulesSeen++;
      try{
        if(rule.type===CSSRule.STYLE_RULE&&rule.selectorText&&rule.style){
          if(/data-exp-shift|exp-shift-root/.test(rule.selectorText))continue;
          const declarations=[];let bg=theme.page;
          const rawBg=rule.style.getPropertyValue('background-color')||rule.style.getPropertyValue('background');
          if(rawBg){const transformed=transformValue('background-color',rawBg,scope,theme.page);const token=transformed.match(/(?:#(?:[0-9a-f]{3,8})\b|rgba?\([^)]*\))/i)?.[0];if(token)bg=token;}
          for(let i=0;i<rule.style.length;i++){
            const p=rule.style.item(i),v=rule.style.getPropertyValue(p);let next=v;
            if(p.startsWith('--')){const rr=role('',p,v);if(rr){next=resolve(v,scope).replace(/(?:#(?:[0-9a-f]{3,8})\b|rgba?\([^)]*\)|hsla?\([^)]*\))/ig,c=>EXP.ColorEngine.transform(c,rr,theme,bg));if(next!==v)stats.variables++;}}
            else next=transformValue(p,v,scope,bg);
            if(next!==v)declarations.push(`${p}:${next}!important`);
          }
          if(declarations.length){out.push(`${rule.selectorText}{${declarations.join(';')}}`);stats.rulesGenerated++;}
        }else if(rule.cssRules){
          const nested=[];walk(rule.cssRules,nested,scope,budget);
          const head=rule.cssText?.slice(0,rule.cssText.indexOf('{')).trim();
          if(nested.length&&/^@(media|supports|layer|container|scope)\b/i.test(head||'')){out.push(`${head}{${nested.join('')}}`);stats.groups++;}
        }
      }catch{}
    }
  }
  function processSheet(sheet,root,budget){
    const key=`${themeKey(theme)}|${signature(sheet)}|${budget}`;let css=cache.get(key);
    if(css!==undefined)stats.cacheHits++;else{stats.cacheMisses++;const out=[];walk(sheet.cssRules,out,new Map(),budget);css=out.join('\n');cache.set(key,css);if(cache.size>96)cache.delete(cache.keys().next().value);}
    let handle=handles.get(sheet);
    if(!css){handle?.remove();handles.delete(sheet);return;}
    if(!handle?.isConnected){handle=document.createElement('style');handle.dataset.expOwned='1';handle.dataset.expShiftDynamic='1';(root instanceof ShadowRoot?root:(document.head||document.documentElement)).append(handle);handles.set(sheet,handle);}
    if(handle.textContent!==css)handle.textContent=css;
  }
  function requestText(url){
    return new Promise((resolve,reject)=>{
      if(typeof GM_xmlhttpRequest!=='function')return reject(new Error('Remote stylesheet transport unavailable'));
      let settled=false,request=null;
      const finish=(fn,value)=>{
        if(settled)return;
        settled=true;
        clearTimeout(watchdog);
        fn(value);
      };
      const watchdog=setTimeout(()=>{
        try{request?.abort?.();}catch{}
        finish(reject,new Error('Stylesheet request watchdog timed out'));
      },15000);
      try{
        request=GM_xmlhttpRequest({
          method:'GET',url,timeout:12000,
          onload:r=>r.status>=200&&r.status<300
            ? finish(resolve,r.responseText)
            : finish(reject,new Error(`Stylesheet HTTP ${r.status}`)),
          onerror:()=>finish(reject,new Error('Stylesheet request failed')),
          ontimeout:()=>finish(reject,new Error('Stylesheet request timed out')),
          onabort:()=>finish(reject,new Error('Stylesheet request aborted')),
        });
      }catch(error){finish(reject,error);}
    });
  }
  function rewriteUrls(cssText,baseUrl){
    return String(cssText||'').replace(/url\(\s*(['"]?)(?!data:|blob:|https?:|\/\/|#)([^'")]+)\1\s*\)/ig,(_m,q,path)=>{
      try{return `url("${new URL(path,baseUrl).href}")`;}catch{return _m;}
    });
  }
  function parseRemote(cssText){
    const doc=document.implementation.createHTMLDocument('shift-css');
    const style=doc.createElement('style');style.textContent=cssText;doc.head.append(style);
    return style.sheet?.cssRules||[];
  }
  async function processRemoteSheet(sheet,root){
    const href=sheet.href||sheet.ownerNode?.href;
    if(!href||!/^https?:/i.test(href)){
      stats.remoteSkippedNoHref++;
      remoteLifetime.skippedNoHref++;
      return;
    }
    const key=`${href}|${themeKey(theme)}`, epoch=generation;
    if(pendingRemote.has(key))return;
    let css=remoteCache.get(key);
    if(css===undefined){
      try{
        pendingRemote.set(key,epoch);
        remoteLifetime.attempts++;
        try{remoteLifetime.hosts.add(new URL(href).hostname);}catch{}
        const source=rewriteUrls(await requestText(href),href);
        if(!active||epoch!==generation||sheet.ownerNode?.isConnected===false)return;
        const rules=parseRemote(source),out=[];
        walk(rules,out,new Map(),8000);
        css=out.join('\n');
        remoteCache.set(key,css);
        if(remoteCache.size>32)remoteCache.delete(remoteCache.keys().next().value);
        stats.remoteRules+=out.length;
        remoteLifetime.successes++;
        remoteLifetime.recoveredRules+=out.length;
        remoteLifetime.lastSuccessAt=Date.now();
      }catch(error){
        if(active&&epoch===generation){
          stats.remoteFailures++;
          remoteLifetime.failures++;
          let host='';
          try{host=new URL(href).hostname;}catch{}
          remoteLifetime.lastFailure={ at:Date.now(), host, message:String(error?.message||error||'Remote stylesheet failed') };
          EXP.Core.safeError(Object.assign(error,{code:'REMOTE_STYLESHEET'}),'shift-dynamic');
        }
        return;
      }
      finally { if(pendingRemote.get(key)===epoch)pendingRemote.delete(key); }
    }else stats.cacheHits++;
    if(!active||epoch!==generation||sheet.ownerNode?.isConnected===false)return;
    let handle=remoteHandles.get(href);
    if(!css){handle?.remove();remoteHandles.delete(href);return;}
    if(!handle?.isConnected){handle=document.createElement('style');handle.dataset.expOwned='1';handle.dataset.expShiftDynamicRemote='1';(root instanceof ShadowRoot?root:(document.head||document.documentElement)).append(handle);remoteHandles.set(href,handle);}
    if(handle.textContent!==css)handle.textContent=css;stats.remoteSheets++;
  }

  function refresh(nextTheme){
    if(!nextTheme)return;
    if(!active){start(nextTheme);return;}
    const nextKey=themeKey(nextTheme);
    if(lastThemeKey&&lastThemeKey!==nextKey){
      generation++;pendingRemote.clear();
      for(const h of handles.values())h.remove(); handles.clear();
      for(const h of remoteHandles.values())h.remove(); remoteHandles.clear();
    }
    theme=nextTheme;lastThemeKey=nextKey;stats.runs++;stats.sheets=stats.rulesSeen=stats.rulesGenerated=stats.inaccessible=stats.remoteSheets=stats.remoteRules=stats.remoteFailures=stats.remoteSkippedNoHref=stats.variables=stats.groups=stats.shadowRoots=stats.adoptedSheets=stats.inferredVariables=stats.skippedSemanticVariables=stats.gradients=stats.layeredBackgrounds=stats.preservedImages=stats.currentColor=stats.colorMix=stats.masks=stats.filters=0;
    const roots=[document];
    const visitShadows=(root)=>{
      root.querySelectorAll?.('*').forEach(el=>{
        if(!el.shadowRoot||el.closest?.('[data-exp-owned="1"]'))return;
        roots.push(el.shadowRoot);visitShadows(el.shadowRoot);
      });
    };
    visitShadows(document);
    stats.shadowRoots=Math.max(0,roots.length-1);
    const live=new Set();
    for(const root of roots){
      const normalSheets=[...(root.styleSheets||[])];
      let adopted=[];try{adopted=[...(root.adoptedStyleSheets||[])];}catch{}
      stats.adoptedSheets+=adopted.length;
      for(const sheet of [...normalSheets,...adopted]){
        if(sheet.ownerNode?.dataset?.expOwned==='1')continue;
        try{void sheet.cssRules;processSheet(sheet,root,6000);live.add(sheet);stats.sheets++;}catch{stats.inaccessible++;processRemoteSheet(sheet,root);}
      }
    }
    for(const [sheet,handle] of [...handles])if(!live.has(sheet)){handle.remove();handles.delete(sheet);}
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(()=>{timer=0;if(active&&theme)refresh(theme);},100);}
  function start(nextTheme){if(active){refresh(nextTheme);return;}theme=nextTheme;active=true;refresh(theme);observer?.disconnect();observer=new MutationObserver(ms=>{if(ms.some(m=>[...m.addedNodes].some(n=>n?.nodeType===1&&(n.matches?.('style,link[rel~="stylesheet"]')||n.querySelector?.('style,link[rel~="stylesheet"]'))) || m.target?.nodeName==='STYLE'))schedule();});observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});}
  function stop(){active=false;generation++;pendingRemote.clear();clearTimeout(timer);timer=0;observer?.disconnect();observer=null;for(const h of handles.values())h.remove();handles.clear();for(const h of remoteHandles.values())h.remove();remoteHandles.clear();lastThemeKey='';}
  function health(){return {...stats,pendingRemote:pendingRemote.size,pendingRemoteHosts:[...new Set([...pendingRemote.keys()].map(key=>{try{return new URL(key.split('|')[0]).hostname;}catch{return'';}}).filter(Boolean))].slice(0,12),remoteAttemptHosts:[...remoteLifetime.hosts].slice(0,12),remoteAttemptsLifetime:remoteLifetime.attempts,remoteSuccessesLifetime:remoteLifetime.successes,remoteFailuresLifetime:remoteLifetime.failures,remoteSkippedNoHrefLifetime:remoteLifetime.skippedNoHref,remoteRulesRecoveredLifetime:remoteLifetime.recoveredRules,lastRemoteSuccessAt:remoteLifetime.lastSuccessAt||null,lastRemoteFailure:remoteLifetime.lastFailure?{...remoteLifetime.lastFailure}:null,handles:handles.size,remoteHandles:remoteHandles.size,cacheEntries:cache.size,remoteCacheEntries:remoteCache.size};}
  return Object.freeze({start,refresh,stop,health});
})();

EXP.LiveResolver = (() => {
  let observer = null;
  let timer = 0;
  let active = false;
  let theme = null;
  let fix = null;
  let options = { repairSurfaces:true, surfaceLevel:'conservative', nativeDark:false };

  const ATTR = 'data-exp-shift-live';
  const PRESERVE = 'data-exp-shift-preserve';
  const PROTECTED = [
    '[data-exp-owned="1"]', `[${PRESERVE}]`,
    'img','picture','video','canvas','svg','[role="img"]',
    '[class*="badge" i]','[class*="status" i]','[class*="rating" i]','[role="progressbar"]'
  ].join(',');
  const CANDIDATES = [
    'html','body','main','header','footer','nav','aside','section','article','div','form','fieldset',
    'input','textarea','select','button','details','summary','dialog','[popover]','[role="main"]','[role="banner"]','[role="navigation"]',
    '[role="contentinfo"]','[role="dialog"]','[role="menu"]','[role="listbox"]','[role="option"]',
    '[role="button"]','[role="textbox"]','[role="combobox"]','[role="searchbox"]','[role="tooltip"]','[role="alert"]','[role="status"]'
  ].join(',');
  const TEXT_CANDIDATES = [
    'p','span','a','label','li','dt','dd','small','figcaption','legend','caption',
    'h1','h2','h3','h4','h5','h6','button','input','textarea','select','[role="button"]','[role="option"]'
  ].join(',');
  const NATIVE_DARK_CANDIDATES = [
    'input','textarea','select','button','details','summary','dialog','[popover]',
    '[role="dialog"]','[role="menu"]','[role="listbox"]','[role="option"]','[role="button"]',
    '[role="textbox"]','[role="combobox"]','[role="searchbox"]','[role="tooltip"]','[role="alert"]','[role="status"]'
  ].join(',');

  const ledger = new Map();
  const processors = new Set();
  const queuedRoots = new Set();
  const selfMutations = new WeakSet();
  const pseudoRules = new Map();
  let pseudoStyle = null;
  let pseudoSequence = 0;
  let backgroundCache = new WeakMap();
  const stats = {
    passes:0,scanned:0,unresolved:0,resolved:0,siteFixes:0,contrast:0,brightSurfaces:0,forms:0,
    inheritedBackgrounds:0,transparentSurfaces:0,textRepairs:0,skippedProtected:0,skippedSemantic:0,backgroundImages:0,imageOverlays:0,iframes:0,iframeFailures:0,placeholders:0,selectionRules:0,scrollbars:0,stickySurfaces:0,fixedSurfaces:0,borders:0,outlines:0,details:0,dialogs:0,popovers:0,mutationPasses:0,rootsQueued:0,
    selfMutationsIgnored:0,rootsCollapsed:0,lastExamined:0,lastChanged:0,lastRoots:0,lastDurationMs:0,maxDurationMs:0,
    backgroundCacheHits:0,backgroundParentCacheHits:0,backgroundWalkSteps:0,nativeDarkDepthStops:0,nativeDarkExtendedWalks:0,nativeDarkFastPathPasses:0,lastSurfaceLimit:0,lastTextLimit:0
  };

  function parse(value){ return EXP.ColorEngine.parse(value); }
  function rgba(color){
    if(!color)return null;
    const a=color.a==null?1:color.a;
    return a<.999
      ? `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${Math.round(a*1000)/1000})`
      : `rgb(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)})`;
  }
  function composite(fg,bg){
    if(!fg)return bg;
    if(!bg||(fg.a??1)>=.999)return {...fg,a:1};
    const fa=Math.max(0,Math.min(1,fg.a??1)),ba=Math.max(0,Math.min(1,bg.a??1));
    const a=fa+ba*(1-fa);
    if(a<=.001)return {r:0,g:0,b:0,a:0};
    return {
      r:(fg.r*fa+bg.r*ba*(1-fa))/a,
      g:(fg.g*fa+bg.g*ba*(1-fa))/a,
      b:(fg.b*fa+bg.b*ba*(1-fa))/a,a
    };
  }
  function isProtected(el){
    try{
      if(!el||el.nodeType!==1)return true;
      if(el.matches(PROTECTED)||el.closest('[data-exp-owned="1"],[data-exp-shift-preserve]')){stats.skippedProtected++;return true;}
    }catch{}
    return false;
  }
  function visible(el){
    try{
      const cs=getComputedStyle(el);
      if(cs.display==='none'||cs.visibility==='hidden'||Number(cs.opacity)<=.01)return false;
      const r=el.getBoundingClientRect();
      return r.width>1&&r.height>1&&r.bottom>=-240&&r.top<=innerHeight+240&&r.right>=-240&&r.left<=innerWidth+240;
    }catch{return false;}
  }
  function bright(color){
    const p=typeof color==='string'?parse(color):color;
    return Boolean(p&&(p.a??1)>.82&&EXP.ColorEngine.luminance(p)>.56);
  }
  function remember(el,property){
    let saved=ledger.get(el);
    if(!saved){saved=new Map();ledger.set(el,saved);}
    if(!saved.has(property))saved.set(property,[el.style.getPropertyValue(property),el.style.getPropertyPriority(property)]);
  }
  function write(el,property,value){
    if(!value)return false;
    remember(el,property);
    if(el.style.getPropertyValue(property)===value&&el.style.getPropertyPriority(property)==='important')return false;
    selfMutations.add(el);
    el.style.setProperty(property,value,'important');
    if(property==='background'||property==='background-color'||property==='background-image')backgroundCache=new WeakMap();
    setTimeout(()=>selfMutations.delete(el),0);
    return true;
  }
  function effectiveBackground(el){
    const cached=backgroundCache.get(el);
    if(cached){stats.backgroundCacheHits++;return cached;}
    const hardLimit=24,softLimit=options.nativeDark?8:24,seen=new Set();
    const fallback=rgba(parse(theme?.page)||{r:0,g:0,b:0,a:1})||(theme?.page||'#000');
    let extended=false;
    function resolve(node,depth){
      if(!node||seen.has(node))return fallback;
      const known=backgroundCache.get(node);
      if(known){
        if(node!==el)stats.backgroundParentCacheHits++;
        else stats.backgroundCacheHits++;
        return known;
      }
      if(depth>=hardLimit){
        if(options.nativeDark)stats.nativeDarkDepthStops++;
        return fallback;
      }
      if(options.nativeDark&&depth>=softLimit&&!extended){extended=true;stats.nativeDarkExtendedWalks++;}
      seen.add(node);stats.backgroundWalkSteps++;
      let own=null;
      try{own=parse(getComputedStyle(node).backgroundColor);}catch{}
      if(!own||(own.a??1)<=.001)stats.transparentSurfaces++;
      const parent=node.parentElement||node.getRootNode?.()?.host||null;
      let result='';
      if(own&&(own.a??1)>=.985){
        result=rgba(own);
      }else{
        const parentResult=resolve(parent,depth+1),parentColor=parse(parentResult);
        result=own&&parentColor?rgba(composite(own,parentColor)):parentResult||fallback;
        if(node!==el)stats.inheritedBackgrounds++;
      }
      seen.delete(node);
      if(result)backgroundCache.set(node,result);
      return result||fallback;
    }
    return resolve(el,0);
  }
  function minimumContrast(el){
    try{
      const cs=getComputedStyle(el),size=parseFloat(cs.fontSize)||16,weight=parseInt(cs.fontWeight,10)||400;
      return size>=24||(size>=18.66&&weight>=700)?3:4.5;
    }catch{return 4.5;}
  }
  function semanticSurface(el,cs){
    try{
      const key=`${el.className||''} ${el.id||''} ${el.getAttribute('role')||''} ${el.getAttribute('aria-label')||''}`.toLowerCase();
      if(/(?:badge|status|rating|star|success|danger|error|warning|sale|discount|promo|price|favorite|heart|brand|logo)/.test(key)){stats.skippedSemantic++;return true;}
      const own=parse(cs.backgroundColor);
      if(own&&EXP.ColorEngine.saturation(own)>.42&&EXP.ColorEngine.luminance(own)>.08&&EXP.ColorEngine.luminance(own)<.72){stats.skippedSemantic++;return true;}
    }catch{}
    return false;
  }
  function hasArtwork(cs){
    const image=String(cs.backgroundImage||'');
    if(!image||image==='none')return false;
    if(/url\s*\(/i.test(image)){stats.backgroundImages++;return true;}
    return false;
  }
  function repairImageOverlay(el,cs,effectiveBg){
    if(!hasArtwork(cs)||!bright(effectiveBg))return false;
    const text=parse(cs.color),bg=parse(effectiveBg);
    if(!text||!bg||EXP.ColorEngine.contrastRatio(text,bg)>=4.5)return false;
    const current=String(cs.backgroundImage||'');
    if(!/url\s*\(/i.test(current))return false;
    const overlay=`linear-gradient(rgba(0,0,0,.34),rgba(0,0,0,.34)),${current}`;
    if(write(el,'background-image',overlay)){stats.imageOverlays++;return true;}
    return false;
  }
  function shouldRepairSurface(el,cs,effectiveBg){
    const own=parse(cs.backgroundColor);
    if(!own||(own.a??1)<.08||!bright(effectiveBg)||semanticSurface(el,cs))return false;
    const sat=EXP.ColorEngine.saturation(own),lum=EXP.ColorEngine.luminance(own);
    return sat<=.32||lum>=.78;
  }
  function recordElementState(el,cs){
    if(cs.position==='fixed')stats.fixedSurfaces++;
    else if(cs.position==='sticky')stats.stickySurfaces++;
    if(el.tagName==='DETAILS'&&el.open)stats.details++;
    if(el.tagName==='DIALOG'&&el.open)stats.dialogs++;
    if(el.matches?.(':popover-open'))stats.popovers++;
  }
  function repairEdges(el,cs,bg){
    if(!bg)return false;
    let changed=false;
    for(const property of ['border-top-color','border-right-color','border-bottom-color','border-left-color']){
      const raw=cs.getPropertyValue(property),parsed=parse(raw);
      if(!parsed||(parsed.a??1)<.08)continue;
      if(EXP.ColorEngine.contrastRatio(parsed,bg)<1.22&&EXP.ColorEngine.luminance(parsed)>.45&&write(el,property,EXP.ColorEngine.border(raw,theme))){stats.borders++;changed=true;}
    }
    const outline=parse(cs.outlineColor);
    if(outline&&(outline.a??1)>.08&&cs.outlineStyle!=='none'&&EXP.ColorEngine.contrastRatio(outline,bg)<1.35&&write(el,'outline-color',theme.accent||EXP.ColorEngine.border(cs.outlineColor,theme))){stats.outlines++;changed=true;}
    return changed;
  }
  function repairForeground(el,cs,effectiveBg){
    const fg=parse(cs.color),bg=parse(effectiveBg);if(!fg||!bg)return false;
    const minimum=minimumContrast(el);if(EXP.ColorEngine.contrastRatio(fg,bg)>=minimum)return false;
    const next=EXP.ColorEngine.foreground(cs.color,theme,effectiveBg,minimum);
    if(!next||!write(el,'color',next))return false;
    stats.contrast++;stats.textRepairs++;return true;
  }
  function repairForm(el,effectiveBg){
    if(!/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))return false;
    stats.forms++;let changed=false;
    if(bright(effectiveBg)&&write(el,'background-color',theme.input||theme.raised||theme.surface))changed=true;
    const nowBg=effectiveBackground(el),nowFg=getComputedStyle(el).color;
    if(parse(nowFg)&&parse(nowBg)&&EXP.ColorEngine.contrastRatio(nowFg,nowBg)<4.5&&write(el,'color',EXP.ColorEngine.foreground(nowFg,theme,nowBg,4.5))){stats.contrast++;changed=true;}
    return changed;
  }
  function repair(el,reason,options={}){
    if(isProtected(el)||!visible(el))return false;
    let cs;try{cs=getComputedStyle(el);}catch{return false;}
    let changed=false,effectiveBg=effectiveBackground(el);
    recordElementState(el,cs);
    if(!options.nativeDark&&el.hasAttribute('style')&&!el.matches('html,body'))EXP.ColorEngine.inspectInline(el,theme);
    if(repairImageOverlay(el,cs,effectiveBg)){changed=true;try{cs=getComputedStyle(el);effectiveBg=effectiveBackground(el);}catch{}}
    if(options.surface!==false&&options.repairSurfaces!==false&&!options.nativeDark&&shouldRepairSurface(el,cs,effectiveBg)){
      const next=EXP.ColorEngine.background(cs.backgroundColor,theme,theme.page);
      if(next&&write(el,'background-color',next)){stats.brightSurfaces++;changed=true;effectiveBg=effectiveBackground(el);}
    }
    if(repairEdges(el,cs,parse(effectiveBg)))changed=true;
    if(options.text!==false&&repairForeground(el,cs,effectiveBg))changed=true;
    if(repairForm(el,effectiveBg))changed=true;
    if(changed){el.setAttribute(ATTR,reason);stats.resolved++;}
    return changed;
  }
  function repairText(el,reason){
    if(isProtected(el)||!visible(el))return false;
    let cs;try{cs=getComputedStyle(el);}catch{return false;}
    const bg=effectiveBackground(el),fg=parse(cs.color),parsedBg=parse(bg);
    if(!fg||!parsedBg)return false;
    const minimum=minimumContrast(el);
    if(EXP.ColorEngine.contrastRatio(fg,parsedBg)>=minimum)return false;
    const next=EXP.ColorEngine.foreground(cs.color,theme,bg,minimum);
    if(!next||!write(el,'color',next))return false;
    el.setAttribute(ATTR,reason);stats.contrast++;stats.textRepairs++;stats.resolved++;return true;
  }
  function applySiteFixes(root=document){
    if(!fix)return;
    const scope=root?.querySelectorAll?root:document;
    try{
      if(fix.preserve?.length)scope.querySelectorAll(fix.preserve.join(',')).forEach(el=>el.setAttribute(PRESERVE,'1'));
      if(fix.preserveSurfaces?.length)scope.querySelectorAll(fix.preserveSurfaces.join(',')).forEach(el=>el.setAttribute(PRESERVE,'1'));
      if(options.repairSurfaces&&!options.nativeDark&&fix.surfaces?.length)scope.querySelectorAll(fix.surfaces.join(',')).forEach(el=>{if(repair(el,`site:${fix.id}`,options))stats.siteFixes++;});
      if(!options.nativeDark&&fix.text?.length)scope.querySelectorAll(fix.text.join(',')).forEach(el=>{if(repairText(el,`site-text:${fix.id}`))stats.siteFixes++;});
      if(!options.nativeDark&&fix.forceText?.length)scope.querySelectorAll(fix.forceText.join(',')).forEach(el=>{
        if(isProtected(el)||!visible(el))return;
        if(write(el,'color',theme.text)){el.setAttribute(ATTR,`site-force-text:${fix.id}`);stats.siteFixes++;stats.textRepairs++;stats.resolved++;}
      });
    }catch{}
  }
  function syncPseudoStyle(){
    if(!pseudoRules.size){pseudoStyle?.remove();pseudoStyle=null;return;}
    if(!pseudoStyle?.isConnected){pseudoStyle=document.createElement('style');pseudoStyle.dataset.expOwned='1';pseudoStyle.dataset.expShiftLivePseudo='1';(document.head||document.documentElement).append(pseudoStyle);}
    pseudoStyle.textContent=[...pseudoRules.values()].join('\n');
  }
  function pseudoRepair(el,reason){
    if(isProtected(el)||!visible(el))return false;
    let id=el.getAttribute('data-exp-shift-pseudo-id'),changed=false;
    const rules=[];
    for(const pseudo of ['::before','::after']){
      try{
        const cs=getComputedStyle(el,pseudo);
        if(!cs||cs.content==='none'||cs.display==='none'||cs.visibility==='hidden')continue;
        const bg=parse(cs.backgroundColor),fg=parse(cs.color),effective=effectiveBackground(el);
        let nextBg='',nextFg='';
        if(bg&&bright(bg)){nextBg=EXP.ColorEngine.background(cs.backgroundColor,theme,theme.page);nextFg=EXP.ColorEngine.foreground(cs.color,theme,nextBg,4.5);}
        else if(fg&&parse(effective)&&EXP.ColorEngine.contrastRatio(fg,parse(effective))<4.5)nextFg=EXP.ColorEngine.foreground(cs.color,theme,effective,4.5);
        if(nextBg||nextFg){
          if(!id){id=`p${++pseudoSequence}`;el.setAttribute('data-exp-shift-pseudo-id',id);}
          rules.push(`[data-exp-shift-pseudo-id="${id}"]${pseudo}{${nextBg?`background-color:${nextBg}!important;`:''}${nextFg?`color:${nextFg}!important;`:''}}`);
        }
      }catch{}
    }
    if(id){
      const css=rules.join('');
      if(css){if(pseudoRules.get(id)!==css){pseudoRules.set(id,css);changed=true;}}
      else if(pseudoRules.delete(id)){el.removeAttribute('data-exp-shift-pseudo-id');changed=true;}
      if(changed)syncPseudoStyle();
    }
    if(changed)stats.resolved++;
    return changed;
  }
  function scanFrames(){
    for(const frame of document.querySelectorAll('iframe')){
      try{
        const doc=frame.contentDocument;
        if(!doc?.documentElement)continue;
        stats.iframes++;
        const root=doc.documentElement;
        const nodes=[root,doc.body,...root.querySelectorAll(CANDIDATES)].filter(Boolean).slice(0,500);
        for(const el of nodes){
          try{
            const cs=doc.defaultView.getComputedStyle(el),bg=parse(cs.backgroundColor);
            if(bg&&bright(bg)){
              const next=EXP.ColorEngine.background(cs.backgroundColor,theme,theme.page);
              el.style.setProperty('background-color',next,'important');
              const fg=EXP.ColorEngine.foreground(cs.color,theme,next,4.5);
              el.style.setProperty('color',fg,'important');
            }
          }catch{}
        }
      }catch{stats.iframeFailures++;}
    }
  }
  function ensureGlobalRepairs(){
    let style=document.querySelector('style[data-exp-shift-live-global="1"]');
    if(!style){style=document.createElement('style');style.dataset.expOwned='1';style.dataset.expShiftLiveGlobal='1';(document.head||document.documentElement).append(style);}
    const css=`
      ::placeholder{color:${theme.muted}!important;opacity:1!important}
      ::selection{background:${theme.accent}!important;color:${theme.page}!important}
      html{scrollbar-color:${theme.muted} ${theme.raised||theme.surface}!important}
      input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus,textarea:-webkit-autofill,select:-webkit-autofill{
        -webkit-text-fill-color:${theme.text}!important;
        box-shadow:0 0 0 1000px ${theme.input||theme.raised||theme.surface} inset!important;
        caret-color:${theme.text}!important
      }`;
    if(style.textContent!==css)style.textContent=css;
    stats.placeholders++;stats.selectionRules++;stats.scrollbars++;
  }
  function collect(root,selector,out,limit){
    if(!root||out.length>=limit)return;
    if(root.nodeType===1&&root.matches?.(selector)&&visible(root))out.push(root);
    if(out.length>=limit)return;
    try{for(const el of root.querySelectorAll?.(selector)||[]){if(visible(el))out.push(el);if(out.length>=limit)break;}}catch{}
  }
  function pass(roots=null,mutation=false){
    if(!active||!theme)return;
    const started=performance.now(),resolvedBefore=stats.resolved;
    let examined=0;
    backgroundCache=new WeakMap();
    stats.passes++;if(mutation)stats.mutationPasses++;if(options.nativeDark)stats.nativeDarkFastPathPasses++;ensureGlobalRepairs();
    const targets=[],textTargets=[],sourceRoots=roots?.length?roots:[document.documentElement];
    stats.lastRoots=sourceRoots.length;
    // Site preservation must run before the generic scan so artwork/media wells
    // are protected before any bright-surface repair can rewrite them.
    for(const root of sourceRoots)applySiteFixes(root);
    const levelLimit={off:0,conservative:700,balanced:1800,aggressive:5000}[options.surfaceLevel]??700;
    const candidateSelector=options.nativeDark?NATIVE_DARK_CANDIDATES:CANDIDATES;
    const surfaceLimit=options.nativeDark
      ? (roots?.length?Math.min(levelLimit,360):Math.min(levelLimit,700))
      : (roots?.length?Math.min(levelLimit,1200):levelLimit);
    const textLimit=options.nativeDark
      ? (roots?.length?700:1600)
      : (roots?.length?1200:2600);
    stats.lastSurfaceLimit=surfaceLimit;stats.lastTextLimit=textLimit;
    for(const root of sourceRoots){
      collect(root,candidateSelector,targets,surfaceLimit);collect(root,TEXT_CANDIDATES,textTargets,textLimit);
      if(targets.length>=surfaceLimit&&textTargets.length>=textLimit)break;
    }
    const seen=new Set();
    for(const el of targets){
      if(seen.has(el)||!visible(el))continue;
      seen.add(el);stats.scanned++;examined++;
      if(options.nativeDark){
        repair(el,'native-dark',{...options,surface:false});
      }else{
        const bg=effectiveBackground(el);
        if(bright(bg)){stats.unresolved++;repair(el,'visual',options);}
        else repair(el,'contrast',{...options,surface:false});
        pseudoRepair(el,'pseudo');
      }
    }
    for(const el of textTargets){
      if(seen.has(el)||!visible(el))continue;
      stats.scanned++;examined++;repairText(el,'text');
    }
    for(const processor of processors){try{processor(sourceRoots);}catch(error){EXP.Core.safeError(error,'shift-processor');}}
    stats.lastExamined=examined;
    stats.lastChanged=Math.max(0,stats.resolved-resolvedBefore);
    stats.lastDurationMs=Math.round((performance.now()-started)*10)/10;
    stats.maxDurationMs=Math.max(stats.maxDurationMs,stats.lastDurationMs);
  }
  function flush(){
    timer=0;if(!active)return;
    const roots=[...queuedRoots].filter(root=>root?.isConnected!==false);
    queuedRoots.clear();pass(roots.length?roots:null,true);
  }
  function schedule(root){
    if(root?.nodeType===1){
      let covered=false;
      for(const queued of [...queuedRoots]){
        if(queued===root||queued.contains?.(root)){covered=true;stats.rootsCollapsed++;break;}
        if(root.contains?.(queued)){queuedRoots.delete(queued);stats.rootsCollapsed++;}
      }
      if(!covered){queuedRoots.add(root);stats.rootsQueued++;}
    }
    clearTimeout(timer);timer=setTimeout(flush,90);
  }
  const onScroll = () => { if(active)schedule(document.documentElement); };
  function start(nextTheme,nextOptions={}){
    if(!nextTheme||nextTheme.original){stop();return;}
    if(active){refresh(nextTheme,nextOptions);return;}
    theme=nextTheme;options={...options,...nextOptions};fix=EXP.SiteFixes.active();active=true;pass();
    observer?.disconnect();
    observer=new MutationObserver(mutations=>{
      for(const mutation of mutations){
        if(mutation.type==='attributes'){
          const target=mutation.target;
          if(mutation.attributeName==='style'&&selfMutations.has(target)){stats.selfMutationsIgnored++;continue;}
          if(target?.nodeType===1&&!target.closest?.('[data-exp-owned="1"],[data-exp-shift-preserve]'))schedule(target);
          continue;
        }
        for(const node of mutation.addedNodes){
          if(node?.nodeType!==1||node.closest?.('[data-exp-owned="1"],[data-exp-shift-preserve]'))continue;
          schedule(node);
        }
      }
    });
    observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','hidden','aria-hidden','open']});
    document.addEventListener('scroll',onScroll,{capture:true,passive:true});
  }
  function refresh(nextTheme,nextOptions={}){
    if(!nextTheme||nextTheme.original){stop();return;}
    if(!active){start(nextTheme,nextOptions);return;}
    theme=nextTheme;options={...options,...nextOptions};fix=EXP.SiteFixes.active();schedule(document.documentElement);
  }
  function restore(){
    for(const [el,properties] of [...ledger]){
      if(!el)continue;
      for(const [property,[value,priority]] of properties){
        try{if(value)el.style.setProperty(property,value,priority);else el.style.removeProperty(property);}catch{}
      }
      try{el.removeAttribute(ATTR);}catch{}
    }
    ledger.clear();
    pseudoRules.clear();pseudoStyle?.remove();pseudoStyle=null;try{document.querySelectorAll('style[data-exp-shift-live-global="1"]').forEach(node=>node.remove());document.querySelectorAll('[data-exp-shift-pseudo-id]').forEach(node=>node.removeAttribute('data-exp-shift-pseudo-id'));}catch{}
  }
  function stop(){
    document.removeEventListener('scroll',onScroll,true);
    active=false;clearTimeout(timer);timer=0;queuedRoots.clear();observer?.disconnect();observer=null;backgroundCache=new WeakMap();restore();
    EXP.ColorEngine.clear();
  }
  function health(){
    return {...stats,site:fix?.id||null,active,ownedRepairs:[...ledger.keys()].filter(el=>el?.isConnected).length,queued:queuedRoots.size};
  }
  function addProcessor(processor){processors.add(processor);return()=>processors.delete(processor);}
  function scan(){schedule(document.documentElement);}
  function fullScan(){const previous=options.surfaceLevel;options={...options,surfaceLevel:'aggressive'};pass();options={...options,surfaceLevel:previous};}
  return Object.freeze({start,refresh,stop,health,scan,fullScan,addProcessor});
})();

// Component roles use SHIFT palette variables. Rules are authored for SHIFT;
// page structure, media, and other products' owned content stay untouched.
EXP.ThemeRules = (() => {
  const guard = ':not(:where([data-exp-owned="1"],[data-exp-owned="1"] *,[data-exp-shift-preserve],[data-exp-shift-preserve] *,img,picture,video,canvas,svg,svg *,[role="img"]))';
  const statuses = {
    success: { selectors: '.alert-success,.notification--success,.notice--success,.MuiAlert-standardSuccess,.ant-alert-success,.btn-success,[data-status="success"]', tone:'#218739', text:'#dcffe4' },
    warning: { selectors: '.alert-warning,.notification--warning,.notice--warning,.MuiAlert-standardWarning,.ant-alert-warning,.btn-warning,[data-status="warning"]', tone:'#b88718', text:'#fff3c4' },
    danger: { selectors: '.alert-danger,.alert-error,.notification--error,.notice--error,.MuiAlert-standardError,.ant-alert-error,.btn-danger,[data-status="error"]', tone:'#a8323a', text:'#ffe1e4' },
    info: { selectors: '.alert-info,.notification--info,.notice--info,.MuiAlert-standardInfo,.ant-alert-info,.btn-info,[data-status="info"]', tone:'#2879a8', text:'#e0f4ff' }
  };
  function css(state, exclusion = '') {
    const target = selector => `html[data-exp-shift] :is(${selector})${exclusion}${guard}`;
    const rules = [];
    const paint = (selector, role) => rules.push(`${target(selector)}{background-color:var(--exp-shift-${role})!important;color:var(--exp-shift-text)!important;border-color:var(--exp-shift-border)!important}`);
    rules.push(`html[data-exp-shift]{--exp-shift-border:color-mix(in srgb,var(--exp-shift-muted) 40%,transparent);--exp-shift-table-heading:var(--exp-shift-raised);--exp-shift-table-row:var(--exp-shift-surface);--exp-shift-code:var(--exp-shift-raised);--exp-shift-control-hover:color-mix(in srgb,var(--exp-shift-accent) 24%,var(--exp-shift-interactive))}`);
    paint('table,tbody,tr,td,[role="table"],[role="gridcell"]', 'table-row');
    paint('thead,th,[role="columnheader"],[role="rowheader"]', 'table-heading');
    paint('dialog,[role="dialog"],[role="alertdialog"],.modal-content,.MuiDialog-paper,.ant-modal-content', 'overlay');
    paint('[role="menu"],[role="listbox"],.dropdown-menu,.MuiMenu-paper,.ant-dropdown-menu', 'raised');
    paint('code,pre,kbd,samp', 'code');
    paint('button,[role="button"],.btn', 'interactive');
    rules.push(`${target('button,[role="button"],.btn')}:not(:disabled):not([aria-disabled="true"]):hover{background-color:var(--exp-shift-control-hover)!important}`);
    if (state.formReadability) paint('input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]):not([type="image"]),select,textarea', 'input');
    for (const [name, status] of Object.entries(statuses)) {
      rules.push(`html[data-exp-shift]{--exp-shift-${name}-surface:color-mix(in srgb,${status.tone} 30%,var(--exp-shift-surface));--exp-shift-${name}-text:${status.text};--exp-shift-${name}-border:${status.tone}}`);
      rules.push(`${target(status.selectors)}{background-color:var(--exp-shift-${name}-surface)!important;color:var(--exp-shift-${name}-text)!important;border-color:var(--exp-shift-${name}-border)!important}`);
      rules.push(`${target(status.selectors)} :is(a,span,p,small,label,strong,button)${guard}{color:var(--exp-shift-${name}-text)!important}`);
    }
    // Alert role alone conveys urgency, not a success/error hue.
    rules.push(`${target('[role="alert"]')}:not(:is(${Object.values(statuses).map(s=>s.selectors).join(',')})){background-color:var(--exp-shift-raised)!important;color:var(--exp-shift-text)!important}`);
    return rules.join('\n');
  }
  return Object.freeze({ css });
})();

EXP.Engine = (() => {
  const STYLE_ID = 'exp-shift-page-style';
  const HOST_ATTR = 'data-exp-shift';
  const SHELL_SELECTOR = '#root,#app,#__next,#__nuxt,#__layout,#app-root,#react-root,#vue-app,#application,#main,#main-content,[data-reactroot],ytd-app,shreddit-app';
  const CHROME_SELECTOR = [
    '.card','.panel','.modal','.modal-content','.modal-dialog','.modal-body','.dropdown-menu',
    '.navbar','.nav-bar','.sidebar','.drawer','.toolbar','.menubar','.list-group','.list-group-item',
    '.bg-white','.bg-light','.bg-body','.bg-body-tertiary','.bg-body-secondary',
    '.MuiPaper-root','.MuiAppBar-root','.MuiDrawer-paper','.MuiDialog-paper','.MuiToolbar-root',
    '.ant-layout','.ant-layout-header','.ant-layout-sider','.ant-card','.ant-modal-content','.ant-drawer-content'
  ].join(',');
  const NAV_SELECTOR = '.navbar,.nav-bar,.sidebar,.drawer,.toolbar,.menubar,.MuiAppBar-root,.MuiDrawer-paper,.MuiToolbar-root,.ant-layout-header,.ant-layout-sider,.ant-drawer-content';
  const CONTENT_SELECTOR = '.width,.script-list';
  const EXCLUDE = ':not(:where(img,picture,video,canvas,svg,[role="img"],[data-exp-owned="1"],[data-exp-shift-preserve],[hidden],[aria-hidden="true"]))';

  let style = null;
  let guard = null;
  let active = false;
  let originalHeld = false;
  let settings = null;
  let lastCss = '';
  let parseContext;
  let nativeBaseline = null;
  let writing = false;
  const hostPaint = new WeakMap();
  const metrics = { mode:'Original', reattaches:0, nativeDark:false, nativeDarkReason:null, nativeDarkEvidence:null, applies:0 };

  function parseColor(value) {
    const raw=String(value||'').trim();
    if(!raw||raw==='transparent'||raw==='none')return null;
    try{
      if(parseContext===undefined){const canvas=document.createElement('canvas');parseContext=canvas.getContext('2d',{willReadFrequently:true})||null;}
      if(parseContext){parseContext.fillStyle='#000';parseContext.fillStyle=raw;const normalized=String(parseContext.fillStyle);const match=normalized.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);if(match)return{r:+match[1],g:+match[2],b:+match[3],a:match[4]===undefined?1:+match[4]};}
    }catch{}
    return EXP.ColorEngine.parse(raw);
  }
  function forcedColors(){try{return matchMedia('(forced-colors: active)').matches;}catch{return false;}}
  function captureNativeBaseline(){
    if(nativeBaseline||!document.documentElement)return nativeBaseline;
    try{
      const html=document.documentElement,body=document.body,rootStyle=getComputedStyle(html),bodyStyle=body?getComputedStyle(body):null;
      let saved=null;try{saved=JSON.parse(html.dataset.expShiftNativeBaseline||'null');}catch{}
      nativeBaseline={
        meta:String(saved?.meta||[...document.querySelectorAll('meta[name="color-scheme"]')].map(node=>node.content||'').join(' ')).toLowerCase(),
        rootScheme:saved?.rootScheme||rootStyle.colorScheme||'',bodyScheme:saved?.bodyScheme||bodyStyle?.colorScheme||'',
        rootBg:parseColor(saved?.rootBg||rootStyle.backgroundColor),bodyBg:parseColor(saved?.bodyBg||bodyStyle?.backgroundColor||'')
      };
    }catch{nativeBaseline={meta:'',rootScheme:'',bodyScheme:'',rootBg:null,bodyBg:null};}
    return nativeBaseline;
  }
  function detectNativeDark(){
    const baseline=captureNativeBaseline();
    const tone=color=>{
      if(!color||(color.a??1)<.9)return 'transparent';
      const level=(Math.max(color.r,color.g,color.b)+Math.min(color.r,color.g,color.b))/510;
      if(level<=.28)return 'dark';
      if(level>=.68)return 'light';
      return 'mid';
    };
    const darkOnlyScheme=value=>/\bdark\b/i.test(String(value||''))&&!/\blight\s+dark\b|\bdark\s+light\b/i.test(String(value||''));
    const explicit=darkOnlyScheme(baseline.rootScheme)||darkOnlyScheme(baseline.bodyScheme)||darkOnlyScheme(baseline.meta);
    const darkCanvas=tone(baseline.rootBg)==='dark'||tone(baseline.bodyBg)==='dark';
    const sampleSelectors=[
      'main','[role="main"]','header','nav','aside','section','article','form',
      '[role="banner"]','[role="navigation"]','[role="contentinfo"]','[role="dialog"]',
      '.card','.panel','[class*="card" i]','[class*="panel" i]'
    ].join(',');
    const candidates=[];
    try{
      for(const el of document.querySelectorAll(sampleSelectors)){
        if(candidates.length>=48)break;
        if(el.closest?.('[data-exp-owned="1"]'))continue;
        const rect=el.getBoundingClientRect();
        if(rect.width<120||rect.height<40||rect.bottom<0||rect.top>innerHeight*2)continue;
        const area=rect.width*rect.height;
        if(area<Math.max(8000,innerWidth*innerHeight*.025))continue;
        let color=null;try{color=parseColor(getComputedStyle(el).backgroundColor);}catch{}
        const kind=tone(color);
        if(kind==='transparent')continue;
        candidates.push({area,kind});
      }
    }catch{}
    candidates.sort((a,b)=>b.area-a.area);
    const samples=candidates.slice(0,24);
    const darkSurfaceCount=samples.filter(item=>item.kind==='dark').length;
    const lightSurfaceCount=samples.filter(item=>item.kind==='light').length;
    const midSurfaceCount=samples.length-darkSurfaceCount-lightSurfaceCount;
    const darkSurfaceRatio=samples.length?darkSurfaceCount/samples.length:0;
    const lightSurfaceRatio=samples.length?lightSurfaceCount/samples.length:0;
    const contradictoryLightMajority=samples.length>=3&&lightSurfaceCount>=2&&lightSurfaceCount>darkSurfaceCount&&lightSurfaceRatio>=.5;
    const inferred=darkCanvas&&samples.length>=4&&darkSurfaceCount>=3&&darkSurfaceRatio>=.72&&lightSurfaceCount<=Math.max(1,Math.floor(samples.length*.12));
    const explicitConfirmed=explicit&&darkCanvas&&!contradictoryLightMajority;
    metrics.nativeDark=Boolean(explicitConfirmed||(!explicit&&inferred));
    metrics.nativeDarkReason=metrics.nativeDark?(explicitConfirmed?'explicit-dark-scheme-with-dark-canvas':'inferred-dark-surface-majority'):null;
    metrics.nativeDarkEvidence={
      explicitDarkScheme:explicit,explicitConfirmed,darkCanvas,sampleCount:samples.length,darkSurfaceCount,lightSurfaceCount,midSurfaceCount,
      darkSurfaceRatio:Math.round(darkSurfaceRatio*1000)/1000,lightSurfaceRatio:Math.round(lightSurfaceRatio*1000)/1000,
      contradictoryLightMajority,inferred
    };
    return metrics.nativeDark;
  }
  function rememberHost(node){
    if(!node||hostPaint.has(node))return;
    hostPaint.set(node,['background','background-color','color','color-scheme'].map(property=>[property,node.style.getPropertyValue(property),node.style.getPropertyPriority(property)]));
  }
  function restoreHost(node){
    const saved=hostPaint.get(node);if(!saved)return;hostPaint.delete(node);
    for(const [property,value,priority] of saved){node.style.removeProperty(property);if(value)node.style.setProperty(property,value,priority);}
  }
  function lockHost(theme,paint=true){
    const html=document.documentElement;if(!html)return;
    if(paint){
      for(const node of [html,document.body]){if(!node)continue;rememberHost(node);node.style.setProperty('background-color',theme.page,'important');node.style.setProperty('color',theme.text,'important');node.style.setProperty('color-scheme','dark','important');}
    }
    html.setAttribute(HOST_ATTR,theme.id||'1');
  }
  function unlockHost(){document.documentElement?.removeAttribute(HOST_ATTR);for(const node of [document.documentElement,document.body])restoreHost(node);}
  function ensureGuard(){
    if(guard||!document.documentElement)return;
    guard=new MutationObserver(mutations=>{
      if(writing||!active||!lastCss)return;
      const removed=mutations.some(mutation=>[...mutation.removedNodes].some(node=>node===style||(node.nodeType===1&&(node.id===STYLE_ID||node.dataset?.expShiftPageStyle))));
      if(removed){metrics.reattaches++;style=null;ensureStyle(lastCss);}
    });
    guard.observe(document.documentElement,{childList:true,subtree:true});
  }
  function ensureStyle(cssText){
    lastCss=cssText;if(writing)return style;writing=true;
    try{
      if(style?.isConnected){if(style.textContent!==cssText)style.textContent=cssText;return style;}
      style?.remove();style=EXP.Core.injectStyle(document,cssText,{expShiftPageStyle:'1'});style.id=STYLE_ID;ensureGuard();return style;
    }finally{writing=false;}
  }
  function pagePaint(theme,state,edge=false){
    if(state.simplifyGradients)return `background:${theme.page}!important;background-color:${theme.page}!important`;
    const layers=[];
    if(edge&&theme.pageEdge)layers.push(`${theme.pageEdge} top / 100% ${theme.id==='pride'?10:6}px no-repeat`);
    if(theme.pageFill)layers.push(theme.pageFill);layers.push(theme.page);
    return `background:${layers.join(',')}!important;background-color:${theme.page}!important`;
  }
  function css(theme,state,nativeDark=false){
    const strength=state.themeStrength||'normal';
    const surface=strength==='soft'?`color-mix(in srgb,${theme.surface} 58%,${theme.page})`:theme.surface;
    const raised=strength==='soft'?`color-mix(in srgb,${theme.raised} 62%,${theme.surface})`:strength==='strong'?theme.overlay:theme.raised;
    const overlay=strength==='strong'?`color-mix(in srgb,${theme.overlay} 84%,${theme.text})`:theme.overlay;
    const text=state.textContrast==='enhanced'?theme.text:`color-mix(in srgb,${theme.text} 88%,${theme.muted})`;
    const vars=`--exp-shift-page:${theme.page};--exp-shift-surface:${surface};--exp-shift-raised:${raised};--exp-shift-overlay:${overlay};--exp-shift-navigation:${theme.navigation};--exp-shift-input:${theme.input};--exp-shift-interactive:${theme.interactive};--exp-shift-text:${text};--exp-shift-muted:${theme.muted};--exp-shift-accent:${theme.accent};--exp-shift-highlight:${theme.highlight||theme.accent}`;
    const effects=`${state.reduceShadows?'box-shadow:none!important;':''}${state.reduceTransparency?'backdrop-filter:none!important;':''}${state.simplifyGradients?'background-image:none!important;':''}${state.reduceBlur?'filter:none!important;backdrop-filter:none!important;':''}`;
    const reduceMotion=state.reduceMotion==='on'||(state.reduceMotion==='system'&&matchMedia('(prefers-reduced-motion: reduce)').matches);
    const motion=reduceMotion?'html[data-exp-shift] :is([data-exp-shift-live],main,header,footer,nav,aside,section,article,button,input,select,textarea){animation:none!important;transition:none!important;scroll-behavior:auto!important}':'';
    const links=state.linkVisibility==='site'?'':`html[${HOST_ATTR}] a:not([role="button"]):not([data-exp-owned="1"]){color:var(--exp-shift-accent)!important;text-decoration-thickness:${state.linkVisibility==='high'?'2px':'auto'}!important}`;
    const forms=state.formReadability
      ? (nativeDark
        ? `html[${HOST_ATTR}] :is(input,select,textarea):not([data-exp-owned="1"]){color:var(--exp-shift-text)!important;border-color:color-mix(in srgb,var(--exp-shift-accent) 55%,currentColor)!important}`
        : `html[${HOST_ATTR}] :is(input,select,textarea):not([data-exp-owned="1"]){background-color:var(--exp-shift-input)!important;color:var(--exp-shift-text)!important;border-color:var(--exp-shift-accent)!important}`)
      : '';
    const muted=state.mutedRecovery?`html[${HOST_ATTR}] :is(.muted,.text-muted,[class*="muted" i],[class*="secondary" i],[class*="subtle" i],figcaption,small,caption):not([data-exp-owned="1"]){color:color-mix(in srgb,var(--exp-shift-muted) 80%,var(--exp-shift-text))!important}`:'';
    const focus=state.focusVisibility==='site'?'':`html[${HOST_ATTR}] :focus-visible{outline:${state.focusVisibility==='high'?3:2}px solid var(--exp-shift-accent)!important;outline-offset:2px!important}`;
    const structural=nativeDark?'':`
      html[${HOST_ATTR}]{${pagePaint(theme,state,true)};color:${text}!important}
      html[${HOST_ATTR}] body{${pagePaint(theme,state)};color:${text}!important}
      html[${HOST_ATTR}] :is(${SHELL_SELECTOR})${EXCLUDE}{background-color:var(--exp-shift-page)!important;color:var(--exp-shift-text)!important}
      html[${HOST_ATTR}] :is(header,footer,nav,aside,[role="banner"],[role="navigation"],[role="contentinfo"])${EXCLUDE}{background-color:var(--exp-shift-navigation)!important;color:var(--exp-shift-text)!important;border-color:var(--exp-shift-highlight)!important}
      html[${HOST_ATTR}] :is(main,[role="main"])${EXCLUDE}{background-color:var(--exp-shift-surface)!important;color:var(--exp-shift-text)!important}
      html[${HOST_ATTR}] :is(section,article,p,li,label,h1,h2,h3,h4,h5,h6,dt,dd,figcaption,legend,caption,blockquote,small)${EXCLUDE}{color:var(--exp-shift-text)!important}
      html[${HOST_ATTR}] :is(${CHROME_SELECTOR})${EXCLUDE}{background-color:var(--exp-shift-surface)!important;color:var(--exp-shift-text)!important;border-color:color-mix(in srgb,var(--exp-shift-muted) 40%,transparent)!important}
      html[${HOST_ATTR}] :is(${NAV_SELECTOR})${EXCLUDE}{background-color:var(--exp-shift-navigation)!important;color:var(--exp-shift-text)!important}
      html[${HOST_ATTR}] :is(${CONTENT_SELECTOR})${EXCLUDE}{background-color:var(--exp-shift-surface)!important;color:var(--exp-shift-text)!important}
      ${EXP.ThemeRules.css(state,EXCLUDE)}${EXP.SiteFixes.css()}`;
    return `@media screen{
      :root,html[${HOST_ATTR}],:host{${vars}}
      html[${HOST_ATTR}]{color-scheme:dark!important}
      ${structural}
      html[${HOST_ATTR}] :is(img,picture,video,canvas,svg,[role="img"],[data-exp-shift-preserve]){filter:none!important}
      html[${HOST_ATTR}] [data-exp-shift-live]{${effects}}
      html[${HOST_ATTR}]{scrollbar-color:var(--exp-shift-muted) var(--exp-shift-raised)}
      ${links}${forms}${muted}${focus}${motion}
    }`;
  }
  function restore(){
    EXP.DynamicEngine?.stop();EXP.LiveResolver?.stop();EXP.ColorEngine.clear();
    style?.remove();style=null;lastCss='';unlockHost();
    try{document.querySelectorAll(`#${STYLE_ID},style[data-exp-shift-page-style],style[data-exp-shift-adapter-style]`).forEach(node=>node.remove());}catch{}
  }
  function apply(next){
    settings=next;metrics.applies++;
    const theme=EXP.Themes.resolve(next.theme,next.accent,next);
    const disabled=theme.original||next.safeMode||next.excluded||originalHeld||forcedColors();
    metrics.mode=next.excluded?'Excluded':next.safeMode?'Safe':theme.original||originalHeld?'Original':'Generic';
    if(disabled){EXP.Preload?.finish();restore();return{theme,mode:metrics.mode};}
    unlockHost();
    const nativeDark=detectNativeDark();
    lockHost(theme,!nativeDark);
    ensureStyle(css(theme,next,nativeDark));EXP.Preload?.finish();
    if(nativeDark)EXP.DynamicEngine?.stop();else EXP.DynamicEngine?.start(theme);
    EXP.LiveResolver?.start(theme,{repairSurfaces:next.repairSurfaces,surfaceLevel:next.surfaceLevel,nativeDark});
    return{theme,mode:metrics.mode};
  }
  function start(initial){if(active)return;active=true;settings=initial;captureNativeBaseline();apply(initial);}
  function stop(){active=false;guard?.disconnect();guard=null;restore();}
  function holdOriginal(held){originalHeld=Boolean(held);if(settings)apply(settings);}
  function health(){
    const live=EXP.LiveResolver?.health?.()||{};
    const leftoverStyles=document.querySelectorAll(`#${STYLE_ID},style[data-exp-shift-page-style],style[data-exp-shift-adapter-style]`).length;
    const hostLocked=Boolean(document.documentElement?.hasAttribute(HOST_ATTR));
    return{...metrics,scanned:live.scanned||0,batches:live.passes||0,lastDurationMs:live.lastDurationMs||0,owned:live.ownedRepairs||0,classified:live.brightSurfaces||0,shells:0,shadows:EXP.DynamicEngine?.health?.().shadowRoots||0,colorRepairs:live.resolved||0,stylesheetInvalidation:{owner:'DynamicEngine',safetyPollMs:0},dynamicEngine:EXP.DynamicEngine?.health?.()||null,liveResolver:live,colorEngine:EXP.ColorEngine.health(),leftoverPaint:{hostAttribute:hostLocked,styleSheets:leftoverStyles,ownedSurfaces:live.ownedRepairs||0,active:Boolean(lastCss)||hostLocked||leftoverStyles>0||(live.ownedRepairs||0)>0}};
  }
  function addProcessor(processor){return EXP.LiveResolver.addProcessor(processor);}
  return Object.freeze({start,stop,apply,holdOriginal,health,scan:()=>EXP.LiveResolver.scan(),fullScan:()=>EXP.LiveResolver.fullScan(),addProcessor});
})();

EXP.Adapters = (() => {
  const definitions = {
    manapool: {
      name: 'ManaPool', hosts: ['manapool.com'],
      options: [['dense-grid', 'Denser card grid'], ['hide-sold-out', 'Hide sold out'], ['compact-prices', 'Compact prices'], ['always-show-chips', 'Always show chips']],
      actions: [['collapse-all', 'Collapse all', () => setManaSections(true)], ['expand-all', 'Expand all', () => setManaSections(false)]],
      css: (s) => `${s['dense-grid'] ? 'ul.grid,.grid{gap:.5rem!important}article{margin:0!important}' : ''}${s['hide-sold-out'] ? '[data-exp-shift-sold="true"]{display:none!important}' : ''}${s['compact-prices'] ? '.text-green-700,.text-xl.font-bold{font-size:.95rem!important;line-height:1.2!important}' : ''}${s['always-show-chips'] ? '.rounded-b-lg.bg-gray-50,.inline-flex.items-center.border{opacity:1!important;visibility:visible!important}' : ''}[data-exp-shift-collapsed="true"]>:not(h2){display:none!important}
        /* ManaPool uses Tailwind utility colors rather than semantic alert class names. */
        [class*="bg-yellow-"],[class*="bg-amber-"]{background-color:color-mix(in srgb,#b88718 34%,var(--exp-shift-surface))!important;color:#fff3c4!important;border-color:#b88718!important}
        [class*="bg-yellow-"] :is(a,button),[class*="bg-amber-"] :is(a,button){color:inherit!important}
        [class*="bg-red-"],[class*="bg-rose-"]{background-color:color-mix(in srgb,#a8323a 32%,var(--exp-shift-surface))!important;color:#ffe1e4!important}
        [class*="bg-green-"],[class*="bg-emerald-"]{background-color:color-mix(in srgb,#218739 30%,var(--exp-shift-surface))!important;color:#dcffe4!important}
        [class*="bg-blue-"],[class*="bg-sky-"]{background-color:color-mix(in srgb,#2879a8 30%,var(--exp-shift-surface))!important;color:#e0f4ff!important}`,
      process: () => markSold('article,li.group,.group.bg-white', (card) => /sold\s*out|out\s*of\s*stock/i.test(card.textContent || '') || card.querySelector('[data-stock="0"],[class*="out-of-stock"]'))
    },
    scryfall: {
      name: 'Scryfall', hosts: ['scryfall.com'], options: [['dim-content-warnings', 'Dim content warnings']],
      css: (s) => s['dim-content-warnings'] ? '.card-content-warning{opacity:.4!important;filter:grayscale(.55)!important;max-height:3.5rem!important;overflow:hidden!important}.card-content-warning:hover,.card-content-warning:focus-within{opacity:1!important;filter:none!important;max-height:none!important}' : ''
    },
    steamgifts: {
      name: 'SteamGifts', hosts: ['steamgifts.com'], options: [['hide-entered', 'Hide entered'], ['hide-ended', 'Hide ended'], ['soft-hide-featured', 'Soft-hide featured / pinned'], ['high-contrast-enter', 'High-contrast Enter']],
      css: (s) => `${s['hide-entered'] ? '.giveaway__row-outer-wrap:has(.is-faded),.giveaway__row-outer-wrap:has(.esgst-faded),.giveaway-gridview .faded{display:none!important}' : ''}${s['hide-ended'] ? '[data-exp-shift-ended="true"]{display:none!important}' : ''}${s['soft-hide-featured'] ? '.featured__container,.pinned-giveaways{opacity:.32!important;max-height:52px!important;overflow:hidden!important}.featured__container:hover,.featured__container:focus-within,.pinned-giveaways:hover,.pinned-giveaways:focus-within{opacity:1!important;max-height:none!important}' : ''}${s['high-contrast-enter'] ? '.sidebar__entry-insert,.form__submit-button{background:#125c14!important;color:#fff!important;border:2px solid #fff!important;font-weight:bold!important}' : ''}`,
      process: () => document.querySelectorAll('.giveaway__row-outer-wrap').forEach((row) => row.dataset.expShiftEnded = String(Boolean(row.querySelector('.fa-times-circle') || [...row.querySelectorAll('[title]')].some((node) => /ended/i.test(node.title)))))
    },
    cardkingdom: {
      name: 'Card Kingdom', hosts: ['cardkingdom.com'], options: [['dense-results', 'Denser product results'], ['hide-sold-out', 'Hide fully sold out'], ['compact-condition-rows', 'Compact condition rows'], ['sticky-filters', 'Sticky search filters'], ['hide-promos', 'Hide promotions']],
      css: (s) => `${s['dense-results'] ? '.productItemWrapper{margin-bottom:.5rem!important}.productCardWrapper,.itemContentWrapper,.detailWrapper{padding:.45rem!important}' : ''}${s['hide-sold-out'] ? '[data-exp-shift-sold="true"]{display:none!important}' : ''}${s['compact-condition-rows'] ? '.addToCartByType,.oneRow,.twoRow{min-height:auto!important;margin:.15rem 0!important;padding:.2rem .35rem!important}' : ''}${s['sticky-filters'] ? '.sidesearch{position:sticky!important;top:8px!important;max-height:calc(100vh - 16px)!important;overflow:auto!important}' : ''}${s['hide-promos'] ? '.promo,.promo-banner,.mega-menu-promo,[class*="promoColumn"],[class*="marketing"]{display:none!important}' : ''}`,
      process: () => markSold('.productItemWrapper,.productCardWrapper', (card) => !card.querySelector('.addToCartButton:not(.disabled),button.addToCartButton:not([disabled])') && card.querySelector('.outOfStockNotice'))
    },
    tcgplayer: {
      name: 'TCGPlayer', hosts: ['tcgplayer.com'], options: [['dense-grid', 'Denser product grid'], ['hide-out-of-stock', 'Hide out of stock'], ['compact-listings', 'Compact listing rows'], ['hide-merchandising', 'Hide merchandising carousels'], ['hide-support-chat', 'Hide support chat']],
      css: (s) => `${s['dense-grid'] ? '.search-results,.product-grid{gap:.5rem!important}.product-card,.search-result{margin:.25rem!important}' : ''}${s['hide-out-of-stock'] ? '.out-of-stock,.mp-oos-badge,[data-exp-shift-sold="true"],.search-result:has(.out-of-stock){display:none!important}' : ''}${s['compact-listings'] ? '.listing-item{padding:.5rem .75rem!important;margin-bottom:.25rem!important}.search-toolbar,.horizontal-filters-bar{min-height:auto!important;padding:.5rem 1rem!important}' : ''}${s['hide-merchandising'] ? '.merchandising-filmstrip,.product-carousel{display:none!important}' : ''}${s['hide-support-chat'] ? 'iframe#forethought-chat,iframe[src*="forethought.ai"],iframe[id^="forethought-"]{display:none!important}' : ''}`,
      process: () => markSold('.search-result,.search-result__content,.product-card,.item-card,.list-view-product-card', (card) => card.querySelector('.out-of-stock,.mp-oos-badge') || /\bout\s*of\s*stock\b/i.test(card.textContent || ''))
    },
    goodreads: {
      name: 'Goodreads', hosts: ['goodreads.com'], options: [['dense-book-lists', 'Denser book lists'], ['compact-reviews', 'Compact reviews'], ['hide-recommendations', 'Hide recommendations'], ['wide-reading', 'Wider reading column']],
      css: (s) => `${s['dense-book-lists'] ? '.elementList,.bookalike,.BookCard{padding:.45rem 0!important;margin:.2rem 0!important}.leftAlignedImage img,.bookCover{max-height:110px!important;width:auto!important}' : ''}${s['compact-reviews'] ? '.review,.ReviewCard{padding:.65rem!important;margin:.35rem 0!important}.reviewText,.ReviewText{line-height:1.42!important}' : ''}${s['hide-recommendations'] ? '[data-exp-shift-recommendation="true"]{display:none!important}' : ''}${s['wide-reading'] ? '.BookPage__mainContent,.mainContent,.gr-mainContent{max-width:980px!important;width:min(980px,100%)!important}' : ''}`,
      process: () => markRecommendations(/readers also enjoyed|recommend(?:ed|ations)|similar books|people also liked/i)
    },
    genius: {
      name: 'Genius', hosts: ['genius.com'], options: [['focus-lyrics', 'Focus lyrics'], ['compact-annotations', 'Compact annotations'], ['dim-media', 'Dim media embeds'], ['hide-recommendations', 'Hide recommendations'], ['hide-community', 'Hide Community section'], ['hide-latest', 'Hide Latest section'], ['hide-videos', 'Hide Videos section'], ['hide-charts', 'Hide Charts section'], ['hide-news', 'Hide News section']],
      css: (s) => `${s['focus-lyrics'] ? '[data-lyrics-container="true"],[class*="Lyrics__Container"]{max-width:760px!important;margin-left:auto!important;margin-right:auto!important;font-size:1.08rem!important;line-height:1.72!important}' : ''}${s['compact-annotations'] ? '[class*="Annotation"]{padding:.55rem!important;margin:.35rem 0!important;line-height:1.42!important}' : ''}${s['dim-media'] ? 'iframe,video,[class*="Media"]{opacity:.42!important;transition:opacity .15s ease}iframe:hover,iframe:focus,video:hover,video:focus,[class*="Media"]:hover,[class*="Media"]:focus-within{opacity:1!important}' : ''}${s['hide-recommendations'] ? '[data-exp-shift-recommendation="true"]{display:none!important}' : ''}${s['hide-community'] ? 'main #community{display:none!important}' : ''}${s['hide-latest'] ? 'main [data-exp-shift-home-section="latest"]{display:none!important}' : ''}${s['hide-videos'] ? 'main #videos{display:none!important}' : ''}${s['hide-charts'] ? 'main #top-songs{display:none!important}' : ''}${s['hide-news'] ? 'main #featured-stories{display:none!important}' : ''}`,
      process() { markRecommendations(/you might also like|recommended|more from|related songs/i); document.querySelectorAll('main h2').forEach((heading) => { if (heading.textContent.trim() === 'Latest') heading.closest('section')?.setAttribute('data-exp-shift-home-section', 'latest'); }); }
    }
  };
  let active;
  let style;
  let status = { id: null, state: 'inactive', reason: 'Generic Mode' };
  function setManaSections(collapsed) { document.querySelectorAll('main section,.container section').forEach((section) => { if (section.querySelector(':scope > h2')) section.dataset.expShiftCollapsed = String(collapsed); }); }
  function markSold(selector, predicate) { document.querySelectorAll(selector).forEach((card) => card.dataset.expShiftSold = String(Boolean(predicate(card)))); }
  function markRecommendations(pattern) { document.querySelectorAll('h1,h2,h3,h4').forEach((heading) => { if (pattern.test(heading.textContent || '')) (heading.closest('section,.gr-box,[class*="Recommended"],[class*="Related"]') || heading.parentElement)?.setAttribute('data-exp-shift-recommendation', 'true'); }); }
  function select(hostname = location.hostname) { return Object.entries(definitions).find(([, item]) => item.hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))); }
  function settings() { return active ? EXP.Settings.snapshot().adapterSettings[active[0]] || {} : {}; }
  function apply() {
    if (!active) return;
    style?.remove(); style = null;
    const effective = EXP.Settings.effective();
    const cssText = effective.safeMode || effective.excluded ? '' : active[1].css(settings());
    if (cssText) { style = EXP.Core.injectStyle(document, cssText, { expShiftAdapterStyle: '1' }); style.id = 'exp-shift-adapter-style'; }
  }
  function initialize() { active = select(); status = active ? { id: active[0], name: active[1].name, state: 'healthy', reason: 'Enhanced Mode available' } : { id: null, state: 'inactive', reason: 'Generic Mode' }; apply(); return status; }
  function process() { if (!active || status.state === 'failed') return; try { active[1].process?.(); status = { ...status, state: 'healthy', reason: 'Enhanced Mode active' }; } catch (error) { status = { ...status, state: 'degraded', reason: error.code || 'ADAPTER_PROCESSING' }; EXP.Core.safeError(error, `adapter-${active[0]}`); } }
  function disable() { style?.remove(); style = null; document.querySelectorAll('[data-exp-shift-collapsed]').forEach((node) => node.removeAttribute('data-exp-shift-collapsed')); status = active ? { ...status, state: 'inactive', reason: 'Adapter suspended' } : status; }
  function health() { return { ...status, controls: active?.[1].options.map(([id]) => id) || [], actions: active?.[1].actions?.map(([id]) => id) || [] }; }
  function options() { return active?.[1].options || []; }
  function actions() { return active?.[1].actions || []; }
  function runAction(id) { const action = active?.[1].actions?.find(([candidate]) => candidate === id); if (!action) return false; action[2](); process(); return true; }
  function setOption(id, value) { if (!active || !active[1].options.some(([candidate]) => candidate === id)) return; const state = EXP.Settings.snapshot(); const adapterSettings = { ...state.adapterSettings, [active[0]]: { ...(state.adapterSettings[active[0]] || {}), [id]: Boolean(value) } }; EXP.Settings.update({ adapterSettings }, `adapter-${active[0]}-${id}`); apply(); process(); }
  return Object.freeze({ catalog: definitions, select, initialize, apply, process, disable, health, options, actions, runAction, settings, setOption });
})();

EXP.VERSION = '3.4.0-dev.9';

EXP.ReleaseNotes = (() => {
  const NOTES = Object.freeze({
    '3.4.0-dev.9': [
      'Adds conservative inferred native-dark detection for sites with a dark canvas and a strong majority of dark major surfaces even when color-scheme is not declared.',
      'Requires multiple large visible surface samples, a high dark-surface ratio, and very few light major surfaces, while a strong light-surface majority vetoes native-dark classification.',
      'Adds native-dark evidence diagnostics including explicit-scheme state, canvas state, sampled surface counts, dark/light/mid counts, and dark-surface ratio.',
      'Adds anonymous positive and mixed-surface regressions so dark applications gain native-dark restraint while mixed or light sites remain on the full transformation path.',
    ],
    '3.4.0-dev.8': [
      'Memoizes resolved ancestor backgrounds within each resolver pass so deeply nested native-dark content can reuse parent results instead of rebuilding the same chain.',
      'Keeps an eight-level native-dark fast path but extends accurately to a hard depth of twenty-four only when needed, then caches the resolved chain.',
      'Adds diagnostics for parent-background cache reuse and extended native-dark walks while preserving the existing native-dark structural fast path.',
      'Adds an anonymous deep native-dark regression covering nested contrast repair, sibling reuse conditions, and preservation of intentional light surfaces.',
    ],
    '3.4.0-dev.7': [
      'Adds a native-dark fast path that scans only interactive/accessibility surfaces instead of the full structural surface set.',
      'Caches effective backgrounds within each resolver pass and caps native-dark ancestor reconstruction at eight levels.',
      'Avoids duplicate effective-background work before native-dark repairs while keeping text, forms, dialogs, focus, and contrast correction active.',
      'Adds native-dark performance telemetry and a generic native-dark regression while leaving Amazon full-transformation behavior unchanged.',
    ],
    '3.4.0-dev.6': [
      'Suppresses resolver feedback from Shift-owned inline style writes so generic repairs do not immediately schedule redundant mutation passes.',
      'Collapses nested mutation roots before each pass and reports per-pass examined versus changed counts, collapsed roots, ignored self-mutations, and maximum pass duration.',
      'Adds an unknown-site regression with no adapter or site rules to verify generic surface, contrast, form, media-preservation, and dynamic-content behavior.',
      'Keeps the established Amazon dev.5 appearance and remote stylesheet recovery behavior as regression baselines while moving performance hardening into the generic engine.',
    ],
    '3.4.0-dev.5': [
      'Neutralizes Amazon multiply blend modes on product metadata so repaired titles and prices render at their intended light color.',
      'Neutralizes multiply blending and reduced opacity on Amazon product images and image wrappers while keeping native media wells intact.',
      'Uses the uploaded Amazon page structure to cover hashed asin metadata, title, price, image-wrapper, and image class families without hard-coding build hashes.',
      'Adds a regression proving Amazon product text and images remain visible when Amazon applies multiply blending.',
    ],
    '3.4.0-dev.4': [
      'Adds a final Amazon product-text repair pass so recovered stylesheet rules cannot push recommendation titles and prices back to near-black.',
      'Keeps the successful remote stylesheet recovery path unchanged while applying Amazon title and price corrections after it.',
      'Preserves the dev.3 product-media well treatment and native artwork handling.',
      'Adds a regression proving Amazon product text remains readable even when a recovered stylesheet uses important dark colors.',
    ],
    '3.4.0-dev.3': [
      'Preserves Amazon product-media wells so dark cards do not swallow dark or transparent product artwork.',
      'Repairs Amazon product titles and prices explicitly while keeping product images unfiltered and fully opaque.',
      'Adds an independent watchdog around remote stylesheet requests so stalled manager requests cannot remain pending forever.',
      'Adds bounded remote host diagnostics so Amazon stylesheet transport failures can be identified precisely.',
    ],
    '3.4.0-dev.2': [
      'Strengthens Amazon navigation, card, form, flyout, alert, and result-surface coverage while preserving product artwork.',
      'Adds explicit Amazon CDN connections for cross-origin stylesheet recovery.',
      'Adds durable remote stylesheet telemetry for pending requests, lifetime successes/failures, recovered rules, and last failure context.',
      'Adds Amazon surface and remote stylesheet regression coverage.',
    ],
    '3.4.0-dev.1': [
      'Rebuilds SHIFT on the Dropper 3.3.2 application shell instead of maintaining a separate launcher and menu implementation.',
      'Uses exp-core for the launcher, header, support control, section navigation, Full / Compact / Narrow geometry, update cards, and multi-product coordination.',
      'Preserves the existing SHIFT color, stylesheet, live-repair, adapter, profile, and site-rule engines behind the new shared shell.',
      'Removes the legacy SHIFT menu-chrome module from the generated userscript so shared UI has one implementation owner.',
    ],
	'3.3.23': [
	  'Uses the same menu-width notice surface for Current Version, Update Available, and Update Complete, matching Dropper.',
	  'Forces a fresh update check for each newly installed SHIFT version instead of inheriting the previous version\'s 15-minute throttle or stale remote version.',
	  'Reports separate progress-card, launcher, launcher-row, menu, and notice geometry, and limits resource-error details to ownership plus asset hostname.',
	],
	'3.3.22': [
	  'Preserves SHIFT settings across userscript updates by recovering from browser-local backup storage when manager storage is missing.',
	  'Mirrors validated settings to both manager storage and the local fallback so future updates can self-heal without resetting preferences.',
	],
	'3.3.21': [
	  'Shows each automatic update notice once for that version instead of on every page load.',
	  'Stacks simultaneous notices beside the complete launcher grid.',
	  'Moves diagnostics and recovery actions under the final System menu.',
	],
	'3.3.20': [
	  'Keeps every launcher clickable when Dropper and multiple ExtraPotions products share the page.',
	  'Uses exp-core 3.2.19 to prevent transparent launcher containers from intercepting pointer input.',
	],
	'3.3.19': [
	  'Uses the borderless SHIFT launcher artwork everywhere an icon is shown.',
	  'References the SVG by URL instead of embedding image bytes in the userscript.',
	  'Removes the superseded bordered SVG and raster badge files.',
	],
	'3.3.18': [
	  'Keeps the rebuilt theme rendering and expanded Amazon coverage from 3.3.17.',
	  'Aligns shared status and progress chrome with the rounded-rectangle suite preference.',
	  'Updates the bundled Core provenance to the verified Dropper 3.2.18 artifact.',
	  'Retains Page, Technical, Console, and Plugin diagnostics with peer conflict reporting.',
	],
	'3.3.17': [
	  'Rebuilds theme rendering with one owner each for component rules, stylesheet transformation, live DOM repair, and lifecycle restoration.',
	  'Improves Amazon coverage with per-stylesheet budgets, stale-response cancellation, scroll-aware contrast repair, and explicit component roles.',
	  'Standardizes Page, Technical, Console, and Plugin diagnostics with bounded redaction and current-page product conflict observations.',
	  'Embeds the canonical SHIFT badge in userscript-manager metadata and replaces the bordered README image with borderless SVG artwork.',
	],
	'3.3.16': [
	  'Removes the decorative progress ring from the SHIFT launcher.',
	  'Keeps the launcher at 48 px with 40 px artwork and the menu badge at 38 px.',
	  'Uses the canonical SHIFT SVG as the userscript-manager icon.',
	],
	'3.3.15': [
	  'Uses 48 px launcher buttons with 40 px artwork and an 8 px gap between launchers.',
	  'Expands menu-header badge artwork to 38 px.',
	  'Adds a dedicated 128 px raster badge derivative without changing either SVG source.',
	],
	'3.3.14': [
	  'Keeps the changelog near a bottom-positioned launcher instead of pushing it to the top of the window.',
	  'Places the changelog beside upward-opening menus so it remains outside the menu without covering it.',
	  'Repositions the changelog after launcher coordination, menu resizing, and viewport changes.',
	],
	'3.3.13': [
	  'Limits active launcher and theme coordination to Dropper, SHIFT, PRISMA, and WARD.',
	  'Stops cross-product audits from tracking archived repositories.',
	  'Pins the bundled Core reference to the verified Dropper 3.2.13 release artifact.',
	],
	'3.3.12': [
	  "Packs installed product launchers into Dropper's compact progress rail and restores the normal grid when the obstacle closes.",
	  "Keeps open-menu placement aligned to each launcher's assigned grid row.",
	],
	'3.3.11': [
	  'Replaces the legacy menu palettes with Ember, Midnight, Glacier, High contrast, Verdant, Pride, Crimson, and SHIFT gem.',
	  'Migrates saved legacy palette names to the closest new direction without changing page content settings.',
	],
    '3.3.10': [
      'Adds Dropper’s layered Warm charcoal menu finish while keeping page themes separate.',
      'Retains the winner-theme priority and matte controls across installed products.',
    ],
    '3.3.9': [
      'Uses the highest-priority installed product’s selected theme surfaces without changing page themes.',
      'Hides subordinate menu theme controls while preserving their own selections.',
    ],
    '3.3.8': [
      'Repairs SteamGifts giveaway controls with dark theme surfaces and readable labels.',
      'Stops repeated stylesheet walks during ordinary page mutations.',
    ],
    '3.3.7': [
      'Pairs SteamGifts pale headings and table controls with dark theme surfaces.',
      'Preserves the warning color of SteamGifts notices while fixing their contrast.',
    ],
    '3.3.6': [
      'Adopts the verified Dropper 3.2.8 Core for menus, themes, notices, diagnostics, and launcher coordination.',
      'Keeps SHIFT page theming independent while standardizing matte controls, responsive layout, and CSP-safe chrome.',
      'Synchronizes source, install metadata, and the reproducible userscript build.',
    ],
    '3.3.0': [
      'Rebuilds SHIFT around a dedicated stylesheet transformer, visual verification resolver, and reversible inline color engine.',
      'Adds dynamic repair for Shadow DOM, pseudo-elements, same-origin frames, forms, overlays, gradients, borders, and contrast failures.',
      'Preserves artwork, semantic and brand colors, masks, currentColor, and modern CSS relationships while repairing structural light surfaces.',
      'Keeps the proven 3.2.6 launcher and menu baseline while expanding diagnostics for the rebuilt rendering pipeline.',
    ],
    '3.3.0-dev.2': [
      'Hardens generated stylesheet insertion for highly dynamic pages such as Amazon.',
      'Prevents detached or moved stylesheet owner nodes from aborting relationship-aware CSS transformation.',
      'Retains the dev.1 variable, compositing, foreground pairing, gradient, shadow, SVG, caching, and invalidation work.',
    ],
    '3.3.0-dev.1': [
      'Development preview of the relationship-aware stylesheet engine for Amazon live testing.',
      'Adds CSS variable-chain resolution, alpha compositing, foreground/background pairing, gradients, shadows, SVG paint transforms, pseudo-element coverage, stylesheet caching, and event-driven invalidation.',
      'Adds diagnostics for advanced stylesheet transformations and cache behavior.',
    ],
    '3.2.6': [
      'Positions the floating changelog above the open SHIFT menu instead of overlapping the menu surface.',
      'Aligns the changelog to the menu edge while retaining launcher-relative placement when the menu is closed.',
    ],
    '3.2.5': [
      'Adds the missing GitHub Release action to the floating changelog card, matching Dropper update chrome.',
    ],
    '3.2.4': [
      'Moves update and changelog cards out of the SHIFT menu so they behave as floating notices attached to the launcher, matching Dropper.',
      'Keeps update/changelog content independent of menu scrolling and section layout.',
    ],
    '3.2.3': [
      'Restores the borderless SHIFT menu badge to its full 38px header footprint instead of shrinking the SVG after removing its frame.',
    ],
    '3.2.2': [
      'Restores the SHIFT menu badge to borderless artwork, matching Dropper rather than wrapping the icon in a separate framed tile.',
      'Keeps structural chrome on the launcher control itself while allowing the badge SVG to render cleanly on its own.',
    ],
    '3.2.1': [
      'Matches the SHIFT launcher framing to Dropper with a real theme-aware border and inset frame instead of relying on the icon artwork for its edge.',
      'Places the menu badge inside the same 38px framed header tile used by Dropper and normalizes both launcher and header artwork to 24px.',
    ],
    '3.2.0': [
      'Brings SHIFT update and changelog behavior in line with Dropper: version-pill changelog, themed update notice, update-complete notice, GitHub Release and Install Update actions, and 30-second dismissal.',
      'Checks for updates on the same 15-minute cadence used by Dropper when update notifications are enabled.',
      'Restyles the header divider to the Dropper-style soft edge fade while keeping Pride full-gradient treatment.',
    ],
    '3.1.10': [
      'Recognizes ManaPool Tailwind yellow/amber, red, green, and blue utility status surfaces that do not expose semantic alert class names.',
      'Maps those site-specific utility alerts to SHIFT semantic warning, error, success, and info pairs.',
    ],
    '3.1.9': [
      'Themes warning, success, error, and info surfaces as semantic foreground/background pairs instead of transforming each color independently.',
      'Keeps status links and controls readable while retaining recognizable warning, success, error, and information meaning.',
    ],
    '3.1.8': [
      'Increases structural depth separation so dark palettes retain distinct page, surface, raised, and overlay layers.',
      'Strengthens muted and secondary text recovery for low-contrast labels and captions.',
      'Skips redundant stylesheet transformation passes when the theme and stylesheet signature have not changed.',
    ],
    '3.1.7': [
      'Stops saturated source-site backgrounds and borders from tinting every SHIFT palette toward the site brand color.',
      'Maps structural surfaces and borders into the selected palette while preserving semantic color through links, status elements, accents, and artwork.',
    ],
    '3.1.6': [
      'Stops SHIFT generated styles and owned UI mutations from feeding back into the DOM scheduler.',
      'Coalesces rapid repeated scans of the same page root to reduce SPA mutation churn and CPU work.',
    ],
    '3.1.5': [
      'Captures the site color-scheme and canvas baseline before SHIFT preload/theme paint.',
      'Prevents SHIFT own color-scheme: dark declaration from falsely classifying light sites such as ManaPool as native-dark.',
    ],
    '3.1.4': [
      'Runs SHIFT in the userscript content context instead of forcing page-world injection, improving compatibility with Orion/iPad and strict sites such as ManaPool.',
      'Retains unsafeWindow for the limited page-world access points that explicitly need it.',
    ],
    '3.1.3': [
      'Adds mobile/WebKit launcher visibility self-checks and automatic viewport recovery for sites that strand a connected launcher off-screen.',
      'Hardens launcher host visibility, opacity, pointer events, stacking, and transforms for Orion/iPad-style browser environments.',
    ],
    '3.1.2': [
      'Guards the document-start anti-flash preload so an early DOM or storage failure cannot abort the entire userscript.',
      'Moves preload startup into the protected main boot path before the full DOMContentLoaded initialization.',
    ],
    '3.1.1': [
      'Keeps the SHIFT launcher and recovery menu available even if the new page engine or a site adapter fails during initialization.',
      'Defers full SHIFT startup until DOMContentLoaded while retaining the document-start anti-flash preload.',
    ],
    '3.1.0': [
      'Adds an independently implemented color engine that preserves source surface hierarchy while mapping pages into SHIFT themes.',
      'Repairs inline background, text, border, and semantic CSS custom-property colors without importing Dark Reader source code.',
      'Keeps artwork protection and the existing semantic surface scanner as a conservative fallback.',
      'Makes transformed inline colors fully reversible when SHIFT is disabled, excluded, or set back to Original.',
    ],
    '3.0.19': [
      'Restyles toggle switches with matte theme surfaces, softer knobs, and restrained accent ON states instead of metallic gray and full-gradient tracks.',
      'Keeps High Contrast and forced-colors switch behavior explicit for accessibility.',
      'Matches switch chrome to the active theme instead of using metallic gray tracks or full-gradient Pride ON fills.',
      'Leaves existing toggle behavior, settings persistence, and panel layout unchanged.',
    ],
    '3.0.18': [
      'Keeps menu CSS inside the shadow root so userscript style APIs cannot paint the page.',
      'Pins the launcher host transparent so the browser popover layer cannot cover the site in white.',
      'Leaves a site background shorthand intact on Original and exclusion so loading SHIFT cannot turn the page white.',
    ],
    '3.0.17': [
      'Stops destroying site background shorthand when theming, so exclusion/Original cannot leave a blank white canvas.',
      'Purges leftover SHIFT page styles on restore and matches exclusions to subdomains (www).',
    ],
    '3.0.16': [
      'Stops blanket background fills on section and article so transparent wrappers no longer cover heroes.',
      'Surface repair only adopts opaque neutral shells, and nested thumbnails no longer block repairing grey boxes.',
    ],
    '3.0.15': [
      'Stops painting common layout classes (`.container`, `.wrapper`, `.page`, and similar) that were covering heroes and page art on every site.',
      'Keeps Greasy Fork `.width` / `.script-list` shells themed so light text is not left on white CMS boxes.',
    ],
    '3.0.14': [
      'Paints classic light-site content wrappers (`.width`, `.container`, and similar) so forced theme text is not left on white boxes.',
      'Fixes washed-out Greasy Fork and CMS pages where headings stayed light on unpainted white shells.',
    ],
    '3.0.13': [
      'Dropdown option text matches other menu label text at 11px.',
      'Fixes theme paint so pages keep opaque host backgrounds and readable contrast without blank-white or over-covered content.',
      'Narrows chrome class hooks, scopes host rules to `html[data-exp-shift]`, and keeps an inline host fallback after stylesheet attach.',
      'Leaves media unfiltered and avoids invert/filter stacking that can hide page content.',
    ],
    '3.0.12': [
      'Pride header divider matches other menu rainbow dividers (full bar, not a faded hairline).',
      'Exposes Pride on the host dataset so shared menu chrome applies the same rainbow bar.',
    ],
    '3.0.11': [
      'Appearance selects, switches, and palette swatches preview and save on change—no Apply or Cancel.',
      'Hold to Show Original remains for temporary page comparison without discarding settings.',
      'Committed themes stay active across SPA route changes without a draft row.',
    ],
    '3.0.10': [
      'Applies themes everywhere sooner with CSS variables plus common chrome and framework class hooks.',
      'Follows SG-Dark-Grey / ESGST patterns: :root tokens, color-scheme dark, and broad !important surface paint.',
      'Keeps media unfiltered while cards, navbars, modals, and utility light backgrounds pick up the active theme.',
    ],
    '3.0.9': [
      'Pride uses a full rainbow border, divider, and accents—not just a pink overlay.',
      'Launcher helper tips flip below when the badge sits at the top of the window.',
      'Removes redundant tips from menu section names.',
      'Keeps appearance previews across SPA route changes until Apply or Cancel.',
    ],
    '3.0.8': [
      'Preserves appearance previews across SPA route changes until Apply or Cancel.',
      'Makes Pride visibly distinct with plum page, rainbow edge, and pink accents.',
      'Rebalances the menu into six task-focused routes with Dropper-style chrome.',
      'Ships a direct-install shift.user.js build without loader parts or remote resources.',
    ],
    '3.0.7': [
      'Hardens the launcher host against site CSS that hides, clips, or disables plugin controls.',
      'Uses the browser top layer when manual popovers are available so overlays stay below the launcher.',
      'Reattaches and restores the launcher host if a page removes or hides it during SPA updates.',
    ],
    '3.0.6': [
      'Pride paints a muted rainbow highlight, a plum page, and pink accents on interactive surfaces.',
      'SHIFT gem is a dedicated teal palette instead of near-black midnight.',
      'Warm charcoal, Graphite, Midnight, Pine, and Ember use lighter, more distinct hues.',
    ],
  });

  function forVersion(version) {
    return NOTES[version] || [];
  }

  function renderChangelog(version) {
    const fragment = document.createDocumentFragment();
    const heading = document.createElement('strong');
    heading.className = 'changelog-version';
    heading.textContent = `Version ${version}`;
    fragment.append(heading);
    const list = document.createElement('ul');
    list.className = 'changelog-list';
    for (const item of forVersion(version).slice(0, 4)) {
      const row = document.createElement('li');
      row.textContent = item;
      list.append(row);
    }
    fragment.append(list);
    return fragment;
  }

  return Object.freeze({ forVersion, renderChangelog });
})();

EXP.Updates = ExtraPotionsCore.createReleaseUpdateChecker({
  productId: 'shift',
  repository: 'ExtraPotions/SHIFT',
  endpoint: 'https://api.github.com/repos/ExtraPotions/SHIFT/releases/latest',
  currentVersion: EXP.VERSION,
  enabled: () => EXP.Settings.snapshot().updateNotifications,
  onError: error => EXP.Core.safeError(error, 'shift-updates'),
});

/* Diagnostics reports and controls follow Dropper's shared implementation. */
EXP.Diagnostics = Object.freeze({
  createDiagnosticsReport: (product, details) => ExtraPotionsCore.createDiagnosticsReport(product, details),
  downloadDiagnostics: report => ExtraPotionsCore.downloadDiagnostics(report),
  createDiagnosticsControls: (getReport, notify) => ExtraPotionsCore.createDiagnosticsControls(getReport, notify)
});

EXP.UI = (() => {
  const ICON_URL = 'https://raw.githubusercontent.com/ExtraPotions/SHIFT/main/assets/shift-launcher.svg';
  const SUPPORT_URL = 'https://ko-fi.com/expdare';
  const PRODUCT_THEME = Object.freeze({
    id:'shift', name:'SHIFT gem',
    swatch:'linear-gradient(135deg,#b9fff9 0 34%,#20d9d3 34% 67%,#f23868 67%)',
    bg:'#101719', panel:'#182326', line:'#344442', text:'#f2f8f7', muted:'#b8c9c7',
    accent:'#26d9c7', accent2:'#f23868',
    skin:'linear-gradient(135deg,#b9fff9,#20d9d3,#f23868)',
    skinVertical:'linear-gradient(180deg,#b9fff9,#20d9d3,#f23868)'
  });
  const routes = [
    ['appearance', 'Appearance'], ['readability', 'Readability'], ['effects', 'Effects & Integrations'], ['profiles', 'Profiles & Sites'], ['menu', 'Menu & Updates'], ['system', 'System']
  ];
  let host;
  let shadow;
  let launcher;
  let panel;
  let toast;
  let toastTimer;
  let product;
  let noticeController;
  let saved;
  let onApply;
  let onSettings;
  let swatchStyle;
  let updateNotice;
  let lastVersionKey = 'exp:v3:shift:last-version-v2';

  const el = (tag, attrs = {}, text) => {
    const node = document.createElement(tag);
    for (const [name, value] of Object.entries(attrs)) {
      if (name === 'class') node.className = value;
      else if (name === 'hidden') node.hidden = value;
      else node.setAttribute(name, value);
    }
    if (text !== undefined) node.textContent = text;
    return node;
  };
  function button(label, action, className = '') {
    const node = el('button', { type: 'button', class: className }, label);
    node.addEventListener('click', action);
    return node;
  }
  function hideUpdateNotice() {
    noticeController?.hide();
  }

  function showUpdateNotice({ kicker = "What's New", title = 'SHIFT Updated', version = EXP.VERSION, text = '', details = [], available = false } = {}) {
    if (!noticeController) return;
    noticeController.show({
      kicker,
      title,
      version,
      text,
      details,
      kind: available ? 'available' : kicker === 'Update Complete' ? 'complete' : 'current',
      releaseUrl: 'https://github.com/ExtraPotions/SHIFT/releases',
      actionUrl: available ? 'https://raw.githubusercontent.com/ExtraPotions/SHIFT/main/shift.user.js' : '',
      actionText: 'Install Update',
      showAction: available,
    });
  }

  async function checkUpdateNotice(force = false) {
    const result = await EXP.Updates.check(force);
    launcher?.classList.toggle('update-available', Boolean(result.available));
    if (result.available && EXP.Core.claimNotice('shift',`available:${result.latest}`)) showUpdateNotice({
      kicker: 'Update Available',
      title: 'New SHIFT Version Available',
      version: result.latest,
      text: `v${result.latest} is ready to install.`,
      details: Array.isArray(result.details) && result.details.length ? result.details : ['A newer SHIFT build is available.', 'Install the latest userscript for the newest fixes and improvements.'],
      available: true,
    });
    return result;
  }

  function setMessage(message, kind = 'status') {
    if (status) { status.textContent = ''; status.hidden = true; }
    if (!toast || !EXP.Settings.snapshot().menuNotifications) return;
    toast.textContent = message; toast.dataset.kind = kind; toast.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { if (toast) toast.hidden = true; }, 2400);
  }
  function section(title) {
    const node = el('section', { class: 'group' });
    node.append(el('h3', {}, title));
    return node;
  }
  function row(label, help) {
    const node = el('div', { class: 'row' });
    const copy = el('div', { class: 'copy' });
    copy.append(el('span', { class: 'label' }, label));
    node.append(copy);
    return node;
  }
  function switchControl(label, help, value, change) {
    const node = row(label, help);
    const control = el('button', { type: 'button', class: 'switch', role: 'switch', 'aria-checked': String(Boolean(value)), 'aria-label': label });
    control.append(el('span', { 'aria-hidden': 'true' }));
    control.addEventListener('click', () => { const next = control.getAttribute('aria-checked') !== 'true'; control.setAttribute('aria-checked', String(next)); change(next); });
    node.append(control);
    return node;
  }
  function selectControl(label, help, value, values, change) {
    const node = row(label, help);
    const select = el('select', { 'aria-label': label });
    for (const [id, name] of values) { const option = el('option', { value: id }, name); option.selected = id === value; select.append(option); }
    select.addEventListener('change', () => change(select.value));
    node.append(select);
    return node;
  }
  function actionRow(label, help, action, actionLabel = label) { const node = row(label, help); node.append(button(actionLabel, action, ['Reset','Reset site'].includes(actionLabel) ? 'action warn' : 'action')); return node; }

  function applyMenuTheme(state) { ExtraPotionsCore.applyTheme(host, state.theme === "original" ? "shift" : state.theme); }

  function commit(patch, reason = 'appearance', message = 'Appearance updated.') {
    saved = onSettings({ ...saved, ...patch }, reason);
    product?.renderActive();
    setMessage(message);
  }
  function appearanceSwatches() {
    const presets = [
      { id:'ember', name:'Ember', theme:'ember', accent:'ember-default', swatch:'linear-gradient(135deg,#120807 0 38%,#c9512c 38% 69%,#b68a32 69% 100%)' },
      { id:'midnight', name:'Midnight', theme:'midnight', accent:'midnight-default', swatch:'linear-gradient(135deg,#050a12 0 38%,#3563a3 38% 69%,#348f8b 69% 100%)' },
      { id:'glacier', name:'Glacier', theme:'glacier', accent:'glacier-default', swatch:'linear-gradient(135deg,#061216 0 38%,#4a9eaa 38% 69%,#92b85b 69% 100%)' },
      { id:'contrast', name:'High contrast', theme:'obsidian', accent:'contrast-default', swatch:'linear-gradient(135deg,#000000 0 48%,#ffffff 48% 78%,#ffd400 78% 100%)' },
      { id:'verdant', name:'Verdant', theme:'verdant', accent:'verdant-default', swatch:'linear-gradient(135deg,#06110d 0 38%,#318c61 38% 69%,#2f7f86 69% 100%)' },
      { id:'pride', name:'Pride', theme:'pride', accent:'pride-default', swatch:'linear-gradient(135deg,#c84e66 0%,#d07840 16.6%,#be9f37 33.3%,#3b8a5f 50%,#3d79a6 66.6%,#7455a4 100%)' },
      { id:'crimson', name:'Crimson', theme:'crimson', accent:'crimson-default', swatch:'linear-gradient(135deg,#0c0508 0 38%,#941f2f 38% 69%,#2f746e 69% 100%)' },
      { id:'shift', name:'SHIFT gem', theme:'shift', accent:'shift-default', swatch:'linear-gradient(135deg,#041313 0 38%,#1e938f 38% 69%,#c34766 69% 100%)' }
    ];
    const custom = saved.customThemes.map((theme) => ({ id:`custom:${theme.id}`, name:theme.name, theme:theme.id, accent:saved.accent, swatch:`linear-gradient(135deg,${theme.page} 50%,${theme.text} 50%)` }));
    const choices = [...presets, ...custom];
    const matched = choices.find((item) => item.theme === saved.theme && item.accent === saved.accent);
    const current = matched?.id || (saved.theme === 'original' ? '' : `current:${saved.theme}:${saved.accent}`);
    if (current && !choices.some((item) => item.id === current)) { const resolved=EXP.Themes.resolve(saved.theme,saved.accent,saved);choices.push({id:current,name:'Current imported palette',theme:saved.theme,accent:saved.accent,swatch:`linear-gradient(135deg,${resolved.page||'#171918'} 50%,${resolved.accent} 50%)`}); }
    const line=el('div',{class:'row palette-row'});const dots=el('div',{class:'exp-theme-swatches'});const options={container:dots,themes:choices,value:current,onChange:(id)=>{const choice=choices.find((item)=>item.id===id);if(choice)commit({theme:choice.theme,accent:choice.accent},'theme-swatch',`${choice.name} applied.`);}};
    const swatchCss = choices.map((theme) => `.exp-theme-swatch[data-swatch="${theme.id}"]{background:${theme.swatch}}`).join('');
    if (swatchStyle) swatchStyle.textContent = swatchCss;
    else swatchStyle = EXP.Core.injectStyle(shadow, swatchCss, { expShiftSwatches: '1' });
    if(ExtraPotionsCore?.createThemeSwatches)ExtraPotionsCore.createThemeSwatches(options);else for(const theme of choices){const dot=el('button',{type:'button',class:`exp-theme-swatch${theme.id===current?' is-on':''}`,'aria-label':theme.name,'aria-pressed':String(theme.id===current),'data-swatch':theme.id});dot.title=theme.name;dot.addEventListener('click',()=>options.onChange(theme.id));dots.append(dot);}
    line.style.setProperty('display','grid','important');
    line.style.setProperty('grid-template-columns','minmax(0,1fr)','important');
    dots.style.setProperty('flex-wrap','wrap','important');
    dots.style.setProperty('width','100%','important');
    line.append(dots);return line;
  }

  function appearanceFooter() {
    const footer = el('div', { class: 'workspace-actions' });
    const original = button('Hold to Show Original', () => {}, 'secondary');
    const hold = (value) => EXP.Engine.holdOriginal(value);
    original.addEventListener('pointerdown', () => hold(true));
    for (const event of ['pointerup', 'pointercancel', 'pointerleave', 'blur']) original.addEventListener(event, () => hold(false));
    original.addEventListener('keydown', (event) => { if (event.code === 'Space' || event.code === 'Enter') hold(true); });
    original.addEventListener('keyup', () => hold(false));
    footer.append(original);
    return footer;
  }

  function renderAppearance() {
    const fragment = document.createDocumentFragment();
    const themes = section('Palette', 'Choose a semantic palette. Original leaves the page unchanged.');
    themes.append(appearanceSwatches());
    themes.append(selectControl('Theme Strength', 'Soft narrows depth differences; Strong increases raised-surface depth.', saved.themeStrength, [['soft', 'Soft'], ['normal', 'Normal'], ['strong', 'Strong']], (themeStrength) => commit({ themeStrength }, 'theme-strength', `Theme strength set to ${themeStrength}.`)));
    fragment.append(themes);

    const surfaces = section('Surfaces', 'Host CSS themes the page and app shells first. Classification then repairs leftover gray boxes.');
    surfaces.append(selectControl('Surface Intelligence', 'Live repair depth after the base theme and stylesheet pass. Off still themes the page and component roles.', saved.surfaceLevel, [['off', 'Off'], ['conservative', 'Conservative'], ['balanced', 'Balanced'], ['aggressive', 'Aggressive']], (surfaceLevel) => commit({ surfaceLevel }, 'surface-level', `Surface intelligence set to ${surfaceLevel}.`)));
    surfaces.append(switchControl('Preserve artwork and charts', 'Never classify images, video, canvas, or SVG.', saved.preserveArt, (preserveArt) => commit({ preserveArt }, 'preserve-art', preserveArt ? 'Artwork preservation on.' : 'Artwork preservation off.')));
    surfaces.append(switchControl('Repair unreadable surfaces', 'Repair leftover neutral boxes after host CSS paints the page.', saved.repairSurfaces, (repairSurfaces) => commit({ repairSurfaces }, 'repair-surfaces', repairSurfaces ? 'Surface repair on.' : 'Surface repair off.')));
    fragment.append(surfaces, appearanceFooter());
    return fragment;
  }

  function renderReadability() {
    const fragment = document.createDocumentFragment();
    const readability = section('Text & links', 'Page text, links, and form accessibility.');
    readability.append(selectControl('Link visibility', 'Increase link distinction without changing status colors.', saved.linkVisibility, [['site', 'Site default'], ['enhanced', 'Enhanced'], ['high', 'High']], (linkVisibility) => commit({ linkVisibility }, 'link-visibility', `Link visibility set to ${linkVisibility}.`)));
    readability.append(selectControl('Text contrast', 'Increase neutral text contrast.', saved.textContrast, [['normal', 'Normal'], ['enhanced', 'Enhanced']], (textContrast) => commit({ textContrast }, 'text-contrast', `Text contrast set to ${textContrast}.`)));
    readability.append(switchControl('Muted text recovery', 'Repair muted text only when contrast is insufficient.', saved.mutedRecovery, (mutedRecovery) => commit({ mutedRecovery }, 'muted-recovery', mutedRecovery ? 'Muted text recovery on.' : 'Muted text recovery off.')));
    readability.append(switchControl('Form readability', 'Improve fields and placeholder contrast.', saved.formReadability, (formReadability) => commit({ formReadability }, 'form-readability', formReadability ? 'Form readability on.' : 'Form readability off.')));
    readability.append(selectControl('Focus visibility', 'Visible keyboard focus without mouse-only effects.', saved.focusVisibility, [['site', 'Site default'], ['enhanced', 'Enhanced'], ['high', 'High']], (focusVisibility) => commit({ focusVisibility }, 'focus-visibility', `Focus visibility set to ${focusVisibility}.`)));
    fragment.append(readability);

    const motion = section('Motion', 'Motion preferences apply immediately when you change them.');
    motion.append(selectControl('Reduce motion', 'Follow the system preference or override it.', saved.reduceMotion, [['off', 'Off'], ['system', 'Follow system'], ['on', 'On']], (reduceMotion) => commit({ reduceMotion }, 'reduce-motion', `Reduce motion set to ${reduceMotion}.`)));
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'Reduced motion requested' : 'Standard motion';
    motion.append(actionRow('System preferences', reduced, () => setMessage(reduced), 'View'));
    fragment.append(motion, appearanceFooter());
    return fragment;
  }

  function renderEffects() {
    const fragment = document.createDocumentFragment();
    const effects = section('Surface effects', 'Applies only to SHIFT-classified surfaces.');
    for (const [key, label] of [['reduceShadows', 'Reduce shadows'], ['reduceTransparency', 'Reduce transparency'], ['simplifyGradients', 'Simplify gradients'], ['reduceBlur', 'Reduce blur']]) effects.append(switchControl(label, 'Applies only to SHIFT-classified surfaces.', saved[key], (value) => commit({ [key]: value }, key, `${label} ${value ? 'on' : 'off'}.`)));
    fragment.append(effects);

    const adapter = EXP.Adapters.health();
    const adapterGroup = section('Site integrations', 'Enhanced Mode is additive; Generic Mode continues if an adapter fails.');
    adapterGroup.append(actionRow(adapter.id ? `${adapter.name} · ${adapter.state}` : 'Generic Mode', adapter.reason, () => setMessage(adapter.controls.length ? `${adapter.controls.length} adapter controls available.` : 'No adapter controls on this site.'), 'Health'));
    const adapterValues = EXP.Adapters.settings();
    for (const [id, label] of EXP.Adapters.options()) adapterGroup.append(switchControl(label, `Site adapter control · ${id}`, Boolean(adapterValues[id]), (value) => { EXP.Adapters.setOption(id, value); setMessage(`${label} ${value ? 'enabled' : 'disabled'}.`); }));
    for (const [id, label] of EXP.Adapters.actions()) adapterGroup.append(actionRow(label, `Immediate site adapter action · ${id}`, () => { EXP.Adapters.runAction(id); setMessage(`${label} completed.`); }, label));
    fragment.append(adapterGroup, appearanceFooter());
    return fragment;
  }

  function renderProfilesSites() {
    const state = EXP.Settings.snapshot();
    const effective = EXP.Settings.effective();
    const fragment = document.createDocumentFragment();
    const current = section('Current site', location.hostname || 'Local document');
    current.append(switchControl('Enable SHIFT on this site', 'Disabling restores only SHIFT-owned page changes.', !effective.excluded, (enabled) => {
      const exclusions = state.exclusions.filter((host) => host !== location.hostname);
      if (!enabled) exclusions.push(location.hostname);
      onSettings({ ...state, exclusions }, 'site-exclusion'); setMessage(enabled ? 'SHIFT enabled for this site.' : 'Site excluded.');
    }));
    const siteProfile = state.siteOverrides[location.hostname]?.profileId || 'inherit';
    current.append(selectControl('Site profile', 'Inherit the global profile or assign one to this hostname.', siteProfile, [['inherit', 'Inherit global'], ...state.profiles.map((profile) => [profile.id, profile.name])], (profileId) => {
      const siteOverrides = { ...state.siteOverrides, [location.hostname]: { ...(state.siteOverrides[location.hostname] || {}) } };
      if (profileId === 'inherit') delete siteOverrides[location.hostname].profileId; else siteOverrides[location.hostname].profileId = profileId;
      onSettings({ ...state, siteOverrides }, 'site-profile'); setMessage('Site profile updated.');
    }));
    current.append(actionRow('Use current appearance on this site', 'Creates a hostname override without changing the selected profile.', () => { const now = EXP.Settings.effective(); const siteOverrides = { ...state.siteOverrides, [location.hostname]: { ...(state.siteOverrides[location.hostname] || {}), theme: now.theme, accent: now.accent, themeStrength: now.themeStrength, surfaceLevel: now.surfaceLevel, linkVisibility: now.linkVisibility, textContrast: now.textContrast, focusVisibility: now.focusVisibility } }; onSettings({ ...state, siteOverrides }, 'site-appearance-override'); setMessage('Site appearance override saved.'); }, 'Save override'));
    current.append(actionRow('Reset this site', 'Remove this site override and exclusion without changing global settings.', () => {
      if (!confirm(`Reset SHIFT settings for ${location.hostname}?`)) return;
      const siteOverrides = { ...state.siteOverrides }; delete siteOverrides[location.hostname];
      onSettings({ ...state, siteOverrides, exclusions: state.exclusions.filter((host) => host !== location.hostname) }, 'site-reset'); setMessage('Site settings reset.');
    }, 'Reset site'));
    fragment.append(current, renderProfiles());
    return fragment;
  }

  function renderProfiles() {
    const state = EXP.Settings.snapshot();
    const fragment = document.createDocumentFragment();
    const group = section('Profiles', 'Profiles contain appearance only; site tools stay independent.');
    group.append(selectControl('Current profile', 'Site overrides remain intact. Original resets global appearance.', state.currentProfile, state.profiles.map((profile) => [profile.id, profile.name]), (currentProfile) => { const reset = currentProfile === 'original' ? { theme: 'original', accent: 'site-default' } : {}; onSettings({ ...state, ...reset, currentProfile }, 'profile-select'); setMessage('Profile applied.'); }));
    group.append(actionRow('Save current appearance', 'Create a custom profile from effective appearance.', () => {
      const name = prompt('Profile name'); if (!name?.trim()) return;
      const id = `profile-${Date.now().toString(36)}`;
      const effective = EXP.Settings.effective();
      const profile = { id, name: name.trim().slice(0, 80), appearance: { theme: effective.theme, accent: effective.accent, surfaceLevel: effective.surfaceLevel, linkVisibility: effective.linkVisibility }, builtIn: false };
      onSettings({ ...state, profiles: [...state.profiles, profile], currentProfile: id }, 'profile-create'); setMessage('Profile created.');
    }, 'New profile'));
    const current = state.profiles.find((profile) => profile.id === state.currentProfile);
    if (current) {
      group.append(actionRow('Duplicate current profile', 'Creates a new stable identity.', () => { const name = prompt('Duplicate profile name', `${current.name} copy`); if (!name?.trim()) return; const copy = { ...structuredClone(current), id: `profile-${Date.now().toString(36)}`, name: name.trim().slice(0, 80), builtIn: false }; onSettings({ ...state, profiles: [...state.profiles, copy], currentProfile: copy.id }, 'profile-duplicate'); setMessage('Profile duplicated.'); }, 'Duplicate'));
      group.append(actionRow('Export current profile', 'Includes appearance only.', () => download(`${current.id}.json`, JSON.stringify({ product: 'shift', generation: 3, schema: 1, type: 'profile', profile: current }, null, 2)), 'Export'));
    }
    if (current && !current.builtIn) {
      group.append(actionRow('Rename current profile', 'Assignments retain the same stable identity.', () => { const name = prompt('Profile name', current.name); if (!name?.trim()) return; onSettings({ ...state, profiles: state.profiles.map((profile) => profile.id === current.id ? { ...profile, name: name.trim().slice(0, 80) } : profile) }, 'profile-rename'); setMessage('Profile renamed.'); }, 'Rename'));
      group.append(actionRow('Delete current profile', 'Assignments return to Original.', () => {
        if (!confirm(`Delete profile “${current.name}”?`)) return;
        const siteOverrides = Object.fromEntries(Object.entries(state.siteOverrides).map(([host, value]) => [host, value.profileId === current.id ? { ...value, profileId: 'original' } : value]));
        onSettings({ ...state, profiles: state.profiles.filter((profile) => profile.id !== current.id), currentProfile: 'original', siteOverrides }, 'profile-delete'); setMessage('Profile deleted.');
      }, 'Delete'));
    }
    const importRow = row('Import profile', 'Validates product, generation, schema, and appearance references.');
    const importInput = el('input', { type: 'file', accept: 'application/json,.json', 'aria-label': 'Import SHIFT profile' });
    importInput.hidden = true;
    importInput.addEventListener('change', async () => { try { const payload = JSON.parse(await importInput.files[0].text()); if (payload.product !== 'shift' || payload.generation !== 3 || payload.schema !== 1 || payload.type !== 'profile' || !payload.profile?.appearance) throw new Error('Unsupported profile file.'); const allowedThemes = new Set(EXP.Themes.themeOptions(state).map(([id]) => id)); const allowedAccents = new Set(EXP.Themes.accentOptions(state).map(([id]) => id)); if (!allowedThemes.has(payload.profile.appearance.theme) || !allowedAccents.has(payload.profile.appearance.accent)) throw new Error('Profile references an unavailable theme or accent.'); const profile = { ...payload.profile, id: `profile-${Date.now().toString(36)}`, name: String(payload.profile.name || 'Imported profile').slice(0, 80), builtIn: false }; const validated = EXP.Settings.replace({ ...state, profiles: [...state.profiles, profile], currentProfile: profile.id }, 'profile-import'); saved = structuredClone(validated); setMessage('Profile imported.'); } catch (error) { setMessage(error.message, 'error'); } });
    importRow.append(button('Import', () => importInput.click(), 'action'), importInput); group.append(importRow);
    const actions = el('div', { class: 'button-grid profile-actions' });
    for (const item of [...group.querySelectorAll(':scope > .row')]) {
      const action = item.querySelector('button.action'); if (!action) continue;
      action.title = item.querySelector('.label')?.textContent || action.textContent;
      const file = item.querySelector('input[type="file"]'); if (file) group.append(file);
      actions.append(action); item.remove();
    }
    group.append(actions); fragment.append(group);
    return fragment;
  }

  function renderMenuUpdates() {
    const state = EXP.Settings.snapshot();
    const fragment = document.createDocumentFragment();
    const chromeGroup = section('Menu chrome', 'Width, close behavior, and local feedback.');
    chromeGroup.append(selectControl('Menu width', 'Dropper-style Full, Compact, or Narrow layout.', state.menuWidth, [['full', 'Full'], ['compact', 'Compact'], ['narrow', 'Narrow']], (menuWidth) => { onSettings({ ...state, menuWidth }, 'menu-width'); product?.refresh(); setMessage(`Menu width set to ${menuWidth}.`); }));
    chromeGroup.append(switchControl('Automatic menu close', 'Close after 15 seconds without menu activity.', state.menuAutoClose, (menuAutoClose) => { onSettings({ ...state, menuAutoClose }, 'menu-auto-close'); product?.refresh(); setMessage(menuAutoClose ? 'Automatic close enabled.' : 'Automatic close disabled.'); }));
    chromeGroup.append(switchControl('Menu notifications', 'Show brief local feedback messages for menu actions.', state.menuNotifications, (menuNotifications) => { onSettings({ ...state, menuNotifications }, 'menu-notifications'); if (!menuNotifications && toast) toast.hidden = true; else setMessage('Menu notifications enabled.'); }));
    fragment.append(chromeGroup);

    const about = section('Updates', 'Release metadata only; SHIFT never installs automatically.');
    about.append(switchControl('Quiet update notifications', 'Off by default. When enabled, checks GitHub release metadata at most once daily and never installs automatically.', state.updateNotifications, (updateNotifications) => { onSettings({ ...state, updateNotifications }, 'update-notifications'); if (updateNotifications) EXP.Updates.check(true).then((result) => setMessage(result.available ? `SHIFT ${result.latest} is available.` : result.state === 'failed' ? 'Update check failed quietly.' : 'SHIFT is up to date.')); else setMessage('Update notifications disabled.'); }));
    if (state.updateNotifications) about.append(actionRow('Check for updates now', 'Fetches release metadata only; never executable code.', () => EXP.Updates.check(true).then((result) => setMessage(result.available ? `SHIFT ${result.latest} is available.` : result.state === 'failed' ? 'Update check failed quietly.' : 'SHIFT is up to date.')), 'Check now'));
    if (state.exclusions.length) about.append(actionRow('Excluded sites', state.exclusions.join(', '), () => { const hostName = prompt('Hostname to remove from exclusions', state.exclusions[0]); if (!hostName) return; onSettings({ ...state, exclusions: state.exclusions.filter((item) => item !== hostName.trim()) }, 'exclusion-manager'); setMessage('Exclusions updated.'); }, 'Manage'));
    fragment.append(about);
    return fragment;
  }

  function renderRecoveryData() {
    const state = EXP.Settings.snapshot();
    const health = EXP.Engine.health();
    const fragment = document.createDocumentFragment();
    const group = section('Diagnostics', 'Page, technical, console, and plugin details; captured locally.');
    group.append(EXP.Diagnostics.createDiagnosticsControls(() => EXP.Diagnostics.createDiagnosticsReport('SHIFT', { host, product: { id:'shift', version: EXP.VERSION }, settings: EXP.Settings.exportData(), mode: EXP.Engine.health(), adapter: EXP.Adapters.health(), updates: EXP.Updates.status(), core: EXP.Core.diagnosticSnapshot() }), setMessage));
    group.append(actionRow(`${health.mode} · ${health.owned} live repairs`, `${health.scanned} visible elements inspected in ${health.batches} passes; last ${health.lastDurationMs} ms.`, () => { EXP.Engine.scan(); setMessage('Repair pass scheduled.'); }, 'Quick scan'));
    group.append(actionRow('Full coverage scan', 'Inspect up to 5,000 visible containers with the aggressive live-repair budget.', () => { EXP.Engine.fullScan(); setMessage('Full repair pass complete; health measurements updated.'); product?.renderActive(); }, 'Full scan'));
    group.append(switchControl('Safe Mode', 'Suspend transformations and adapters while preserving configuration.', state.safeMode, (safeMode) => { onSettings({ ...state, safeMode }, 'safe-mode'); setMessage(safeMode ? 'Safe Mode active.' : 'Safe Mode disabled.'); }));
    fragment.append(group);
    const data = section('Data', 'Imports validate ownership and schema before replacing settings.');
    data.append(actionRow('Export SHIFT settings', 'Local JSON file; no upload.', () => download('shift-v3-settings.json', JSON.stringify(EXP.Settings.exportData(), null, 2)), 'Export'));
    const importRow = row('Import SHIFT settings', 'Invalid files leave current settings unchanged.');
    const input = el('input', { type: 'file', accept: 'application/json,.json', 'aria-label': 'Import SHIFT settings' });
    input.hidden = true;
    input.addEventListener('change', async () => { try { const payload = JSON.parse(await input.files[0].text()); const next = EXP.Settings.importData(payload); saved = structuredClone(next); onApply(next); product?.renderActive(); setMessage('Settings imported.'); } catch (error) { setMessage(error.message, 'error'); } });
    importRow.append(button('Import', () => input.click(), 'action'), input); data.append(importRow);
    data.append(actionRow('Reset SHIFT', 'Deletes SHIFT V3 settings, profiles, and site overrides only.', () => {
      if (!confirm('Reset all SHIFT V3 configuration?')) return;
      const next = EXP.Settings.replace(EXP.Settings.defaults, 'product-reset'); saved = structuredClone(next); onApply(next); product?.renderActive(); setMessage('SHIFT reset complete.');
    }, 'Reset'));
    fragment.append(data);
    return fragment;
  }

  function download(name, value) {
    const url = URL.createObjectURL(new Blob([value], { type: 'application/json' }));
    const link = el('a', { href: url, download: name }); link.click(); setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function applyPosition() {
    if (host) host.dataset.position = 'automatic-end-bottom';
  }

  function build(initial, callbacks) {
    if (window.top !== window.self) return { update() {}, toggle() {}, destroy() {} };
    saved = structuredClone(initial);
    onApply = callbacks.apply;
    onSettings = callbacks.settings;

    const renderers = {
      appearance: renderAppearance,
      readability: renderReadability,
      effects: renderEffects,
      profiles: renderProfilesSites,
      menu: renderMenuUpdates,
      system: renderRecoveryData,
    };

    product = ExtraPotionsCore.createProduct({
      id: 'shift',
      name: 'SHIFT',
      version: EXP.VERSION,
      subtitle: 'Adaptive themes and readability',
      artwork: ICON_URL,
      theme: PRODUCT_THEME,
      supportUrl: SUPPORT_URL,
      priority: 100,
      getSettings: () => EXP.Settings.snapshot(),
      onSettings: (next, reason) => onSettings(next, reason),
      sections: routes.map(([id, label]) => ({
        id,
        label,
        render: () => renderers[id](),
      })),
    });

    ({ host, shadow, launcher, panel } = product);
    applyPosition();

    EXP.Core.injectStyle(shadow, STYLE, { expShiftProductUi: '1' });

    toast = el('div', { class: 'toast', role: 'status', 'aria-live': 'polite', hidden: true });
    const nav = panel.querySelector('nav');
    if (nav) nav.before(toast);
    else panel.append(toast);

    noticeController = ExtraPotionsCore.createProductNotice({
      host,
      shadow,
      panel,
      versionButton: product.versionButton,
      releaseUrl: 'https://github.com/ExtraPotions/SHIFT/releases',
      installUrl: 'https://raw.githubusercontent.com/ExtraPotions/SHIFT/main/shift.user.js',
      onVersion: () => {
        if (updateNotice?.hidden === false && updateNotice.dataset.noticeKind === 'current') {
          hideUpdateNotice();
          return;
        }
        showUpdateNotice({
          kicker: 'Current Version',
          title: 'SHIFT Changelog',
          version: EXP.VERSION,
          text: `What's new in v${EXP.VERSION}.`,
          details: EXP.ReleaseNotes.forVersion(EXP.VERSION),
          available: false,
        });
      },
    });
    updateNotice = noticeController.element;

    applyMenuTheme(EXP.Settings.effective());

    try {
      const previous = EXP.Core.consumeVersionChange('shift', EXP.VERSION, lastVersionKey);
      if (previous) {
        showUpdateNotice({
          kicker: 'Update Complete',
          title: 'SHIFT Updated',
          version: EXP.VERSION,
          text: `Updated from v${previous} to v${EXP.VERSION}.`,
          details: EXP.ReleaseNotes.forVersion(EXP.VERSION),
        });
      }
    } catch {}

    if (initial.updateNotifications) {
      checkUpdateNotice(false).catch((error) => EXP.Core.safeError(error, 'shift-update-ui'));
    }

    return {
      update(next) {
        saved = structuredClone(next);
        applyPosition();
        applyMenuTheme(EXP.Settings.effective());
        product?.renderActive();
        product?.refresh();
      },
      toggle() { product?.toggle(); },
      destroy() {
        clearTimeout(toastTimer);
        noticeController?.destroy();
        product?.destroy();
        product = noticeController = null;
        host = shadow = launcher = panel = toast = updateNotice = swatchStyle = null;
      },
    };
  }

  const STYLE = `
    .fl-tool-body .diagnostics-controls .action{font-size:10px!important;padding:4px!important;min-height:28px!important;line-height:1.2!important}
    .fl-tool-body .row.palette-row.mini-row{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:7px!important}
    .fl-tool-body .row.palette-row>.copy{grid-column:1/-1;min-width:0;width:100%;margin:0!important}
    .fl-tool-body .row.palette-row>.exp-theme-swatches{grid-column:1/-1;display:flex!important;flex-wrap:wrap!important;width:100%;min-width:0;gap:5px;justify-content:flex-start}
    .profile-actions{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px;padding:8px 0}
    .profile-actions>*{min-width:0}
    .status{display:none}
  `;
  return Object.freeze({ build });
})();

ExtraPotionsCore.registerDiagnosticsProduct('shift', EXP.VERSION);
const SHIFT_MANIFEST = Object.freeze({
  id: 'shift', version: EXP.VERSION, coreRange: '^3.3.2',
  capabilities: ['lifecycle', 'settings', 'diagnostics', 'dom-scheduler', 'navigation', 'launcher', 'ui']
});

let ui;
let unsubscribe;
let navigationCleanup;
let processorCleanup;
let shortcutCleanup;
const hooks = {
  async initialize() {
    const settings = EXP.Settings.load();
    try { EXP.Adapters.initialize(); } catch (error) { EXP.Core.safeError(error, 'shift-adapters-init'); }
    // Launcher/menu are the recovery surface. Mount them before any page transformation so
    // an engine failure or aggressive site rewrite can never prevent access to SHIFT controls.
    ui = EXP.UI.build(settings, {
      apply: (next) => EXP.Engine.apply({ ...EXP.Settings.effective(), ...next }),
      settings: (next, reason) => {
        const valid = EXP.Settings.replace(next, reason);
        EXP.Engine.apply(EXP.Settings.effective());
        EXP.Adapters.apply();
        return valid;
      }
    });
    try {
      EXP.Engine.start(EXP.Settings.effective());
      processorCleanup = EXP.Engine.addProcessor(EXP.Adapters.process);
    } catch (error) { EXP.Core.safeError(error, 'shift-engine-init'); }
    /* UI already mounted above. */
    const onShortcut = (event) => {
      const target = event.target;
      if (target?.matches?.('input,textarea,select,[contenteditable="true"]')) return;
      const combo = [event.ctrlKey && 'Control', event.altKey && 'Alt', event.metaKey && 'Meta', event.shiftKey && 'Shift', /^[a-z0-9]$/i.test(event.key) && event.key.toUpperCase()].filter(Boolean).join('+');
      if (EXP.Settings.snapshot().shortcut && combo === EXP.Settings.snapshot().shortcut) { event.preventDefault(); ui?.toggle(); }
    };
    addEventListener('keydown', onShortcut);
    shortcutCleanup = () => removeEventListener('keydown', onShortcut);
    if (settings.updateNotifications) EXP.Updates.check().catch((error) => EXP.Core.safeError(error, 'shift-updates'));
    unsubscribe = EXP.Settings.subscribe((next) => {
      EXP.Engine.apply(EXP.Settings.effective());
      EXP.Adapters.apply();
      ui?.update(next);
    });
    navigationCleanup = EXP.Core.onNavigation(() => {
      EXP.Adapters.initialize();
      EXP.Engine.apply(EXP.Settings.effective());
    });
  },
  async enable() { EXP.Engine.apply(EXP.Settings.effective()); },
  async disable() { EXP.Engine.stop(); EXP.Adapters.disable(); },
  async cleanup() { unsubscribe?.(); navigationCleanup?.(); processorCleanup?.(); shortcutCleanup?.(); EXP.Engine.stop(); EXP.Adapters.disable(); ui?.destroy(); }
};

const product = EXP.Core.register(SHIFT_MANIFEST, hooks);

let booted = false;
const bootOnce = () => {
  if (booted) return;
  if (!document.documentElement) { setTimeout(bootOnce, 25); return; }
  booted = true;
  try { EXP.Preload?.start(); } catch (error) { EXP.Core.safeError(error, 'shift-preload'); }
  product.initialize().then(() => product.enable()).catch((error) => EXP.Core.safeError(error, 'shift-boot'));
};
// Orion/WebKit can execute document-start before documentElement exists. Nothing in Core,
// Preload, or UI may touch the DOM until the root element is available.
bootOnce();
if (document.readyState === 'loading') addEventListener('DOMContentLoaded', bootOnce, { once: true });
})();
