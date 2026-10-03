ExtraPotionsCore.registerDiagnosticsProduct('shift', EXP.VERSION);
const SHIFT_MANIFEST = Object.freeze({
  id: 'shift', version: EXP.VERSION, coreRange: '^3.3.3',
  capabilities: ['lifecycle', 'settings', 'diagnostics', 'dom-scheduler', 'navigation', 'launcher', 'ui']
});

let ui;
let unsubscribe;
let navigationCleanup;
let processorCleanup;
let shortcutCleanup;
let engineStarted = false;
const publishSuiteState = (state = EXP.Settings.effective()) => globalThis.ExtraPotionsCore?.publishSuiteState?.('shift', 'shift.state-changed', {
  active: Boolean(engineStarted),
  theme: String(state?.theme || 'unknown'),
  safeMode: Boolean(state?.safeMode),
  excluded: Boolean(state?.excluded),
});
const initialPageReady = () => document.readyState === 'complete'
  ? Promise.resolve()
  : new Promise((resolve) => addEventListener('load', resolve, { once: true }));
const applyEngine = () => {
  if (!engineStarted) return null;
  const state = EXP.Settings.effective();
  const result = EXP.Engine.apply(state);
  EXP.Inspector.applySaved();
  publishSuiteState(state);
  return result;
};
const hooks = {
  async initialize() {
    const settings = EXP.Settings.load();
    try { EXP.Adapters.initialize(); } catch (error) { EXP.Core.safeError(error, 'shift-adapters-init'); }
    // Launcher/menu are the recovery surface. Mount them before any page transformation so
    // an engine failure or aggressive site rewrite can never prevent access to SHIFT controls.
    ui = EXP.UI.build(settings, {
      apply: (next) => engineStarted ? EXP.Engine.apply({ ...EXP.Settings.effective(), ...next }) : null,
      settings: (next, reason) => {
        const valid = EXP.Settings.replace(next, reason);
        applyEngine();
        EXP.Adapters.apply();
        return valid;
      }
    });
    try {
      processorCleanup = EXP.Engine.addProcessor((root) => { EXP.Inspector.applySaved();EXP.Adapters.process(root); });
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
      applyEngine();
      EXP.Adapters.apply();
      ui?.update(next);
    });
    navigationCleanup = EXP.Core.onNavigation(() => {
      EXP.Adapters.initialize();
      applyEngine();
    });
  },
  async enable() {
    await initialPageReady();
    if (!engineStarted) {
      engineStarted = true;
      const state = EXP.Settings.effective();
      EXP.Engine.start(state);
      EXP.Inspector.applySaved();
      publishSuiteState(state);
    } else applyEngine();
  },
  async disable() { engineStarted = false; EXP.Inspector.destroy(); EXP.Engine.stop(); EXP.Adapters.disable(); publishSuiteState(); },
  async cleanup() { engineStarted = false; unsubscribe?.(); navigationCleanup?.(); processorCleanup?.(); shortcutCleanup?.(); EXP.Engine.stop(); EXP.Adapters.disable(); ui?.destroy(); }
};

const product = EXP.Core.register(SHIFT_MANIFEST, hooks);

// A frame from another origin (an extension overlay, an ad slot, a map, an embedded player) is laid out by the
// page that hosts it, not by the viewer's theme. Painting one opaque hides whatever sits beneath it, such as the
// video under a Twitch extension overlay, so SHIFT leaves foreign frames alone.
const inForeignFrame = () => {
  if (window.top === window.self) return false;
  try {
    const ancestors = location.ancestorOrigins;
    if (ancestors && ancestors.length) return [...ancestors].some((origin) => origin !== location.origin);
  } catch {}
  try { void window.top.location.href; return false; } catch { return true; }
};

let booted = false;
const bootOnce = () => {
  if (booted) return;
  if (!document.documentElement) { setTimeout(bootOnce, 25); return; }
  booted = true;
  if (inForeignFrame()) return;
  try { EXP.Preload?.start(); } catch (error) { EXP.Core.safeError(error, 'shift-preload'); }
  product.initialize().then(() => product.enable()).catch((error) => EXP.Core.safeError(error, 'shift-boot'));
};
// Orion/WebKit can execute document-start before documentElement exists. Nothing in Core,
// Preload, or UI may touch the DOM until the root element is available.
bootOnce();
if (document.readyState === 'loading') addEventListener('DOMContentLoaded', bootOnce, { once: true });
