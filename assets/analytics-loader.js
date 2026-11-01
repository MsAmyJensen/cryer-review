/* One installation in the main document. Never instrument evidence frames or forms.
 * No input values, search text, identity, custom tags or custom events are read.
 * Clarity text/image masking is present in HTML before this loader can run.
 */
(() => {
  'use strict';
  const config = window.townLedgerAnalyticsConfig;
  if (!config || window !== window.top || !['/', '/index.html'].includes(location.pathname)) return;
  const counts = {attempted: false, loaded: false, tag: null};
  const recordings = {attempted: false, loaded: false, tag: null};
  let blocked = false, active = true;
  function safeLocation() {
    // URLs/referrers can contain personal data and are not covered by DOM masking.
    if (location.search || document.referrer.includes('?')) return false;
    const key = location.hash.slice(1);
    const fixed = ['','welcome','brief','options','sources','engage','impact','money','who','funding','services','projects','pay','future','participate','project-choices'];
    if (fixed.includes(key)) return true;
    if (key.startsWith('detail=')) return ['priorities','budget-process','records','reference','summary','changes','shared-costs','who-sources','loan-projects','loan-rail','loan-fire','loan-north','loan-ladder','loan-south'].includes(key.slice(7));
    const routes = window.townLedgerPreviewData?.['route-data'] || {};
    if (Object.hasOwn(routes, key) || document.getElementById(key)) return true;
    // Full detail URLs are intentionally excluded from analytics until reviewed.
    return false;
  }
  function clearCookies() {
    const parts = location.hostname.split('.');
    const domains = [''];
    for (let i = 0; i < parts.length - 1; i++) domains.push('; Domain=' + parts.slice(i).join('.'));
    for (const name of ['_clck', '_clsk']) for (const domain of domains) {
      document.cookie = name + '=; Max-Age=0; Path=/' + domain + '; SameSite=Lax';
    }
  }
  function blockTransport() {
    // Stop can flush a final beacon; Clarity consent denial can restart capture.
    // Block transport BEFORE either call. A reload unloads both SDKs and restores
    // only the permissions still saved. This policy lasts for this document only.
    const policy = document.createElement('meta');
    policy.httpEquiv = 'Content-Security-Policy';
    policy.content = "connect-src 'none'; script-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; frame-src 'self'; worker-src 'none'; object-src 'none'";
    document.head.appendChild(policy);
  }
  function permissions(value) {
    const privacyOff = navigator.globalPrivacyControl === true;
    return {counts: !privacyOff && value?.counts === true, recordings: !privacyOff && value?.recordings === true};
  }
  function stopDisallowed(value) {
    const next = permissions(value);
    const needsReload = blocked || (counts.attempted && !next.counts) || (recordings.attempted && !next.recordings);
    if (needsReload && !blocked) {
      blocked = true;
      blockTransport();
      counts.tag?.remove();
      recordings.tag?.remove();
      if (recordings.attempted && typeof window.clarity === 'function') {
        try { window.clarity('consentv2', {analytics_Storage: 'denied', ad_Storage: 'denied'}); } catch { /* reload still unloads the SDK */ }
        try { window.clarity('stop'); } catch { /* reload still unloads the SDK */ }
        if (window.clarity.q) window.clarity.q.length = 0;
      }
      counts.loaded = recordings.loaded = false;
    }
    if (!next.recordings || needsReload) clearCookies();
    return needsReload;
  }
  function attach(state, tag) {
    state.attempted = true;
    state.tag = tag;
    tag.addEventListener('load', () => { if (!blocked) state.loaded = true; });
    tag.addEventListener('error', () => { state.loaded = false; });
    document.head.appendChild(tag);
  }
  function apply(value) {
    const next = permissions(value);
    if (stopDisallowed(next)) return true;
    if (!active || blocked || !config.enabled || config.preview || !config.allowedOrigins.includes(location.origin) || !safeLocation()) return false;
    if (next.counts && !counts.attempted && config.cloudflare?.enabled === true && typeof config.cloudflare.token === 'string' && config.cloudflare.token.trim()) {
      const tag = document.createElement('script');
      tag.type = 'module';
      tag.src = 'https://static.cloudflareinsights.com/beacon.min.js';
      tag.id = 'town-ledger-cloudflare-tag';
      // One document load, not one measurement per hash change or embedded page.
      tag.setAttribute('data-cf-beacon', JSON.stringify({token: config.cloudflare.token, spa: false}));
      attach(counts, tag);
    }
    if (next.recordings && !recordings.attempted && document.documentElement.getAttribute('data-clarity-mask') === 'True') {
      window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
      // Queue consent before inserting the asynchronous tag. No advertising grant.
      window.clarity('consentv2', {analytics_Storage: 'granted', ad_Storage: 'denied'});
      const tag = document.createElement('script');
      tag.async = true;
      tag.referrerPolicy = 'no-referrer';
      tag.src = 'https://www.clarity.ms/tag/' + config.projectId;
      tag.id = 'town-ledger-clarity-tag';
      attach(recordings, tag);
    }
    return false;
  }
  // Do not reinitialize either SDK or add custom events on chapter changes.
  window.addEventListener('pagehide', () => { active = false; });
  window.addEventListener('pageshow', () => { active = true; });
  window.townLedgerAnalytics = Object.freeze({apply, stopDisallowed,
    snapshot: () => ({enabled: config.enabled, preview: config.preview, blocked,
      counts: {attempted: counts.attempted, loaded: counts.loaded},
      recordings: {attempted: recordings.attempted, loaded: recordings.loaded}})
  });
})();
