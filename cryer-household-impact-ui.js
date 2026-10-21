(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const node = $('household-utility-data') || $('cryer-household-impact-data');
  if (!node || !window.cryerHouseholdImpact || !window.cryerPreviewState) return;
  const data = JSON.parse(node.textContent), api = window.cryerHouseholdImpact;
  const standalone = Boolean($('review-household-form'));
  let state = window.cryerPreviewState.read() || window.cryerPreviewState.defaults();
  function render() {
    const current = standalone ? state : window.cryerPreviewState.capture();
    if (!current) return;
    const result = api.compute(data, current.household, current.selection);
    const impact = $('review-household-impact');
    if (impact) impact.textContent = api.describe(result);
    $('review-household-basis').textContent = api.basis(result);
    if (standalone) {
      if (document.activeElement !== $('review-household-home')) $('review-household-home').value = current.household.home;
      $('review-household-location').value = current.household.location;
      $('review-household-home').disabled = current.household.location === 'outside';
      $('review-household-input-note').textContent = current.household.example
        ? 'This is an example home. Enter your taxable value, or open What do I pay? to include your location, services and water use.'
        : 'This uses the taxable value and location shown here. The notes below explain how the example divides the Town’s funding gap and extends past cost trends.';
    }
  }
  if (standalone) {
    $('review-household-form').addEventListener('submit', event => event.preventDefault());
    $('review-household-home').addEventListener('input', event => {
      state.household.home = event.target.value.trim().replace(/,/g, '');
      state.household.example = false; window.cryerPreviewState.save(state); render();
    });
    $('review-household-location').addEventListener('change', event => {
      state.household.location = event.target.value; state.household.example = false;
      window.cryerPreviewState.save(state); render();
    });
    window.addEventListener('pageshow', () => { state = window.cryerPreviewState.read() || state; render(); });
  } else {
    for (const event of ['cryer:household', 'cryer:outlook', 'cryer:route']) window.addEventListener(event, render);
    for (const id of ['hh-tax-path', 'hh-utility-case']) $(id)?.addEventListener('change', render);
  }
  render();
})();
