/* Carry household inputs and selected assumptions within this browser tab only. */
(() => {
  'use strict';
  const key = 'cryer-review-household:' + new URL('.', location.href).href;
  const dataNode = document.getElementById('household-utility-data') || document.getElementById('cryer-household-impact-data');
  const data = dataNode ? JSON.parse(dataNode.textContent) : null;
  const defaultSelection = data ? {
    taxCase: Object.keys(data.tax_alternatives)[0],
    gfCase: Object.keys(Object.values(data.tax_alternatives)[0].by_gf_case)[0],
    utilityCase: 'historical_rate_growth', year: 2039
  } : null;
  function householdShape(h) {
    return h && ['inside', 'outside'].includes(h.location)
      && ['both', 'water', 'sewer', 'none'].includes(h.services)
      && ['home', 'gallons'].every(k => typeof h[k] === 'string')
      && typeof h.example === 'boolean';
  }
  function normalize(value) {
    if (householdShape(value)) return {household: value, selection: {...defaultSelection}};
    if (!householdShape(value?.household) || !value.selection) return null;
    const s = value.selection;
    if (!data?.tax_alternatives[s.taxCase]?.by_gf_case[s.gfCase]) return null;
    return {household: {...value.household}, selection: {...s, year: 2039}};
  }
  function read() {
    try { return normalize(JSON.parse(sessionStorage.getItem(key) || 'null')); }
    catch (_) { return null; }
  }
  function save(value) {
    const safe = normalize(value);
    if (!safe) return false;
    try { sessionStorage.setItem(key, JSON.stringify(safe)); return true; }
    catch (_) { return false; }
  }
  function capture() {
    if (!window.cryerHousehold) return read();
    return {household: window.cryerHousehold.get(), selection: {
      taxCase: window.cryerHouseholdProjection.getTaxCase(),
      utilityCase: window.cryerHouseholdProjection.getUtilityCase(),
      gfCase: window.cryerOutlook.getScenario(), year: 2039
    }};
  }
  function restore() {
    if (!window.cryerHousehold) return;
    const saved = read();
    if (!saved) return;
    const view = window.cryerUI.capture();
    view.home = {...saved.household};
    view.householdProjection = {taxCase: saved.selection.taxCase, utilityCase: saved.selection.utilityCase};
    view.longerOutlook = {scenario: saved.selection.gfCase};
    window.cryerUI.restore(view, document.body.dataset.route || 'relationships');
    window.cryerHousehold.set(saved.household);
    try { sessionStorage.removeItem(key); } catch (_) {}
  }
  window.cryerPreviewState = {read, save, capture, defaults: () => ({
    household: {location: 'inside', services: 'both', home: '400000', gallons: '4000', example: true},
    selection: {...defaultSelection}
  })};
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href]');
    if (!anchor || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || anchor.target === '_blank' || !window.cryerHousehold) return;
    const target = new URL(anchor.href, location.href);
    if (new URL('.', target).href !== new URL('.', location.href).href
      || !/\/(?:Cryer-Future-Outlook-(?:General-Fund|Utilities)|Cryer-(?:General-Fund|Water-Sewer)-Loan-Projects)-Source-Links-2026-10-16\.html$/.test(target.pathname)) return;
    save(capture());
  });
  window.addEventListener('pageshow', restore);
  restore();
})();
