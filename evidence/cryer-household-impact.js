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
    if (result.status === 'outside') return 'A home outside Town limits does not pay Hillsborough Town property tax, so this tax example adds nothing to your bill. Any utility charges and County taxes are separate.';
    if (result.status === 'invalid') return 'Enter your home’s taxable value as a number of zero or more. Until then, there is no tax estimate; a blank entry does not mean your tax is zero.';
    if (result.status !== 'ready') return 'A tax estimate is not available for this selection. Open the household calculator to check your entries and choose an available example.';
    return `${result.example ? 'Example home' : 'Your home'} · ${money(result.value)} taxable value: annual Town property tax would be about ${money(result.total)} for ${result.year} in this scenario. That includes ${money(result.baseline)} in projected tax before paying for the shortfall, plus ${money(result.gapShare)} toward that year’s gap.`;
  }
  function basis(result) {
    if (result.status !== 'ready') return 'Water, sewer, stormwater and County taxes are not included in this Town property-tax example.';
    return `The example assumes property taxes cover the entire ${money(result.annualGap)} funding gap for FY${result.year}, without using more savings. It also assumes your home keeps the same share of the Town’s property-tax collections. Different spending, other income or changes in taxable property could change your cost. This is not an adopted bill. Water, sewer, stormwater and County taxes are separate.`;
  }
  return {compute, describe, basis};
});
