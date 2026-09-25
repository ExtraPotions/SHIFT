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
