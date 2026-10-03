// ==UserScript==
// @name         Userscript Manager Test
// @namespace    https://github.com/ExtraPotions
// @version      1.0.0
// @description  Minimal userscript execution test.
// @match        http://*/*
// @match        https://*/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(() => {
  'use strict';
  if (window.top !== window.self) return;
  if (document.getElementById('exp-userscript-manager-test')) return;
  const box = document.createElement('div');
  box.id = 'exp-userscript-manager-test';
  box.textContent = 'USERSCRIPTS WORKING';
  box.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:2147483647;padding:14px 18px;border:3px solid white;border-radius:10px;background:#d40000;color:white;font:800 16px/1.2 system-ui,-apple-system,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.55);pointer-events:none';
  (document.body || document.documentElement).appendChild(box);
})();