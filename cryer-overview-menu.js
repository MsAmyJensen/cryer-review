/* Local section navigation only; no financial state or calculations. */
(() => {
  const toggle = document.getElementById('overview-menu-toggle');
  const menu = document.getElementById('overview-site-menu');
  if (!toggle || !menu) return;
  const mobile = matchMedia('(max-width:1100px)');
  let open = false;
  function render() {
    toggle.hidden = !mobile.matches;
    menu.hidden = mobile.matches && !open;
    toggle.setAttribute('aria-expanded', String(!menu.hidden));
  }
  toggle.addEventListener('click', () => { open = !open; render(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobile.matches && open) {
      open = false; render(); toggle.focus();
    }
  });
  menu.addEventListener('click', event => {
    if (event.target.closest('a')) { open = false; render(); }
  });
  mobile.addEventListener('change', render);
  window.addEventListener('pageshow', render);
  render();
})();
