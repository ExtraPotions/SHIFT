EXP.Updates = ExtraPotionsCore.createReleaseUpdateChecker({
  productId: 'shift',
  repository: 'ExtraPotions/SHIFT',
  endpoint: 'https://api.github.com/repos/ExtraPotions/SHIFT/releases/latest',
  currentVersion: EXP.VERSION,
  enabled: () => EXP.Settings.snapshot().updateNotifications,
  onError: error => EXP.Core.safeError(error, 'shift-updates'),
});
