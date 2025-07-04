/* DFN Nonsense Patrol – MVP v1.1-preview
 * – режим Badge (dfn-badge) + режим Section (dfn-patrol)
 * – inline-CSS, без внешних запросов
 * – placeholder UI; реальные данные появятся, когда подключим WSS
 *   2025-07-07
 */

(function () {
  const BADGE = 'dfn-badge';
  const PANEL = 'dfn-patrol';

  const STYLE = `
  /* ───── базовые переменные ───── */
  :root{
    --dfn-bg:     #111;           /* фон секции / модалки */
    --dfn-card:   #181818;        /* фон карточек */
    --dfn-accent: #f5d742;        /* основной акцент */
    --dfn-radius: 12px;
    --dfn-shadow: 0 6px 24px rgba(0,0,0,.45);
    --dfn-font:   system-ui, sans-serif;
  }
  /* ───── маленький щит ───── */
  ${BADGE}{position:fixed;z-index:2147483000;width:24px;height:24px;cursor:pointer}
  ${BADGE}[data-position="br"]{bottom:16px;right:16px}
  ${BADGE}[data-position="bl"]{bottom:16px;left:16px}
  ${BADGE}[data-position="tr"]{top:16px;right:16px}
  ${BADGE}[data-position="tl"]{top:16px;left:16px}
  /* ───── всплывающая модалка (для щита) ───── */
  .dfn-patrol-ol{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;
    background:rgba(0,0,0,.45);z-index:2147483600}
  .dfn-patrol-card{width:320px;max-width:90vw;background:var(--dfn-bg);color:#fff;
    border-radius:var(--dfn-radius);font-family:var(--dfn-font);padding:22px;
    box-shadow:var(--dfn-shadow)}
  /* ───── секция INLINE ───── */
  ${PANEL}{display:block;font-family:var(--dfn-font);color:#fff;background:var(--dfn-card);
    border-radius:var(--dfn-radius);padding:22px;box-shadow:var(--dfn-shadow)}
  ${PANEL}[data-layout="card"]{max-width:420px;margin:0 auto}
  .dfn-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
  .dfn-val{font-weight:600}
  .dfn-grid{display:grid;gap:10px 14px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))}
  .dfn-grid div{background:#0004;padding:8px 10px;border-radius:8px;font-size:.85rem}
  .dfn-tag{background:var(--dfn-accent);color:#000;padding:2px 6px;border-radius:4px;font-size:.7rem}
  `;

  const SHIELD_SVG = 'data:image/svg+xml;base64,' +
    btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f5d742"><path d="M12 2 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3Z"/></svg>');

  /* — style inject once — */
  function css(){if(!document.getElementById('dfn-patrol-style')){const s=document.createElement('style');s.id='dfn-patrol-style';s.textContent=STYLE;document.head.appendChild(s);}}

  /* — badge — */
  function mountBadge(el){
    css();
    if(!el.hasAttribute('data-position')) el.setAttribute('data-position','br');
    el.innerHTML=`<img src="${SHIELD_SVG}" alt="DFN Patrol" style="width:100%;height:100%">`;
    el.addEventListener('click',()=>openModal(el.getAttribute('embed')));
  }

  /* — modal — */
  function openModal(embed){
    if(document.querySelector('.dfn-patrol-ol')) return;
    const ol=document.createElement('div');
    ol.className='dfn-patrol-ol';
    ol.innerHTML=`
      <div class="dfn-patrol-card">
        <h3 style="margin:0 0 8px">DFN Patrol — ${embed}</h3>
        <p style="margin:0 0 14px">Live analytics coming soon…</p>
        <button style="background:var(--dfn-accent);border:none;padding:8px 16px;border-radius:6px;cursor:pointer;color:#111;font-weight:600">Close</button>
      </div>`;
    ol.querySelector('button').onclick=()=>ol.remove();
    document.body.appendChild(ol);
  }

  /* — section (dfn-patrol) — */
  function mountSection(el){
    css();
    const embed = el.getAttribute('embed') || '???';
    const layout= el.getAttribute('data-layout')||'full';
    el.setAttribute('data-layout',layout);

    el.innerHTML=`
      <div class="dfn-head">
        <strong>DFN Patrol — ${embed}</strong>
        <span class="dfn-tag">beta</span>
      </div>
      <div class="dfn-grid">
        <div>Price<br><span class="dfn-val" id="${embed}-price">0.00000</span></div>
        <div>LP Locked<br><span class="dfn-val" id="${embed}-lp">–</span></div>
        <div>Risk<br><span class="dfn-val" id="${embed}-risk">–</span></div>
        <div>Whale Alerts<br><span class="dfn-val" id="${embed}-whale">0</span></div>
        <div>Dev Sells 24h<br><span class="dfn-val" id="${embed}-dev">0</span></div>
        <div>Supply Δ 24h<br><span class="dfn-val" id="${embed}-supply">0 %</span></div>
      </div>
      <div style="text-align:right;margin-top:12px">
        <a href="https://dfn.wtf" target="_blank" style="color:var(--dfn-accent);font-size:.8rem;text-decoration:none">Full feed ↗</a>
      </div>`;
    // todo: WebSocket update handlers will target ids like `${embed}-price`
  }

  /* — bootstrap — */
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll(BADGE).forEach(mountBadge);
    document.querySelectorAll(PANEL).forEach(mountSection);
    console.info('DFN Patrol: initialized');
  });

  /* — test hook — */
  window.addEventListener('DFN_TEST_ALERT',e=>{
    alert(`Test alert: ${e.detail.type} ${e.detail.amount}`);
  });
})();
