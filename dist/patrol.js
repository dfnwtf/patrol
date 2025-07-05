/* DFN Nonsense Patrol — Free-Tier Widget (MVP)
   --------------------------------------------------
   Updated 2025-07-04
   * change: CSS is now injected inline, so no network request to cdn.dfn.watch
   * result: console error ERR_NAME_NOT_RESOLVED disappears
*/

(function () {
  const BADGE_TAG = 'dfn-badge';
  const STYLE = `
  ${BADGE_TAG} {
    position: fixed;
    z-index: 2147483000;
    width: 24px; height: 24px;
    cursor: pointer;
  }
  ${BADGE_TAG}[data-position="br"] { bottom: 16px; right: 16px; }
  ${BADGE_TAG}[data-position="bl"] { bottom: 16px; left: 16px; }
  ${BADGE_TAG}[data-position="tr"] { top: 16px;    right: 16px; }
  ${BADGE_TAG}[data-position="tl"] { top: 16px;    left: 16px; }
  .dfn-patrol-modal {
    position: fixed; inset:0; display:flex; align-items:center; justify-content:center;
    background: rgba(0,0,0,.45);
    z-index: 2147483600;
  }
  .dfn-patrol-card {
    width: 320px; max-width: 90vw; background:#111; color:#fff; border-radius:12px;
    font-family: system-ui, sans-serif; padding:20px; box-shadow:0 6px 24px rgba(0,0,0,.4);
  }
  `;

  /** Inject <style> once */
  function injectCSS() {
    if (document.getElementById('dfn-patrol-style')) return;
    const s = document.createElement('style');
    s.id = 'dfn-patrol-style';
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  /** Minimal SVG for shield */
  const SHIELD_SVG =
    'data:image/svg+xml;base64,' +
    btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f5d742"><path d="M12 2 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3Z"/></svg>');

  /** Mount badge & listeners */
  function mount(el) {
    injectCSS();
    el.innerHTML = `<img src="${SHIELD_SVG}" alt="DFN Patrol" style="width:100%;height:100%">`;
    el.addEventListener('click', () => openDashboard(el));
  }

  /** Simple modal placeholder */
  function openDashboard(el) {
    if (document.querySelector('.dfn-patrol-modal')) return;
    const wrap = document.createElement('div');
    wrap.className = 'dfn-patrol-modal';
    wrap.innerHTML = `
      <div class="dfn-patrol-card">
        <h3 style="margin:0 0 8px">DFN Patrol (beta)</h3>
        <p style="margin:0 0 16px;line-height:1.4">Live analytics coming soon…</p>
        <button id="dfn-close" style="background:#f5d742;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;color:#111;font-weight:600;">Close</button>
      </div>`;
    wrap.querySelector('#dfn-close').onclick = () => wrap.remove();
    document.body.appendChild(wrap);
  }

  /** Auto-init on DOMContentLoaded */
  document.addEventListener('DOMContentLoaded', () => {
    const others = document.querySelectorAll(BADGE_TAG);
    others.forEach(el => {
      // default attrs
      if (!el.hasAttribute('data-position')) el.setAttribute('data-position', 'br');
      mount(el);
    });
    console.info('DFN Patrol: initialized');
  });

  /** Test hook */
  window.addEventListener('DFN_TEST_ALERT', e => {
    const d = e.detail;
    console.log('TEST ALERT', d);
    alert(`Test alert: ${d.type} ${d.amount}`);
  });
})();
