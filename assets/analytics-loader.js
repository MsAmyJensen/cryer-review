/* One top-level installation, never in hosted forms or standalone source pages.
 * No input values, search text, identity, custom tags or custom events are read.
 * Text/image masking is present in HTML before this loader can run.
 */
(() => {
  'use strict';
  const config = window.townLedgerAnalyticsConfig;
  if (!config || window !== window.top) return;
  let attempted = false, blocked = false, loaded = false, tag = null;
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
    // Stop can flush a final beacon; consent denial can restart cookieless capture.
    // Apply browser-enforced restrictions BEFORE either call, then unload the SDK.
    // This policy lasts only until the immediate reload. It does not affect forms
    // opened separately and does not touch any account or server configuration.
    const policy = document.createElement('meta');
    policy.httpEquiv = 'Content-Security-Policy';
    policy.content = "connect-src 'none'; script-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; frame-src 'self'; worker-src 'none'; object-src 'none'";
    document.head.appendChild(policy);
  }
  function stop() {
    blocked = attempted;
    const needsReload = attempted;
    if (needsReload) {
      blockTransport();
      tag?.remove();
      if (typeof window.clarity === 'function') {
        try { window.clarity('consentv2', {analytics_Storage: 'denied', ad_Storage: 'denied'}); } catch { /* reload still unloads the SDK */ }
        try { window.clarity('stop'); } catch { /* reload still unloads the SDK */ }
        if (window.clarity.q) window.clarity.q.length = 0;
      }
    }
    clearCookies();
    loaded = false;
    return needsReload;
  }
  function start() {
    if (attempted || blocked || !config.enabled || config.preview || !config.allowedOrigins.includes(location.origin) || !safeLocation()) return false;
    if (navigator.globalPrivacyControl === true) return false;
    if (document.documentElement.getAttribute('data-clarity-mask') !== 'True') return false;
    attempted = true;
    window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
    // Queue consent before inserting the asynchronous tag. No advertising grant.
    window.clarity('consentv2', {analytics_Storage: 'granted', ad_Storage: 'denied'});
    tag = document.createElement('script');
    tag.async = true;
    tag.referrerPolicy = 'no-referrer';
    tag.src = 'https://www.clarity.ms/tag/' + config.projectId;
    tag.id = 'town-ledger-clarity-tag';
    tag.addEventListener('load', () => { if (!blocked) loaded = true; });
    tag.addEventListener('error', () => { loaded = false; });
    document.head.appendChild(tag);
    return true;
  }
  // Existing navigation generates only public route hashes; household values
  // stay in tab storage and Search never writes its query to a URL. Do not
  // reinitialize the SDK, add custom route tags, or reload on chapter changes.
  window.townLedgerAnalytics = Object.freeze({start, stop,
    snapshot: () => ({enabled: config.enabled, preview: config.preview, attempted, loaded, blocked})
  });
})();
