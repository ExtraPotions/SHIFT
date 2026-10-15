// Component roles use SHIFT palette variables. Rules are authored for SHIFT;
// page structure, media, and other products' owned content stay untouched.
EXP.ThemeRules = (() => {
  const guard = ':not(:where([data-exp-owned="1"],[data-exp-owned="1"] *,[data-exp-shift-preserve],[data-exp-shift-preserve] *,img,picture,video,canvas,svg,svg *,[role="img"]))';
  const statuses = {
    success: { selectors: '.alert-success,.notification--success,.notice--success,.MuiAlert-standardSuccess,.ant-alert-success,.btn-success,[data-status="success"]', tone:'#218739', text:'#dcffe4' },
    warning: { selectors: '.alert-warning,.notification--warning,.notice--warning,.MuiAlert-standardWarning,.ant-alert-warning,.btn-warning,[data-status="warning"]', tone:'#b88718', text:'#fff3c4' },
    danger: { selectors: '.alert-danger,.alert-error,.notification--error,.notice--error,.MuiAlert-standardError,.ant-alert-error,.btn-danger,[data-status="error"]', tone:'#a8323a', text:'#ffe1e4' },
    info: { selectors: '.alert-info,.notification--info,.notice--info,.MuiAlert-standardInfo,.ant-alert-info,.btn-info,[data-status="info"]', tone:'#2879a8', text:'#e0f4ff' }
  };
  function css(state, exclusion = '') {
    const target = selector => `html[data-exp-shift] :is(${selector})${exclusion}${guard}`;
    const rules = [];
    const paint = (selector, role) => rules.push(`${target(selector)}{background-color:var(--exp-shift-${role})!important;color:var(--exp-shift-text)!important;border-color:var(--exp-shift-border)!important}`);
    rules.push(`html[data-exp-shift]{--exp-shift-border:color-mix(in srgb,var(--exp-shift-muted) 40%,transparent);--exp-shift-table-heading:var(--exp-shift-raised);--exp-shift-table-row:var(--exp-shift-surface);--exp-shift-code:var(--exp-shift-raised);--exp-shift-control-hover:color-mix(in srgb,var(--exp-shift-accent) 24%,var(--exp-shift-interactive))}`);
    paint('table,tbody,tr,td,[role="table"],[role="gridcell"]', 'table-row');
    paint('thead,th,[role="columnheader"],[role="rowheader"]', 'table-heading');
    paint('dialog,[role="dialog"],[role="alertdialog"],.modal-content,.MuiDialog-paper,.ant-modal-content', 'overlay');
    paint('[role="menu"],[role="listbox"],.dropdown-menu,.MuiMenu-paper,.ant-dropdown-menu', 'raised');
    paint('code,pre,kbd,samp', 'code');
    paint('button,[role="button"],.btn', 'interactive');
    rules.push(`${target('button,[role="button"],.btn')}:not(:disabled):not([aria-disabled="true"]):hover{background-color:var(--exp-shift-control-hover)!important}`);
    if (state.formReadability) paint('input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]):not([type="image"]),select,textarea', 'input');
    for (const [name, status] of Object.entries(statuses)) {
      rules.push(`html[data-exp-shift]{--exp-shift-${name}-surface:color-mix(in srgb,${status.tone} 30%,var(--exp-shift-surface));--exp-shift-${name}-text:${status.text};--exp-shift-${name}-border:${status.tone}}`);
      rules.push(`${target(status.selectors)}{background-color:var(--exp-shift-${name}-surface)!important;color:var(--exp-shift-${name}-text)!important;border-color:var(--exp-shift-${name}-border)!important}`);
      rules.push(`${target(status.selectors)} :is(a,span,p,small,label,strong,button)${guard}{color:var(--exp-shift-${name}-text)!important}`);
    }
    // Alert role alone conveys urgency, not a success/error hue.
    rules.push(`${target('[role="alert"]')}:not(:is(${Object.values(statuses).map(s=>s.selectors).join(',')})){background-color:var(--exp-shift-raised)!important;color:var(--exp-shift-text)!important}`);
    return rules.join('\n');
  }
  return Object.freeze({ css });
})();
