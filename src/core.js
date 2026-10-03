const services = ExtraPotionsCore.createProductServices({
  productId: 'shift',
  repository: 'ExtraPotions/SHIFT',
  currentVersion: () => EXP.VERSION,
  enabled: () => EXP.Settings.snapshot().updateNotifications,
  onError: error => EXP.Core.safeError(error, 'shift-updates'),
});
EXP.Core = services.lifecycle;
EXP.Diagnostics = services.diagnostics;
EXP.Updates = services.updates;
