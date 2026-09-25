// ==UserScript==
// @name         SHIFT
// @namespace    https://github.com/ExtraPotions
// @version      3.3.0-dev.1
// @description  Accessible semantic themes that paint host pages first, with conservative classification and site enhancements.
// @icon         https://raw.githubusercontent.com/ExtraPotions/SHIFT/main/assets/shift-badge.svg
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
// ==/UserScript==
// SHIFT Manager Metadata
// Description: Accessible semantic themes that paint host pages first, with conservative classification and site enhancements.
// Tags: accessibility, themes, customization

(() => {
'use strict';
const EXP = Object.create(null);

/* exp-core 3.0.1: product-neutral local runtime plus declarative cross-sandbox coordination. */
EXP.Core = (() => {
  const VERSION = '3.0.1';
  const PROTOCOL = 'exp-core-coordination-v1';
  const CAPABILITIES = new Set(['lifecycle', 'settings', 'diagnostics', 'dom-scheduler', 'navigation', 'launcher', 'ui']);
  const products = new Map();
  const cleanups = new Set();
  const errors = [];
  const metrics = { batches: 0, roots: 0, startedAt: Date.now() };
  let coordinator;

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
    const transition = (next, action) => {
      record.queue = record.queue.then(async () => {
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
      initialize: () => record.state === 'registered' ? transition('initialized', hooks.initialize) : record.queue,
      enable: () => ['initialized', 'disabled'].includes(record.state) ? transition('enabled', hooks.enable) : record.queue,
      disable: () => record.state === 'enabled' ? transition('disabled', hooks.disable) : record.queue,
      cleanup: () => record.state !== 'cleaned' ? transition('cleaned', hooks.cleanup) : record.queue
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
      roots.add(root.nodeType === Node.TEXT_NODE ? root.parentElement : root);
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
        observer.observe(document.documentElement, { childList: true, subtree: true, attributes: Boolean(options.attributes), attributeFilter: options.attributeFilter });
        schedule(document.documentElement);
      },
      stop() { active = false; observer?.disconnect(); observer = null; roots.clear(); if (frame) cancelAnimationFrame(frame); frame = 0; },
      schedule,
      flush
    });
  }

  function onNavigation(callback) {
    let previous = location.href;
    const check = () => { if (location.href !== previous) { previous = location.href; callback({ href: location.href }); } };
    addEventListener('popstate', check);
    addEventListener('hashchange', check);
    const interval = setInterval(check, 500);
    const cleanup = () => { removeEventListener('popstate', check); removeEventListener('hashchange', check); clearInterval(interval); };
    cleanups.add(cleanup);
    return cleanup;
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
        const pin = (prop, value) => host.style.setProperty(prop, value, 'important');
        pin('position', 'fixed');
        pin('inset', 'auto');
        pin('top', '0');
        pin('left', '0');
        pin('right', 'auto');
        pin('bottom', 'auto');
        pin('width', '0');
        pin('height', '0');
        pin('max-width', '0');
        pin('max-height', '0');
        pin('margin', '0');
        pin('padding', '0');
        pin('border-width', '0');
        pin('background', 'transparent');
        pin('background-color', 'transparent');
        pin('box-shadow', 'none');
        pin('overflow', 'visible');
        pin('visibility', 'visible');
        pin('opacity', '1');
        pin('pointer-events', 'auto');
        pin('z-index', '2147483647');
        pin('transform', 'none');
        pin('filter', 'none');
        installHostCss();
        // Mobile/WebKit recovery: verify the actual shadow launcher is still in the viewport.
        // Some SPA shells can leave the host connected while its fixed child is effectively stranded.
        const launcher = shadow?.querySelector?.('.launcher');
        if (launcher) {
          const rect = launcher.getBoundingClientRect();
          const vw = host.ownerDocument?.defaultView?.innerWidth || innerWidth || 0;
          const vh = host.ownerDocument?.defaultView?.innerHeight || innerHeight || 0;
          const visible = rect.width > 8 && rect.height > 8 && rect.right > 0 && rect.bottom > 0 && rect.left < vw && rect.top < vh;
          host.dataset.launcherVisible = visible ? '1' : '0';
          host.dataset.launcherRect = [Math.round(rect.left), Math.round(rect.top), Math.round(rect.width), Math.round(rect.height)].join(',');
          if (!visible) {
            host.dataset.launcherRecoveries = String((Number(host.dataset.launcherRecoveries) || 0) + 1);
            launcher.style.setProperty('position', 'fixed', 'important');
            launcher.style.setProperty('top', 'auto', 'important');
            launcher.style.setProperty('left', 'auto', 'important');
            launcher.style.setProperty('right', '12px', 'important');
            launcher.style.setProperty('bottom', '12px', 'important');
            launcher.style.setProperty('display', 'grid', 'important');
            launcher.style.setProperty('visibility', 'visible', 'important');
            launcher.style.setProperty('opacity', '1', 'important');
            launcher.style.setProperty('pointer-events', 'auto', 'important');
            launcher.style.setProperty('z-index', '2147483647', 'important');
            launcher.style.setProperty('transform', 'none', 'important');
          }
        }
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

  function registerLauncher(host, options) {
    host.dataset.expProductLauncher = '1';
    host.dataset.productId = options.productId;
    const hostProtectionCleanup = protectLauncherHost(host);
    host.dataset.launcherPriority = String(options.priority || 0);
    const layout = () => {
      let order = []; try { const saved = JSON.parse(localStorage.getItem('exp:v3:launcher-order') || '[]'); if (Array.isArray(saved)) order = saved; } catch {}
      const peers = [...document.querySelectorAll('[data-exp-product-launcher="1"]')].sort((left, right) => { const li=order.indexOf(left.dataset.productId),ri=order.indexOf(right.dataset.productId); if(left.dataset.productId!=='dropper'&&right.dataset.productId!=='dropper'&&li!==ri){if(li<0)return 1;if(ri<0)return -1;return li-ri;} return Number(right.dataset.launcherPriority || 0) - Number(left.dataset.launcherPriority || 0) || (left.dataset.productId || '').localeCompare(right.dataset.productId || ''); });
      const columns = 3;
      const dropper = peers.find((peer) => peer.dataset.productId === 'dropper');
      const products = peers.filter((peer) => peer !== dropper);
      const assign = (peer, slot, span = 1) => { const row = Math.floor(slot / columns); const column = slot % columns; peer.dataset.launcherSlot = String(slot); peer.dataset.launcherRow = String(row); peer.dataset.launcherColumn = String(column); peer.dataset.launcherSpan = String(span); peer.style.setProperty('--exp-launcher-x', `${column * 56}px`); peer.style.setProperty('--exp-launcher-y', `${row * 56}px`); peer.style.setProperty('--exp-launcher-offset', `${row * 56}px`); };
      if (dropper) assign(dropper, 0, columns);
      const reservedRows = dropper ? Math.max(1, Number(dropper.dataset.launcherReservedRows || 1)) : 0;
      const firstProductSlot = dropper ? columns * reservedRows : 0;
      products.forEach((peer, index) => assign(peer, firstProductSlot + index));
      try { localStorage.setItem('exp:v3:launcher-order', JSON.stringify(products.map((peer) => peer.dataset.productId).filter(Boolean))); } catch {}
    };
    const refresh = () => requestAnimationFrame(layout);
    document.addEventListener('exp-core:coordination', refresh);
    addEventListener('resize', refresh, { passive: true });
    announce('launcher-ready', { productId: options.productId, priority: options.priority || 0 });
    layout();
    const cleanup = () => { hostProtectionCleanup?.(); document.removeEventListener('exp-core:coordination', refresh); removeEventListener('resize', refresh); host.removeAttribute('data-exp-product-launcher'); host.style.removeProperty('--exp-launcher-x'); host.style.removeProperty('--exp-launcher-y'); host.style.removeProperty('--exp-launcher-offset'); announce('launcher-removed', { productId: options.productId }); };
    cleanups.add(cleanup);
    return cleanup;
  }

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
  return Object.freeze({ VERSION, PROTOCOL, register, createScheduler, onNavigation, registerLauncher, announce, negotiate, safeError, diagnosticSnapshot, focusMenuSurface, injectStyle });
})();

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
    try { if (typeof GM_getValue === 'function') return GM_getValue(key(name), undefined); } catch {}
    try { const value = localStorage.getItem(key(name)); return value === null ? undefined : JSON.parse(value); } catch { return memory.get(key(name)); }
  }
  function rawWrite(name, value) {
    memory.set(key(name), value);
    try { if (typeof GM_setValue === 'function') { GM_setValue(key(name), value); return; } } catch {}
    try { localStorage.setItem(key(name), JSON.stringify(value)); } catch {}
  }
  const validTheme = (value) => typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,63}$/.test(value);
  function validate(candidate) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) throw Object.assign(new Error('Settings must be an object'), { code: 'SETTINGS_TYPE' });
    const result = structuredClone(defaults);
    const enums = {
      theme: EXP.Themes ? [...Object.keys(EXP.Themes.catalog), ...(candidate.customThemes || []).map((item) => item?.id).filter(Boolean)] : ['original'], accent: [...Object.keys(EXP.Themes?.accents || { 'site-default': null }), ...(candidate.customAccents || []).map((item) => item?.id).filter(Boolean)],
      themeStrength: ['soft', 'normal', 'strong'],
      surfaceLevel: ['off', 'conservative', 'balanced', 'aggressive'], linkVisibility: ['site', 'enhanced', 'high'], textContrast: ['normal', 'enhanced'],
      focusVisibility: ['site', 'enhanced', 'high'], reduceMotion: ['off', 'system', 'on'], launcherPosition: ['automatic-end-bottom', 'end-top', 'end-bottom', 'start-top', 'start-bottom'], menuWidth: ['full', 'compact', 'narrow']
    };
    for (const [name, allowed] of Object.entries(enums)) if (candidate[name] !== undefined && allowed.includes(candidate[name])) result[name] = candidate[name];
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
  function load() { state = validate(rawRead('settings') || defaults); return snapshot(); }
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
    charcoal: { name: 'Charcoal', page: '#243028', surface: '#2e3a32', raised: '#384640', overlay: '#425048', text: '#f2f5f3', muted: '#c1c9c4' },
    warm: { name: 'Warm charcoal', page: '#3c3428', surface: '#4a4032', raised: '#584c3a', overlay: '#665844', text: '#f6efe4', muted: '#c8b8a0' },
    discord: { name: 'Graphite', page: '#3a3c44', surface: '#464850', raised: '#52545c', overlay: '#5e6068', text: '#f2f3f5', muted: '#c0c4cc' },
    midnight: { name: 'Midnight', page: '#1a2840', surface: '#24344c', raised: '#2e4058', overlay: '#384c64', text: '#e8eef6', muted: '#9ab0c8' },
    obsidian: { name: 'High contrast', page: '#0a0a0a', surface: '#161616', raised: '#222222', overlay: '#2e2e2e', text: '#ffffff', muted: '#d8d8d8' },
    ember: { name: 'Ember', page: '#3c2424', surface: '#4a2e2e', raised: '#583838', overlay: '#664242', text: '#f6e8e6', muted: '#d0b0b0' },
    pine: { name: 'Pine', page: '#1e3a30', surface: '#28483c', raised: '#325648', overlay: '#3c6454', text: '#e8f4ea', muted: '#a8c8b0' },
    cinder: { name: 'Cinder', page: '#3a3018', surface: '#4a3e20', raised: '#5a4c28', overlay: '#6a5a30', text: '#fff8e9', muted: '#d9c9a8' },
    pride: {
      name: 'Pride',
      page: '#2b1f32',
      pageFill: 'linear-gradient(180deg,#49334f 0%,#2b1f32 42%)',
      pageEdge: 'linear-gradient(90deg,#c97b83 0%,#d29a70 16.6%,#d0c07d 33.3%,#70a886 50%,#7091b6 66.6%,#a27ba9 100%)',
      surface: '#3a2942',
      raised: '#49334f',
      overlay: '#5a3e5e',
      navigation: '#30233a',
      input: '#412e48',
      interactive: '#513856',
      text: '#fff2fa',
      muted: '#d8b9cd',
      highlight: '#e07ca6'
    },
    shift: {
      name: 'SHIFT gem',
      page: '#0e3a40',
      pageFill: 'linear-gradient(180deg,#165058 0%,#0e3a40 40%)',
      pageEdge: 'linear-gradient(90deg,#20d9d3,#26d9c7 55%,#f23868)',
      surface: '#184850',
      raised: '#225860',
      overlay: '#2c6870',
      navigation: '#14444c',
      input: '#1c5058',
      interactive: '#226068',
      text: '#e8faf8',
      muted: '#8ec8c4',
      highlight: '#26d9c7'
    }
  });
  const accents = Object.freeze({
    'site-default': null, teal: '#26d9c7', coral: '#ff6577', sky: '#69bdf2', mint: '#63d99a', amber: '#e8b94f', violet: '#b487ed', silver: '#c6d0dc', pride: '#e07ca6', warm: '#c8953b', discord: '#5865f2', 'midnight-default': '#7ec8ff', 'contrast-default': '#ffffff', 'pine-default': '#5dbe72', 'ember-default': '#e05a5a', 'pride-default': '#e07ca6', 'shift-default': '#26d9c7'
  });
  const hex = (value) => /^#[0-9a-f]{6}$/i.test(value || '');
  function themeOptions(state) { return [...Object.entries(catalog).map(([id, item]) => [id, item.name]), ...(state?.customThemes || []).map((item) => [item.id, item.name])]; }
  function accentOptions(state) { return [...Object.entries(accents).map(([id]) => [id, id === 'site-default' ? 'Site default' : id[0].toUpperCase() + id.slice(1)]), ...(state?.customAccents || []).map((item) => [item.id, item.name])]; }
  function resolve(themeId, accentId, state = {}) {
    let theme = catalog[themeId] || state.customThemes?.find((item) => item.id === themeId) || catalog.original;
    if (theme.system) theme = matchMedia('(prefers-color-scheme: dark)').matches ? catalog.charcoal : catalog.original;
    const accent = accents[accentId] || state.customAccents?.find((item) => item.id === accentId)?.color || (theme.original ? '#287a74' : '#26d9c7');
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
  const SHEET_STYLE_ATTR = 'data-exp-shift-sheet-style';
  const sheetHandles = new Map();
  const adoptedHandles = new Map();
  const sheetCache = new WeakMap();
  let sheetStats = { sheets: 0, rules: 0, inaccessible: 0, pseudoRules: 0, gradients: 0, shadows: 0 };
  let lastSheetSignature = '';
  let pseudoRuleCount = 0;
  let sheetCacheHits = 0;
  let sheetCacheMisses = 0;
  let gradientTransformCount = 0;
  let shadowTransformCount = 0;
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
  const variableLedger = new Map();

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

  function transformGradient(value, theme) {
    const source = String(value || '');
    if (!/(?:repeating-)?(?:linear|radial|conic)-gradient\s*\(/i.test(source) || /url\s*\(/i.test(source)) return source;
    return source.replace(COLOR_FUNCTION, (token) => transform(token, 'background', theme));
  }

  function transformShadow(value, theme, backgroundValue = theme.page) {
    const source = String(value || '');
    if (!source || source === 'none' || /var\s*\(/i.test(source)) return source;
    return source.replace(COLOR_FUNCTION, (token) => {
      const color = parse(token);
      if (!color) return token;
      // Preserve shadow alpha/depth while moving light shadows into the selected
      // palette and keeping dark shadows genuinely dark.
      const l = luminance(color);
      const target = l > 0.5 ? mix(theme.raised, theme.muted, 0.35) : mix(theme.page, '#000000', 0.48);
      const parsedTarget = parse(target);
      return parsedTarget ? rgba({ ...parsedTarget, a: color.a }) : token;
    });
  }

  function transformFilter(value, theme) {
    const source = String(value || '');
    if (!source || source === 'none') return source;
    return source.replace(/drop-shadow\(([^)]*)\)/ig, (match, body) => `drop-shadow(${transformShadow(body, theme)})`);
  }

  function variableRole(name) {
    const key = String(name || '').toLowerCase();
    if (/(?:bg|background|surface|canvas|panel|card|layer|elevation|base|container)/.test(key)) return 'background';
    if (/(?:text|foreground|fg|label|copy|font|ink|content)/.test(key)) return 'foreground';
    if (/(?:border|outline|divider|stroke|rule|separator)/.test(key)) return 'border';
    return null;
  }

  function inferVariableRole(name, value, theme) {
    const named = variableRole(name);
    if (named) return named;
    const parsed = parse(String(value || '').trim());
    if (!parsed || parsed.a < 0.08) return null;
    const l = luminance(parsed), sat = saturation(parsed);
    // Unknown neutral/light variables are overwhelmingly structural on modern
    // component systems (Amazon included); vivid unknowns stay untouched so
    // brand/status colors are not flattened.
    if (sat <= 0.14 && l >= 0.32) return 'background';
    if (sat <= 0.12 && l < 0.32) return 'border';
    return null;
  }

  function resolveVariableValue(value, declarations, seen = new Set()) {
    let source = String(value || '');
    return source.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]+))?\)/g, (_m, name, fallback) => {
      if (seen.has(name)) return fallback || _m;
      const next = declarations.get(name);
      if (!next) return fallback || _m;
      const chain = new Set(seen); chain.add(name);
      return resolveVariableValue(next, declarations, chain);
    });
  }

  const inlineLedger = new Map();

  function rememberInline(element, property) {
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
    if (!element?.style || element.closest?.('[data-exp-owned="1"]')) return;
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
      for (const [property, [value, priority]] of saved) {
        if (value) element.style.setProperty(property, value, priority);
        else element.style.removeProperty(property);
      }
      element.removeAttribute(INLINE_ATTR);
      element.removeAttribute(INLINE_VARS_ATTR);
      inlineLedger.delete(element);
    }
  }

  function transformDeclaration(property, value, theme, declarations, backgroundValue) {
    const key = String(property || '').toLowerCase();
    if (!value || /url\s*\(/i.test(value)) return value;
    const resolved = declarations ? resolveVariableValue(value, declarations) : value;
    if (key === 'background-image' || key === 'background') {
      const gradient = transformGradient(resolved, theme);
      if (gradient !== resolved) { gradientTransformCount += 1; return gradient; }
    }
    if (key === 'box-shadow' || key === 'text-shadow') { const next=transformShadow(resolved, theme, backgroundValue || theme.page); if(next!==resolved) shadowTransformCount += 1; return next; }
    if (key === 'filter') return transformFilter(resolved, theme);
    const role = COLOR_PROPS[key] || variableRole(key);
    if (!role) return value;
    const transformed = transformColorTokens(resolved, role, theme);
    return transformed === resolved && resolved !== value ? value : transformed;
  }

  function collectRuleOverrides(rules, theme, out, budget, inheritedVariables = new Map()) {
    if (!rules || out.length >= budget) return;
    const scopedVariables = new Map(inheritedVariables);
    // First pass: collect custom properties in this rule group so declarations can
    // resolve var() chains regardless of source order.
    for (const rule of rules) {
      try {
        if (rule.type !== CSSRule.STYLE_RULE || !rule.style) continue;
        for (let index = 0; index < rule.style.length; index += 1) {
          const property = rule.style.item(index);
          if (property?.startsWith('--')) scopedVariables.set(property, rule.style.getPropertyValue(property).trim());
        }
      } catch {}
    }
    for (const rule of rules) {
      if (out.length >= budget) break;
      try {
        if (rule.type === CSSRule.STYLE_RULE && rule.selectorText && rule.style) {
          const declarations = [];
          let transformedBackground = theme.page;
          const rawBackground = rule.style.getPropertyValue('background-color') || rule.style.getPropertyValue('background');
          if (rawBackground) {
            const resolvedBackground = resolveVariableValue(rawBackground, scopedVariables);
            if (!/url\s*\(/i.test(resolvedBackground)) {
              const token = resolvedBackground.match(COLOR_FUNCTION)?.[0];
              if (token) transformedBackground = background(token, theme, theme.page);
            }
          }
          for (let index = 0; index < rule.style.length; index += 1) {
            const property = rule.style.item(index);
            const value = rule.style.getPropertyValue(property);
            let next;
            if (property.startsWith('--')) {
              const role = inferVariableRole(property, value, theme);
              const resolved = resolveVariableValue(value, scopedVariables);
              next = role ? transformColorTokens(resolved, role, theme, role === 'foreground' ? transformedBackground : theme.page) : value;
            } else {
              const role = COLOR_PROPS[String(property).toLowerCase()] || variableRole(property);
              next = transformDeclaration(property, value, theme, scopedVariables, role === 'foreground' ? transformedBackground : undefined);
            }
            if (next !== value) declarations.push(`${property}:${next}!important`);
          }
          if (declarations.length) { out.push(`${rule.selectorText}{${declarations.join(';')}}`); if(/::(?:before|after|marker|placeholder|selection)\b/i.test(rule.selectorText)) pseudoRuleCount += 1; }
        } else if (rule.cssRules) {
          const nested = [];
          collectRuleOverrides(rule.cssRules, theme, nested, budget - out.length, scopedVariables);
          if (nested.length) {
            const header = rule.cssText?.slice(0, rule.cssText.indexOf('{')).trim();
            if (header && /^@(media|supports|layer|container)\b/i.test(header)) out.push(`${header}{${nested.join('')}}`);
          }
        }
      } catch {}
    }
  }

  function collectOpenShadowRoots(root = document) {
    const found = [];
    const visit = (parent) => {
      parent.querySelectorAll?.('*').forEach((element) => {
        if (!element.shadowRoot || element.closest?.('[data-exp-owned="1"]')) return;
        found.push(element.shadowRoot);
        visit(element.shadowRoot);
      });
    };
    visit(root);
    return found;
  }

  function themeSignature(theme) {
    return [theme.id,theme.page,theme.surface,theme.raised,theme.overlay,theme.text,theme.muted,theme.accent].join('|');
  }
  function sheetSignature(sheet) {
    try {
      const rules=sheet.cssRules;
      let hash=2166136261;
      const sample=Math.min(rules.length,64);
      for(let i=0;i<sample;i+=1){
        const text=rules[i]?.cssText||'';
        for(let j=0;j<text.length;j+=Math.max(1,Math.floor(text.length/48))) { hash^=text.charCodeAt(j); hash=Math.imul(hash,16777619); }
      }
      return `${rules.length}:${hash>>>0}:${sheet.ownerNode?.textContent?.length||0}`;
    } catch { return 'x'; }
  }
  function cachedOverrides(sheet, theme, budget) {
    const signature=`${themeSignature(theme)}|${sheetSignature(sheet)}|${budget}`;
    const cached=sheetCache.get(sheet);
    if(cached?.signature===signature){sheetCacheHits+=1;return cached.overrides.slice();}
    const overrides=[];collectRuleOverrides(sheet.cssRules,theme,overrides,budget);
    sheetCache.set(sheet,{signature,overrides:overrides.slice()});sheetCacheMisses+=1;return overrides;
  }

  function refreshAdoptedStyleSheets(theme, roots) {
    const live = new Set();
    let generated = 0;
    for (const root of roots) {
      let sheets;
      try { sheets = [...(root.adoptedStyleSheets || [])]; } catch { continue; }
      if (!sheets.length) continue;
      const css = [];
      for (const sheet of sheets) {
        let rules;
        try { rules = cachedOverrides(sheet, theme, 800); } catch { continue; }
        if (rules.length) css.push(...rules);
      }
      let handle = adoptedHandles.get(root);
      if (!css.length) {
        try { handle?.remove(); } catch {}
        adoptedHandles.delete(root);
        continue;
      }
      if (!handle?.isConnected) {
        handle = document.createElement('style');
        handle.dataset.expOwned = '1';
        handle.dataset.expShiftAdoptedStyle = '1';
        root.append(handle);
        adoptedHandles.set(root, handle);
      }
      const cssText = css.join('\n');
      if (handle.textContent !== cssText) handle.textContent = cssText;
      live.add(root);
      generated += css.length;
    }
    for (const [root, handle] of [...adoptedHandles]) {
      if (live.has(root) && root.host?.isConnected !== false) continue;
      try { handle.remove(); } catch {}
      adoptedHandles.delete(root);
    }
    return { roots: live.size, rules: generated };
  }

  function refreshStyleSheets(theme, root = document) {
    const live = new Set();
    pseudoRuleCount = 0; gradientTransformCount = 0; shadowTransformCount = 0; sheetCacheHits = 0; sheetCacheMisses = 0;
    const sheets = [...(root.styleSheets || [])];
    const signature = [theme.id, theme.page, theme.surface, theme.raised, theme.overlay, theme.text, theme.muted, sheets.length]
      .join('|') + '|' + sheets.map((sheet) => {
        try { return `${sheet.cssRules.length}:${sheet.ownerNode?.textContent?.length || 0}`; } catch { return 'x'; }
      }).join(',');
    if (root === document && signature === lastSheetSignature && sheetHandles.size) return { ...sheetStats };
    if (root === document) lastSheetSignature = signature;
    let generated = 0;
    let inaccessible = 0;
    for (const sheet of sheets) {
      const owner = sheet.ownerNode;
      if (!owner || owner.dataset?.expOwned === '1' || owner.dataset?.expShiftPageStyle || owner.dataset?.expShiftSheetStyle) continue;
      let rules;
      try { rules = sheet.cssRules; } catch { inaccessible += 1; continue; }
      if (!rules) continue;
      const overrides = cachedOverrides(sheet, theme, 1200);
      let handle = sheetHandles.get(sheet);
      if (!overrides.length) {
        try { handle?.remove(); } catch {}
        sheetHandles.delete(sheet);
        continue;
      }
      const cssText = overrides.join('\n');
      if (!handle?.isConnected) {
        handle = document.createElement('style');
        handle.dataset.expOwned = '1';
        handle.dataset.expShiftSheetStyle = '1';
        owner.parentNode?.insertBefore(handle, owner.nextSibling);
        sheetHandles.set(sheet, handle);
      }
      if (handle.previousSibling !== owner) owner.parentNode?.insertBefore(handle, owner.nextSibling);
      if (handle.textContent !== cssText) handle.textContent = cssText;
      live.add(sheet);
      generated += overrides.length;
    }
    for (const [sheet, handle] of [...sheetHandles]) {
      if (live.has(sheet) && handle.isConnected) continue;
      try { handle.remove(); } catch {}
      sheetHandles.delete(sheet);
    }
    const shadowRoots = collectOpenShadowRoots(root);
    for (const shadow of shadowRoots) {
      for (const sheet of [...(shadow.styleSheets || [])]) {
        const owner = sheet.ownerNode;
        if (!owner || owner.dataset?.expOwned === '1') continue;
        let rules;
        try { rules = sheet.cssRules; } catch { inaccessible += 1; continue; }
        const overrides = cachedOverrides(sheet, theme, 800);
        let handle = sheetHandles.get(sheet);
        if (!overrides.length) {
          try { handle?.remove(); } catch {}
          sheetHandles.delete(sheet);
          continue;
        }
        if (!handle?.isConnected) {
          handle = document.createElement('style');
          handle.dataset.expOwned = '1';
          handle.dataset.expShiftSheetStyle = '1';
          owner.parentNode?.insertBefore(handle, owner.nextSibling);
          sheetHandles.set(sheet, handle);
        }
        if (handle.previousSibling !== owner) owner.parentNode?.insertBefore(handle, owner.nextSibling);
        const cssText = overrides.join('\n');
        if (handle.textContent !== cssText) handle.textContent = cssText;
        live.add(sheet);
        generated += overrides.length;
      }
    }
    const adopted = refreshAdoptedStyleSheets(theme, [document, ...shadowRoots]);
    sheetStats = { sheets: live.size, rules: generated, inaccessible, shadowRoots: shadowRoots.length, adoptedRoots: adopted.roots, adoptedRules: adopted.rules, pseudoRules: pseudoRuleCount, gradients: gradientTransformCount, shadows: shadowTransformCount, cacheHits: sheetCacheHits, cacheMisses: sheetCacheMisses };
    return { ...sheetStats };
  }

  function clearStyleSheets() {
    for (const handle of sheetHandles.values()) { try { handle.remove(); } catch {} }
    sheetHandles.clear();
    for (const handle of adoptedHandles.values()) { try { handle.remove(); } catch {} }
    adoptedHandles.clear();
    sheetStats = { sheets: 0, rules: 0, inaccessible: 0, pseudoRules: 0, gradients: 0, shadows: 0 };
    lastSheetSignature = '';
  }

  function reset(root = document) {
    clear(root);
    clearStyleSheets();
  }

  function health(root = document) {
    return {
      inline: root.querySelectorAll?.(`[${INLINE_ATTR}]`).length || 0,
      variables: root.querySelectorAll?.(`[${INLINE_VARS_ATTR}]`).length || 0,
      cache: cache.size,
      transformCache: transformCache.size,
      styleSheets: sheetHandles.size,
      sheetRules: sheetStats.rules,
      inaccessibleStyleSheets: sheetStats.inaccessible,
      shadowRoots: sheetStats.shadowRoots || 0,
      adoptedRoots: sheetStats.adoptedRoots || 0,
      adoptedRules: sheetStats.adoptedRules || 0,
    };
  }

  return Object.freeze({
    parse, luminance, saturation, contrastRatio, ensureContrast, transform, background, foreground, border,
    inspectInline, refreshStyleSheets, clearStyleSheets, clear, reset, health,
    INLINE_ATTR, INLINE_VARS_ATTR,
  });
})();

