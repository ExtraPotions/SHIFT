'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
function runtime() {
  const context = vm.createContext({ EXP: {}, location: { hostname: 'mail.google.com' }, ExtraPotionsCore: { cloneSettings: value => JSON.parse(JSON.stringify(value)), clearProductData() {} } });
  const policy = path.join(__dirname, '../src/site-policy.js');
  if (fs.existsSync(policy)) vm.runInContext(fs.readFileSync(policy, 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/settings.js'), 'utf8'), context);
  context.EXP.Settings.load(); return context.EXP;
}
test('starter scopes and descendants are off, unrelated lookalikes stay eligible', () => {
  const exp = runtime();
  for (const host of ['chase.com', 'secure.chase.com', 'bankofamerica.com', 'wellsfargo.com', 'usbank.com', 'kp.org', 'mychart.org', 'mail.google.com', 'outlook.live.com', 'outlook.office.com', 'mail.yahoo.com', 'mail.proton.me']) assert.equal(exp.Settings.effective(host).excluded, true, host);
  for (const host of ['notchase.com', 'chase.com.evil.test', 'google.com', 'example.test']) assert.equal(exp.Settings.effective(host).excluded, false, host);
});
test('sensitive opt-ins are exact normalized hosts, never inferred from overrides', () => {
  const exp = runtime(); exp.Settings.update({ siteOverrides: { 'mail.google.com': { theme: 'midnight', matcherMode: 'strict' } } });
  assert.equal(exp.Settings.effective('mail.google.com').excluded, true);
  exp.Settings.update({ sensitiveSiteOptIns: [' MAIL.GOOGLE.COM. ', 'mail.google.com'] });
  assert.equal(JSON.stringify(exp.Settings.snapshot().sensitiveSiteOptIns), '["mail.google.com"]');
  assert.equal(exp.Settings.effective('mail.google.com').excluded, false);
  assert.equal(exp.Settings.effective('sub.mail.google.com').excluded, true);
});
test('opt-ins reject malformed hosts, deduplicate and cap stored data', () => {
  const exp = runtime(); exp.Settings.update({ sensitiveSiteOptIns: ['https://chase.com', '*.chase.com', 'chase.com/path', 'bad..chase.com', '-bad.chase.com', 'chase.com:443', {}, 'mail.google.com', 'mail.google.com', ...Array.from({ length: 150 }, (_, i) => 'h'+i+'.chase.com')] });
  const values = exp.Settings.snapshot().sensitiveSiteOptIns;
  assert.ok(Array.isArray(values)); assert.equal(values.length, 100); assert.equal(new Set(values).size, 100);
  assert.equal(values[0], 'mail.google.com');
});
test('legacy exclusions still beat opt-ins and retain their matching semantics', () => {
  const exp = runtime(); exp.Settings.update({ sensitiveSiteOptIns: ['mail.google.com'], exclusions: ['mail.google.com', 'example.test'] });
  assert.equal(exp.Settings.effective('mail.google.com').excluded, true);
  assert.equal(exp.Settings.effective('sub.example.test').excluded, true);
});
test('reset and old imports have no inferred sensitive opt-ins', () => {
  const exp = runtime(); exp.Settings.update({ sensitiveSiteOptIns: ['mail.google.com'] }); exp.Settings.resetAll();
  assert.equal(JSON.stringify(exp.Settings.snapshot().sensitiveSiteOptIns), '[]');
  const payload = { product: 'shift', generation: 3, schema: 1, settings: { siteOverrides: { 'mail.google.com': { theme: 'midnight' } } } };
  const candidate = exp.Settings.importData(payload);
  assert.equal(JSON.stringify(candidate.sensitiveSiteOptIns), '[]');
});
