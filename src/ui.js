EXP.UI = (() => {
  const ICON_URL = 'https://raw.githubusercontent.com/ExtraPotions/SHIFT/main/assets/shift-launcher.svg';
  const BADGE_DATA = ICON_URL;
  const LAUNCHER_DATA = ICON_URL;
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
  let noticeResize;
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

  function positionChangelog() {
    const notice = shadow?.querySelector('.changelog');
    if (!notice || notice.hidden || !panel || !launcher) return;
    const panelRect = panel.getBoundingClientRect();
    const launcherRect = launcher.getBoundingClientRect();
    if (!panelRect.width || !launcherRect.width) return;
    const width = Math.min(panelRect.width, innerWidth - 24);
    const height = notice.offsetHeight || notice.scrollHeight || 180;
    const opensUp = host?.dataset.openDirection === 'up' || panelRect.bottom <= launcherRect.top;
    const sideFits = opensUp && panelRect.left >= width + 16;
    notice.style.width = `${width}px`;
    notice.style.right = 'auto';
    notice.style.bottom = 'auto';
    if (sideFits) {
      notice.style.left = `${Math.max(8, panelRect.left - width - 8)}px`;
      notice.style.top = `${Math.max(8, Math.min(innerHeight - height - 8, launcherRect.bottom - height))}px`;
      notice.dataset.placement = 'launcher-side';
      return;
    }
    notice.style.left = `${Math.max(8, Math.min(innerWidth - width - 8, panelRect.right - width))}px`;
    const above = panelRect.top - height - 8;
    notice.style.top = `${above >= 8 ? above : Math.min(innerHeight - height - 8, panelRect.bottom + 8)}px`;
    notice.dataset.placement = above >= 8 ? 'menu-above' : 'menu-below';
  }

  function queueChangelogPosition() {
    requestAnimationFrame(() => requestAnimationFrame(positionChangelog));
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

  function applyMenuTheme(state) { ExtraPotionsCore.applyTheme(host, state.theme === "original" ? "shift" : state.theme); }

  function commit(patch, reason = 'appearance', message = 'Appearance updated.') {
    saved = onSettings({ ...saved, ...patch }, reason);
    renderRoute();
    setMessage(message);
  }
  function appearanceSwatches() {
    const presets = [
      { id:'ember', name:'Ember', theme:'ember', accent:'ember-default', swatch:'linear-gradient(135deg,#120807 0 38%,#c9512c 38% 69%,#b68a32 69% 100%)' },
      { id:'midnight', name:'Midnight', theme:'midnight', accent:'midnight-default', swatch:'linear-gradient(135deg,#050a12 0 38%,#3563a3 38% 69%,#348f8b 69% 100%)' },
      { id:'glacier', name:'Glacier', theme:'glacier', accent:'glacier-default', swatch:'linear-gradient(135deg,#061216 0 38%,#4a9eaa 38% 69%,#92b85b 69% 100%)' },
      { id:'contrast', name:'High contrast', theme:'obsidian', accent:'contrast-default', swatch:'linear-gradient(135deg,#000000 0 48%,#ffffff 48% 78%,#ffd400 78% 100%)' },
      { id:'verdant', name:'Verdant', theme:'verdant', accent:'verdant-default', swatch:'linear-gradient(135deg,#06110d 0 38%,#318c61 38% 69%,#2f7f86 69% 100%)' },
      { id:'pride', name:'Pride', theme:'pride', accent:'pride-default', swatch:'linear-gradient(135deg,#c84e66 0%,#d07840 16.6%,#be9f37 33.3%,#3b8a5f 50%,#3d79a6 66.6%,#7455a4 100%)' },
      { id:'crimson', name:'Crimson', theme:'crimson', accent:'crimson-default', swatch:'linear-gradient(135deg,#0c0508 0 38%,#941f2f 38% 69%,#2f746e 69% 100%)' },
      { id:'shift', name:'SHIFT gem', theme:'shift', accent:'shift-default', swatch:'linear-gradient(135deg,#041313 0 38%,#1e938f 38% 69%,#c34766 69% 100%)' }
    ];
    const custom = saved.customThemes.map((theme) => ({ id:`custom:${theme.id}`, name:theme.name, theme:theme.id, accent:saved.accent, swatch:`linear-gradient(135deg,${theme.page} 50%,${theme.text} 50%)` }));
    const choices = [...presets, ...custom];
    const matched = choices.find((item) => item.theme === saved.theme && item.accent === saved.accent);
    const current = matched?.id || (saved.theme === 'original' ? '' : `current:${saved.theme}:${saved.accent}`);
    if (current && !choices.some((item) => item.id === current)) { const resolved=EXP.Themes.resolve(saved.theme,saved.accent,saved);choices.push({id:current,name:'Current imported palette',theme:saved.theme,accent:saved.accent,swatch:`linear-gradient(135deg,${resolved.page||'#171918'} 50%,${resolved.accent} 50%)`}); }
    const line=el('div',{class:'row palette-row'});const dots=el('div',{class:'exp-theme-swatches'});const options={container:dots,themes:choices,value:current,onChange:(id)=>{const choice=choices.find((item)=>item.id===id);if(choice)commit({theme:choice.theme,accent:choice.accent},'theme-swatch',`${choice.name} applied.`);}};
    const swatchCss = choices.map((theme) => `.exp-theme-swatch[data-swatch="${theme.id}"]{background:${theme.swatch}}`).join('');
    if (swatchStyle) swatchStyle.textContent = swatchCss;
    else swatchStyle = EXP.Core.injectStyle(shadow, swatchCss, { expShiftSwatches: '1' });
    if(ExtraPotionsCore?.createThemeSwatches)ExtraPotionsCore.createThemeSwatches(options);else for(const theme of choices){const dot=el('button',{type:'button',class:`exp-theme-swatch${theme.id===current?' is-on':''}`,'aria-label':theme.name,'aria-pressed':String(theme.id===current),'data-swatch':theme.id});dot.title=theme.name;dot.addEventListener('click',()=>options.onChange(theme.id));dots.append(dot);}
    line.style.setProperty('display','grid','important');
    line.style.setProperty('grid-template-columns','minmax(0,1fr)','important');
    dots.style.setProperty('flex-wrap','wrap','important');
    dots.style.setProperty('width','100%','important');
    line.append(dots);return line;
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
    surfaces.append(selectControl('Surface Intelligence', 'Live repair depth after the base theme and stylesheet pass. Off still themes the page and component roles.', saved.surfaceLevel, [['off', 'Off'], ['conservative', 'Conservative'], ['balanced', 'Balanced'], ['aggressive', 'Aggressive']], (surfaceLevel) => commit({ surfaceLevel }, 'surface-level', `Surface intelligence set to ${surfaceLevel}.`)));
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
    const group = section('Diagnostics', 'Page, technical, console, and plugin details; captured locally.');
    group.append(EXP.Diagnostics.createDiagnosticsControls(() => EXP.Diagnostics.createDiagnosticsReport('SHIFT', { host, product: { id:'shift', version: EXP.VERSION }, settings: EXP.Settings.exportData(), mode: EXP.Engine.health(), adapter: EXP.Adapters.health(), updates: EXP.Updates.status(), core: EXP.Core.diagnosticSnapshot() }), setMessage));
    group.append(actionRow(`${health.mode} · ${health.owned} live repairs`, `${health.scanned} visible elements inspected in ${health.batches} passes; last ${health.lastDurationMs} ms.`, () => { EXP.Engine.scan(); setMessage('Repair pass scheduled.'); }, 'Quick scan'));
    group.append(actionRow('Full coverage scan', 'Inspect up to 5,000 visible containers with the aggressive live-repair budget.', () => { EXP.Engine.fullScan(); setMessage('Full repair pass complete; health measurements updated.'); renderRoute(); }, 'Full scan'));
    group.append(switchControl('Safe Mode', 'Suspend transformations and adapters while preserving configuration.', state.safeMode, (safeMode) => { onSettings({ ...state, safeMode }, 'safe-mode'); setMessage(safeMode ? 'Safe Mode active.' : 'Safe Mode disabled.'); }));
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
    EXP.Core.injectStyle(shadow, STYLE + '.fl-tool-body .diagnostics-controls .action{font-size:10px!important;padding:4px!important;min-height:28px!important;line-height:1.2!important}.fl-tool-body .row.palette-row.mini-row{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:7px!important}.fl-tool-body .row.palette-row>.copy{grid-column:1/-1;min-width:0;width:100%;margin:0!important}.fl-tool-body .row.palette-row>.exp-theme-swatches{grid-column:1/-1;display:flex!important;flex-wrap:wrap!important;width:100%;min-width:0;gap:5px;justify-content:flex-start}.profile-actions{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px;padding:8px 0}.profile-actions>*{min-width:0}.status{display:none}');
    launcher = el('button', { type: 'button', class: 'launcher', 'aria-label': 'Open SHIFT. Drag to move.', 'data-help': 'Drag To Move · Click To Open SHIFT', 'aria-expanded': 'false', 'aria-controls': 'shift-panel' });
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
        queueChangelogPosition();
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
    noticeResize = new ResizeObserver(queueChangelogPosition);
    noticeResize.observe(panel);
    addEventListener('resize', queueChangelogPosition, { passive: true });
    document.addEventListener('exp-core:coordination', queueChangelogPosition);
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
      destroy() { clearTimeout(toastTimer); clearTimeout(updateTimer); noticeResize?.disconnect(); removeEventListener('resize', queueChangelogPosition); document.removeEventListener('exp-core:coordination', queueChangelogPosition); document.removeEventListener('pointerdown', outside, true); chrome?.destroy(); launcherCleanup?.(); host.remove(); host = shadow = launcher = panel = content = nav = status = toast = chrome = menuThemeStyle = swatchStyle = noticeResize = null; },
    };
  }

  const STYLE = '';
  return Object.freeze({ build });
})();
