/* Display the existing household model's annual results without changing it. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.cryerHouseholdImpact = api;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const money = value => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0
  }).format(value);
  function compute(data, household, selection) {
    const h = household, s = selection || {};
    if (!h) return {status: 'missing'};
    if (!['inside', 'outside'].includes(h.location)) return {status: 'invalid'};
    if (h.location === 'outside') return {status: 'outside'};
    const input = String(h.home ?? '').trim(), value = Number(input);
    if (!input || !Number.isFinite(value) || value < 0) return {status: 'invalid'};
    const path = data.tax_alternatives[s.taxCase]?.by_gf_case[s.gfCase];
    const row = path?.rows.find(r => r.year === (s.year ?? 2039));
    if (!row || s.taxCase !== 'constant_receipts_share') return {status: 'unavailable'};
    const scale = value / 100000;
    const baseline = row.baseline_tax_per100000_current_home_value * scale;
    const gapShare = row.additional_gap_tax_per100000_current_home_value * scale;
    const total = baseline + gapShare;
    if (![baseline, gapShare, total, row.gap].every(Number.isFinite)) return {status: 'invalid'};
    return {status: 'ready', year: row.year, value, example: h.example === true,
      baseline, gapShare, total, annualGap: row.gap, gfCase: s.gfCase, taxCase: s.taxCase};
  }
  function describe(result) {
    if (result.status === 'outside') return 'No Hillsborough Town property tax applies outside Town limits. This General Fund tax illustration does not add Town property tax to your bill. Utility charges are separate.';
    if (result.status === 'invalid') return 'Enter a valid, nonnegative taxable home value to see the annual Town-tax illustration. Blank or invalid inputs are not treated as zero.';
    if (result.status !== 'ready') return 'The household estimate is not available for these inputs or assumptions. Open the household calculator to choose supported inputs.';
    return `${result.example ? 'Example household' : 'Your household'} · ${money(result.value)} taxable value: the ${result.year} annual Town property-tax illustration is ${money(result.total)} — ${money(result.baseline)} of baseline tax plus ${money(result.gapShare)} toward that year’s funding gap.`;
  }
  function basis(result) {
    if (result.status !== 'ready') return 'Water, sewer, stormwater and County taxes are separate from this Town property-tax illustration.';
    return `This uses FY${result.year}’s annual General Fund gap of ${money(result.annualGap)}, before additional savings. It assumes your share of Town property-tax receipts stays fixed and the whole remaining gap is funded through property tax. Spending choices, other funding and changes in the tax base could change the result. This is not an adopted bill. Water, sewer, stormwater and County taxes are separate.`;
  }
  return {compute, describe, basis};
});
