/* Keep the schedule's one column-header row visible during page scrolling.
   The table keeps its existing horizontal scroll and semantic header cells. */
(function () {
  'use strict';
  const page = document.getElementById('master-schedule-page');
  const screen = document.getElementById('screen-area');
  const table = document.getElementById('master-table');
  const head = document.getElementById('master-head');
  if (!page || !screen || !table || !head) return;

  const style = document.createElement('style');
  style.textContent = '#master-head{position:relative;z-index:10}' +
    '@media print{#master-head{transform:none!important}}';
  document.head.appendChild(style);
  let offset = 0;
  let frame = 0;

  function update() {
    frame = 0;
    if (!table.getClientRects().length) {
      offset = 0;
      head.style.removeProperty('transform');
      return;
    }
    const bounds = head.getBoundingClientRect();
    const naturalTop = bounds.top - offset;
    const screenBounds = screen.getBoundingClientRect();
    const clipped = /auto|scroll|hidden/.test(getComputedStyle(screen).overflowY);
    const top = clipped ? Math.max(0, screenBounds.top + screen.clientTop) : 0;
    const bottom = table.getBoundingClientRect().bottom;
    const next = Math.max(0, Math.min(top - naturalTop, bottom - bounds.height - naturalTop));
    if (next !== offset) {
      offset = next;
      head.style.transform = next ? 'translateY(' + next + 'px)' : '';
    }
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }
  screen.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('pageshow', schedule);
  document.addEventListener('cryer:route', schedule);
  // Filtering, changing years, and expanding rows replace table contents.
  new MutationObserver(schedule).observe(table, { childList: true, subtree: true });
  if ('ResizeObserver' in window) {
    const resize = new ResizeObserver(schedule);
    resize.observe(screen);
    resize.observe(table);
    resize.observe(head);
  }
  // Clear the screen offset before printing; recompute it on return.
  window.addEventListener('beforeprint', function () {
    offset = 0;
    head.style.removeProperty('transform');
  });
  window.addEventListener('afterprint', schedule);
  document.fonts.ready.then(schedule);
  schedule();
}());
