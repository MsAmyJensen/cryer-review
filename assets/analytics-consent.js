/* Preparation choices use their own storage key. A live release asks again.
 * No visitor input, search text, page content, identity or feedback is read here.
 */
(() => {
  'use strict';
  const config = window.townLedgerAnalyticsConfig;
  const key = config?.preview ? 'town-ledger:analytics-preparation-choice:v1' : 'town-ledger:analytics-choice:v1';
  const mode = config?.preview ? 'preview' : 'live';
  const banner = document.getElementById('analytics-banner');
  const dialog = document.getElementById('analytics-dialog');
  const status = document.getElementById('analytics-choice-status');
  const notice = document.getElementById('analytics-notice');
  const adapter = window.townLedgerAnalytics;
  if (!banner || !dialog || !adapter || typeof dialog.showModal !== 'function') return;
  let choice = null;
  let opener = null;
  let storageUnavailable = false;

  function parse(raw) {
    try {
      const value = JSON.parse(raw);
      return value?.version === config.consentVersion && value.mode === mode && Number.isFinite(value.savedAt) && value.savedAt <= Date.now() && Date.now() - value.savedAt < config.consentMaxAgeDays * 86400000 && ['granted', 'declined'].includes(value.choice) ? value.choice : null;
    } catch { return null; }
  }
  function read() {
    if (new URL(location.href).searchParams.get('analytics') === 'off') return 'declined';
    try { return parse(localStorage.getItem(key)); }
    catch { storageUnavailable = true; return null; }
  }
  function sizeBanner() {
    document.documentElement.style.setProperty('--analytics-space', (banner.hidden ? 0 : Math.ceil(banner.getBoundingClientRect().height)) + 'px');
  }
  function render() {
    banner.hidden = choice !== null;
    document.body.classList.toggle('analytics-prompt-visible', !banner.hidden);
    status.textContent = choice === 'granted' ? (config.preview ? 'Your preview choice: Accept optional cookies. Tracking is still off in this preview.' : 'Your choice: Accept optional cookies.') : choice === 'declined' ? 'Your choice: Reject optional cookies. Analytics is off.' : 'No choice saved. Analytics is off.';
    notice.textContent = storageUnavailable ? 'This browser could not save your preference. Analytics remains off; you may be asked again on your next visit.' : '';
    notice.hidden = !storageUnavailable;
    sizeBanner();
  }
  function apply(next) {
    choice = next;
    if (choice === 'granted' && !storageUnavailable) adapter.start();
    else if (adapter.stop()) location.reload();
    render();
  }
  function close() { if (dialog.open) dialog.close(); }
  function choose(next) {
    // Stop immediately on withdrawal even if browser storage subsequently fails.
    const reloadAfterWithdrawal = next !== 'granted' && adapter.stop();
    try {
      localStorage.setItem(key, JSON.stringify({version: config.consentVersion, mode, choice: next, savedAt: Date.now()}));
      storageUnavailable = false;
      if (next === 'granted') {
        const url = new URL(location.href);
        if (url.searchParams.get('analytics') === 'off') {
          url.searchParams.delete('analytics');
          history.replaceState(null, '', url);
        }
      }
      if (reloadAfterWithdrawal) { location.reload(); return; }
      apply(next);
    } catch {
      storageUnavailable = true;
      // Never keep or activate a grant that could not be saved. No other storage is touched.
      try { localStorage.removeItem(key); } catch { /* inaccessible storage */ }
      // A stale saved grant must never re-enable tracking after failed withdrawal
      // storage. Preserve the current route, adding a non-identifying fail-closed
      // marker that the next document checks before reading localStorage.
      const url = new URL(location.href);
      url.searchParams.set('analytics', 'off');
      history.replaceState(null, '', url);
      apply('declined');
      if (reloadAfterWithdrawal) { location.reload(); return; }
    }
    if (storageUnavailable) {
      if (!dialog.open) open(document.querySelector('[data-analytics-settings]'));
      return;
    }
    if (dialog.open) close();
    else document.getElementById('main').focus({preventScroll: true});
  }
  function open(button) {
    opener = button;
    render();
    if (!dialog.open) dialog.showModal();
    document.getElementById('analytics-close').focus();
  }
  document.querySelectorAll('[data-analytics-settings]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => open(button));
  });
  document.querySelectorAll('[data-analytics-choice]').forEach(button => button.addEventListener('click', () => choose(button.dataset.analyticsChoice)));
  document.getElementById('analytics-close').addEventListener('click', close);
  dialog.addEventListener('close', () => {
    const target = opener?.isConnected && opener.getClientRects().length ? opener : document.getElementById('main');
    target.focus({preventScroll: true});
  });
  document.addEventListener('keydown', event => {
    if (!dialog.open) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); close(); }
    if (event.key !== 'Tab') return;
    const buttons = [...dialog.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')].filter(button => button.getClientRects().length);
    const first = buttons[0], last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }, true);
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) { storageUnavailable = false; apply(read()); }
  });
  window.addEventListener('pageshow', event => { if (event.persisted) { apply(read()); } });
  document.querySelectorAll('[data-analytics-preview]').forEach(node => { node.hidden = !config.preview; });
  if ('ResizeObserver' in window) new ResizeObserver(sizeBanner).observe(banner);
  window.addEventListener('resize', sizeBanner);
  apply(read());
})();
