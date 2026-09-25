EXP.Updates = ExtraPotionsCore.createReleaseUpdateChecker({
  productId: 'shift',
  repository: 'ExtraPotions/SHIFT',
  currentVersion: EXP.VERSION,
  enabled: () => EXP.Settings.snapshot().updateNotifications,
  onError: error => EXP.Core.safeError(error, 'shift-updates'),
});