EXP.Engine = (() => {
  const STYLE_ID = 'exp-shift-page-style';
  const HOST_ATTR = 'data-exp-shift';
  const OWNED = 'data-exp-shift-surface';
  const SHELL_SELECTOR = '#root,#app,#__next,#__nuxt,#__layout,#app-root,#react-root,#vue-app,#application,#main,#main-content,[data-reactroot],ytd-app,shreddit-app';
  // Exact / framework chrome only — avoid broad [class*="card|paper|sheet"] substring hooks that
  // over-paint nested wrappers and collapse contrast (invisible content).
  const CHROME_CLASS_SELECTOR = [
    '.card','.panel','.modal','.modal-content','.modal-dialog','.modal-body','.dropdown-menu',
    '.navbar','.nav-bar','.sidebar','.drawer','.toolbar','.menubar','.list-group','.list-group-item',
    '.bg-white','.bg-light','.bg-body','.bg-body-tertiary','.bg-body-secondary',
    '.MuiPaper-root','.MuiAppBar-root','.MuiDrawer-paper','.MuiDialog-paper','.MuiToolbar-root',
    '.ant-layout','.ant-layout-header','.ant-layout-sider','.ant-card','.ant-modal-content','.ant-drawer-content'
  ].join(',');
  const NAV_CLASS_SELECTOR = [
    '.navbar','.nav-bar','.sidebar','.drawer','.toolbar','.menubar',
    '.MuiAppBar-root','.MuiDrawer-paper','.MuiToolbar-root',
    '.ant-layout-header','.ant-layout-sider','.ant-drawer-content'
  ].join(',');
  const LIGHT_UTILITY_SELECTOR = '.bg-white,.bg-light,.bg-body,.bg-body-tertiary,.bg-body-secondary';
  // Greasy Fork CMS shells only. Do NOT include Bootstrap/layout staples (.container, .wrapper,
  // .page, .content, .box, …) — opaque paint on those covers heroes and page art on most sites.
  const CONTENT_WRAPPER_SELECTOR = '.width,.script-list';
  const TEXT_SELECTOR = 'p,li,label,h1,h2,h3,h4,h5,h6,dt,dd,figcaption,legend,caption,blockquote,small';
  // Exclude media and SHIFT-owned nodes. Nested chrome uses background-color (not background)
  // so site background-images stay intact; no invert/filter on html (avoids double-invert invisibility).
  const MEDIA_EXCLUSION = `:not(img):not(picture):not(video):not(canvas):not(svg):not([role="img"]):not([data-exp-shift-preserve]):not([data-exp-owned="1"]):not([${OWNED}]):not([hidden]):not([aria-hidden="true"])`;
  const LANDMARK_SELECTOR = 'html,body,main,header,footer,nav,aside,section,article,form,[role="main"],[role="banner"],[role="navigation"],[role="contentinfo"]';
  const ledger = new Map();
  const processors = new Set();
  const shadowHandles = new Map();
  let style;
  let scheduler;
  let guard;
  let writing = false;
  let active = false;
  let originalHeld = false;
  let settings;
  let lastCss = '';
  let parseContext;
  let nativeBaseline = null;
  let sheetRefreshTimer = 0;
  let sheetRefreshPending = false;
  let sheetPollTimer = 0;
  let sheetMutationObserver = null;
  let sheetMutationRefreshes = 0;
  let pageVisible = !document.hidden;
  let visibilityCleanup;
  let deferredTimer = 0;
  let idleHandle = 0;
  const deferredRoots = new Set();
  const recentRoots = new WeakMap();
  const metrics = { scanned: 0, classified: 0, batches: 0, lastDurationMs: 0, mode: 'Original', shadows: 0, reattaches: 0, shells: 0, colorRepairs: 0, nativeDark: false, nativeDarkReason: null };
  const protectedSelector = 'img,picture,video,canvas,svg,[role="img"],[data-exp-owned="1"],[data-exp-shift-preserve],[class*="badge" i],[class*="status" i],[class*="rating" i],[role="progressbar"]';

  function getParseContext() {
    if (parseContext !== undefined) return parseContext;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      parseContext = canvas.getContext('2d', { willReadFrequently: true }) || null;
    } catch {
      parseContext = null;
    }
    return parseContext;
  }
  function parseColor(value) {
    const raw = String(value || '').trim();
    if (!raw || raw === 'transparent' || raw === 'none') return null;
    const ctx = getParseContext();
    if (ctx) {
      try {
        ctx.fillStyle = '#000000';
        ctx.fillStyle = raw;
        const normalized = String(ctx.fillStyle);
        const painted = normalized.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
        if (painted) return { r: +painted[1], g: +painted[2], b: +painted[3], a: painted[4] === undefined ? 1 : +painted[4] };
      } catch {}
    }
    const match = raw.match(/^rgba?\(\s*([\d.]+)\s*[,/\s]\s*([\d.]+)\s*[,/\s]\s*([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i);
    if (!match) return null;
    const alpha = match[4] === undefined ? 1 : (String(match[4]).endsWith('%') ? parseFloat(match[4]) / 100 : +match[4]);
    return { r: +match[1], g: +match[2], b: +match[3], a: alpha };
  }
  function forcedColors() {
    try { return typeof matchMedia === 'function' && matchMedia('(forced-colors: active)').matches; } catch { return false; }
  }
  function captureNativeBaseline() {
    if (nativeBaseline || !document.documentElement) return nativeBaseline;
    try {
      const html = document.documentElement;
      const body = document.body;
      let saved = null;
      try { saved = JSON.parse(html.dataset.expShiftNativeBaseline || 'null'); } catch {}
      const meta = String(saved?.meta || [...document.querySelectorAll('meta[name="color-scheme"]')].map((node) => node.content || '').join(' ')).toLowerCase();
      const rootStyle = getComputedStyle(html);
      const bodyStyle = body ? getComputedStyle(body) : null;
      nativeBaseline = {
        meta,
        rootScheme: saved?.rootScheme || rootStyle.colorScheme || '',
        bodyScheme: saved?.bodyScheme || bodyStyle?.colorScheme || '',
        rootBg: parseColor(saved?.rootBg || rootStyle.backgroundColor),
        bodyBg: parseColor(saved?.bodyBg || bodyStyle?.backgroundColor || ''),
      };
    } catch {
      nativeBaseline = { meta: '', rootScheme: '', bodyScheme: '', rootBg: null, bodyBg: null };
    }
    return nativeBaseline;
  }

  function detectNativeDark() {
    try {
      const baseline = captureNativeBaseline();
      const meta = baseline.meta;
      const rootScheme = baseline.rootScheme;
      const bodyScheme = baseline.bodyScheme;
      const rootBg = baseline.rootBg;
      const bodyBg = baseline.bodyBg;
      const darkSurface = (parts) => {
        if (!parts || (parts.a ?? 1) < 0.9) return false;
        const lightness = (Math.max(parts.r, parts.g, parts.b) + Math.min(parts.r, parts.g, parts.b)) / 510;
        return lightness <= 0.22;
      };
      const explicit = /\bdark\b/i.test(rootScheme) || /\bdark\b/i.test(bodyScheme) || (/\bdark\b/.test(meta) && !/\blight\s+dark\b|\bdark\s+light\b/.test(meta));
      const painted = darkSurface(bodyBg) || darkSurface(rootBg);
      const native = explicit && painted;
      metrics.nativeDark = native;
      metrics.nativeDarkReason = native ? 'explicit-dark-scheme-with-dark-canvas' : null;
      return native;
    } catch {
      metrics.nativeDark = false;
      metrics.nativeDarkReason = null;
      return false;
    }
  }
  const hostPaint = new WeakMap();
  function rememberHostPaint(node) {
    if (!node || hostPaint.has(node)) return;
    hostPaint.set(node, {
      background: node.style.getPropertyValue('background'),
      backgroundPriority: node.style.getPropertyPriority('background'),
      backgroundColor: node.style.getPropertyValue('background-color'),
      backgroundColorPriority: node.style.getPropertyPriority('background-color'),
      color: node.style.getPropertyValue('color'),
      colorPriority: node.style.getPropertyPriority('color'),
      colorScheme: node.style.getPropertyValue('color-scheme'),
      colorSchemePriority: node.style.getPropertyPriority('color-scheme'),
    });
  }
  function releaseHostPaint(node) {
    if (!node || !hostPaint.has(node)) return;
    const saved = hostPaint.get(node);
    hostPaint.delete(node);
    node.style.removeProperty('background-color');
    node.style.removeProperty('color');
    node.style.removeProperty('color-scheme');
    if (saved.background) node.style.setProperty('background', saved.background, saved.backgroundPriority);
    else if (saved.backgroundColor) node.style.setProperty('background-color', saved.backgroundColor, saved.backgroundColorPriority);
    if (saved.color) node.style.setProperty('color', saved.color, saved.colorPriority);
    if (saved.colorScheme) node.style.setProperty('color-scheme', saved.colorScheme, saved.colorSchemePriority);
  }
  function clearCompetingHostPaint(pageColor, textColor) {
    // Override host colors with !important only. Remember the inline background
    // first: removing background-color from a `background` shorthand leaves a
    // transparent canvas (the white page) even when theming is off.
    for (const node of [document.documentElement, document.body]) {
      if (!node) continue;
      rememberHostPaint(node);
      node.style.setProperty('background-color', pageColor, 'important');
      node.style.setProperty('color', textColor, 'important');
      node.style.setProperty('color-scheme', 'dark', 'important');
    }
  }
  function lockHost(on, themeId) {
    const html = document.documentElement;
    if (!html) return;
    if (on) {
      for (const node of [html, document.body]) rememberHostPaint(node);
      html.setAttribute(HOST_ATTR, themeId || '1');
      html.style.setProperty('color-scheme', 'dark', 'important');
      return;
    }
    html.removeAttribute(HOST_ATTR);
    for (const node of [html, document.body]) releaseHostPaint(node);
  }
  function ensureGuard() {
    if (guard || !document.documentElement) return;
    guard = new MutationObserver((mutations) => {
      if (writing || !active || !lastCss) return;
      let stolen = Boolean(style && !style.isConnected);
      if (!stolen) {
        for (const mutation of mutations) {
          for (const node of mutation.removedNodes) {
            if (node === style || (node.nodeType === 1 && (node.id === STYLE_ID || node.dataset?.expShiftPageStyle))) stolen = true;
          }
        }
      }
      if (!stolen) return;
      metrics.reattaches += 1;
      style = null;
      ensureStyle(lastCss);
    });
    guard.observe(document.documentElement, { childList: true, subtree: true });
  }
  function ensureStyle(cssText) {
    lastCss = cssText;
    if (writing) return style;
    writing = true;
    try {
      if (style) {
        try {
          style.textContent = cssText;
          if (style.isConnected) return style;
        } catch {}
        try { style.remove(); } catch {}
        style = null;
      }
      style = EXP.Core.injectStyle(document, cssText, { expShiftPageStyle: '1' });
      style.id = STYLE_ID;
      ensureGuard();
      return style;
    } finally {
      writing = false;
    }
  }
  function isViewportShell(element) {
    if (!element || element === document.documentElement || element === document.body) return true;
    try { if (element.matches?.(SHELL_SELECTOR)) return true; } catch {}
    const rect = element.getBoundingClientRect();
    const vw = innerWidth || document.documentElement.clientWidth || 0;
    const vh = innerHeight || document.documentElement.clientHeight || 0;
    if (vw < 80 || vh < 80) return false;
    return rect.width >= vw * 0.86 && rect.height >= vh * 0.4 && rect.top < vh * 0.25;
  }
  function hasPhotoBackground(computed) {
    const image = computed.backgroundImage;
    return Boolean(image && image !== 'none' && /url\s*\(/i.test(image));
  }
  function neutral(parts) { return parts && Math.max(parts.r, parts.g, parts.b) - Math.min(parts.r, parts.g, parts.b) <= 42; }
  function eligible(element, computed, level, asShell) {
    if (element.matches?.(protectedSelector) || element.closest?.(protectedSelector) || computed.display === 'none' || computed.visibility === 'hidden') return false;
    // Preserve photo backgrounds on the element itself. Nested icons/thumbnails must not
    // block repairing a neutral grey section/article (that left light text on white boxes).
    if (settings.preserveArt && hasPhotoBackground(computed)) return false;
    const parts = parseColor(computed.backgroundColor);
    if (asShell) {
      // Only adopt opaque neutral shells. Transparent viewport wrappers must stay clear so
      // hero / page art under them is not covered by a solid OWNED page plate.
      if (!parts || (parts.a ?? 1) < 0.96 || !neutral(parts)) return false;
      return true;
    }
    if (!parts || !neutral(parts) || (parts.a ?? 1) < 0.96) return false;
    if (hasPhotoBackground(computed)) return false;
    const rect = element.getBoundingClientRect();
    const thresholds = level === 'aggressive' ? [24, 16] : level === 'balanced' ? [48, 20] : [80, 28];
    return rect.width >= thresholds[0] && rect.height >= thresholds[1];
  }
  function classify(element) {
    if (element.matches('html,body,main') || isViewportShell(element)) return 'page';
    if (element.matches('header,footer,nav,aside,[role="banner"],[role="navigation"],[role="contentinfo"]')) return 'navigation';
    if (element.matches('button,a[role="button"]')) return 'interactive';
    if (element.matches('input,select,textarea,form')) return 'input';
    if (element.closest('dialog,[role="dialog"],[aria-modal="true"]')) return 'overlay';
    if (element.parentElement?.hasAttribute(OWNED)) return 'raised';
    return 'surface';
  }
  function mark(element, role) {
    if (!ledger.has(element)) ledger.set(element, element.getAttribute(OWNED));
    element.setAttribute(OWNED, role);
    metrics.classified += 1;
    if (role === 'page' && (element.matches?.(SHELL_SELECTOR) || element.parentElement === document.body)) metrics.shells += 1;
  }
  function scanSelector(level) {
    if (level === 'aggressive') return `${LANDMARK_SELECTOR},${SHELL_SELECTOR},div,ul,li,table,dialog,[role="dialog"]`;
    if (level === 'balanced') return `${LANDMARK_SELECTOR},${SHELL_SELECTOR},div,ul,li`;
    return `${LANDMARK_SELECTOR},${SHELL_SELECTOR}`;
  }
  function collectTargets(roots, selector) {
    const seen = new Set();
    const add = (element) => {
      if (!element || element.nodeType !== 1) return;
      if (element.closest?.('[data-exp-owned="1"]')) return;
      seen.add(element);
    };
    for (const root of roots) {
      if (!root) continue;
      if (root.matches?.(selector)) add(root);
      if (root === document.documentElement || root === document.body) {
        add(document.documentElement);
        add(document.body);
      }
      root.querySelectorAll?.(selector).forEach(add);
      const host = root === document.documentElement ? document.body : root;
      const kids = host?.children ? [...host.children] : [];
      for (const child of kids) {
        if (isViewportShell(child)) add(child);
        for (const grand of child.children || []) if (isViewportShell(grand)) add(grand);
      }
    }
    return seen;
  }
  function paintShadows(cssText, level) {
    const budget = level === 'aggressive' ? 80 : level === 'balanced' ? 36 : 16;
    const shadows = [];
    const visit = (root) => {
      if (shadows.length >= budget || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('*')) {
        if (shadows.length >= budget) return;
        if (el.closest?.('[data-exp-owned="1"]')) continue;
        const shadow = el.shadowRoot;
        if (!shadow) continue;
        if (level === 'conservative' && !isViewportShell(el) && !el.matches?.(LANDMARK_SELECTOR)) continue;
        shadows.push(shadow);
        visit(shadow);
      }
    };
    visit(document.documentElement);
    metrics.shadows = shadows.length;
    const live = new Set(shadows);
    for (const [root, handle] of [...shadowHandles]) {
      if (live.has(root) && root.host?.isConnected) continue;
      try { handle.remove(); } catch {}
      shadowHandles.delete(root);
    }
    for (const shadow of shadows) {
      const handle = shadowHandles.get(shadow);
      if (handle) {
        try { handle.textContent = cssText; continue; } catch {
          try { handle.remove(); } catch {}
          shadowHandles.delete(shadow);
        }
      }
      try { shadowHandles.set(shadow, EXP.Core.injectStyle(shadow, cssText, { expShiftShadowStyle: '1' })); } catch (error) { EXP.Core.safeError(error, 'shift-shadow'); }
    }
  }
  function clearShadows() {
    for (const handle of shadowHandles.values()) { try { handle.remove(); } catch {} }
    shadowHandles.clear();
    metrics.shadows = 0;
  }
  function restoreMarks() {
    for (const [element, previous] of ledger) {
      if (!element.isConnected) continue;
      if (previous === null) element.removeAttribute(OWNED); else element.setAttribute(OWNED, previous);
    }
    ledger.clear();
    clearShadows();
    EXP.ColorEngine.clear();
    EXP.ColorEngine.clearStyleSheets();
    metrics.classified = 0;
    metrics.shells = 0;
  }
  function restoreAll() {
    restoreMarks();
    if (style) {
      try { style.remove(); } catch {}
      style = null;
    }
    lastCss = '';
    lockHost(false);
    // Defensive purge: orphaned sheets/attrs from older builds or lost ledger entries.
    try {
      document.querySelectorAll(`#${STYLE_ID},style[data-exp-shift-page-style],style[data-exp-shift-adapter-style]`).forEach((node) => {
        try { node.remove(); } catch {}
      });
      document.querySelectorAll(`[${OWNED}]`).forEach((node) => node.removeAttribute(OWNED));
      document.documentElement?.removeAttribute(HOST_ATTR);
    } catch {}
  }
  function scheduleStyleSheetRefresh() {
    if (sheetRefreshPending || !active || !settings) return;
    sheetRefreshPending = true;
    sheetRefreshTimer = setTimeout(() => {
      sheetRefreshPending = false;
      sheetRefreshTimer = 0;
      if (!active || settings.theme === 'original' || settings.safeMode || settings.excluded || originalHeld || forcedColors()) return;
      try {
        const theme = EXP.Themes.resolve(settings.theme, settings.accent, settings);
        EXP.ColorEngine.refreshStyleSheets(theme);
      } catch (error) { EXP.Core.safeError(error, 'shift-stylesheets'); }
    }, 80);
  }

  function inViewport(element) {
    if (!element?.getBoundingClientRect) return true;
    try {
      const rect = element.getBoundingClientRect();
      const vh = innerHeight || document.documentElement.clientHeight || 0;
      const vw = innerWidth || document.documentElement.clientWidth || 0;
      return rect.bottom >= -120 && rect.right >= -120 && rect.top <= vh + 120 && rect.left <= vw + 120;
    } catch { return true; }
  }

  function queueDeferredRoots(roots) {
    for (const root of roots) if (root?.nodeType === 1 && !inViewport(root)) deferredRoots.add(root);
    if (!deferredRoots.size || deferredTimer || idleHandle) return;
    const run = () => {
      deferredTimer = 0;
      idleHandle = 0;
      if (!active || document.hidden) return;
      const batch = [...deferredRoots].slice(0, 24);
      batch.forEach((root) => deferredRoots.delete(root));
      if (batch.length) scanRoots(batch, 'balanced', true);
      if (deferredRoots.size) queueDeferredRoots([]);
    };
    if (typeof requestIdleCallback === 'function') idleHandle = requestIdleCallback(run, { timeout: 900 });
    else deferredTimer = setTimeout(run, 180);
  }

  function repairInlineColors(roots) {
    const theme = EXP.Themes.resolve(settings.theme, settings.accent, settings);
    const budget = settings.surfaceLevel === 'aggressive' ? 1800 : settings.surfaceLevel === 'balanced' ? 900 : 360;
    let count = 0;
    const inspect = (element) => {
      if (!element || element.nodeType !== 1 || count >= budget || element.closest?.('[data-exp-owned="1"]')) return;
      if (element.hasAttribute('style')) {
        EXP.ColorEngine.inspectInline(element, theme);
        count += 1;
      }
    };
    for (const root of roots) {
      inspect(root);
      root?.querySelectorAll?.('[style]').forEach(inspect);
      if (count >= budget) break;
    }
    metrics.colorRepairs += count;
  }

  function scanRoots(roots, overrideLevel, deferredPass = false) {
    if (!active || settings.theme === 'original' || settings.safeMode || settings.excluded || originalHeld || forcedColors()) return;
    const now = performance.now();
    if (!overrideLevel && !deferredPass) {
      roots = roots.filter((root) => {
        if (!root || root === document.documentElement || root === document.body) return true;
        const previous = recentRoots.get(root) || 0;
        recentRoots.set(root, now);
        return now - previous > 120;
      });
      if (!roots.length) return;
    }
    const start = now;
    const level = overrideLevel || settings.surfaceLevel || 'conservative';
    if (!deferredPass) queueDeferredRoots(roots);
    const nativeDark = detectNativeDark();
    if (!nativeDark) repairInlineColors(roots);
    if (!nativeDark) scheduleStyleSheetRefresh();
    else EXP.ColorEngine.clearStyleSheets();
    if (lastCss) paintShadows(lastCss, level === 'off' ? 'conservative' : level);
    if (level !== 'off' || overrideLevel) {
      const selector = scanSelector(level === 'off' ? 'conservative' : level);
      const seen = collectTargets(roots, selector);
      const ordered = [...seen].sort((left, right) => Number(inViewport(right)) - Number(inViewport(left)));
      const limit = level === 'aggressive' ? 5000 : level === 'balanced' ? 1500 : 700;
      for (const element of ordered.slice(0, limit)) {
        metrics.scanned += 1;
        const computed = getComputedStyle(element);
        const asShell = isViewportShell(element);
        if (eligible(element, computed, level, asShell)) mark(element, classify(element));
      }
    }
    metrics.batches += 1;
    metrics.lastDurationMs = Math.round((performance.now() - start) * 10) / 10;
    for (const processor of processors) { try { processor(roots); } catch (error) { EXP.Core.safeError(error, 'shift-processor'); } }
  }
  function pagePaint(theme, state, withEdge = false) {
    if (state.simplifyGradients) return `background:${theme.page}!important;background-color:${theme.page}!important`;
    const layers = [];
    if (withEdge) {
      const edge = theme.pageEdge || (theme.accent ? `linear-gradient(90deg,${theme.highlight || theme.accent},color-mix(in srgb,${theme.accent} 40%,${theme.page}))` : '');
      if (edge) {
        const pride = theme.id === 'pride' || /#c97b83/.test(edge);
        layers.push(`${edge} top / 100% ${pride ? 10 : 6}px no-repeat`);
        if (pride) layers.push(`linear-gradient(180deg,#c97b83,#d29a70,#d0c07d,#70a886,#7091b6,#a27ba9) left / 5px 100% no-repeat`);
      }
    }
    if (theme.pageFill) layers.push(theme.pageFill);
    layers.push(theme.page);
    return `background:${layers.join(',')}!important;background-color:${theme.page}!important`;
  }
  function css(theme, state) {
    if (theme.original || state.safeMode || state.excluded || originalHeld || forcedColors()) return '';
    const strength = state.themeStrength || 'normal';
    const surface = strength === 'soft' ? `color-mix(in srgb,${theme.surface} 58%,${theme.page})` : theme.surface;
    const raised = strength === 'soft' ? `color-mix(in srgb,${theme.raised} 62%,${theme.surface})` : strength === 'strong' ? theme.overlay : theme.raised;
    const overlay = strength === 'strong' ? `color-mix(in srgb,${theme.overlay} 84%,${theme.text})` : theme.overlay;
    const foreground = state.textContrast === 'enhanced' ? theme.text : `color-mix(in srgb,${theme.text} 88%,${theme.muted})`;
    const hostPage = pagePaint(theme, state, true);
    const page = pagePaint(theme, state, false);
    const highlight = theme.highlight || theme.accent;
    const shadow = state.reduceShadows ? `box-shadow:none!important;` : '';
    const transparency = state.reduceTransparency ? `backdrop-filter:none!important;` : '';
    const gradient = state.simplifyGradients ? `background-image:none!important;` : '';
    const blur = state.reduceBlur ? `filter:none!important;backdrop-filter:none!important;` : '';
    const motion = state.reduceMotion === 'on' || (state.reduceMotion === 'system' && matchMedia('(prefers-reduced-motion: reduce)').matches) ? `*,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}` : '';
    const links = state.linkVisibility === 'site' ? '' : `html[${HOST_ATTR}] a:not([role="button"]):not([data-exp-owned="1"]){color:var(--exp-shift-accent)!important;text-decoration-thickness:${state.linkVisibility === 'high' ? '2px' : 'auto'}!important}`;
    const forms = state.formReadability ? `html[${HOST_ATTR}] :is(input,select,textarea):not([data-exp-owned="1"]){background-color:var(--exp-shift-input)!important;color:var(--exp-shift-text)!important;border-color:var(--exp-shift-accent)!important}html[${HOST_ATTR}] ::placeholder{color:var(--exp-shift-muted)!important;opacity:1!important}` : '';
    const muted = state.mutedRecovery ? `html[${HOST_ATTR}] :is(.muted,.text-muted,[class*="muted" i],[class*="secondary" i],[class*="subtle" i]):not([data-exp-owned="1"]){color:color-mix(in srgb,var(--exp-shift-muted) 78%,var(--exp-shift-text))!important}html[${HOST_ATTR}] :is(figcaption,small,caption):not([data-exp-owned="1"]){color:color-mix(in srgb,var(--exp-shift-muted) 84%,var(--exp-shift-text))!important}` : '';
    const semantic = `
      html[${HOST_ATTR}] :is([role="alert"],.alert,.notification,.notice,[class*="warning" i],[class*="caution" i],[class*="success" i],[class*="error" i],[class*="danger" i],[class*="info" i]):not([data-exp-owned="1"]){color:var(--exp-shift-text)!important;border-color:color-mix(in srgb,var(--exp-shift-muted) 42%,transparent)!important}
      html[${HOST_ATTR}] :is(.alert-warning,.warning,[class*="warning" i],[class*="caution" i]):not([data-exp-owned="1"]){background-color:color-mix(in srgb,#b88718 34%,var(--exp-shift-surface))!important;color:#fff3c4!important;border-color:#b88718!important}
      html[${HOST_ATTR}] :is(.alert-success,.success,[class*="success" i]):not([data-exp-owned="1"]){background-color:color-mix(in srgb,#218739 30%,var(--exp-shift-surface))!important;color:#dcffe4!important;border-color:#3fa95a!important}
      html[${HOST_ATTR}] :is(.alert-danger,.alert-error,.error,.danger,[class*="error" i],[class*="danger" i]):not([data-exp-owned="1"]){background-color:color-mix(in srgb,#a8323a 32%,var(--exp-shift-surface))!important;color:#ffe1e4!important;border-color:#c84b54!important}
      html[${HOST_ATTR}] :is(.alert-info,.info,[class*="info" i]):not([data-exp-owned="1"]){background-color:color-mix(in srgb,#2879a8 30%,var(--exp-shift-surface))!important;color:#e0f4ff!important;border-color:#4a9ac7!important}
      html[${HOST_ATTR}] :is([role="alert"],.alert,.notification,.notice,[class*="warning" i],[class*="caution" i],[class*="success" i],[class*="error" i],[class*="danger" i],[class*="info" i]) :is(a,button):not([data-exp-owned="1"]){color:inherit!important}
    `;
    const focus = state.focusVisibility === 'site' ? '' : `html[${HOST_ATTR}] :focus-visible{outline:${state.focusVisibility === 'high' ? 3 : 2}px solid var(--exp-shift-accent)!important;outline-offset:2px!important}`;
    // Host-first cascade (differs from legacy invert-filter darkeners): opaque html/body/shell
    // page paint + readable text, then chrome hooks. main keeps a surface fill (common content
    // shell); section/article only get text color — transparent sections over heroes must not
    // become solid plates. Neutral leftover boxes are repaired via OWNED marks.
    const vars = `--exp-shift-page:${theme.page};--exp-shift-surface:${surface};--exp-shift-raised:${raised};--exp-shift-overlay:${overlay};--exp-shift-navigation:${theme.navigation};--exp-shift-input:${theme.input};--exp-shift-interactive:${theme.interactive};--exp-shift-text:${foreground};--exp-shift-muted:${theme.muted};--exp-shift-accent:${theme.accent};--exp-shift-highlight:${highlight}`;
    const everywhere = `
        html[${HOST_ATTR}] :is(header,footer,nav,aside,[role="banner"],[role="navigation"],[role="contentinfo"])${MEDIA_EXCLUSION}{background-color:var(--exp-shift-navigation)!important;color:var(--exp-shift-text)!important;border-color:color-mix(in srgb,var(--exp-shift-highlight) 55%,transparent)!important}
        html[${HOST_ATTR}] :is(main,[role="main"])${MEDIA_EXCLUSION}{background-color:var(--exp-shift-surface)!important;color:var(--exp-shift-text)!important}
        html[${HOST_ATTR}] :is(section,article)${MEDIA_EXCLUSION}{color:var(--exp-shift-text)!important}
        html[${HOST_ATTR}] :is(dialog,[role="dialog"])${MEDIA_EXCLUSION}{background-color:var(--exp-shift-overlay)!important;color:var(--exp-shift-text)!important;border-color:color-mix(in srgb,var(--exp-shift-accent) 40%,transparent)!important}
        html[${HOST_ATTR}] :is(table,thead,tbody,tr,th,td)${MEDIA_EXCLUSION}{background-color:var(--exp-shift-surface)!important;color:var(--exp-shift-text)!important;border-color:color-mix(in srgb,var(--exp-shift-muted) 35%,transparent)!important}
        html[${HOST_ATTR}] :is(button,[role="button"],.btn)${MEDIA_EXCLUSION}{background-color:color-mix(in srgb,var(--exp-shift-accent) 18%,var(--exp-shift-interactive))!important;color:var(--exp-shift-text)!important;border-color:var(--exp-shift-accent)!important}
        html[${HOST_ATTR}] :is(hr){border-color:color-mix(in srgb,var(--exp-shift-muted) 40%,transparent)!important}
        html[${HOST_ATTR}] :is(code,pre,kbd,samp)${MEDIA_EXCLUSION}{background-color:var(--exp-shift-raised)!important;color:var(--exp-shift-text)!important;border-color:color-mix(in srgb,var(--exp-shift-muted) 30%,transparent)!important}
        html[${HOST_ATTR}] :is(${CHROME_CLASS_SELECTOR})${MEDIA_EXCLUSION}{background-color:var(--exp-shift-surface)!important;color:var(--exp-shift-text)!important;border-color:color-mix(in srgb,var(--exp-shift-muted) 40%,transparent)!important}
        html[${HOST_ATTR}] :is(${NAV_CLASS_SELECTOR})${MEDIA_EXCLUSION}{background-color:var(--exp-shift-navigation)!important;color:var(--exp-shift-text)!important;border-color:color-mix(in srgb,var(--exp-shift-highlight) 50%,transparent)!important}
        html[${HOST_ATTR}] :is(${LIGHT_UTILITY_SELECTOR})${MEDIA_EXCLUSION}{background-color:var(--exp-shift-surface)!important;color:var(--exp-shift-text)!important}
        html[${HOST_ATTR}] :is(${CONTENT_WRAPPER_SELECTOR})${MEDIA_EXCLUSION}{background-color:var(--exp-shift-surface)!important;color:var(--exp-shift-text)!important}
        html[${HOST_ATTR}] :is(${TEXT_SELECTOR})${MEDIA_EXCLUSION}{color:var(--exp-shift-text)!important}
        html[${HOST_ATTR}] :is(img,picture,video,canvas,svg,[role="img"],[data-exp-shift-preserve]){filter:none!important}
        html[${HOST_ATTR}]{scrollbar-color:var(--exp-shift-muted) var(--exp-shift-raised)}
      `;
    return `
      @media screen {
        :root,html[${HOST_ATTR}],:host{${vars}}
        html[${HOST_ATTR}]{color-scheme:dark!important;${hostPage};color:${foreground}!important}
        html[${HOST_ATTR}] body{${page};color:${foreground}!important;color-scheme:dark!important}
        html[${HOST_ATTR}] :is(${SHELL_SELECTOR})${MEDIA_EXCLUSION}{background-color:${theme.page}!important;color:${foreground}!important}
        ${everywhere}
        [${OWNED}="page"]{${page};color:var(--exp-shift-text)!important}
        [${OWNED}="surface"]{background-color:var(--exp-shift-surface)!important;color:var(--exp-shift-text)!important}
        [${OWNED}="raised"]{background-color:var(--exp-shift-raised)!important;color:var(--exp-shift-text)!important}
        [${OWNED}="input"]{background-color:var(--exp-shift-input)!important;color:var(--exp-shift-text)!important;border-color:var(--exp-shift-accent)!important}
        [${OWNED}="interactive"]{background-color:color-mix(in srgb,var(--exp-shift-accent) 18%,var(--exp-shift-interactive))!important;color:var(--exp-shift-text)!important;border-color:var(--exp-shift-accent)!important}
        [${OWNED}="overlay"]{background-color:var(--exp-shift-overlay)!important;color:var(--exp-shift-text)!important}
        [${OWNED}="navigation"]{background-color:var(--exp-shift-navigation)!important;color:var(--exp-shift-text)!important;border-color:var(--exp-shift-highlight)!important;box-shadow:inset 0 2px 0 var(--exp-shift-highlight)!important}
        [${OWNED}]{${shadow}${transparency}${gradient}${blur}}
        :host{${page};color:${foreground}!important}
        :host > :first-child{background-color:${theme.page}!important;color:${foreground}!important}
        ::selection{background:color-mix(in srgb,var(--exp-shift-accent) 42%,var(--exp-shift-page))!important;color:var(--exp-shift-text)!important}
        ${links}${forms}${muted}${semantic}${focus}${motion}
      }`;
  }
  function apply(next) {
    settings = next;
    const theme = EXP.Themes.resolve(next.theme, next.accent, next);
    const disabled = theme.original || next.safeMode || next.excluded || originalHeld || forcedColors();
    metrics.mode = next.excluded ? 'Excluded' : next.safeMode ? 'Safe' : theme.original || originalHeld ? 'Original' : 'Generic';
    if (disabled) {
      EXP.Preload?.finish();
      restoreAll();
      return { theme, mode: metrics.mode };
    }
    if (!next.repairSurfaces) {
      for (const [element, previous] of ledger) {
        if (!element.isConnected) continue;
        if (previous === null) element.removeAttribute(OWNED); else element.setAttribute(OWNED, previous);
      }
      ledger.clear();
      clearShadows();
      metrics.classified = 0;
      metrics.shells = 0;
    }
    const themeCss = css(theme, next);
    if (!themeCss) {
      restoreAll();
      return { theme, mode: metrics.mode };
    }
    lockHost(true, theme.id || '1');
    ensureStyle(themeCss);
    EXP.Preload?.finish();
    scheduleStyleSheetRefresh();
    clearCompetingHostPaint(theme.page, theme.text);
    scheduler?.schedule(document.documentElement);
    return { theme, mode: metrics.mode };
  }
  function start(initial) {
    if (active) return;
    active = true;
    settings = initial;
    captureNativeBaseline();
    scheduler = EXP.Core.createScheduler(scanRoots, { source: 'shift-engine', attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
    scheduler.start();
    // Poll slowly as a safety net. Normal stylesheet invalidation is event-driven.
    sheetPollTimer = setInterval(() => { if (pageVisible) scheduleStyleSheetRefresh(); }, 10000);
    sheetMutationObserver = new MutationObserver((mutations) => {
      if (!active || !pageVisible) return;
      let relevant = false;
      for (const mutation of mutations) {
        const target = mutation.target;
        if (target?.nodeType === 1 && (target.matches?.('style,link[rel~="stylesheet"]') || target.closest?.('style'))) { relevant = true; break; }
        for (const node of mutation.addedNodes) {
          if (node?.nodeType === 1 && (node.matches?.('style,link[rel~="stylesheet"]') || node.querySelector?.('style,link[rel~="stylesheet"]'))) { relevant = true; break; }
        }
        if (relevant) break;
      }
      if (relevant) { sheetMutationRefreshes += 1; scheduleStyleSheetRefresh(); }
    });
    sheetMutationObserver.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['href','media','disabled']});
    const onVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible) {
        scheduleStyleSheetRefresh();
        scheduler?.schedule(document.documentElement);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    visibilityCleanup = () => document.removeEventListener('visibilitychange', onVisibility);
    apply(initial);
  }
  function stop() {
    active = false;
    scheduler?.stop();
    scheduler = null;
    if (sheetRefreshTimer) clearTimeout(sheetRefreshTimer);
    sheetRefreshTimer = 0;
    sheetRefreshPending = false;
    if (sheetPollTimer) clearInterval(sheetPollTimer);
    sheetPollTimer = 0;
    sheetMutationObserver?.disconnect();
    sheetMutationObserver = null;
    if (deferredTimer) clearTimeout(deferredTimer);
    deferredTimer = 0;
    if (idleHandle && typeof cancelIdleCallback === 'function') cancelIdleCallback(idleHandle);
    idleHandle = 0;
    deferredRoots.clear();
    visibilityCleanup?.();
    visibilityCleanup = null;
    guard?.disconnect();
    guard = null;
    restoreAll();
  }
  function holdOriginal(held) { originalHeld = Boolean(held); if (settings) apply(settings); }
  function health() {
    const leftoverStyles = document.querySelectorAll(`#${STYLE_ID},style[data-exp-shift-page-style],style[data-exp-shift-adapter-style]`).length;
    const leftoverOwned = document.querySelectorAll(`[${OWNED}]`).length;
    const hostLocked = Boolean(document.documentElement?.hasAttribute(HOST_ATTR));
    return {
      ...metrics,
      stylesheetInvalidation: { mutationRefreshes: sheetMutationRefreshes, safetyPollMs: 10000 },
      colorEngine: EXP.ColorEngine.health(),
      owned: [...ledger.keys()].filter((item) => item.isConnected).length,
      leftoverPaint: {
        hostAttribute: hostLocked,
        styleSheets: leftoverStyles,
        ownedSurfaces: leftoverOwned,
        active: Boolean(lastCss) || hostLocked || leftoverStyles > 0 || leftoverOwned > 0,
      },
    };
  }
  function addProcessor(processor) { processors.add(processor); return () => processors.delete(processor); }
  return Object.freeze({ start, stop, apply, holdOriginal, health, scan: () => scheduler?.schedule(document.documentElement), fullScan: () => scanRoots([document.documentElement], 'aggressive'), addProcessor });
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

EXP.VERSION = '3.3.0-dev.1';

EXP.ReleaseNotes = (() => {
  const NOTES = Object.freeze({
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

EXP.Updates = (() => {
  const CURRENT_VERSION = EXP.VERSION;
  const ENDPOINT = 'https://api.github.com/repos/ExtraPotions/SHIFT/releases/latest';
  const CACHE_KEY = 'exp:v3:shift:update-cache';
  const CHECK_INTERVAL = 15 * 60 * 1000;
  let memory = { checkedAt: 0, latest: null, state: 'unrun' };

  function readCache() {
    try { if (typeof GM_getValue === 'function') return GM_getValue(CACHE_KEY, memory) || memory; } catch {}
    return memory;
  }
  function writeCache(value) {
    memory = value;
    try { if (typeof GM_setValue === 'function') GM_setValue(CACHE_KEY, value); } catch {}
  }
  function compare(left, right) {
    const a = String(left).replace(/^v/, '').split(/[.-]/).slice(0, 3).map((part) => Number(part) || 0);
    const b = String(right).replace(/^v/, '').split(/[.-]/).slice(0, 3).map((part) => Number(part) || 0);
    for (let index = 0; index < 3; index += 1) if (a[index] !== b[index]) return a[index] > b[index] ? 1 : -1;
    return 0;
  }
  function request() {
    return new Promise((resolve, reject) => {
      if (typeof GM_xmlhttpRequest !== 'function') return reject(Object.assign(new Error('Update request capability unavailable'), { code: 'UPDATE_CAPABILITY' }));
      GM_xmlhttpRequest({ method: 'GET', url: ENDPOINT, timeout: 10000, headers: { Accept: 'application/vnd.github+json' }, onload: (response) => response.status >= 200 && response.status < 300 ? resolve(response.responseText) : reject(Object.assign(new Error('Update metadata request failed'), { code: `UPDATE_HTTP_${response.status}` })), onerror: () => reject(Object.assign(new Error('Update metadata request failed'), { code: 'UPDATE_NETWORK' })), ontimeout: () => reject(Object.assign(new Error('Update metadata request timed out'), { code: 'UPDATE_TIMEOUT' })) });
    });
  }
  async function check(force = false) {
    if (!EXP.Settings.snapshot().updateNotifications && !force) return { ...readCache(), state: 'disabled', current: CURRENT_VERSION };
    const cached = readCache();
    if (!force && Date.now() - Number(cached.checkedAt || 0) < CHECK_INTERVAL) return { ...cached, current: CURRENT_VERSION, available: cached.latest ? compare(cached.latest, CURRENT_VERSION) > 0 : false };
    try {
      const payload = JSON.parse(await request());
      const latest = String(payload.tag_name || '').replace(/^v/, '');
      if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(latest)) throw Object.assign(new Error('Invalid update metadata'), { code: 'UPDATE_METADATA' });
      const next = { checkedAt: Date.now(), latest, state: 'complete' }; writeCache(next);
      return { ...next, current: CURRENT_VERSION, available: compare(latest, CURRENT_VERSION) > 0 };
    } catch (error) {
      EXP.Core.safeError(error, 'shift-updates');
      const next = { checkedAt: Date.now(), latest: cached.latest || null, state: 'failed', code: error.code || 'UPDATE_FAILED' }; writeCache(next);
      return { ...next, current: CURRENT_VERSION, available: false };
    }
  }
  function status() { const cached = readCache(); return { ...cached, current: CURRENT_VERSION, available: cached.latest ? compare(cached.latest, CURRENT_VERSION) > 0 : false }; }
  return Object.freeze({ CURRENT_VERSION, ENDPOINT, check, status, compare });
})();

EXP.MenuChrome = (() => {
  const WIDTHS = new Set(['full', 'compact', 'narrow']);
  const DISMISS_MS = 15000;
  const SHELL_CSS = `
    .dropper-menu-surface>.live{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip-path:inset(50%)!important;white-space:nowrap!important;border:0!important}
    .fl-tool-body .exp-theme-swatch{box-sizing:border-box!important;flex:0 0 22px!important;width:22px!important;height:22px!important;min-width:22px!important;min-height:22px!important;max-width:22px!important;max-height:22px!important;padding:0!important;border-radius:5px!important}
    .dropper-menu-surface{font-family:system-ui,sans-serif!important;box-sizing:border-box!important;width:312px!important;max-width:calc(100vw - 24px)!important;padding:9px!important;border:0!important;border-radius:14px!important;background:var(--dropper-bg,#111114)!important;box-shadow:0 16px 42px #000b!important;color:var(--dropper-text,#f4f4f6)!important;overflow:visible!important}
    :host([data-menu-width="compact"]) .dropper-menu-surface{width:260px!important}:host([data-menu-width="narrow"]) .dropper-menu-surface{width:220px!important}
    .menu-head{display:grid!important;grid-template-columns:minmax(0,1fr) 30px!important;align-items:start!important;gap:8px!important;min-height:38px!important;padding:0!important;background:none!important}
    .header-brand{display:grid!important;grid-template-columns:38px minmax(0,1fr)!important;align-items:center!important;gap:8px!important;min-width:0!important}
    .header-brand>img,.header-brand>.brand-mark,.header-brand>.header-icon,.header-brand>.identity-icon{box-sizing:border-box!important;width:38px!important;height:38px!important;border-radius:9px!important;object-fit:cover!important;overflow:hidden!important}
    .header-copy{min-width:0!important}.header-title-row{display:flex!important;align-items:center!important;gap:6px!important;min-width:0!important}.menu-title{margin:0!important;font:800 15px/1.1 system-ui,sans-serif!important;letter-spacing:.03em!important;white-space:nowrap!important}.menu-subtitle{display:block!important;margin:3px 0 0!important;padding:0!important;border:0!important;text-align:left!important;font:500 9px/1.25 system-ui,sans-serif!important;color:var(--dropper-muted,#a6a6ae)!important}
    .header-version{min-height:18px!important;margin:0!important;padding:2px 6px!important;border-radius:6px!important;font:800 8px/1 system-ui,sans-serif!important}.menu-close{box-sizing:border-box!important;width:30px!important;height:30px!important;min-width:30px!important;margin:0!important;padding:0!important;border-radius:8px!important;font-size:18px!important;line-height:1!important}
    .header-divider{width:100%!important;height:1px!important;margin:7px 0 5px!important;border:0!important;background:linear-gradient(90deg,transparent,var(--dropper-accent,#26d9c7),transparent)!important;opacity:.65!important}
    :host([data-ui-theme="pride"]) .header-divider{height:3px!important;border-radius:2px!important;background:linear-gradient(90deg,#c97b83,#d29a70,#d0c07d,#70a886,#7091b6,#a27ba9)!important;opacity:1!important}
    .menu-toast{position:static!important;box-sizing:border-box!important;width:100%!important;max-width:none!important;margin:0 0 5px!important;padding:7px 8px!important;border-radius:8px!important;font:700 9px/1.35 system-ui,sans-serif!important}.update-notice{box-sizing:border-box!important;margin:0 0 5px!important;padding:8px!important;border-radius:8px!important;font-size:9px!important}
    .dropper-menu-nav{display:block!important;margin:0!important;padding:0!important;overflow:visible!important}.fl-tool-panel{position:relative!important;margin-top:5px!important;border:1px solid var(--dropper-panel-line,#27272d)!important;border-radius:9px!important;background:var(--dropper-panel,#19191e)!important;overflow:visible!important}.fl-tool-header{box-sizing:border-box!important;display:flex!important;align-items:center!important;justify-content:space-between!important;width:100%!important;min-height:29px!important;margin:0!important;padding:5px 8px!important;border:0!important;border-radius:8px!important;background:transparent!important;box-shadow:none!important;color:inherit!important;text-align:left!important;font:750 11px/1.3 system-ui,sans-serif!important;cursor:pointer!important}.fl-tool-header:hover,.fl-tool-header[aria-expanded="true"]{background:color-mix(in srgb,var(--dropper-accent,#26d9c7) 10%,transparent)!important}.fl-tool-title{min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}.fl-tool-chevron{margin-left:auto!important;padding-left:8px!important;color:var(--dropper-muted,#a6a6ae)!important;font-size:12px!important;line-height:1!important}.fl-tool-body{box-sizing:border-box!important;padding:0 8px 8px!important;border:0!important;border-top:1px solid var(--dropper-panel-line,#27272d)!important;border-radius:0 0 8px 8px!important;background:transparent!important;overflow:auto!important;max-height:min(62vh,520px)!important}.fl-tool-body[hidden],.fl-tool-hidden{display:none!important}
    .fl-tool-title{font-size:12px!important;font-weight:700!important}.fl-tool-body{padding:0 10px 8px!important}.fl-tool-body .row,.fl-tool-body .mini-row{box-sizing:border-box!important;min-height:32px!important;padding:6px 0!important}.fl-tool-body .switch,.fl-tool-body [role="switch"]{box-sizing:border-box!important;width:34px!important;height:20px!important;min-width:34px!important;padding:0!important;border-radius:6px!important}.fl-tool-body .switch>span,.fl-tool-body [role="switch"]>span{width:14px!important;height:14px!important;border-radius:4px!important}.fl-tool-body button:not(.switch):not([role="switch"]):not(.exp-theme-swatch),.fl-tool-body select{min-height:28px!important;border-radius:7px!important;font-size:11px!important;font-weight:700!important}.has-tooltip{position:relative!important}.has-tooltip::after{content:attr(data-tip);position:absolute;left:0;top:calc(100% + 4px);width:min(190px,calc(100vw - 48px));max-width:100%;padding:6px 8px;border:1px solid #3b3b44;border-radius:7px;background:#0e0e10;color:#efeff1;box-shadow:0 6px 18px #0007;box-sizing:border-box;font-size:10px;line-height:1.35;white-space:normal;overflow-wrap:anywhere;opacity:0;pointer-events:none;z-index:999;transform:translateY(-2px);transition:.12s opacity,.12s transform}.has-tooltip:hover::after,.has-tooltip:focus-visible::after{opacity:1;transform:translateY(0)}
    .menu-head,.fl-tool-panel,.fl-tool-header,.fl-tool-body{height:auto!important;min-height:0!important}.fl-tool-header{align-items:flex-start!important;padding-top:7px!important;padding-bottom:7px!important}.fl-tool-title{overflow:visible!important;text-overflow:clip!important;white-space:normal!important;overflow-wrap:anywhere!important}.fl-tool-body{max-height:none!important;overflow:visible!important}.fl-tool-body .row,.fl-tool-body .mini-row{height:auto!important;min-height:0!important;align-items:flex-start!important}.fl-tool-body .label,.fl-tool-body .copy strong{overflow:visible!important;text-overflow:clip!important;white-space:normal!important;overflow-wrap:anywhere!important}
  `;
  function installDropperShell(shadow, panel) {
    if (shadow.querySelector('style[data-exp-dropper-shell]')) return;
    EXP.Core.injectStyle(shadow, SHELL_CSS, { expDropperShell: '1' });
    const surface = panel.querySelector('.ward-shell') || panel; surface.classList.add('dropper-menu-surface');
    const head = surface.querySelector(':scope > header, :scope > .head, :scope > .ward-header');
    if (head) {
      head.classList.add('menu-head');
      const brand = head.querySelector('.identity,.brand,.header-brand'); if (brand) brand.classList.add('header-brand');
      const copy = brand?.querySelector('.header-copy,.brand-copy') || brand?.children?.[1]; if (copy) copy.classList.add('header-copy');
      const titleRow = copy?.querySelector('.title-row') || copy?.firstElementChild; if (titleRow) titleRow.classList.add('header-title-row');
      const title = titleRow?.querySelector('h1,h2,h3,strong,.brand-copy'); if (title) title.classList.add('menu-title');
      const subtitle = copy?.querySelector('small,.subtitle'); if (subtitle) subtitle.classList.add('menu-subtitle');
      const version = head.querySelector('.version'); if (version) version.classList.add('header-version');
      const close = head.querySelector('.close'); if (close) close.classList.add('menu-close');
    }
    const divider = surface.querySelector(':scope > .divider,:scope > .header-divider'); if (divider) divider.classList.add('header-divider');
    const notice = surface.querySelector(':scope > .changelog'); if (notice) notice.classList.add('update-notice');
    const toast = shadow.querySelector('.toast'); if (toast) { toast.classList.add('menu-toast'); if (divider) divider.after(toast); }
    const nav = surface.querySelector('nav'); if (nav) nav.classList.add('dropper-menu-nav');
    for (const section of nav?.children || []) {
      section.classList.add('fl-tool-panel'); const control = section.querySelector(':scope > button'); const body = section.querySelector(':scope > div');
      if (!control || !body) continue; control.classList.add('fl-tool-header'); body.classList.add('fl-tool-body');
      let title = control.querySelector('.fl-tool-title'); const existingChevron = control.querySelector('.chevron,.fl-tool-chevron');
      if (!title) { const label = [...control.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim()); if (label) { title = document.createElement('span'); title.className = 'fl-tool-title'; title.textContent = label.textContent.trim(); label.remove(); control.prepend(title); } else if (control.firstElementChild && control.firstElementChild !== existingChevron) { title = control.firstElementChild; title.classList.add('fl-tool-title'); } }
      let chevron = existingChevron; if (!chevron) { chevron = document.createElement('span'); chevron.textContent = '▸'; control.append(chevron); } chevron.classList.add('fl-tool-chevron');
    }
  }
  function attachFloatingNotice(shadow, panel) {
    const notice = shadow.querySelector('.changelog');
    const versionButton = panel.querySelector('.version');
    if (!notice) return { layout() {}, setMenuOpen() {}, destroy() {} };
    if (globalThis.ExtraPotionsCore?.createFloatingNotice) return globalThis.ExtraPotionsCore.createFloatingNotice({ shadow, panel, notice, versionButton, durationMs: 30000, manageVersion: false });
    if (!shadow.querySelector('style[data-exp-floating-notice]')) { EXP.Core.injectStyle(shadow,'.exp-floating-update{position:fixed;z-index:2147483647;box-sizing:border-box;max-width:calc(100vw - 24px);margin:0!important;padding:10px 32px 10px 10px!important;border:1px solid var(--dropper-accent,#6f42b4)!important;border-radius:10px!important;background:linear-gradient(180deg,#251a35,#18181d 70%)!important;color:#f4f4f6!important;box-shadow:0 10px 28px #0008!important;font:500 9px/1.45 system-ui,sans-serif!important}.exp-floating-update[hidden]{display:none!important}.exp-floating-update-dismiss{position:absolute;top:7px;right:7px;width:23px;height:23px;padding:0;border:1px solid transparent;border-radius:7px;background:transparent;color:inherit;cursor:pointer;font:15px/1 Arial,sans-serif}',{expFloatingNotice:'1'}); }
    notice.classList.add('exp-floating-update');notice.setAttribute('role','status');const dismiss=document.createElement('button');dismiss.type='button';dismiss.className='exp-floating-update-dismiss';dismiss.setAttribute('aria-label','Dismiss changelog');dismiss.textContent='×';notice.prepend(dismiss);shadow.append(notice);
    let open=false,timer=0;const hide=()=>{clearTimeout(timer);notice.hidden=true;versionButton?.setAttribute('aria-expanded','false');};const layout=()=>{if(!open||notice.hidden)return;const rect=panel.getBoundingClientRect();if(!rect.width)return;const width=Math.min(rect.width,innerWidth-24);notice.style.width=`${width}px`;notice.style.left=`${Math.max(8,Math.min(innerWidth-width-8,rect.right-width))}px`;const height=notice.offsetHeight||72;const above=rect.top-height-8;notice.style.top=`${above>=8?above:Math.min(innerHeight-height-8,rect.bottom+8)}px`;};const show=()=>{notice.hidden=false;versionButton?.setAttribute('aria-expanded','true');clearTimeout(timer);timer=setTimeout(hide,30000);requestAnimationFrame(layout);};const versionClick=()=>notice.hidden?hide():show();dismiss.addEventListener('click',hide);versionButton?.addEventListener('click',versionClick);addEventListener('resize',layout,{passive:true});return{layout,setMenuOpen(value){open=Boolean(value);if(!open)hide();else requestAnimationFrame(layout);},destroy(){clearTimeout(timer);dismiss.removeEventListener('click',hide);versionButton?.removeEventListener('click',versionClick);removeEventListener('resize',layout);}};
  }
  function installLayoutContract(shadow){if(shadow.querySelector('style[data-exp-layout-contract]'))return;EXP.Core.injectStyle(shadow,'.fl-tool-body .action.warn{border-color:#cb6868!important;background:#402020!important;color:#ffd7d7!important}.fl-tool-body .action.warn:hover{background:#582828!important}.dropper-menu-surface{border:0!important;outline:none!important}.fl-tool-body{overflow:visible!important;max-height:none!important}.fl-tool-body :is(.group,.section){grid-template-columns:minmax(0,1fr)!important}.fl-tool-body :is(.group,.section)>*{grid-column:1/-1!important}.fl-tool-body :is(.row,.identity,.setting-row,.mini-row){align-items:center!important}.fl-tool-body :is(.label,.setting-label,.copy strong,.row-copy strong,.row-copy small){word-break:normal!important;overflow-wrap:normal!important;white-space:normal!important}.fl-tool-body .row:has(>select){display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr)!important;min-width:0!important}.fl-tool-body .row>select{width:100%!important;min-width:0!important;max-width:100%!important}',{expLayoutContract:'1'});}
  function syncLauncherTipPlacement(launcher) {
    if (!launcher) return;
    const rect = launcher.getBoundingClientRect();
    const spaceAbove = rect.top;
    launcher.classList.toggle('tip-below', spaceAbove < 80);
  }
  function create({ id, host, shadow, launcher, panel, getSettings, setOpen, shortcutKey = '' }) {
    installDropperShell(shadow, panel);
    installLayoutContract(shadow);
    const floatingNotice = attachFloatingNotice(shadow, panel);
    const gridTopKey = 'exp:v3:launcher-grid-delta';
    const gridOrderKey = 'exp:v3:launcher-order';
    let open = false; let top = 0; let gridDelta = 0; let dismissTimer = 0; let dismissAt = 0; let destroyed = false;
    function readGridDelta() { try { const value = Number(localStorage.getItem(gridTopKey) || 0); return Number.isFinite(value) ? value : 0; } catch { return 0; } }
    function settings() { return getSettings?.() || {}; }
    function width() { const value = settings().menuWidth; return WIDTHS.has(value) ? value : 'compact'; }
    function clearDismiss() { clearTimeout(dismissTimer); dismissTimer = 0; dismissAt = 0; }
    function scheduleDismiss() {
      clearDismiss();
      if (!open || settings().menuAutoClose === false) return;
      dismissAt = Date.now() + DISMISS_MS;
      dismissTimer = setTimeout(() => { if (open && dismissAt && Date.now() >= dismissAt) setOpen(false, false); }, DISMISS_MS + 20);
    }
    function layout() {
      if (destroyed || !launcher?.isConnected) return;
      host.dataset.menuWidth = width();
      const launcherHeight = launcher.offsetHeight || 48;
      const gridOffset = parseFloat(getComputedStyle(host).getPropertyValue('--exp-launcher-offset')) || 0;
      const gridX = parseFloat(getComputedStyle(host).getPropertyValue('--exp-launcher-x')) || 0;
      const peers = [...document.querySelectorAll('[data-exp-product-launcher="1"]')];
      const minimumDelta = 8 - (innerHeight - launcherHeight - 12);
      gridDelta = Math.max(minimumDelta, Math.min(4, readGridDelta()));
      const origin = innerHeight - launcherHeight - 12 + gridDelta;
      const anchor = origin <= (innerHeight - launcherHeight) / 2 ? 'top' : 'bottom';
      document.documentElement.dataset.expLauncherAnchor = anchor;
      document.documentElement.style.setProperty('--exp-launcher-grid-delta', `${gridDelta}px`);
      top = anchor === 'top' ? origin + gridOffset : origin - gridOffset;
      if (document.documentElement.dataset.expDropperMenuOpen === '1') {
        const menuTop = parseFloat(document.documentElement.style.getPropertyValue('--exp-dropper-menu-top'));
        const products = peers.filter((peer) => peer.dataset.productId !== 'dropper').sort((a,b)=>Number(a.dataset.launcherSlot||0)-Number(b.dataset.launcherSlot||0));
        const index = Math.max(0, products.findIndex((peer) => peer.dataset.productId === id));
        if (Number.isFinite(menuTop)) top = Math.max(8, menuTop - launcherHeight - 8 - Math.floor(index / 3) * 56);
      }
      launcher.style.top = `${top}px`; launcher.style.bottom = 'auto'; launcher.style.right = `${12 + gridX}px`; launcher.style.left = 'auto'; launcher.style.zIndex = '2147483600';
      syncLauncherTipPlacement(launcher);
      panel.style.right = '12px'; panel.style.left = 'auto'; panel.style.zIndex = open ? '2147483647' : '2147483599';
      if (!open) return;
      const panelHeight = panel.offsetHeight || panel.scrollHeight || 280;
      const spaceBelow = innerHeight - top - launcherHeight - 8;
      const spaceAbove = top - 8;
      const openUp = spaceBelow < panelHeight + 12 && spaceAbove >= spaceBelow;
      host.dataset.openDirection = openUp ? 'up' : 'down';
      const panelTop = openUp ? Math.max(8, top - panelHeight - 8) : Math.min(innerHeight - panelHeight - 8, top + launcherHeight + 8);
      panel.style.top = `${Math.max(8, panelTop)}px`; panel.style.bottom = 'auto';
      floatingNotice.layout();
    }
    let startX = 0; let startY = 0; let startGridDelta = 0; let startOrder = []; let dragAxis = ''; let didDrag = false; let activePointerId = null;
    const menuResize = new ResizeObserver(() => { if (open && !destroyed) layout(); });
    menuResize.observe(panel);
    function readOrder() { try { const value=JSON.parse(localStorage.getItem(gridOrderKey)||'[]'); return Array.isArray(value)?value.filter((item)=>typeof item==='string'&&item!=='dropper'):[]; } catch { return []; } }
    function pointerDown(event) { if (event.button !== 0) return; activePointerId=event.pointerId;startX=event.clientX;startY=event.clientY;startGridDelta=readGridDelta();startOrder=readOrder();if(!startOrder.includes(id))startOrder.push(id);dragAxis='';didDrag=false;event.preventDefault(); }
    function pointerMove(event) { if (event.pointerId!==activePointerId) return;const dx=event.clientX-startX,dy=event.clientY-startY;if(!dragAxis&&Math.max(Math.abs(dx),Math.abs(dy))>7)dragAxis=Math.abs(dx)>Math.abs(dy)?'order':'group';if(!dragAxis)return;didDrag=true;event.preventDefault();if(dragAxis==='order'){const from=startOrder.indexOf(id),to=Math.max(0,Math.min(startOrder.length-1,from+Math.round(-dx/56)));const next=[...startOrder];next.splice(from,1);next.splice(to,0,id);try{localStorage.setItem(gridOrderKey,JSON.stringify(next));}catch{}document.dispatchEvent(new CustomEvent('exp-core:coordination',{detail:{type:'launcher-order-changed',productId:id}}));return;}try{localStorage.setItem(gridTopKey,String(startGridDelta+dy));}catch{}document.dispatchEvent(new CustomEvent('exp-core:coordination',{detail:{type:'launcher-grid-moved',productId:id}}));layout(); }
    function pointerUp(event) { if(event.pointerId===activePointerId) activePointerId=null; }
    function blockDraggedClick(event) { if (!didDrag) return; event.preventDefault(); event.stopImmediatePropagation(); didDrag = false; }
    function activity() { if (open) scheduleDismiss(); }
    function keydown(event) {
      if (shortcutKey && event.altKey && event.shiftKey && event.key.toLowerCase() === shortcutKey.toLowerCase() && !event.repeat) { event.preventDefault(); setOpen(!open, true); return; }
      if (event.key === 'Escape' && open) { event.preventDefault(); setOpen(false, true); }
    }
    function syncOnHover() { syncLauncherTipPlacement(launcher); }
    launcher.addEventListener('pointerdown', pointerDown);
    launcher.addEventListener('pointerenter', syncOnHover);
    launcher.addEventListener('focus', syncOnHover);
    document.addEventListener('pointermove', pointerMove, { passive:false });
    document.addEventListener('pointerup', pointerUp);
    document.addEventListener('pointercancel', pointerUp);
    launcher.addEventListener('click', blockDraggedClick, true);
    for (const type of ['pointerdown','click','wheel','keydown','input','change']) panel.addEventListener(type, activity, { passive: type === 'wheel' });
    function gridChanged() { requestAnimationFrame(() => requestAnimationFrame(layout)); }
    document.addEventListener('exp-core:coordination', gridChanged); addEventListener('resize', layout); addEventListener('keydown', keydown);
    requestAnimationFrame(layout);
    return Object.freeze({
      state(value) { open = Boolean(value); floatingNotice.setMenuOpen(open); if (open) scheduleDismiss(); else clearDismiss(); requestAnimationFrame(layout); },
      update() { if (open) scheduleDismiss(); requestAnimationFrame(layout); },
      layout,
      get dismissAt() { return dismissAt; },
      destroy() { destroyed = true; menuResize.disconnect(); clearDismiss(); floatingNotice.destroy(); launcher.removeEventListener('pointerdown', pointerDown); launcher.removeEventListener('pointerenter', syncOnHover); launcher.removeEventListener('focus', syncOnHover); document.removeEventListener('pointermove', pointerMove); document.removeEventListener('pointerup', pointerUp); document.removeEventListener('pointercancel', pointerUp); launcher.removeEventListener('click', blockDraggedClick, true); document.removeEventListener('exp-core:coordination', gridChanged); removeEventListener('resize', layout); removeEventListener('keydown', keydown); }
    });
  }
  return Object.freeze({ create, DISMISS_MS });
})();

/* Shared, local-only diagnostics UI. Vendored by products; never loads remote code. */
EXP.Diagnostics = (() => {
  function createDiagnosticsReport(product, details = {}) {
    const { host, shadow: suppliedShadow, ...data } = details;
    const shadow = suppliedShadow || host?.shadowRoot;
    const count = (selector) => document.querySelectorAll(selector).length;
    const navigation = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource');
    const resourceTypes = {};
    for (const entry of resources) {
      const type = entry.initiatorType || 'other';
      const summary = resourceTypes[type] ||= { count: 0, durationMs: 0, transferBytes: 0 };
      summary.count++; summary.durationMs += Math.round(entry.duration); summary.transferBytes += entry.transferSize || 0;
    }
    const page = {
      origin: location.origin, protocol: location.protocol, readyState: document.readyState,
      contentType: document.contentType, characterSet: document.characterSet, compatibilityMode: document.compatMode,
      language: document.documentElement.lang || null, direction: document.documentElement.dir || 'auto',
      structure: { elements: count('*'), headings: count('h1,h2,h3,h4,h5,h6'), links: count('a[href]'), forms: count('form'), inputs: count('input,select,textarea'), buttons: count('button,[role="button"]'), images: count('img'), videos: count('video'), audio: count('audio'), frames: count('iframe'), scripts: count('script'), stylesheets: document.styleSheets.length },
      layout: { documentWidth: document.documentElement.scrollWidth, documentHeight: document.documentElement.scrollHeight, scrollX, scrollY, horizontalOverflow: document.documentElement.scrollWidth > innerWidth },
      preferences: { reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, darkColorScheme: matchMedia('(prefers-color-scheme: dark)').matches, forcedColors: matchMedia('(forced-colors: active)').matches },
      performance: { navigation: navigation ? { type: navigation.type, durationMs: Math.round(navigation.duration), responseMs: Math.round(navigation.responseEnd), domInteractiveMs: Math.round(navigation.domInteractive), domContentLoadedMs: Math.round(navigation.domContentLoadedEventEnd), loadMs: Math.round(navigation.loadEventEnd), redirectCount: navigation.redirectCount } : null, resources: { count: resources.length, byType: resourceTypes }, paint: performance.getEntriesByType('paint').map(entry => ({ name: entry.name, startMs: Math.round(entry.startTime) })) },
      privacy: { pageText: 'excluded', formValues: 'excluded', urlPathsAndQueries: 'excluded', resourceUrls: 'excluded', cookiesAndStorage: 'excluded; plugin settings supplied separately' }
    };
    const rect = (node) => {
      const box = node.getBoundingClientRect();
      return { width: box.width, height: box.height, x: box.x, y: box.y, visible: Boolean(node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden') };
    };
    return {
      ...data,
      report: `${String(product || 'ExtraPotions')} Diagnostics`, schemaVersion: 2, page,
      generatedAt: new Date().toISOString(),
      environment: { hostname: location.hostname, topLevelContext: window.top === window.self, visibility: document.visibilityState, online: navigator.onLine, language: navigator.language, userAgent: navigator.userAgent, viewport: { width: innerWidth, height: innerHeight, pixelRatio: devicePixelRatio } },
      ui: { mounted: Boolean(host?.isConnected), menuWidth: host?.dataset.menuWidth || null,
        surfaces: [...(shadow?.querySelectorAll('.panel,.ward,#mb-dock,#tdh-tools-dock') || [])].map(rect),
        categories: [...(shadow?.querySelectorAll('.route,.nav-item,.fl-tool-header') || [])].map(node => ({ name: node.textContent.trim(), expanded: node.getAttribute('aria-expanded') })),
        swatches: [...(shadow?.querySelectorAll('.exp-theme-swatch,.mb-theme-dot') || [])].map(node => ({ name: node.getAttribute('aria-label'), selected: node.getAttribute('aria-pressed'), ...rect(node) })) }
    };
  }
  function downloadDiagnostics(report) {
    const name = `${String(report.report || 'Diagnostics').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function createDiagnosticsControls(getReport, notify = () => {}) {
    const box = document.createElement('div'); box.className = 'diagnostics-controls';
    const actions = document.createElement('div'); actions.className = 'button-grid';
    actions.style.cssText = 'display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin:6px 0';
    const add = (label, handler) => { const button = document.createElement('button'); button.type = 'button'; button.className = 'action'; button.textContent = label; button.addEventListener('click', async () => { try { await handler(); } catch { notify('Diagnostics action failed. Please try again.', 'error'); } }); actions.append(button); return button; };
    add('Copy Diagnostics', async () => { const text = JSON.stringify(await getReport(), null, 2); try { await navigator.clipboard.writeText(text); notify('Diagnostics copied.'); } catch { prompt('Copy Diagnostics', text); } });
    const pre = document.createElement('pre'); pre.hidden = true;
    pre.setAttribute('role', 'region'); pre.setAttribute('aria-label', 'Site and plugin diagnostics'); pre.tabIndex = 0;
    pre.style.cssText = 'display:none!important;box-sizing:border-box;width:100%;min-width:0;height:160px;max-height:160px;overflow:auto;overscroll-behavior:contain;padding:8px;margin:6px 0;border:1px solid #45454f;border-radius:7px;background:#0d0f12;color:#e7e7ee;box-shadow:inset 0 2px 6px #0006;white-space:pre-wrap;overflow-wrap:anywhere;font:10px/1.4 monospace';
    const show = add('Show Diagnostics', async () => {
      if (pre.hidden) pre.textContent = JSON.stringify(await getReport(), null, 2);
      pre.hidden = !pre.hidden; pre.style.setProperty('display', pre.hidden ? 'none' : 'block', 'important');
      show.textContent = pre.hidden ? 'Show Diagnostics' : 'Hide Diagnostics';
      show.setAttribute('aria-expanded', String(!pre.hidden));
    });
    show.setAttribute('aria-expanded', 'false');
    box.append(actions, pre); return box;
  }
  return Object.freeze({ createDiagnosticsReport, downloadDiagnostics, createDiagnosticsControls });
})();

EXP.UI = (() => {
  const BADGE_DATA = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiIHJvbGU9ImltZyIgYXJpYS1sYWJlbGxlZGJ5PSJ0aXRsZSBkZXNjIj4KICA8dGl0bGUgaWQ9InRpdGxlIj5TSElGVCBJY29uPC90aXRsZT48ZGVzYyBpZD0iZGVzYyI+QSBjeWFuIGFuZCBjb3JhbCBwaGFzZS1jdXQgZmFjZXRlZCBnZW0gaW4gYSBtYXRjaGluZyBncmFkaWVudCBiYWRnZS48L2Rlc2M+CiAgPGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJiZyIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPjxzdG9wIHN0b3AtY29sb3I9IiMwNzE5MWMiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMxNjBkMTgiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iYm9yZGVyIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agc3RvcC1jb2xvcj0iI2I5ZmZmOSIvPjxzdG9wIG9mZnNldD0iLjQ4IiBzdG9wLWNvbG9yPSIjMjBkOWQzIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZjIzODY4Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+CiAgPHJlY3QgeD0iMzIiIHk9IjMyIiB3aWR0aD0iOTYwIiBoZWlnaHQ9Ijk2MCIgcng9IjE4NSIgZmlsbD0idXJsKCNiZykiLz48cmVjdCB4PSI0MiIgeT0iNDIiIHdpZHRoPSI5NDAiIGhlaWdodD0iOTQwIiByeD0iMTc1IiBmaWxsPSJub25lIiBzdHJva2U9InVybCgjYm9yZGVyKSIgc3Ryb2tlLXdpZHRoPSIyOCIvPgogIDxwb2x5Z29uIHBvaW50cz0iNTQ4LDE4NCA3OTAsMzYwIDc3MCw2NTAgNDc2LDg0MCAyMzAsNjYyIDI1NCwzNjYiIGZpbGw9IiMxNTE1MWQiLz48cG9seWdvbiBwb2ludHM9IjU0OCwxODQgNTQ4LDQxNiAyNTQsMzY2IiBmaWxsPSIjYjlmZmY5Ii8+PHBvbHlnb24gcG9pbnRzPSI1NDgsMTg0IDc5MCwzNjAgNTQ4LDQxNiIgZmlsbD0iIzYyZjVlYyIvPjxwb2x5Z29uIHBvaW50cz0iMjU0LDM2NiA1NDgsNDE2IDQzOCw1MjYgMjMwLDY2MiIgZmlsbD0iIzFjZDVkMSIvPjxwb2x5Z29uIHBvaW50cz0iMjMwLDY2MiA0MzgsNTI2IDQ3Niw4NDAiIGZpbGw9IiMxOTc3ZDUiLz48cG9seWdvbiBwb2ludHM9IjU0OCw0MTYgNzkwLDM2MCA2MDQsNTQ4IDQzOCw1MjYiIGZpbGw9IiNmZmYwYzgiLz48cG9seWdvbiBwb2ludHM9Ijc5MCwzNjAgNzcwLDY1MCA2MDQsNTQ4IiBmaWxsPSIjZmY4YzcyIi8+PHBvbHlnb24gcG9pbnRzPSI3NzAsNjUwIDQ3Niw4NDAgNjA0LDU0OCIgZmlsbD0iI2YyMzg2OCIvPjxwb2x5Z29uIHBvaW50cz0iNDM4LDUyNiA2MDQsNTQ4IDQ3Niw4NDAiIGZpbGw9IiM5MzM1N2QiLz48cG9seWdvbiBwb2ludHM9IjU0OCw0MTYgNjA0LDU0OCA0MzgsNTI2IiBmaWxsPSIjMjkyMTMyIi8+Cjwvc3ZnPgo=';
  const LAUNCHER_DATA = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiIHJvbGU9ImltZyIgYXJpYS1sYWJlbGxlZGJ5PSJ0aXRsZSBkZXNjIj4KICA8dGl0bGUgaWQ9InRpdGxlIj5TSElGVCBMYXVuY2hlciBHZW08L3RpdGxlPjxkZXNjIGlkPSJkZXNjIj5BIGJvcmRlcmxlc3Mgb2Zmc2V0IGNyeXN0YWwgd2l0aCBjeWFuIGFuZCBjb3JhbCBwaGFzZXMgZGl2aWRlZCBieSBhIGRpYWdvbmFsIHNlYW0uPC9kZXNjPgogIDxwb2x5Z29uIHBvaW50cz0iNTQ4LDE4NCA3OTAsMzYwIDc3MCw2NTAgNDc2LDg0MCAyMzAsNjYyIDI1NCwzNjYiIGZpbGw9IiMxNTE1MWQiLz48cG9seWdvbiBwb2ludHM9IjU0OCwxODQgNTQ4LDQxNiAyNTQsMzY2IiBmaWxsPSIjYjlmZmY5Ii8+PHBvbHlnb24gcG9pbnRzPSI1NDgsMTg0IDc5MCwzNjAgNTQ4LDQxNiIgZmlsbD0iIzYyZjVlYyIvPjxwb2x5Z29uIHBvaW50cz0iMjU0LDM2NiA1NDgsNDE2IDQzOCw1MjYgMjMwLDY2MiIgZmlsbD0iIzFjZDVkMSIvPjxwb2x5Z29uIHBvaW50cz0iMjMwLDY2MiA0MzgsNTI2IDQ3Niw4NDAiIGZpbGw9IiMxOTc3ZDUiLz48cG9seWdvbiBwb2ludHM9IjU0OCw0MTYgNzkwLDM2MCA2MDQsNTQ4IDQzOCw1MjYiIGZpbGw9IiNmZmYwYzgiLz48cG9seWdvbiBwb2ludHM9Ijc5MCwzNjAgNzcwLDY1MCA2MDQsNTQ4IiBmaWxsPSIjZmY4YzcyIi8+PHBvbHlnb24gcG9pbnRzPSI3NzAsNjUwIDQ3Niw4NDAgNjA0LDU0OCIgZmlsbD0iI2YyMzg2OCIvPjxwb2x5Z29uIHBvaW50cz0iNDM4LDUyNiA2MDQsNTQ4IDQ3Niw4NDAiIGZpbGw9IiM5MzM1N2QiLz48cG9seWdvbiBwb2ludHM9IjU0OCw0MTYgNjA0LDU0OCA0MzgsNTI2IiBmaWxsPSIjMjkyMTMyIi8+Cjwvc3ZnPgo=';
  const routes = [
    ['appearance', 'Appearance'], ['readability', 'Readability'], ['effects', 'Effects & Integrations'], ['profiles', 'Profiles & Sites'], ['menu', 'Menu & Updates'], ['recovery', 'Recovery & Data']
  ];
  let host;
  let shadow;
  let launcher;
  let panel;
  let content;
  let nav;
  let status;
  let toast;
  let chrome;
  let toastTimer;
  let currentRoute = '';
  let lastRoute = '';
  let saved;
  let open = false;
  let onApply;
  let onSettings;
  let launcherCleanup;
  let menuThemeStyle;
  let swatchStyle;
  let updateNotice;
  let updateTimer;
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
    clearTimeout(updateTimer);
    updateTimer = null;
    if (updateNotice) updateNotice.hidden = true;
    chrome?.update();
  }

  function showUpdateNotice({ kicker = "What's New", title = 'SHIFT Updated', version = EXP.VERSION, text = '', details = [], available = false } = {}) {
    if (!updateNotice) return;
    updateNotice.querySelector('.update-kicker').textContent = kicker;
    updateNotice.querySelector('.update-title').textContent = title;
    updateNotice.querySelector('.update-version').textContent = version ? `v${version}` : '';
    updateNotice.querySelector('.update-text').textContent = text;
    const list = updateNotice.querySelector('.update-list');
    list.replaceChildren();
    for (const detail of details.slice(0, 4)) list.append(el('li', {}, detail));
    list.hidden = !details.length;
    const install = updateNotice.querySelector('.update-action');
    install.hidden = !available;
    install.href = 'https://raw.githubusercontent.com/ExtraPotions/SHIFT/main/shift.user.js';
    updateNotice.hidden = false;
    updateNotice.style.display = 'block';
    updateNotice.style.right = launcher?.style.right || '12px';
    const top = parseFloat(launcher?.style.top);
    if (Number.isFinite(top)) {
      const estimated = updateNotice.offsetHeight || 190;
      updateNotice.style.top = Math.max(8, Math.min(innerHeight - estimated - 8, top - estimated - 8)) + 'px';
      updateNotice.style.bottom = 'auto';
    }
    chrome?.update();
    clearTimeout(updateTimer);
    updateTimer = setTimeout(hideUpdateNotice, 30000);
    chrome?.update();
  }

  async function checkUpdateNotice(force = false) {
    const result = await EXP.Updates.check(force);
    launcher?.classList.toggle('update-available', Boolean(result.available));
    if (result.available) showUpdateNotice({
      kicker: 'Update Available',
      title: 'New SHIFT Version Available',
      version: result.latest,
      text: `v${result.latest} is ready to install.`,
      details: ['A newer SHIFT build is available.', 'Install the latest userscript for the newest fixes and improvements.'],
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

  function applyMenuTheme(state) {
    if (!host || !shadow) return;
    const resolved = EXP.Themes.resolve(state.theme, state.accent, state);
    const theme = resolved.original ? { page:'#101719', surface:'#182326', raised:'#213034', text:'#f2f8f7', muted:'#b8c9c7', accent:'#26d9c7' } : resolved;
    const vars = { bg:theme.page, surface:theme.surface, raised:theme.raised, text:theme.text, muted:theme.muted, border:theme.muted, teal:theme.accent,
      'dropper-bg':theme.page, 'dropper-panel':theme.surface, 'dropper-panel-line':theme.raised, 'dropper-text':theme.text, 'dropper-muted':theme.muted, 'dropper-accent':theme.accent,
      'exp-notice-border':theme.accent, 'exp-notice-top':theme.surface, 'exp-notice-bottom':theme.page, 'exp-notice-text':theme.text };
    const edge = resolved.pageEdge;
    const prideMenu = Boolean(edge) && (state.theme === 'pride' || resolved.id === 'pride');
    if (host) host.dataset.uiTheme = prideMenu ? 'pride' : (resolved.id || state.theme || '');
    const divider = prideMenu
      ? edge
      : `linear-gradient(90deg,transparent,color-mix(in srgb,${theme.accent} 70%,transparent) 22%,${theme.accent} 50%,color-mix(in srgb,${theme.accent} 70%,transparent) 78%,transparent)`;
    const menuEdge = !edge ? `.header-divider{height:1px!important;margin:5px 0!important;background:${divider}!important}` : prideMenu
      ? `.dropper-menu-surface{border:2px solid transparent!important;background-color:var(--dropper-bg,#111114)!important;background-image:linear-gradient(var(--dropper-bg,#111114),var(--dropper-bg,#111114)),${edge}!important;background-origin:border-box!important;background-clip:padding-box,border-box!important}.launcher{border:2px solid transparent!important;background-image:linear-gradient(#18181b,#18181b),${edge}!important;background-origin:border-box!important;background-clip:padding-box,border-box!important}.header-divider{background:${edge}!important;opacity:1!important;height:3px!important;border-radius:2px!important}.version{border-color:transparent!important;background:${edge}!important;color:#211826!important}.route[aria-current="page"],.fl-tool-header[aria-expanded="true"]{background-image:linear-gradient(90deg,#c97b832e,#d0c07d1f,#7091b62e,#a27ba92e),linear-gradient(180deg,#c97b83,#d29a70,#d0c07d,#70a886,#7091b6,#a27ba9)!important;background-size:100% 100%,3px 100%!important;background-repeat:no-repeat!important;background-position:0 0,0 0!important}`
      : `.dropper-menu-surface{background:${edge} top / 100% 5px no-repeat,var(--dropper-bg,#111114)!important}.header-divider{height:1px!important;margin:5px 0!important;background:${divider}!important}`;
    const css = `:host{${Object.entries(vars).map(([key, value]) => `--${key}:${value}`).join(';')}}${menuEdge}`;
    if (menuThemeStyle) menuThemeStyle.textContent = css;
    else menuThemeStyle = EXP.Core.injectStyle(shadow, css, { expShiftMenuTheme: '1' });
  }

  function commit(patch, reason = 'appearance', message = 'Appearance updated.') {
    saved = onSettings({ ...saved, ...patch }, reason);
    renderRoute();
    setMessage(message);
  }
  function appearanceSwatches() {
    const presets = [
      { id:'warm', name:'Warm charcoal', theme:'warm', accent:'warm', swatch:'linear-gradient(135deg,#3c3428 46%,#c8953b 46%)' },
      { id:'discord', name:'Graphite', theme:'discord', accent:'discord', swatch:'linear-gradient(135deg,#3a3c44 46%,#5865f2 46%)' },
      { id:'midnight', name:'Midnight', theme:'midnight', accent:'midnight-default', swatch:'linear-gradient(135deg,#1a2840 46%,#7ec8ff 46%)' },
      { id:'contrast', name:'High contrast', theme:'obsidian', accent:'contrast-default', swatch:'linear-gradient(135deg,#0a0a0a 46%,#ffffff 46%)' },
      { id:'pine', name:'Pine', theme:'pine', accent:'pine-default', swatch:'linear-gradient(135deg,#1e3a30 46%,#5dbe72 46%)' },
      { id:'ember', name:'Ember', theme:'ember', accent:'ember-default', swatch:'linear-gradient(135deg,#3c2424 46%,#e05a5a 46%)' },
      { id:'pride', name:'Pride', theme:'pride', accent:'pride-default', swatch:'linear-gradient(135deg,#2b1f32 0%,#c97b83 16.6%,#d29a70 33.3%,#d0c07d 50%,#70a886 66.6%,#7091b6 83.3%,#a27ba9 100%)' },
      { id:'shift', name:'SHIFT gem', theme:'shift', accent:'teal', swatch:'linear-gradient(135deg,#b9fff9 0 34%,#20d9d3 34% 67%,#f23868 67%)' }
    ];
    const custom = saved.customThemes.map((theme) => ({ id:`custom:${theme.id}`, name:theme.name, theme:theme.id, accent:saved.accent, swatch:`linear-gradient(135deg,${theme.page} 50%,${theme.text} 50%)` }));
    const choices = [...presets, ...custom];
    const matched = choices.find((item) => item.theme === saved.theme && item.accent === saved.accent);
    const current = matched?.id || (saved.theme === 'original' ? '' : `current:${saved.theme}:${saved.accent}`);
    if (current && !choices.some((item) => item.id === current)) { const resolved=EXP.Themes.resolve(saved.theme,saved.accent,saved);choices.push({id:current,name:'Current imported palette',theme:saved.theme,accent:saved.accent,swatch:`linear-gradient(135deg,${resolved.page||'#171918'} 50%,${resolved.accent} 50%)`}); }
    const line=row('Palette','One swatch selects the theme and accent together.');line.classList.add('palette-row');const dots=el('div',{class:'exp-theme-swatches'});const options={container:dots,themes:choices,value:current,onChange:(id)=>{const choice=choices.find((item)=>item.id===id);if(choice)commit({theme:choice.theme,accent:choice.accent},'theme-swatch',`${choice.name} applied.`);}};
    const swatchCss = choices.map((theme) => `.exp-theme-swatch[data-swatch="${theme.id}"]{background:${theme.swatch}}`).join('');
    if (swatchStyle) swatchStyle.textContent = swatchCss;
    else swatchStyle = EXP.Core.injectStyle(shadow, swatchCss, { expShiftSwatches: '1' });
    if(globalThis.ExtraPotionsCore?.createThemeSwatches)globalThis.ExtraPotionsCore.createThemeSwatches(options);else for(const theme of choices){const dot=el('button',{type:'button',class:`exp-theme-swatch${theme.id===current?' is-on':''}`,'aria-label':theme.name,'aria-pressed':String(theme.id===current),'data-swatch':theme.id});dot.title=theme.name;dot.addEventListener('click',()=>options.onChange(theme.id));dots.append(dot);}line.append(dots);return line;
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
    surfaces.append(selectControl('Surface Intelligence', 'Classification depth after host CSS. Off still paints html, body, and app shells.', saved.surfaceLevel, [['off', 'Off'], ['conservative', 'Conservative'], ['balanced', 'Balanced'], ['aggressive', 'Aggressive']], (surfaceLevel) => commit({ surfaceLevel }, 'surface-level', `Surface intelligence set to ${surfaceLevel}.`)));
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
    chromeGroup.append(selectControl('Menu width', 'Dropper-style Full, Compact, or Narrow layout.', state.menuWidth, [['full', 'Full'], ['compact', 'Compact'], ['narrow', 'Narrow']], (menuWidth) => { onSettings({ ...state, menuWidth }, 'menu-width'); chrome?.update(); setMessage(`Menu width set to ${menuWidth}.`); }));
    chromeGroup.append(switchControl('Automatic menu close', 'Close after 15 seconds without menu activity.', state.menuAutoClose, (menuAutoClose) => { onSettings({ ...state, menuAutoClose }, 'menu-auto-close'); chrome?.update(); setMessage(menuAutoClose ? 'Automatic close enabled.' : 'Automatic close disabled.'); }));
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
    const group = section('Recovery', 'Measured locally; page text is never copied.');
    group.append(actionRow(`${health.mode} · ${health.owned} surfaces`, `${health.scanned} scanned in ${health.batches} batches; last ${health.lastDurationMs} ms.`, () => { EXP.Engine.scan(); setMessage('Scan scheduled.'); }, 'Quick scan'));
    group.append(actionRow('Full coverage scan', 'Inspect up to 5,000 eligible containers in bounded batches.', () => { EXP.Engine.fullScan(); setMessage('Full scan complete; health measurements updated.'); renderRoute(); }, 'Full scan'));
    group.append(switchControl('Safe Mode', 'Suspend transformations and adapters while preserving configuration.', state.safeMode, (safeMode) => { onSettings({ ...state, safeMode }, 'safe-mode'); setMessage(safeMode ? 'Safe Mode active.' : 'Safe Mode disabled.'); }));
    group.append(EXP.Diagnostics.createDiagnosticsControls(() => EXP.Diagnostics.createDiagnosticsReport('SHIFT', { host, product: { id:'shift', version: EXP.VERSION }, settings: EXP.Settings.exportData(), mode: EXP.Engine.health(), adapter: EXP.Adapters.health(), updates: EXP.Updates.status(), core: EXP.Core.diagnosticSnapshot() }), setMessage));
    fragment.append(group);
    const data = section('Data', 'Imports validate ownership and schema before replacing settings.');
    data.append(actionRow('Export SHIFT settings', 'Local JSON file; no upload.', () => download('shift-v3-settings.json', JSON.stringify(EXP.Settings.exportData(), null, 2)), 'Export'));
    const importRow = row('Import SHIFT settings', 'Invalid files leave current settings unchanged.');
    const input = el('input', { type: 'file', accept: 'application/json,.json', 'aria-label': 'Import SHIFT settings' });
    input.hidden = true;
    input.addEventListener('change', async () => { try { const payload = JSON.parse(await input.files[0].text()); const next = EXP.Settings.importData(payload); saved = structuredClone(next); onApply(next); renderRoute(); setMessage('Settings imported.'); } catch (error) { setMessage(error.message, 'error'); } });
    importRow.append(button('Import', () => input.click(), 'action'), input); data.append(importRow);
    data.append(actionRow('Reset SHIFT', 'Deletes SHIFT V3 settings, profiles, and site overrides only.', () => {
      if (!confirm('Reset all SHIFT V3 configuration?')) return;
      const next = EXP.Settings.replace(EXP.Settings.defaults, 'product-reset'); saved = structuredClone(next); onApply(next); renderRoute(); setMessage('SHIFT reset complete.');
    }, 'Reset'));
    fragment.append(data);
    return fragment;
  }

  function download(name, value) {
    const url = URL.createObjectURL(new Blob([value], { type: 'application/json' }));
    const link = el('a', { href: url, download: name }); link.click(); setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function renderRoute() {
    if (!nav) return;
    applyMenuTheme(EXP.Settings.effective());
    const renderers = { appearance: renderAppearance, readability: renderReadability, effects: renderEffects, profiles: renderProfilesSites, menu: renderMenuUpdates, recovery: renderRecoveryData };
    for (const item of nav.querySelectorAll('[data-route]')) {
      const active = item.dataset.route === currentRoute;
      if (active) lastRoute = currentRoute;
      item.classList.toggle('last-opened', item.dataset.route === lastRoute);
      item.setAttribute('aria-expanded', String(active));
      item.setAttribute('aria-current', active ? 'page' : 'false');
      item.querySelector('.chevron')?.replaceChildren(document.createTextNode(active ? '⌄' : '›'));
      const body = item.parentElement.querySelector('.route-body');
      body.hidden = !active;
      if (active) { content = body; body.replaceChildren(renderers[currentRoute]()); }
      else body.replaceChildren();
    }
    chrome?.update();
  }

  function setOpen(value, focus = true) {
    open = Boolean(value); panel.hidden = !open; launcher.setAttribute('aria-expanded', String(open));
    chrome?.state(open);
    if (open) { currentRoute='';renderRoute(); chrome?.layout(); requestAnimationFrame(() => { chrome?.layout(); if (focus) EXP.Core.focusMenuSurface(panel); }); }
    else if (focus) launcher.focus();
  }
  function applyPosition() { if (host) host.dataset.position = 'automatic-end-bottom'; }
  function build(initial, callbacks) {
    if (window.top !== window.self) return { update() {}, toggle() {}, destroy() {} };
    saved = structuredClone(initial); onApply = callbacks.apply; onSettings = callbacks.settings;
    host = el('div', { id: 'exp-shift-root', 'data-exp-owned': '1' });
    shadow = host.attachShadow({ mode: 'open' });
    applyPosition(initial.launcherPosition);
    EXP.Core.injectStyle(shadow, STYLE + '.fl-tool-body .diagnostics-controls .action{font-size:10px!important;padding:4px!important;min-height:28px!important;line-height:1.2!important}.palette-row{display:block!important}.palette-row>.copy{margin-bottom:7px}.palette-row>.exp-theme-swatches{width:100%;justify-content:flex-start}.profile-actions{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px;padding:8px 0}.profile-actions>*{min-width:0}.status{display:none}');
    launcher = el('button', { type: 'button', class: 'launcher', 'aria-label': 'Open SHIFT. Drag to move.', 'data-help': 'Drag To Move · Click To Open SHIFT', 'aria-expanded': 'false', 'aria-controls': 'shift-panel' });
    launcher.innerHTML='<svg class="launcher-ring" viewBox="0 0 36 36" aria-hidden="true"><rect class="launcher-track" x="3" y="3" width="30" height="30" rx="9"></rect><rect class="launcher-fill" x="3" y="3" width="30" height="30" rx="9" pathLength="100" stroke-dasharray="100 100"></rect></svg>';
    launcher.append(el('img', { class: 'launcher-icon', src: LAUNCHER_DATA, alt: '' }));
    launcher.addEventListener('click', () => setOpen(!open));
    panel = el('div', { id: 'shift-panel', class: 'panel', role: 'dialog', 'aria-modal': 'false', 'aria-label': 'SHIFT settings', hidden: true });
    const header = el('header', { class: 'menu-head' });
    const identity = el('div', { class: 'identity header-brand' });
    const copy = el('div', { class: 'header-copy' });
    const titleRow = el('div', { class: 'header-title-row' });
    titleRow.append(el('strong', { class: 'brand-copy menu-title' }, 'SHIFT'));
    const version = button(`v${EXP.VERSION}`, () => {
      const notice = shadow.querySelector('.changelog');
      notice.hidden = !notice.hidden;
      if (!notice.hidden) {
        hideUpdateNotice();
        const panelRect = panel.getBoundingClientRect();
        const launcherRect = launcher.getBoundingClientRect();
        const noticeHeight = notice.offsetHeight || 180;
        const anchorTop = open && panelRect.height ? panelRect.top : launcherRect.top;
        notice.style.right = Math.max(12, innerWidth - (open && panelRect.width ? panelRect.right : launcherRect.right)) + 'px';
        notice.style.top = Math.max(8, anchorTop - noticeHeight - 8) + 'px';
        notice.style.bottom = 'auto';
      }
      chrome?.update();
    }, 'version');
    version.setAttribute('aria-label', `View SHIFT v${EXP.VERSION} Changelog`);
    version.title = 'View Changelog';
    titleRow.append(version); copy.append(titleRow, el('div', { class: 'subtitle menu-subtitle' }, 'Adaptive themes and readability'));
    const headerIcon = el('div', { class: 'header-icon', 'aria-hidden': 'true' });
    headerIcon.append(el('img', { src: BADGE_DATA, alt: '' }));
    identity.append(headerIcon, copy);
    header.append(identity, button('×', () => setOpen(false), 'close'));
    const changelog = el('div', { class: 'changelog', hidden: true });
    changelog.append(EXP.ReleaseNotes.renderChangelog(EXP.VERSION));
    const changelogFooter = el('div', { class: 'update-footer changelog-footer' });
    const changelogRelease = el('a', { class: 'update-release', href: 'https://github.com/ExtraPotions/SHIFT/releases', target: '_blank', rel: 'noopener noreferrer' }, 'GitHub Release');
    changelogFooter.append(changelogRelease);
    changelog.append(changelogFooter);
    updateNotice = el('div', { class: 'update-notice', hidden: true });
    updateNotice.innerHTML = '<button type="button" class="update-dismiss" aria-label="Dismiss Update Notice">×</button><div class="update-head"><div class="update-heading"><div class="update-kicker">What\'s New</div><div class="update-title"></div></div><div class="update-version"></div></div><div class="update-text"></div><ul class="update-list"></ul><div class="update-footer"><a class="update-release" href="https://github.com/ExtraPotions/SHIFT/releases" target="_blank" rel="noopener noreferrer">GitHub Release</a><a class="update-action" href="#" target="_blank" rel="noopener noreferrer">Install Update</a></div>';
    updateNotice.querySelector('.update-dismiss').addEventListener('click', hideUpdateNotice);
    nav = el('nav', { 'aria-label': 'SHIFT sections' });
    for (const [id, label] of routes) {
      const item = button('', () => { currentRoute = currentRoute === id ? '' : id; renderRoute(); }, 'nav-item');
      item.dataset.route = id; item.append(el('span', {}, label), el('span', { class: 'chevron', 'aria-hidden': 'true' }, '›'));
      const section = el('section', { class: 'tool-panel' });
      section.append(item, el('div', { class: 'route-body', hidden: true })); nav.append(section);
    }
    status = el('div', { class: 'status', role: 'status', 'aria-live': 'polite' }, 'Original appearance is active.');
    toast = el('div', { class: 'toast', role: 'status', 'aria-live': 'polite', hidden: true });
    panel.append(header, el('div', { class: 'header-divider' }), status, nav); shadow.append(panel, updateNotice, changelog, launcher, toast);
    chrome = EXP.MenuChrome.create({ id: 'shift', host, shadow, launcher, panel, getSettings: () => EXP.Settings.snapshot(), setOpen, shortcutKey: 's' });
    document.documentElement.append(host);
    applyMenuTheme(EXP.Settings.effective());
    launcherCleanup = EXP.Core.registerLauncher(host, { productId: 'shift', priority: 100 });
    try {
      const previous = localStorage.getItem(lastVersionKey);
      if (previous && previous !== EXP.VERSION) showUpdateNotice({ kicker:'Update Complete', title:'SHIFT Updated', version:EXP.VERSION, text:`Updated from v${previous} to v${EXP.VERSION}.`, details:EXP.ReleaseNotes.forVersion(EXP.VERSION) });
      localStorage.setItem(lastVersionKey, EXP.VERSION);
    } catch {}
    if (initial.updateNotifications) checkUpdateNotice(false).catch((error) => EXP.Core.safeError(error, 'shift-update-ui'));
    const outside = (event) => { if (open && !event.composedPath().includes(host)) setOpen(false, false); };
    document.addEventListener('pointerdown', outside, true);
    shadow.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && open) { event.preventDefault(); setOpen(false); }
      if (event.key === 'Tab' && open) { const focusable = [...panel.querySelectorAll('button:not([disabled]),select:not([disabled]),input:not([disabled]),a[href]')].filter((node) => !node.closest('[hidden]')); if (!focusable.length) return; const first = focusable[0], last = focusable.at(-1), active = shadow.activeElement; if (active === panel) { event.preventDefault(); (event.shiftKey ? last : first).focus(); } else if (event.shiftKey && active === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && active === last) { event.preventDefault(); first.focus(); } }
    });
    return {
      update(next) { saved = structuredClone(next); applyPosition(next.launcherPosition); applyMenuTheme(EXP.Settings.effective()); if (open) renderRoute(); chrome?.update(); },
      toggle() { setOpen(!open); },
      destroy() { clearTimeout(toastTimer); clearTimeout(updateTimer); document.removeEventListener('pointerdown', outside, true); chrome?.destroy(); launcherCleanup?.(); host.remove(); host = shadow = launcher = panel = content = nav = status = toast = chrome = menuThemeStyle = swatchStyle = null; },
    };
  }

  const STYLE = `
    :host{all:initial;position:fixed!important;inset:0 auto auto 0!important;display:block!important;width:0!important;height:0!important;min-width:0!important;min-height:0!important;max-width:0!important;max-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:visible!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;z-index:2147483647!important;transform:none!important;translate:none!important;rotate:none!important;scale:none!important;filter:none!important;backdrop-filter:none!important;clip:auto!important;clip-path:none!important;contain:none!important;content-visibility:visible!important;isolation:isolate!important;mix-blend-mode:normal!important;--bg:#101719;--surface:#182326;--raised:#213034;--text:#f2f8f7;--muted:#b8c9c7;--border:#526462;--teal:#26d9c7;--coral:#ff6577;--exp-notice-border:#26d9c7;--exp-notice-top:#182326;--exp-notice-bottom:#101719;--exp-notice-text:#f2f8f7;font:14px/1.35 ui-sans-serif,system-ui,-apple-system,sans-serif;color:var(--text)}
    :host .exp-floating-update{border-color:var(--exp-notice-border)!important;background:linear-gradient(180deg,var(--exp-notice-top),var(--exp-notice-bottom) 70%)!important;color:var(--exp-notice-text)!important}
    *,*::before,*::after{box-sizing:border-box}button,select,input{font:inherit}.launcher{position:fixed;z-index:2147483600;right:12px;bottom:calc(12px + var(--exp-launcher-offset,0px));display:grid;place-items:center;width:48px;height:48px;padding:0;border:1px solid color-mix(in srgb,var(--teal) 48%,var(--border));border-radius:12px;background:var(--surface);box-shadow:inset 0 0 0 1px color-mix(in srgb,#000 22%,transparent),0 8px 30px #0007;cursor:grab;touch-action:none;overflow:visible}.launcher::before{content:attr(data-help);position:absolute;right:0;bottom:calc(100% + 7px);width:max-content;max-width:200px;padding:5px 8px;border:1px solid #3a3d48;border-radius:7px;background:#101116;color:#f2f8f7;font:700 9px/1.3 system-ui;opacity:0;visibility:hidden;transform:translateY(2px);pointer-events:none;transition:.12s opacity .35s,.12s transform .35s;white-space:normal}.launcher:hover::before,.launcher:focus-visible::before{opacity:1;visibility:visible;transform:none}.launcher.tip-below::before{bottom:auto!important;top:calc(100% + 7px)!important;transform:translateY(-2px)!important;}.launcher.tip-below:hover::before,.launcher.tip-below:focus-visible::before{transform:none}.launcher:hover,.launcher[aria-expanded="true"]{border-color:var(--teal);background:var(--raised)}.launcher:active{cursor:grabbing}.launcher-ring{position:absolute;top:50%;left:50%;width:40px;height:40px;transform:translate(-50%,-50%)}.launcher-track{fill:none;stroke:#303038;stroke-width:3}.launcher-fill{fill:none;stroke:var(--teal);stroke-width:3;stroke-linecap:round;transform:rotate(-90deg);transform-origin:18px 18px}.launcher-icon{position:relative;z-index:1;width:24px;height:24px;pointer-events:none;object-fit:contain}.launcher:focus-visible{outline:2px solid #fff;outline-offset:2px}
    .panel{position:fixed;z-index:2147483599;right:12px;bottom:calc(68px + var(--exp-launcher-offset,0px));width:min(312px,calc(100vw - 24px));max-height:calc(100vh - 16px);padding:9px;border:1px solid var(--border);border-radius:14px;background:var(--bg);color:var(--text);box-shadow:0 18px 50px #000b;overflow:auto;scrollbar-width:none}.panel::-webkit-scrollbar,nav::-webkit-scrollbar,.route-body::-webkit-scrollbar{display:none}.panel[hidden],.changelog[hidden],.route-body[hidden],.toast[hidden]{display:none}:host([data-menu-width="compact"]) .panel{width:min(260px,calc(100vw - 24px))}:host([data-menu-width="narrow"]) .panel{width:min(220px,calc(100vw - 24px))}
    header{min-height:46px;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:start;gap:8px;padding:7px 8px;background:linear-gradient(110deg,#162325,#25202a)}.identity{display:grid;grid-template-columns:38px minmax(0,1fr);align-items:center;gap:8px;min-width:0}.header-icon{width:38px;height:38px;display:grid;place-items:center;background:transparent;border:0;box-shadow:none}.header-icon img{width:38px;height:38px;display:block;object-fit:contain}.brand-copy{font-size:14px;font-weight:900;letter-spacing:.12em;overflow:hidden;text-overflow:ellipsis}.version,.close,.action,.primary,.secondary{min-height:30px;padding:5px 8px;border:1px solid var(--border);border-radius:8px;background:var(--raised);color:var(--text);cursor:pointer}.version{font-size:11px;color:var(--muted)}.close{width:30px;padding:0;font-size:20px;line-height:1}.close:focus-visible,.version:focus-visible,.action:focus-visible,.primary:focus-visible,.secondary:focus-visible,.nav-item:focus-visible,select:focus-visible,input:focus-visible,.switch:focus-visible{outline:2px solid var(--teal);outline-offset:2px}.primary{background:var(--teal);border-color:var(--teal);color:#071313;font-weight:800}.secondary{background:transparent}.subtitle,.changelog,.status{padding:6px 9px;border-top:1px solid #ffffff18;color:var(--muted);font-size:11px}.changelog{position:fixed;z-index:2147483647;width:min(312px,calc(100vw - 24px));right:12px;bottom:68px;margin:0;padding:10px;color:var(--text);background:linear-gradient(180deg,color-mix(in srgb,var(--surface) 88%,var(--teal) 12%),var(--bg) 76%);border:1px solid color-mix(in srgb,var(--teal) 62%,var(--border));border-radius:10px;margin:0 8px 8px;padding:10px}.update-notice{position:fixed;z-index:2147483647;width:min(312px,calc(100vw - 24px));right:12px;bottom:68px;margin:0;padding:10px;border:1px solid color-mix(in srgb,var(--teal) 62%,var(--border));border-radius:10px;background:linear-gradient(180deg,color-mix(in srgb,var(--surface) 88%,var(--teal) 12%),var(--bg) 76%);color:var(--text);box-shadow:0 10px 28px #0008}.update-notice[hidden]{display:none}.update-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding-right:22px}.update-kicker{margin-bottom:2px;color:var(--teal);font-size:8px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.update-title{font-size:12px;font-weight:850}.update-version{flex:none;padding:2px 6px;border:1px solid color-mix(in srgb,var(--teal) 62%,var(--border));border-radius:999px;background:color-mix(in srgb,var(--surface) 82%,var(--teal) 18%);font-size:8px;font-weight:800}.update-text{margin-top:6px;font-size:9px;line-height:1.45;color:var(--muted)}.update-list{margin:7px 0 0;padding-left:15px;max-height:86px;overflow:auto;font-size:9px;line-height:1.4}.update-list li::marker{color:var(--teal)}.update-footer{display:flex;justify-content:flex-end;gap:6px;margin-top:8px;padding-top:7px;border-top:1px solid var(--border)}.update-action,.update-release,.update-dismiss{border:1px solid var(--border);border-radius:7px;background:var(--surface);color:var(--text);cursor:pointer}.update-action,.update-release{min-height:27px;padding:5px 10px;font-size:9px;font-weight:800;text-decoration:none}.update-action{border-color:var(--teal);background:color-mix(in srgb,var(--surface) 68%,var(--teal) 32%)}.update-dismiss{position:absolute;top:7px;right:7px;width:23px;height:23px;padding:0;border-color:transparent;background:transparent;font-size:15px}.update-action[hidden],.update-release[hidden]{display:none}.changelog-version{display:block;margin:0 0 4px;font-size:10px;font-weight:800;color:var(--text)}.changelog-list{margin:0;padding:0 0 0 14px;font-size:9px;line-height:1.45;color:var(--muted)}.changelog-list li+li{margin-top:3px}.status{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.status[data-kind="error"],.toast[data-kind="error"]{color:#ffabb5}
    nav{padding:0;overflow:auto;scrollbar-width:none}.nav-item{display:flex;align-items:center;justify-content:space-between;width:100%;min-height:36px;margin-top:5px;padding:7px 9px;border:1px solid #334548;border-radius:9px;background:var(--surface);color:var(--muted);text-align:left;cursor:pointer}.nav-item:hover{background:#ffffff0b;color:var(--text)}.nav-item[aria-current="page"]{border-color:var(--teal);background:var(--raised);color:var(--text);box-shadow:inset 3px 0 var(--teal)}.chevron{font-size:16px;line-height:1;color:var(--muted)}.nav-item[aria-expanded="true"] .chevron{color:var(--teal)}.route-body{padding:0 10px 9px;border:1px solid #334548;border-top:0;border-radius:0 0 9px 9px;background:#121d20;overflow:auto}.group{margin:7px 0 0;border:1px solid var(--border);border-radius:9px;background:var(--surface);overflow:visible}.group h3{margin:0;padding:5px 8px;border-bottom:1px solid var(--border);border-radius:8px 8px 0 0;font-size:11px}.row{display:flex;align-items:center;gap:7px;min-height:32px;padding:5px 8px;border-top:1px solid #ffffff12}.group h3+.row{border-top:0}.copy{display:flex;min-width:0;flex:1;flex-direction:column}.label{overflow:hidden;text-overflow:ellipsis;font-size:11px;font-weight:700;white-space:nowrap}.row select,.row input[type="text"]{width:96px;min-width:0;min-height:28px;padding:4px 6px;border:1px solid var(--border);border-radius:7px;background:var(--raised);color:var(--text);font-size:11px;font-weight:700}
    .nav-item.last-opened{box-shadow:inset 3px 0 0 var(--teal)}
    .switch{position:relative;width:34px;height:20px;flex:0 0 34px;padding:0;border:1px solid color-mix(in srgb,var(--border) 88%,var(--muted) 12%);border-radius:6px;background:color-mix(in srgb,var(--bg) 84%,var(--surface) 16%);box-shadow:inset 0 1px 0 rgba(255,255,255,.018);cursor:pointer;transition:.15s background,.15s border-color}.switch span{display:block;position:absolute;top:2px;left:2px;width:14px;height:14px;box-sizing:border-box;border:0;border-radius:4px;background:color-mix(in srgb,var(--muted) 82%,var(--text) 18%);box-shadow:none;transition:.15s transform,.15s background}.switch[aria-checked="true"]{border-color:color-mix(in srgb,var(--border) 52%,var(--teal) 48%);background:color-mix(in srgb,var(--surface) 72%,var(--teal) 28%)}.switch[aria-checked="true"] span{transform:translateX(14px);background:var(--text)}.exp-theme-swatches{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.exp-theme-swatch{appearance:none;width:18px;height:18px;min-width:18px;padding:0;border:2px solid var(--border);border-radius:4px;cursor:pointer}.exp-theme-swatch.is-on{border-color:var(--text);box-shadow:0 0 0 2px var(--teal)}.workspace-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:8px 0}.workspace-actions .secondary:first-child{grid-column:1/-1}.workspace-actions button{width:100%;font-size:11px}.action{max-width:94px;font-size:11px}.toast{position:fixed;z-index:2147483601;right:16px;bottom:76px;width:min(300px,calc(100vw - 24px));padding:9px 10px;border:1px solid var(--border);border-radius:10px;background:#172326;color:var(--text);box-shadow:0 10px 34px #000a;font:12px/1.35 ui-sans-serif,system-ui,-apple-system,sans-serif}.toast[data-kind="error"]{border-color:var(--coral)}input[type="file"]{max-width:105px;color:var(--muted);font-size:10px}
    .group{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:stretch}.group>h3{grid-column:1/-1}.group>.row{grid-column:1/-1;min-width:0}.group>.row:has(>select,>.switch){grid-column:auto}.group>.row:has(input[type="file"],textarea,pre),.group>pre,.group>.empty{grid-column:1/-1}.group>.row input[type="file"]{width:100%;max-width:100%}
    .panel,nav,.route-body,.group{height:auto;min-height:0}.nav-item{height:auto;min-height:0;align-items:flex-start;padding-top:8px;padding-bottom:8px;white-space:normal;overflow-wrap:anywhere}.route-body{max-height:none;overflow:visible}.row{height:auto;min-height:0;align-items:flex-start}.label{overflow:visible;text-overflow:clip;white-space:normal;overflow-wrap:anywhere}:host([data-menu-width="compact"]) .group,:host([data-menu-width="narrow"]) .group{grid-template-columns:minmax(0,1fr)}:host([data-menu-width="compact"]) .group>*,:host([data-menu-width="narrow"]) .group>*{grid-column:1/-1}
    .group{grid-template-columns:minmax(0,1fr)}.group>*{grid-column:1/-1!important;min-width:0}.row{display:grid;grid-template-columns:minmax(92px,1fr) auto;align-items:center}.label{word-break:normal;overflow-wrap:normal}.nav-item{align-items:center;overflow-wrap:normal}.row select,.row input[type="text"]{width:auto;max-width:124px}.route-body{overflow:visible}
    :host([data-ui-theme="obsidian"]) .switch,:host([data-ui-theme="contrast"]) .switch{border:2px solid #fff;background:#050505}
    :host([data-ui-theme="obsidian"]) .switch span,:host([data-ui-theme="contrast"]) .switch span{top:0;left:0;border:1px solid #050505;background:#fff}
    :host([data-ui-theme="obsidian"]) .switch[aria-checked="true"],:host([data-ui-theme="contrast"]) .switch[aria-checked="true"]{background:#fff;border-color:#fff}
    :host([data-ui-theme="obsidian"]) .switch[aria-checked="true"] span,:host([data-ui-theme="contrast"]) .switch[aria-checked="true"] span{background:#050505;border-color:#fff;transform:translateX(14px)}
    @media(max-width:360px){.panel{width:calc(100vw - 16px)}.row{grid-template-columns:minmax(76px,1fr) auto}.row select,.row input[type="text"]{max-width:108px}.copy{min-width:0}}
    @media(prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto!important}}
    @media(forced-colors:active){.launcher,.primary{forced-color-adjust:auto}.switch{forced-color-adjust:none;border:1px solid CanvasText;background:Canvas}.switch span{border-color:CanvasText;background:CanvasText}.switch[aria-checked="true"]{border-color:Highlight;background:Highlight}.switch[aria-checked="true"] span{border-color:HighlightText;background:HighlightText}.nav-item[aria-current="page"]{outline:2px solid CanvasText}}
    :host([data-position="end-top"]) .launcher{top:12px;right:12px;bottom:auto}:host([data-position="end-top"]) .panel{top:68px;right:12px;bottom:auto}
    :host([data-position="start-top"]) .launcher{top:12px;left:12px;right:auto;bottom:auto}:host([data-position="start-top"]) .panel{top:68px;left:12px;right:auto;bottom:auto}
    :host([data-position="start-bottom"]) .launcher{left:12px;right:auto;bottom:12px}:host([data-position="start-bottom"]) .panel{left:12px;right:auto;bottom:68px}
  `;
  return Object.freeze({ build });
})();

const SHIFT_MANIFEST = Object.freeze({
  id: 'shift', version: EXP.VERSION, coreRange: '^3.0.1',
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
    try {
      EXP.Engine.start(EXP.Settings.effective());
      processorCleanup = EXP.Engine.addProcessor(EXP.Adapters.process);
    } catch (error) { EXP.Core.safeError(error, 'shift-engine-init'); }
    // Launcher/menu are a recovery surface: build them even if page theming or a site adapter fails.
    ui = EXP.UI.build(settings, {
      apply: (next) => EXP.Engine.apply({ ...EXP.Settings.effective(), ...next }),
      settings: (next, reason) => {
        const valid = EXP.Settings.replace(next, reason);
        EXP.Engine.apply(EXP.Settings.effective());
        EXP.Adapters.apply();
        return valid;
      }
    });
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
const startPreload = () => { try { EXP.Preload?.start(); } catch (error) { EXP.Core.safeError(error, 'shift-preload'); } };
startPreload();

const boot = () => product.initialize().then(() => product.enable()).catch((error) => EXP.Core.safeError(error, 'shift-boot'));
// Preload owns document-start paint. Full UI waits for a stable document so strict/CSP-heavy
// sites cannot lose the launcher because an early engine or DOM operation failed.
if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
})();
