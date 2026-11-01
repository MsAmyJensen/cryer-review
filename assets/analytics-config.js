/* Each service loads only after its own saved visitor permission. */
window.townLedgerAnalyticsConfig = Object.freeze({
  enabled: true,
  preview: false,
  projectId: 'z4rmqz4t9f',
  allowedOrigins: Object.freeze(['https://townledger.org']),
  // Public Web Analytics identifier supplied by the site owner; not an API credential.
  cloudflare: Object.freeze({enabled: true, token: 'c9ea39700bca455799fff0bfdfbb5b01'}),
  consentVersion: 2,
  consentMaxAgeDays: 180
});
