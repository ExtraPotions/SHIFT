EXP.UI = (() => {
  let healthControl;
  function systemHealthSnapshot() {
    const settings=EXP.Settings.effective(),data=EXP.Engine.health(),adapter=EXP.Adapters?.health?.()||{},checkedAt=Date.now();
    if(settings.safeMode||ExtraPotionsCore.suiteSitePaused())return {state:'paused',reason:'Page appearance changes are paused.',checkedAt};
    if(settings.excluded||data.mode==='Excluded')return {state:'waiting',reason:'Appearance changes are excluded on this page.',checkedAt};
    if(adapter.state==='degraded'||adapter.state==='failed'||adapter.recovery?.suspended)return {state:'attention',reason:'Site-specific appearance features need attention. Generic theme repair remains independent.',checkedAt,action:{label:'Retry site features',run:()=>EXP.Adapters.retry()}};
    if(data.liveResolver?.recovery?.suspended)return {state:'attention',reason:'Live appearance repair stopped after repeated failures.',checkedAt,action:{label:'Retry',run:()=>{if(!EXP.Settings.snapshot().safeMode&&!ExtraPotionsCore.suiteSitePaused())return EXP.LiveResolver.retry();}}};
    return {state:'working',reason:data.mode==='Original'?'Original appearance is selected. This is a valid appearance choice.':'Appearance and readability changes are active.',checkedAt};
  }
  const ICON_URL = 'https://raw.githubusercontent.com/ExtraPotions/SHIFT/main/assets/shift-launcher.svg';
  const SUPPORT_URL = 'https://ko-fi.com/expdare';
  const PRODUCT_THEME = Object.freeze({
    id:'shift', name:'SHIFT gem',
    swatch:'linear-gradient(135deg,#b9fff9 0 34%,#20d9d3 34% 67%,#f23868 67%)',
    bg:'#101719', panel:'#182326', line:'#344442', text:'#f2f8f7', muted:'#b8c9c7',
    accent:'#26d9c7', accent2:'#f23868',
    skin:'linear-gradient(135deg,#b9fff9,#20d9d3,#f23868)',
    skinVertical:'linear-gradient(180deg,#b9fff9,#20d9d3,#f23868)'
  });
  const routes = [
    ['appearance', 'Appearance'], ['advanced', 'Advanced'], ['system', 'System']
  ];
  let host;
  let shadow;
  let launcher;
  let panel;
  let toast;
  let toastTimer;
  let product;
  let noticeController;
  let saved;
  let importDraft = null;
  let onApply;
  let onSettings;
  let swatchStyle;
  let updateNotice;
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
    noticeController?.hide();
  }

  function showUpdateNotice({ kicker = "What's New", title = 'SHIFT Updated', version = EXP.VERSION, text = '', details = [], available = false } = {}) {
    if (!noticeController) return;
    noticeController.show({
      kicker,
      title,
      version,
      text,
      details,
      kind: available ? 'available' : kicker === 'Update Complete' ? 'complete' : 'current',
      releaseUrl: EXP.Updates.RELEASE_URL,
      actionUrl: available ? EXP.Updates.INSTALL_URL : '',
      actionText: 'Install Update',
      showAction: available,
    });
  }

  function markLauncherUpdate(result = {}) {
    if (!launcher) return;
    const ready = Boolean(result.available && result.latest);
    launcher.classList.toggle('update-available', ready);
    launcher.setAttribute('aria-label', ready ? `Open SHIFT · Update v${result.latest} Available` : 'Open SHIFT');
  }

  async function checkUpdateNotice(force = false) {
    const result = await EXP.Updates.check(force);
    markLauncherUpdate(result);
    if (result.available && !result.quiet && EXP.Core.claimNotice('shift',`available:${result.latest}`)) showUpdateNotice({
      kicker: 'Update Available',
      title: 'New SHIFT Version Available',
      version: result.latest,
      text: `v${result.latest} is ready to install.`,
      details: Array.isArray(result.details) && result.details.length ? result.details : ['A newer SHIFT build is available.', 'Install the latest userscript for the newest fixes and improvements.'],
      available: true,
    });
    return result;
  }

  function setMessage(message, kind = 'status') {
    if (!toast) return;
    toast.textContent = message; toast.dataset.kind = kind; toast.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { if (toast) toast.hidden = true; }, 2400);
  }
  function section(title) {
    const node = el('section', { class: 'group' });
    if (title) node.append(el('h3', {}, title));
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

  function applyMenuTheme() { ExtraPotionsCore.applyTheme(host, 'shift'); }

  function commit(patch, reason = 'appearance', message = 'Appearance updated.') {
    saved = onSettings({ ...saved, ...patch }, reason);
    product?.renderActive();
    setMessage(message);
  }
  function appearanceSwatches() {
    const choices = EXP.Themes.themeOptions().filter(([id]) => !['original', 'system'].includes(id)).map(([id, name]) => {
      const palette = EXP.Themes.resolve(id);
      return { id, name, swatch: palette.pageEdge || 'linear-gradient(135deg,' + palette.page + ' 50%,' + palette.highlight + ' 50%)' };
    });
    const line = el('div', { class:'row palette-row' });
    const dots = el('div', { class:'exp-theme-swatches' });
    ExtraPotionsCore.createThemeSwatches({ container:dots, themes:choices, value:saved.theme, label:'Website theme', onChange:id => commit({ theme:id, accent:'site-default' }, 'theme-swatch', choices.find(item => item.id === id).name + ' applied.') });
    const css = choices.map(theme => '.exp-theme-swatch[data-swatch="' + theme.id + '"]{background:' + theme.swatch + '}').join('');
    if (swatchStyle) swatchStyle.textContent = css;
    else swatchStyle = EXP.Core.injectStyle(shadow, css, { expShiftSwatches:'1' });
    line.style.setProperty('display','grid','important');
    line.style.setProperty('grid-template-columns','minmax(0,1fr)','important');
    line.append(dots);
    return line;
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


  function appearanceExplanation() {
    const card = el('details', { class: 'exp-tools-card', 'data-shift-appearance-explanation': 'true' });
    card.style.cssText = 'border:1px solid var(--theme-line);border-radius:7px;padding:8px;font-size:var(--exp-font-size-body,13px);line-height:1.5;overflow-wrap:anywhere';
    card.append(el('summary', {}, 'Why this appearance?'));
    const content = el('div');card.append(content);
    function refresh() {
      const { settings, sources } = EXP.Settings.explain();
      const status = EXP.Engine.appearanceStatus();
      const palette = EXP.Themes.resolve(settings.theme, settings.accent, settings);
      const reason = settings.excluded ? 'SHIFT is excluded on this site. Page appearance changes are paused.'
        : settings.safeMode ? 'Safe Mode is on. Page appearance changes are paused.'
        : status.forcedColors ? 'Your browser’s forced colors mode is active. SHIFT leaves page colors alone.'
        : status.originalHeld ? 'The temporary Original preview is active.'
        : palette.original ? 'Original is selected. SHIFT leaves page colors unchanged.'
        : !status.active ? 'The appearance engine is not active yet.'
        : status.nativeDark ? 'The site already has a dark appearance. SHIFT applies your selected palette while preserving artwork and native image effects.'
        : 'SHIFT is applying the selected palette and appearance controls.';
      content.replaceChildren(el('p', { role: 'status' }, reason));
      content.append(el('p', {}, 'Priority: site override, then profile, then global settings. These are the effective values for this page.'));
      const fields = [['theme','Palette','appearance'],['accent','Accent','appearance'],['themeStrength','Theme strength','appearance'],['surfaceLevel','Surface intelligence','appearance'],['repairSurfaces','Surface repair','appearance'],['preserveArt','Artwork preservation','appearance'],['reduceMotion','Reduced motion','appearance'],['linkVisibility','Link visibility','readability'],['textContrast','Text contrast','readability'],['mutedRecovery','Muted text recovery','readability'],['formReadability','Form readability','readability'],['focusVisibility','Focus visibility','readability'],['reduceShadows','Reduced shadows','effects'],['reduceTransparency','Reduced transparency','effects'],['simplifyGradients','Simplified gradients','effects'],['reduceBlur','Reduced blur','effects']];
      const more = el('details');more.append(el('summary', {}, 'More appearance settings'));
      for (const [key,label,route] of fields) {
        const value = key === 'theme' ? (palette.name || settings.theme) : key === 'accent' ? (EXP.Themes.accentOptions(settings).find(([id])=>id===settings.accent)?.[1] || settings.accent) : typeof settings[key] === 'boolean' ? (settings[key] ? 'On' : 'Off') : String(settings[key]).replace(/^./, letter=>letter.toUpperCase());
        const line = el('p', { 'data-setting-source': key }, `${label}: ${value} — ${sources[key].label}`);
        line.append(button('View source', () => {
          const destination = sources[key].kind === 'global'
            ? (route === 'effects' ? 'advanced' : 'appearance')
            : 'advanced';
          const header = shadow.querySelector(`[data-section="${destination}"]`);
          const body = header?.parentElement.querySelector('.route-body');
          if (header?.parentElement) header.parentElement.hidden = false;
          if (header?.getAttribute('aria-expanded') !== 'true') header?.click();
          // The shared shell finishes arranging freshly rendered tabs next frame.
          requestAnimationFrame(()=>{
          const scope = body || header?.parentElement;
          const labels = { themeStrength:'Theme Strength',surfaceLevel:'Surface Intelligence',repairSurfaces:'Repair unreadable surfaces',preserveArt:'Preserve artwork and charts',reduceMotion:'Reduce motion',reduceShadows:'Reduce shadows',reduceTransparency:'Reduce transparency',simplifyGradients:'Simplify gradients',reduceBlur:'Reduce blur' };
          const targetLabel = sources[key].kind === 'global' ? (labels[key] || label) : sources[key].kind === 'profile' && !EXP.Settings.snapshot().siteOverrides[location.hostname]?.profileId ? 'Current profile' : 'Site profile';
          const control = sources[key].kind === 'global' && ['theme','accent'].includes(key) ? scope?.querySelector('.exp-theme-swatch[aria-pressed="true"]') : [...(scope?.querySelectorAll('button,select,input') || [])].find(n => n.getAttribute('aria-label') === targetLabel);
          const disclosure = control?.closest('details');
          const tabPanel=control?.closest('.exp-submenu-tabpanel');
          if(tabPanel)shadow.querySelector(`[role="tab"][aria-controls="${tabPanel.id}"]`)?.click();
          if (disclosure) disclosure.open = true;
          (control || header)?.focus();(control || header)?.scrollIntoView({block:'nearest'});
          });
        }, 'secondary'));
        (['theme','accent'].includes(key) ? content : more).append(line);
      }
      content.append(more, button('Refresh explanation', refresh, 'secondary'));
    }
    card.addEventListener('toggle', () => { if (card.open) refresh(); });
    return card;
  }

  function renderAppearance() {
    const fragment = document.createDocumentFragment();
    const themes = section('Website theme', 'Six palettes for websites. The SHIFT menu keeps its own colors.');
    themes.append(selectControl('Display mode', 'Keep the original site, follow your system, or use a theme.', ['original','system'].includes(saved.theme) ? saved.theme : 'themed', [['original','Original site'],['system','Follow system'],['themed','Use theme']], mode => commit({theme: mode === 'themed' ? 'midnight' : mode, accent:'site-default'}, 'display-mode')));
    themes.append(appearanceSwatches());
    themes.append(selectControl('Theme Strength', 'Soft narrows depth differences; Strong increases raised-surface depth.', saved.themeStrength, [['soft', 'Soft'], ['normal', 'Normal'], ['strong', 'Strong']], (themeStrength) => commit({ themeStrength }, 'theme-strength', `Theme strength set to ${themeStrength}.`)));
    fragment.append(themes, appearanceExplanation());

    const surfaces = section('Surfaces', 'Host CSS themes the page and app shells first. Classification then repairs leftover gray boxes.');
    surfaces.append(selectControl('Surface Intelligence', 'Live repair depth after the base theme and stylesheet pass. Off still themes the page and component roles.', saved.surfaceLevel, [['off', 'Off'], ['conservative', 'Conservative'], ['balanced', 'Balanced'], ['aggressive', 'Aggressive']], (surfaceLevel) => commit({ surfaceLevel }, 'surface-level', `Surface intelligence set to ${surfaceLevel}.`)));
    surfaces.append(switchControl('Preserve artwork and charts', 'Never classify images, video, canvas, or SVG.', saved.preserveArt, (preserveArt) => commit({ preserveArt }, 'preserve-art', preserveArt ? 'Artwork preservation on.' : 'Artwork preservation off.')));
    surfaces.append(switchControl('Repair unreadable surfaces', 'Repair leftover neutral boxes after host CSS paints the page.', saved.repairSurfaces, (repairSurfaces) => commit({ repairSurfaces }, 'repair-surfaces', repairSurfaces ? 'Surface repair on.' : 'Surface repair off.')));
    const motion = section('Motion', 'Motion preferences apply immediately when you change them.');
    motion.append(selectControl('Reduce motion', 'Follow the system preference or override it.', saved.reduceMotion, [['off', 'Off'], ['system', 'Follow system'], ['on', 'On']], (reduceMotion) => commit({ reduceMotion }, 'reduce-motion', `Reduce motion set to ${reduceMotion}.`)));
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'Reduced motion requested' : 'Standard motion';
    motion.append(actionRow('System preferences', reduced, () => setMessage(reduced), 'View'));
    fragment.append(motion);
    fragment.append(surfaces);
    fragment.append(ExtraPotionsCore.createDisclosure('Readability', renderReadability()));
    fragment.append(appearanceFooter());
    fragment.append(renderMenuUpdates());
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
    fragment.append(adapterGroup);
    return fragment;
  }

  function renderProfilesSites() {
    const state = EXP.Settings.snapshot();
    const effective = EXP.Settings.effective();
    const fragment = document.createDocumentFragment();
    const current = section('Current site', location.hostname || 'Local document');
    if (EXP.SitePolicy.isSensitive(location.hostname)) current.append(el('p', {}, 'This supported banking, healthcare or email site stays unchanged until you enable this exact hostname. Site exclusions and pauses still take priority. Coverage is not universal.'));
    current.append(switchControl('Enable SHIFT on this site', 'Known banking, healthcare and email sites require exact-site permission. Coverage is not universal.', !effective.excluded, (enabled) => {
      const exclusions = state.exclusions.filter((host) => host !== location.hostname);
      if (!enabled) exclusions.push(location.hostname);
      const host = EXP.SitePolicy.normalizeHost(location.hostname);
      const sensitiveSiteOptIns = state.sensitiveSiteOptIns.filter(item => item !== host);
      if (enabled && EXP.SitePolicy.isSensitive(host)) sensitiveSiteOptIns.push(host);
      onSettings({ ...state, exclusions, sensitiveSiteOptIns }, 'site-exclusion'); setMessage(EXP.Settings.effective().excluded ? 'Site remains excluded.' : 'SHIFT enabled for this site.');
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
      onSettings({ ...state, siteOverrides, exclusions: state.exclusions.filter((host) => host !== location.hostname), sensitiveSiteOptIns: state.sensitiveSiteOptIns.filter(host => host !== EXP.SitePolicy.normalizeHost(location.hostname)) }, 'site-reset'); setMessage('Site settings reset.');
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
      group.append(actionRow('Duplicate current profile', 'Creates a new stable identity.', () => { const name = prompt('Duplicate profile name', `${current.name} copy`); if (!name?.trim()) return; const copy = { ...EXP.Settings.clone(current), id: `profile-${Date.now().toString(36)}`, name: name.trim().slice(0, 80), builtIn: false }; onSettings({ ...state, profiles: [...state.profiles, copy], currentProfile: copy.id }, 'profile-duplicate'); setMessage('Profile duplicated.'); }, 'Duplicate'));
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
    importInput.addEventListener('change', async () => { try { const payload = JSON.parse(await importInput.files[0].text()); if (payload.product !== 'shift' || payload.generation !== 3 || payload.schema !== 1 || payload.type !== 'profile' || !payload.profile?.appearance) throw new Error('Unsupported profile file.'); const allowedThemes = new Set(EXP.Themes.themeOptions(state).map(([id]) => id)); const allowedAccents = new Set(EXP.Themes.accentOptions(state).map(([id]) => id)); if (!allowedThemes.has(payload.profile.appearance.theme) || !allowedAccents.has(payload.profile.appearance.accent)) throw new Error('Profile references an unavailable theme or accent.'); const profile = { ...payload.profile, id: `profile-${Date.now().toString(36)}`, name: String(payload.profile.name || 'Imported profile').slice(0, 80), builtIn: false }; const validated = EXP.Settings.replace({ ...state, profiles: [...state.profiles, profile], currentProfile: profile.id }, 'profile-import'); saved = EXP.Settings.clone(validated); setMessage('Profile imported.'); } catch (error) { setMessage(error.message, 'error'); } });
    importRow.append(button('Import', () => importInput.click(), 'action'), importInput); group.append(importRow);
    const actions = el('div', { class: 'button-grid profile-actions' });
    for (const item of [...group.querySelectorAll(':scope > .row')]) {
      const action = item.querySelector('button.action'); if (!action) continue;
      action.title = item.querySelector('.label')?.textContent || action.textContent;
      const file = item.querySelector('input[type="file"]'); if (file) group.append(file);
      actions.append(action); item.remove();
    }
    if (state.exclusions.length) group.append(actionRow('Excluded sites', state.exclusions.join(', '), () => { const hostName = prompt('Hostname to remove from exclusions', state.exclusions[0]); if (!hostName) return; onSettings({ ...state, exclusions: state.exclusions.filter((item) => item !== hostName.trim()) }, 'exclusion-manager'); setMessage('Exclusions updated.'); }, 'Manage'));
    group.append(actions); fragment.append(group);
    return fragment;
  }

  function renderAdvanced() {
    const fragment = document.createDocumentFragment();
    fragment.append(
      ExtraPotionsCore.createDisclosure('Effects & integrations', renderEffects()),
      ExtraPotionsCore.createDisclosure('Profiles & sites', renderProfilesSites()),
      renderPageTools(),
      renderSettingsTransfer()
    );
    return fragment;
  }

  function renderMenuUpdates() {
    const state = EXP.Settings.snapshot();
    const fragment = document.createDocumentFragment();
    const chromeGroup = ExtraPotionsCore.createDisclosure('Menu Preferences');chromeGroup.append(ExtraPotionsCore.createMenuSizeControls());
    chromeGroup.append(switchControl('Auto-close menu', 'Close after 15 seconds without menu activity.', state.menuAutoClose, (menuAutoClose) => { onSettings({ ...state, menuAutoClose }, 'menu-auto-close'); product?.refresh(); setMessage(menuAutoClose ? 'Automatic close enabled.' : 'Automatic close disabled.'); }));
    fragment.append(chromeGroup);

    const about = chromeGroup;
    about.append(switchControl('Update notifications', 'Checks GitHub for new releases. Never installs automatically.', state.updateNotifications, (updateNotifications) => { onSettings({ ...state, updateNotifications }, 'update-notifications'); if (updateNotifications) EXP.Updates.check(true).then((result) => { markLauncherUpdate(result); setMessage(result.available ? `SHIFT ${result.latest} is available.` : result.state === 'failed' ? 'Update check failed quietly.' : 'SHIFT is up to date.'); }); else setMessage('Update notifications disabled.'); }));
    about.append(actionRow('Check for updates now', 'Fetches release metadata only; never executable code.', () => EXP.Updates.check(true).then((result) => { markLauncherUpdate(result); setMessage(result.available ? `SHIFT ${result.latest} is available.` : result.state === 'failed' ? 'Update check failed quietly.' : 'SHIFT is up to date.'); }), 'Check now'));

    return fragment;
  }

  function renderPageTools() {
    const state=EXP.Settings.snapshot(),health=EXP.Engine.health();
    const tools=ExtraPotionsCore.createDisclosure('Page tools');
    tools.append(EXP.Inspector.createControls(()=>product?.open()));
    tools.append(actionRow(`${health.mode} · ${health.owned} live repairs`, `${health.scanned} visible elements inspected in ${health.batches} passes; last ${health.lastDurationMs} ms.`,()=>{EXP.Engine.scan();setMessage('Repair pass scheduled.');},'Quick scan'));
    tools.append(actionRow('Full coverage scan','Inspect up to 5,000 visible containers with the aggressive live-repair budget.',()=>{EXP.Engine.fullScan();setMessage('Full repair pass complete; health measurements updated.');product?.renderActive();},'Full scan'));
    tools.append(switchControl('Safe Mode','Suspend transformations and adapters while preserving configuration.',state.safeMode,safeMode=>{onSettings({...state,safeMode},'safe-mode');setMessage(safeMode?'Safe Mode active.':'Safe Mode disabled.');}));
    return tools;
  }
  function renderSettingsTransfer() {
    const data = ExtraPotionsCore.createDisclosure('Settings transfer');
    data.open = Boolean(importDraft);
    data.append(actionRow('Export SHIFT settings', 'Local JSON file; no upload.', () => download('shift-settings.json', JSON.stringify(EXP.Settings.exportData(), null, 2)), 'Export'));
    const importRow = row('Import SHIFT settings', 'Invalid files leave current settings unchanged.');
    const input = el('input', { type: 'file', accept: 'application/json,.json', 'aria-label': 'Import SHIFT settings' });
    input.hidden = true;
    input.addEventListener('change', async () => { try { const payload = JSON.parse(await input.files[0].text()); importDraft = EXP.Settings.prepareImport(payload); product?.renderActive(); setMessage('Import validated. Review and apply or cancel.'); } catch (error) { setMessage(error.message, 'error'); } });
    importRow.append(button('Import', () => input.click(), 'action'), input); data.append(importRow);
    if (importDraft) {
      data.append(el('p', {class:'import-preview'}, importDraft.sensitiveSiteOptIns.length ? `Sensitive-site permissions to restore (exact hostnames): ${importDraft.sensitiveSiteOptIns.join(', ')}` : 'No sensitive-site permissions will be restored.'));
      data.append(button('Cancel import', () => { importDraft = null; product?.renderActive(); setMessage('Import cancelled.'); }, 'action'), button('Apply import', () => { const next = EXP.Settings.replace(importDraft, 'import'); importDraft = null; saved = EXP.Settings.clone(next); onApply(next); product?.renderActive(); setMessage('Settings imported.'); }, 'action'));
    }
    return data;
  }
  function renderRecoveryData() {
    healthControl?.dispose();
    healthControl=ExtraPotionsCore.createProductTimeline('shift',systemHealthSnapshot,setMessage,{layout:'grouped'});
    return ExtraPotionsCore.createProductSystem({id:'shift',version:EXP.VERSION,issueSettings:()=>({current:EXP.Settings.snapshot(),defaults:EXP.Settings.defaults}),
      timeline:healthControl.element,
      diagnostics:EXP.Diagnostics.createDiagnosticsControls(() => EXP.Diagnostics.createDiagnosticsReport('SHIFT', { host, product: { id:'shift', version: EXP.VERSION }, settings: EXP.Settings.exportData(), mode: EXP.Engine.health(), adapter: EXP.Adapters.health(), updates: EXP.Updates.status(), core: EXP.Core.diagnosticSnapshot() }), setMessage),
      layout:'grouped',
      onReset:()=>{importDraft=null;const next=EXP.Settings.resetAll();saved=EXP.Settings.clone(next);onApply(next);product?.renderActive();location.reload();},notify:setMessage
    });
  }

  function download(name, value) {
    const url = URL.createObjectURL(new Blob([value], { type: 'application/json' }));
    const link = el('a', { href: url, download: name }); link.click(); setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function applyPosition() {
    if (host) host.dataset.position = 'automatic-end-bottom';
  }

  function build(initial, callbacks) {
    if (window.top !== window.self) return { update() {}, toggle() {}, destroy() {} };
    saved = EXP.Settings.clone(initial);
    onApply = callbacks.apply;
    onSettings = callbacks.settings;

    const renderers = {
      appearance: renderAppearance,
      advanced: renderAdvanced,
      system: renderRecoveryData,
    };

    product = ExtraPotionsCore.createProduct({
      id: 'shift',
      keepOpen: () => Boolean(importDraft),
      name: 'SHIFT',
      version: EXP.VERSION,
      subtitle: 'Adaptive themes and readability',
      artwork: ICON_URL,
      theme: PRODUCT_THEME,
      supportUrl: SUPPORT_URL,
      getSettings: () => EXP.Settings.snapshot(),
      onSettings: (next, reason) => onSettings(next, reason),
      sections: routes.map(([id, label]) => ({
        id,
        label,
        render: () => renderers[id](),
      })),
    });

    ({ host, shadow, launcher, panel } = product);
    applyPosition();

    EXP.Core.injectStyle(shadow, STYLE, { expShiftProductUi: '1' });

    toast = el('div', { class: 'toast', role: 'status', 'aria-live': 'polite', hidden: true });
    const nav = panel.querySelector('nav');
    if (nav) nav.before(toast);
    else panel.append(toast);

    noticeController = ExtraPotionsCore.createProductNotice({
      host,
      shadow,
      panel,
      versionButton: product.versionButton,
      releaseUrl: EXP.Updates.RELEASE_URL,
      installUrl: EXP.Updates.INSTALL_URL,
      onVersion: () => {
        if (updateNotice?.hidden === false && updateNotice.dataset.noticeKind === 'current') {
          hideUpdateNotice();
          return;
        }
        showUpdateNotice({
          kicker: 'Current Version',
          title: 'SHIFT Changelog',
          version: EXP.VERSION,
          text: `What's new in v${EXP.VERSION}.`,
          details: EXP.ReleaseNotes.forVersion(EXP.VERSION),
          available: false,
        });
      },
    });
    updateNotice = noticeController.element;

    applyMenuTheme(EXP.Settings.effective());

    try {
      const previous = EXP.Core.consumeVersionChange('shift', EXP.VERSION, lastVersionKey);
      if (previous && !EXP.ReleaseNotes.isQuietUpgrade(previous)) {
        showUpdateNotice({
          kicker: 'Update Complete',
          title: 'SHIFT Updated',
          version: EXP.VERSION,
          text: `Updated from v${previous} to v${EXP.VERSION}.`,
          details: EXP.ReleaseNotes.forVersion(EXP.VERSION),
        });
      }
    } catch {}

    if (initial.updateNotifications) {
      checkUpdateNotice(false).catch((error) => EXP.Core.safeError(error, 'shift-update-ui'));
    }

    return {
      update(next) {
        saved = EXP.Settings.clone(next);
        applyPosition();
        applyMenuTheme(EXP.Settings.effective());
        product?.renderActive();
        product?.refresh();
      },
      toggle() { product?.toggle(); },
      destroy() {
        importDraft=null;healthControl?.dispose();EXP.Inspector.destroy();
        clearTimeout(toastTimer);
        noticeController?.destroy();
        product?.destroy();
        product = noticeController = null;
        host = shadow = launcher = panel = toast = updateNotice = swatchStyle = null;
      },
    };
  }

  const STYLE = `
    .fl-tool-body .diagnostics-controls .action{font-size:var(--exp-font-size-small,11px)!important;padding:4px!important;min-height:28px!important;line-height:1.2!important}
    .fl-tool-body .row.palette-row.mini-row{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:7px!important}
    .fl-tool-body .row.palette-row>.copy{grid-column:1/-1;min-width:0;width:100%;margin:0!important}
    .fl-tool-body .row.palette-row>.exp-theme-swatches{grid-column:1/-1;display:flex!important;flex-wrap:wrap!important;width:100%;min-width:0;gap:5px;justify-content:flex-start}
    .profile-actions{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px;padding:8px 0}
    .profile-actions>*{min-width:0}
    .palette-studio{display:grid;gap:6px}.palette-studio>summary{grid-column:1/-1}.palette-studio>.row{display:flex!important}.palette-studio input[type="color"]{width:42px;height:28px;padding:2px;border:1px solid var(--theme-line);border-radius:6px;background:var(--theme-inset)}.palette-preview{grid-column:1/-1;min-height:54px;border-radius:7px;padding:18px 12px 8px;text-align:center;font-size:var(--exp-font-size-small,11px);font-weight:700}
    .status{display:none}
  `;
  return Object.freeze({ build,refreshHealth:()=>healthControl?.refresh() });
})();
