// Starter coverage is intentionally bounded; this is not universal sensitive-site detection.
EXP.SitePolicy = (() => {
  const scopes = Object.freeze(['chase.com', 'bankofamerica.com', 'wellsfargo.com', 'usbank.com', 'kp.org', 'mychart.org', 'mail.google.com', 'outlook.live.com', 'outlook.office.com', 'mail.yahoo.com', 'mail.proton.me']);
  function normalizeHost(value) {
    if (typeof value !== 'string' || value.length > 255) return '';
    const host = value.trim().toLowerCase().replace(/\.$/, '');
    if (!host || host.length > 253 || !host.split('.').every(label => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))) return '';
    return host;
  }
  function validateOptIns(value) {
    const hosts = new Set();
    if (Array.isArray(value)) for (const item of value.slice(0, 500)) {
      const host = normalizeHost(item);
      if (host) hosts.add(host);
      if (hosts.size === 100) break;
    }
    return [...hosts];
  }
  function isSensitive(value) { const host = normalizeHost(value); return Boolean(host && scopes.some(scope => host === scope || host.endsWith('.' + scope))); }
  function blocked(host, settings) { return isSensitive(host) && !validateOptIns(settings?.sensitiveSiteOptIns).includes(normalizeHost(host)); }
  return Object.freeze({ normalizeHost, validateOptIns, isSensitive, blocked });
})();
