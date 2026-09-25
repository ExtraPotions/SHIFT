ExtraPotionsCore.registerDiagnosticsProduct('shift', EXP.VERSION);
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
