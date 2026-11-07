(() => {
  'use strict';
  const reviews = window.townLedgerProjectReview.projects;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fields = [['approval','Approvals & budget authority'],['funding','Funding & agreements'],['contracts','Contracts & payments'],['stage','Work stage in the dated records']];
  window.townLedgerProjectGuidance = {
    get: id => reviews[id],
    search: id => Object.entries(reviews[id] || {}).filter(([key]) => key !== 'sources').map(([,value]) => value).join(' '),
    render(id) {
      const r = reviews[id];
      if (!r) return '';
      return `<section class="pr-evidence" aria-label="Dated evidence and decisions for this project"><p class="pr-date">Public-record review · November 6, 2026</p><dl class="pr-facts">${fields.map(([key,label])=>`<div><dt>${label}</dt><dd>${esc(r[key])}</dd></div>`).join('')}</dl><div class="pr-choices"><h4>What might residents still influence?</h4><p>${esc(r.influence)}</p><p class="pr-ask"><strong>Ask the Town:</strong> ${esc(r.ask)}</p></div>${r.conflicts?`<p class="pr-conflict"><strong>Source conflict or qualification:</strong> ${esc(r.conflicts)}</p>`:''}<p class="pr-sources"><strong>Evidence:</strong> ${r.sources.map(source=>`<a href="${esc(source.href)}" target="_blank" rel="noopener">${esc(source.label)} ↗</a>`).join(' <span aria-hidden="true">·</span> ')}</p></section>`;
    }
  };
})();
