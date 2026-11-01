/* Counts and recordings have independent permissions in one atomic record.
 * Legacy choices are read without rewriting or expanding their scope.
 * No visitor input, search text, page content, identity or feedback is read here.
 */
(() => {
  'use strict';
  const config = window.townLedgerAnalyticsConfig;
  const prefix = config?.preview ? 'town-ledger:analytics-preparation-choice:' : 'town-ledger:analytics-choice:';
  const key = prefix + 'v2', legacyKey = prefix + 'v1';
  const mode = config?.preview ? 'preview' : 'live';
  const banner = document.getElementById('analytics-banner');
  const dialog = document.getElementById('analytics-dialog');
  const status = document.getElementById('analytics-choice-status');
  const notice = document.getElementById('analytics-notice');
  const adapter = window.townLedgerAnalytics;
  if (!banner || !dialog || !adapter || typeof dialog.showModal !== 'function') return;
  const off = (hasChoice = false) => ({counts: false, recordings: false, hasChoice, legacy: false});
  let choice = off(), opener = null, storageUnavailable = false, reloading = false;
  function parse(raw, version) {
    try {
      const value = JSON.parse(raw);
      return value?.version === version && value.mode === mode && Number.isFinite(value.savedAt) && value.savedAt <= Date.now() && Date.now() - value.savedAt < config.consentMaxAgeDays * 86400000 ? value : null;
    } catch { return null; }
  }
  function read() {
    if (new URL(location.href).searchParams.get('analytics') === 'off') return off(true);
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        const value = parse(raw, config.consentVersion);
        if (!value || !['granted', 'declined'].includes(value.counts) || !['granted', 'declined'].includes(value.recordings)) return off();
        const legacy = parse(localStorage.getItem(legacyKey), 1);
        // A still-open old tab can change its original Clarity-only choice.
        // Recognize that explicit newer action, but not our compatibility mirror.
        if (value && legacy && legacy.splitConsentVersion !== 2 && legacy.savedAt >= value.savedAt && ['granted', 'declined'].includes(legacy.choice)) {
          return {counts: false, recordings: legacy.choice === 'granted', hasChoice: true, legacy: legacy.choice === 'granted'};
        }
        // Never fall back to a stale legacy grant when a newer choice is invalid.
        return {counts: value.counts === 'granted', recordings: value.recordings === 'granted', hasChoice: true, legacy: false};
      }
      const legacy = parse(localStorage.getItem(legacyKey), 1);
      if (!legacy || !['granted', 'declined'].includes(legacy.choice)) return off();
      // The old notice named Clarity only. A saved rejection denies both services.
      return {counts: false, recordings: legacy.choice === 'granted', hasChoice: true, legacy: legacy.choice === 'granted'};
    } catch { storageUnavailable = true; return off(); }
  }
  function sizeBanner() {
    document.documentElement.style.setProperty('--analytics-space', (banner.hidden ? 0 : Math.ceil(banner.getBoundingClientRect().height)) + 'px');
  }
  function render() {
    banner.hidden = choice.hasChoice;
    document.body.classList.toggle('analytics-prompt-visible', !banner.hidden);
    if (navigator.globalPrivacyControl === true) status.textContent = 'Optional analytics is off because this browser sends a privacy preference.';
    else if (storageUnavailable) status.textContent = 'Optional analytics is off.';
    else if (choice.legacy) status.textContent = 'Your saved choice allows Microsoft Clarity recordings only. Basic counts are off. You can choose a different option below.';
    else if (choice.counts && choice.recordings) status.textContent = 'Your choice: allow basic counts and recordings.';
    else if (choice.counts) status.textContent = 'Your choice: allow basic counts. Recordings are off.';
    else if (choice.recordings) status.textContent = 'Your choice: allow recordings. Basic counts are off.';
    else status.textContent = choice.hasChoice ? 'Your choice: reject all. Optional analytics is off.' : 'No choice saved. Optional analytics is off.';
    if (config.preview) status.textContent += ' Tracking is disabled in this preview.';
    notice.textContent = storageUnavailable ? 'This browser could not save your preference. Optional analytics remains off; you may be asked again on your next visit.' : '';
    notice.hidden = !storageUnavailable;
    sizeBanner();
  }
  function markOff() {
    const url = new URL(location.href);
    url.searchParams.set('analytics', 'off');
    history.replaceState(null, '', url);
  }
  function reload() {
    if (!reloading) { reloading = true; location.reload(); }
  }
  function apply(next) {
    if (reloading) return;
    choice = next;
    const needsReload = adapter.apply(storageUnavailable ? off() : next);
    render();
    if (needsReload) {
      if (storageUnavailable) markOff();
      reload();
    }
  }
  function close() { if (dialog.open) dialog.close(); }
  function choose(option) {
    if (reloading || !['basic', 'all', 'reject'].includes(option)) return;
    const next = {counts: option !== 'reject', recordings: option === 'all', hasChoice: true, legacy: false};
    // Stop before any write on reduction, including a later failed storage write.
    const reloadAfterWithdrawal = adapter.stopDisallowed(next);
    try {
      const savedAt = Date.now();
      const record = JSON.stringify({version: config.consentVersion, mode,
        counts: next.counts ? 'granted' : 'declined', recordings: next.recordings ? 'granted' : 'declined', savedAt});
      localStorage.setItem(key, record);
      // Keep already-open legacy tabs and a rollback from reviving recordings.
      // Only explicit actions write this compatibility record; never migrate on read.
      const compatibilityRecord = JSON.stringify({version: 1, mode, choice: next.recordings ? 'granted' : 'declined', savedAt, splitConsentVersion: 2});
      localStorage.setItem(legacyKey, compatibilityRecord);
      if (localStorage.getItem(key) !== record || localStorage.getItem(legacyKey) !== compatibilityRecord) throw new Error('Preference could not be saved');
      storageUnavailable = false;
      if (option !== 'reject') {
        const url = new URL(location.href);
        if (url.searchParams.get('analytics') === 'off') {
          url.searchParams.delete('analytics');
          history.replaceState(null, '', url);
        }
      }
      if (reloadAfterWithdrawal) { reload(); return; }
      apply(next);
    } catch {
      storageUnavailable = true;
      // A partially saved grant must never activate after a failed write.
      for (const storageKey of [key, legacyKey]) { try { localStorage.removeItem(storageKey); } catch { /* fail-closed URL also protects a stale grant */ } }
      markOff();
      apply(off(true));
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
    if (event.key === key || event.key === legacyKey || event.key === null) { storageUnavailable = false; apply(read()); }
  });
  window.addEventListener('pageshow', event => { if (event.persisted) { storageUnavailable = false; apply(read()); } });
  document.querySelectorAll('[data-analytics-preview]').forEach(node => { node.hidden = !config.preview; });
  if ('ResizeObserver' in window) new ResizeObserver(sizeBanner).observe(banner);
  window.addEventListener('resize', sizeBanner);
  apply(read());
})();
