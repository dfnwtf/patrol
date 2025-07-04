/*  DFN Nonsense Patrol  –  v1.1.1   (2025-07-14)
    ------------------------------------------------
    • supports <dfn-badge>  and  <dfn-patrol>
    • live alerts: whale-sell/-buy, dev-sell, mint/burn, bundle
    • LP-locked, risk light, clusters, toast engine
    • internal token-picker (data-allow-pick)
    • WS endpoint: wss://edge.dfn.wtf/alerts
    ≈ 15 KB  gzip
*/

(() => {
/*────────────────────  CONFIG  ────────────────────*/
const ENDPOINT  = 'wss://edge.dfn.wtf/alerts';
const SNAPSHOT_INTERVAL = 60_000;          // 60 s
const TOAST_LIFE        = 7_000;           // 7 s

/*─────────────────  UTILITIES  ───────────────────*/
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const h = (tag, attrs={}, ...kids) => {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k,v));
  kids.flat().forEach(k=> el.append(k));
  return el;
};

/*───────────────  STYLE (injected once)  ─────────*/
const STYLE = `
:root{
  --dfn-bg:#111; --dfn-card:#181818; --dfn-accent:#f5d742;
  --dfn-radius:12px; --dfn-shadow:0 6px 20px rgba(0,0,0,.4);
  --dfn-font:system-ui,sans-serif;
}
/* badge */
dfn-badge{position:fixed;z-index:2147483000;width:24px;height:24px;cursor:pointer}
dfn-badge[data-position="br"]{bottom:16px;right:16px}
dfn-badge[data-position="bl"]{bottom:16px;left:16px}
dfn-badge[data-position="tr"]{top:16px;right:16px}
dfn-badge[data-position="tl"]{top:16px;left:16px}
/* toast */
.dfn-toast{position:fixed;right:16px;bottom:16px;width:320px;
  background:#222;border-left:6px solid var(--clr);padding:10px 14px;
  border-radius:8px;color:#fff;font:14px/1.35 var(--dfn-font);
  box-shadow:var(--dfn-shadow);opacity:0;transform:translateY(20px);
  transition:all .25s}
.dfn-toast.show{opacity:1;transform:none}
/* panel */
dfn-patrol{display:block;background:var(--dfn-card);color:#fff;
  border-radius:var(--dfn-radius);padding:22px;box-shadow:var(--dfn-shadow);
  font-family:var(--dfn-font)}
dfn-patrol[data-layout="card"]{max-width:420px;margin:0 auto}
.dfn-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
.dfn-grid{display:grid;gap:10px 14px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))}
.dfn-grid div{background:#0005;padding:8px 10px;border-radius:8px;font-size:.85rem}
.dfn-val{font-weight:600}
.dfn-tag{background:var(--dfn-accent);color:#000;padding:2px 6px;border-radius:4px;font-size:.7rem}
`;
function injectCSS(){
  if(!$('#dfn-style')){
    const s=h('style',{id:'dfn-style'}); s.textContent=STYLE; document.head.append(s);
  }
}

/*─────────────  TOAST ENGINE  ─────────────*/
const toasts=[];
function toast({msg,color='var(--dfn-accent)'}){
  const el=h('div',{class:'dfn-toast',style:`--clr:${color}`},msg);
  document.body.append(el);
  requestAnimationFrame(()=>el.classList.add('show'));
  toasts.push(el);
  setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),250)},TOAST_LIFE);
}

/*──────────────  PANEL RENDER  ────────────*/
function renderPanel(el,snap){
  $('#price',el).textContent   = snap.price;
  $('#lp',el).textContent      = snap.lp_locked_pct+' %';
  $('#risk',el).textContent    = snap.risk;
  $('#whale',el).textContent   = snap.whale24;
  $('#dev',el).textContent     = snap.dev24;
  $('#supply',el).textContent  = (snap.supply_change24>0?'+':'')+snap.supply_change24+' %';
  renderClusters(el,snap.clusters);
}
function renderClusters(el,rows){
  const box=$('#clusters',el);
  box.innerHTML='';
  rows.forEach(r=>{
    box.append(h('div',{},`${r.id} · ${r.wallets} wlts · ${r.vol}`));
  });
}

/*─────────────  WEB-SOCKET LIFECYCLE ─────────────*/
let ws, embed='IDK', reconnectT;
function connect(){
  clearTimeout(reconnectT);
  ws=new WebSocket(`${ENDPOINT}?embed=${embed}`);
  ws.onopen = ()=>console.info('[Patrol] WS open');
  ws.onmessage=e=>{
    const obj=JSON.parse(e.data);
    if(obj.type==='snapshot') renderPanel($('#patrol'),obj);
    else if(obj.type==='toast') toast(obj.payload);
  };
  ws.onclose = ()=>{console.warn('[Patrol] WS closed; retry'); reconnectT=setTimeout(connect,3000);}
}
function changeEmbed(mint){embed=mint; ws?.close()}

/*─────────────  TOKEN PICKER  ─────────────*/
function attachPicker(panel){
  if(!panel.hasAttribute('data-allow-pick')) return;
  const icon=h('span',{style:'cursor:pointer;margin-left:auto;font-size:18px'},'🔍');
  $('.dfn-head',panel).append(icon);
  icon.onclick=()=>{
    const mint=prompt('Paste mint address or symbol:');
    if(mint) {panel.setAttribute('embed',mint); changeEmbed(mint);}
  };
}

/*─────────────  MOUNT ROUTINES  ───────────*/
function mountBadge(b){
  injectCSS();
  const svg='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="'+getComputedStyle(document.documentElement).getPropertyValue('--dfn-accent').trim()+'"><path d="M12 2 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3Z"/></svg>');
  b.innerHTML=`<img src="${svg}" style="width:100%;height:100%">`;
  b.onclick=()=>toast({msg:'Patrol running…',color:'var(--dfn-accent)'});
}
function mountPanel(p){
  injectCSS();
  const id=p.getAttribute('embed')||'???';
  p.innerHTML=`
    <div class="dfn-head"><strong>DFN Patrol — ${id}</strong>
      <span class="dfn-tag">live</span></div>
    <div class="dfn-grid">
      <div>Price<br><span class="dfn-val" id="price">–</span></div>
      <div>LP Locked<br><span class="dfn-val" id="lp">–</span></div>
      <div>Risk<br><span class="dfn-val" id="risk">–</span></div>
      <div>Whale Alerts<br><span class="dfn-val" id="whale">0</span></div>
      <div>Dev Sells<br><span class="dfn-val" id="dev">0</span></div>
      <div>Supply Δ 24h<br><span class="dfn-val" id="supply">0 %</span></div>
    </div>
    <h4 style="margin:18px 0 6px">Clusters</h4>
    <div id="clusters" style="display:grid;gap:6px"></div>
    <div style="text-align:right;margin-top:12px">
      <a href="https://dfn.wtf" target="_blank"
         style="color:var(--dfn-accent);font-size:.8rem;text-decoration:none">
         Full feed ↗</a>
    </div>`;
  attachPicker(p);
}

/*─────────────  BOOT  ─────────────────────*/
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('dfn-badge').forEach(mountBadge);
  const panel=$('dfn-patrol');
  if(panel){mountPanel(panel); connect();}
  console.info('DFN Patrol: initialized');
});

/* public changeEmbed for external form */
window.DFNPatrol={setToken:mint=>{const p=$('dfn-patrol');p.setAttribute('embed',mint);changeEmbed(mint);}};

})();
