// component.js — DFN Patrol UI v2
console.log("[DFN Components] beta-v1.5 initialized");

/* ---------- helpers ---------- */
function sanitizeHTML(str) {
  if (!str) return '';
  if (typeof DOMPurify === 'undefined') return str;
  return DOMPurify.sanitize(str.toString());
}
function sanitizeUrl(url) {
  if (typeof url !== 'string' || !url) return '#';
  try {
    const u = new URL(url);
    if (u.protocol === 'http:' || u.protocol === 'https:' || u.protocol === 'tg:') return u.href;
  } catch (e) {}
  return '#';
}
function msToAgeDays(ms) {
  if (!ms || ms <= 0) return 0;
  const days = Math.floor((Date.now() - ms) / 86400000);
  return Math.max(0, days);
}
function verdictFromScore(score) {
  if (score >= 85) return { text: 'Reliable', tone: 'ok' };
  if (score >= 70) return { text: 'Sound', tone: 'ok' };
  if (score >= 55) return { text: 'Caution', tone: 'warn' };
  if (score >= 40) return { text: 'Risky', tone: 'warn' };
  return { text: 'High Risk', tone: 'bad' };
}

/* ---------- template ---------- */
const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      --bg: #0e0e0f;
      --panel: #151516;
      --panel-2: #1a1a1b;
      --muted: #a9a9ad;
      --text: #f2f2f3;
      --line: #262628;
      --accent: #FFD447;
      --ok: #9eff9e;
      --bad: #ff6b7b;
      --warn: #ffd447;
      --link: #9fd3ff;

      display:block; background:var(--bg); color:var(--text);
      border:1px solid var(--line); border-radius:16px; padding:20px;
      font-family: ui-sans-serif, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Apple Color Emoji","Segoe UI Emoji";
    }

    /* typography */
    h2 { margin:0; font-size:1.6rem; letter-spacing: .2px; }
    h3 { margin:16px 0 12px; font-size:1.05rem; color:var(--accent); font-weight:700; }
    h4 { margin:0 0 10px; font-size:.95rem; color:#cfcfd2; }

    a { color:var(--accent); text-decoration:none; }
    a:hover { text-decoration:underline; }

    .muted { color:var(--muted); }
    .ok { color:var(--ok); } .bad { color:var(--bad); } .warn { color:var(--warn); }

    /* hero */
    .hero {
      display:grid; grid-template-columns: 1fr auto; gap:20px;
      background:linear-gradient(180deg, #111 0%, #0d0d0f 100%);
      border:1px solid var(--line); border-radius:14px; padding:16px 16px 18px;
    }
    .hero-left { display:flex; gap:14px; align-items:center; min-width:0; }
    .logo { width:64px; height:64px; border-radius:12px; object-fit:cover; background:#1c1c1f; border:1px solid #222; }
    .token-meta { min-width:0; }
    .symbol { font-size:.95rem; color:#c9c9cc; margin-top:2px; }
    .row-actions { display:flex; gap:8px; margin-top:8px; flex-wrap:wrap; }

    .addr-pill, .share-pill {
      display:inline-flex; align-items:center; gap:8px;
      padding:6px 10px; border-radius:10px; border:1px solid var(--line); background:#141416;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
      font-size:.85rem; color:#cfd0d4; cursor:pointer;
    }
    .addr-pill:hover, .share-pill:hover { background:#18181b; }

    .score {
      position:relative; width:120px; height:120px;
      align-self:center;
    }
    .score svg { width:100%; height:100%; transform:rotate(-90deg); }
    .ring-bg { stroke:#232326; stroke-width:10; fill:none; }
    .ring-fg { stroke:#ff6b7b; stroke-width:10; fill:none; stroke-linecap:round; transition:stroke-dashoffset 1s ease, stroke .4s; }
    .score-txt { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
    .score-val { font-size:1.9rem; font-weight:800; }
    .score-label { font-size:.68rem; color:#b5b5b8; text-transform:uppercase; margin-top:-2px; }
    .score-verdict { margin-top:6px; font-size:.85rem; font-weight:700; }
    .score-verdict.ok { color:var(--ok); }
    .score-verdict.warn { color:var(--warn); }
    .score-verdict.bad { color:var(--bad); }

    /* belt KPIs */
    .belt {
      margin-top:14px; display:flex; gap:10px; overflow:auto; padding-bottom:2px;
      scrollbar-width:thin;
    }
    .kpi { min-width:140px; flex:0 0 auto; background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:12px 14px; }
    .kpi b { display:block; font-size:.72rem; color:#aeb0b7; letter-spacing:.3px; text-transform:uppercase; }
    .kpi span { display:block; margin-top:6px; font-weight:700; font-size:1.05rem; }

    /* pills row (risks) */
    .pills {
      display:flex; gap:8px; flex-wrap:wrap; margin-top:14px;
    }
    .pill {
      display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:999px;
      background:#131314; border:1px solid #232326; color:#d0d1d6; font-size:.85rem; white-space:nowrap;
    }
    .pill.ok { border-color:#1f3921; color:#b8f0b8; }
    .pill.bad { border-color:#3b1f25; color:#ff8f9d; }
    .pill.warn { border-color:#3d3216; color:#ffe299; }

    /* tabs */
    .tabs { display:flex; gap:8px; margin:18px 2px 10px; border-bottom:1px solid var(--line); }
    .tab {
      padding:10px 14px; border:1px solid var(--line); border-bottom:none; border-radius:8px 8px 0 0;
      background:var(--panel-2); color:#d7d8dc; font-weight:600; cursor:pointer; user-select:none;
    }
    .tab[aria-selected="true"] { background:#202023; color:#fff; }
    .tabpanels { background:var(--panel); border:1px solid var(--line); border-radius:0 12px 12px 12px; padding:16px; }

    /* grids */
    .grid { display:grid; gap:16px; }
    .grid-2 { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
    .grid-3 { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }

    /* trend */
    .trend { display:grid; grid-template-columns: repeat(4, 1fr); gap:1px; background:#222; border:1px solid #222; border-radius:10px; overflow:hidden; }
    .trend > div { background:#151516; padding:14px 10px; text-align:center; }
    .trend b { display:block; font-size:.72rem; color:#aeb0b7; text-transform:uppercase; }
    .trend span { display:block; margin-top:6px; font-weight:800; font-size:1.2rem; }
    .trend .ok { color:var(--ok); } .trend .bad { color:var(--bad); }

    /* socials */
    .chips { display:flex; flex-wrap:wrap; gap:8px; }
    .chip { padding:8px 14px; background:#141416; border:1px solid #26262a; border-radius:999px; color:#ddd; font-weight:600; }

    /* lists */
    ul.clean { list-style:none; padding:0; margin:0; }
    ul.clean li { margin:8px 0; color:#cfd0d4; word-break:break-word; }

    /* clusters (compact) */
    .clusters { display:grid; gap:12px; }
    .cl-item { border:1px solid var(--line); border-radius:12px; background:#121214; }
    .cl-item details { overflow:hidden; border-radius:12px; }
    .cl-item summary { display:grid; grid-template-columns:1fr auto; align-items:center; gap:10px; padding:10px 12px; cursor:pointer; list-style:none; }
    .cl-item summary::-webkit-details-marker{ display:none; }
    .cl-title { display:flex; align-items:center; gap:10px; min-width:0; }
    .cl-index { display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:999px; background:#1a1a1c; border:1px solid #2a2a2e; font-weight:800; font-size:.9rem; }
    .cl-meta { display:inline-flex; align-items:center; gap:8px; flex-wrap:wrap; }
    .cl-chip { background:#1a1a1c; border:1px solid #2a2a2e; border-radius:999px; padding:3px 8px; font-size:.75rem; color:#ccc; white-space:nowrap; }
    .cl-conf { font-variant-numeric:tabular-nums; white-space:nowrap; border:1px solid #333; border-radius:999px; padding:2px 10px; font-size:.85rem; color:#ddd; }
    .cl-supply { border:1px solid #333; border-radius:8px; padding:2px 8px; color:#bbb; font-size:.85rem; white-space:nowrap; }
    .cl-body { padding:8px 12px 12px; border-top:1px solid #202022; }
    .cl-addrs { display:grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap:8px; list-style:none; padding:0; margin:0; }
    .cl-addrs a { color:var(--link); text-decoration:none; border-bottom:1px dotted #2a6fa8; overflow:hidden; text-overflow:ellipsis; display:block; }
    .cl-addrs a:hover { text-decoration:underline; }

    @media (max-width: 720px) {
      .hero { grid-template-columns: 1fr; }
      .score { margin-left:auto; }
      .trend { grid-template-columns: repeat(2, 1fr); }
      .cl-addrs { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
    }

    .placeholder, .error { text-align:center; padding:40px; color:#8a8a8f; }
    .error { color:var(--bad); }

    .disclaimer {
      margin-top:20px; padding-top:18px; border-top:1px solid var(--line);
      color:#9a9aa0; font-size:.82rem; text-align:center;
    }
  </style>

  <div id="wrap">
    <div id="root"></div>
  </div>
`;

class DFNPatrol extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode:"open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.root = this.shadowRoot.querySelector('#root');
    this.copyIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9cad0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>`;
    this.checkIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9eff9e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  }

  setReport(report) {
    this.report = report;
    this.render();
    if (report && typeof report.trustScore !== 'undefined') this.updateScore(report.trustScore);
  }

  updateScore(score) {
    const ring = this.shadowRoot.querySelector('.ring-fg');
    const txt = this.shadowRoot.querySelector('.score-val');
    if (!ring || !txt) return;

    const r = ring.r.baseVal.value || 54;
    const C = 2 * Math.PI * r;
    ring.style.strokeDasharray = `${C} ${C}`;

    setTimeout(() => {
      const off = C - (score / 100) * C;
      ring.style.strokeDashoffset = off;
      ring.style.stroke = (score >= 75) ? '#9eff9e' : (score >= 40 ? '#ffd447' : '#ff6b7b');

      const start = parseInt(txt.textContent.replace('%','')) || 0;
      const dur = 900; const t0 = performance.now();
      const animate = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        txt.textContent = `${Math.round(start + (score - start) * k)}%`;
        if (k < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, 80);
  }

  copyAddress(addrEl, addr) {
    navigator.clipboard.writeText(addr).then(() => {
      const prev = addrEl.innerHTML;
      addrEl.innerHTML = `${this.checkIcon}<span>Copied</span>`;
      setTimeout(()=> addrEl.innerHTML = prev, 1400);
    });
  }
  copyShare(btnEl, url) {
    navigator.clipboard.writeText(url).then(() => {
      const prev = btnEl.innerHTML;
      btnEl.innerHTML = `${this.checkIcon}<span>Link copied</span>`;
      setTimeout(()=> btnEl.innerHTML = prev, 1600);
    });
  }

  /* ---------- simulation ---------- */
  async runSimulation() {
    const btn = this.shadowRoot.querySelector('#sim-btn');
    const log = this.shadowRoot.querySelector('#sim-log');
    const bar = this.shadowRoot.querySelector('#sim-bar');
    const val = this.shadowRoot.querySelector('#sim-val');
    const sc = this.report?.liquidityDrain;
    const th = this.report?.distribution?.topHolders;
    const mc0 = this.report?.market?.marketCap;
    if (!btn || !log || !bar || !val || !Array.isArray(sc) || !mc0) return;

    const fmt$ = n => `$${Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    const wait = ms => new Promise(r=>setTimeout(r, ms));
    const logLine = html => { const d = document.createElement('div'); d.innerHTML = html; log.prepend(d); };
    const setBar = mc => { const w = Math.max(0, (mc / mc0) * 100); bar.style.width = `${w}%`; val.textContent = fmt$(mc); };

    btn.disabled = true; btn.textContent = 'Simulating…';
    log.innerHTML=''; setBar(mc0); await wait(900);

    for (const s of sc) {
      let ownPct = 0;
      const m = s.group.match(/Top (\d+)/);
      if (m && th) {
        const n = +m[1];
        ownPct = th.slice(0,n).reduce((sum,h)=>sum+parseFloat(h.percent||0), 0);
      }
      logLine(`Analyzing: <b>${s.group}</b>${ownPct?` (own ${ownPct.toFixed(2)}%)`:''}…`);
      await wait(1200);
      setBar(s.marketCapAfterSale);
      logLine(`→ Price drop <b class="bad">-${s.marketCapDropPercentage}%</b>, new MC: <b>${fmt$(s.marketCapAfterSale)}</b>`);
      await wait(1600);
    }
    logLine('<b>SIMULATION END</b>');
    btn.disabled=false; btn.textContent='Run Simulation';
  }

  render() {
    const report = this.report;
    if (!report) { this.root.innerHTML = `<div class="placeholder">Generating token health report...</div>`; return; }
    if (report.error) { this.root.innerHTML = `<div class="error">${sanitizeHTML(report.error)}</div>`; return; }

    const { tokenInfo, security, distribution, market, socials, liquidityDrain, hype, clusterSummary } = report;
    const logo = tokenInfo?.logoUrl ? `<img class="logo" src="${sanitizeUrl(tokenInfo.logoUrl)}" alt="${sanitizeHTML(tokenInfo.symbol)} logo">` : `<div class="logo"></div>`;
    const displayName = tokenInfo?.name && tokenInfo.name.length > 14 ? `${tokenInfo.name.slice(0,11)}…` : (tokenInfo?.name || 'Token');
    const symbol = sanitizeHTML(tokenInfo?.symbol || '');
    const addr = tokenInfo?.address || '';
    const addrShort = addr ? `${addr.slice(0,4)}…${addr.slice(-4)}` : '';
    const price = (market?.priceUsd==null) ? 'N/A'
      : (Number(market.priceUsd) < 0.000001
        ? `$${Number(market.priceUsd).toExponential(2)}`
        : `$${Number(market.priceUsd).toLocaleString('en-US', { maximumFractionDigits: 8 })}`);
    const fmt = (n) => n ? Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 }) : 'N/A';
    const ch = market?.priceChange || {};
    const ageDays = market?.pairCreatedAt ? msToAgeDays(market.pairCreatedAt) : (clusterSummary?.ageDays || 0);
    const ts = typeof report.trustScore === 'number' ? report.trustScore : 0;
    const verdict = verdictFromScore(ts);

    /* hero */
    const heroHTML = `
      <div class="hero">
        <div class="hero-left">
          ${logo}
          <div class="token-meta">
            <h2>${sanitizeHTML(displayName)}</h2>
            <div class="symbol">${symbol}</div>
            <div class="row-actions">
              ${addr ? `<button class="addr-pill" id="copy-addr">${this.copyIcon}<span>${addrShort}</span></button>` : ''}
              <button class="share-pill" id="copy-share">${this.copyIcon}<span>Share</span></button>
            </div>
          </div>
        </div>
        <div class="score">
          <svg viewBox="0 0 120 120">
            <circle class="ring-bg" cx="60" cy="60" r="54"></circle>
            <circle class="ring-fg" cx="60" cy="60" r="54" style="stroke-dasharray:339.292; stroke-dashoffset:339.292"></circle>
          </svg>
          <div class="score-txt">
            <div class="score-val">0%</div>
            <div class="score-label">Trust Score</div>
            <div class="score-verdict ${verdict.tone}">${verdict.text}</div>
          </div>
        </div>
      </div>
    `;

    /* belt KPIs */
    const kpisHTML = `
      <div class="belt">
        <div class="kpi"><b>Price</b><span>${price}</span></div>
        <div class="kpi"><b>24h Change</b><span class="${(ch.h24??0)>=0?'ok':'bad'}">${(ch.h24??0).toFixed(2)}%</span></div>
        <div class="kpi"><b>24h Volume</b><span>$${fmt(market?.volume24h)}</span></div>
        <div class="kpi"><b>Market Cap</b><span>$${fmt(market?.marketCap)}</span></div>
        <div class="kpi"><b>Liquidity</b><span>$${fmt(market?.liquidity)}</span></div>
        <div class="kpi"><b>24h TXNs</b><span><span class="ok">${market?.txns24h?.buys||0}</span> / <span class="bad">${market?.txns24h?.sells||0}</span></span></div>
        <div class="kpi"><b>Age</b><span>${ageDays?`${ageDays} d`:'N/A'}</span></div>
      </div>
    `;

    /* risk pills */
    const pills = [];
    if (security?.launchpad) pills.push({ t:`Launchpad: ${sanitizeHTML(security.launchpad)}`, cls:'ok' });
    if (security?.hackerFound) pills.push({ t:sanitizeHTML(security.hackerFound), cls:'bad' });
    if ('holderConcentration' in security) {
      const pct = Number(security.holderConcentration||0).toFixed(2);
      const cls = (security.holderConcentration>25)?'bad':(security.holderConcentration>10?'warn':'ok');
      pills.push({ t:`Top10: ${pct}%`, cls });
    }
    if (security?.isDexVerified) pills.push({ t:'DEX Paid', cls:'ok' });
    else pills.push({ t:'DEX Not Paid', cls:'bad' });
    if (security?.isCto) pills.push({ t:'Community Takeover', cls:'ok' });
    if (security?.lpStatus) {
      const cls = (security.lpStatus==='Burned'||security.lpStatus==='Locked/Burned')?'ok':'bad';
      pills.push({ t:`LP: ${security.lpStatus}`, cls });
    }
    if ('isMutable' in security) pills.push({ t:(!security.isMutable?'Immutable':'Mutable'), cls:(!security.isMutable?'ok':'bad') });
    if ('freezeAuthorityEnabled' in security) pills.push({ t:(!security.freezeAuthorityEnabled?'No Freeze':'Freeze On'), cls:(!security.freezeAuthorityEnabled?'ok':'bad') });
    if ('mintRenounced' in security) pills.push({ t:(security.mintRenounced?'Mint Renounced':'Mint Active'), cls:(security.mintRenounced?'ok':'bad') });
    if ('transferTax' in security) pills.push({ t:`Tax: ${security.transferTax}%`, cls:'warn' });
    else if ('noTransferTax' in security) pills.push({ t:`No Transfer Tax`, cls:'ok' });

    const pillsHTML = `
      <div class="pills">
        ${pills.map(p=>`<span class="pill ${p.cls}">${p.t}</span>`).join('')}
      </div>
    `;

    /* tabs header */
    const tabsHTML = `
      <div class="tabs" role="tablist">
        <div class="tab" role="tab" aria-selected="true"  data-tab="overview">Overview</div>
        <div class="tab" role="tab" aria-selected="false" data-tab="holders">Holders & Clusters</div>
        <div class="tab" role="tab" aria-selected="false" data-tab="sim">Simulation</div>
      </div>
      <div class="tabpanels">
        <section id="panel-overview" role="tabpanel">${this.renderOverviewTab(ch, socials, hype)}</section>
        <section id="panel-holders" role="tabpanel" hidden>${this.renderHoldersTab(distribution, report.clusters)}</section>
        <section id="panel-sim" role="tabpanel" hidden>${this.renderSimTab(liquidityDrain, market)}</section>
      </div>
      <div class="disclaimer">Disclaimer: This report is automated and for informational purposes only. Always DYOR.</div>
    `;

    this.root.innerHTML = `
      ${heroHTML}
      ${kpisHTML}
      ${pillsHTML}
      ${tabsHTML}
    `;

    // listeners
    const addrBtn = this.shadowRoot.querySelector('#copy-addr');
    if (addrBtn && addr) addrBtn.addEventListener('click', ()=> this.copyAddress(addrBtn, addr));
    const shareBtn = this.shadowRoot.querySelector('#copy-share');
    if (shareBtn) shareBtn.addEventListener('click', ()=> this.copyShare(shareBtn, window.location.href));

    // tabs
    const tabs = Array.from(this.shadowRoot.querySelectorAll('.tab'));
    const show = (name) => {
      tabs.forEach(t => t.setAttribute('aria-selected', t.dataset.tab===name ? 'true' : 'false'));
      this.shadowRoot.querySelector('#panel-overview').hidden = name!=='overview';
      this.shadowRoot.querySelector('#panel-holders').hidden  = name!=='holders';
      this.shadowRoot.querySelector('#panel-sim').hidden      = name!=='sim';
    };
    tabs.forEach(t => t.addEventListener('click', ()=> show(t.dataset.tab)));

    // sim
    const simBtn = this.shadowRoot.querySelector('#sim-btn');
    if (simBtn) simBtn.addEventListener('click', ()=> this.runSimulation());
  }

  renderOverviewTab(priceChange, socials, hype) {
    const pct = (v)=> (v==null? '0.00' : Number(v).toFixed(2)) + '%';
    const trendHTML = `
      <div class="trend">
        <div><b>5 MIN</b><span class="${(priceChange.m5??0)>=0?'ok':'bad'}">${pct(priceChange.m5)}</span></div>
        <div><b>1 HOUR</b><span class="${(priceChange.h1??0)>=0?'ok':'bad'}">${pct(priceChange.h1)}</span></div>
        <div><b>6 HOURS</b><span class="${(priceChange.h6??0)>=0?'ok':'bad'}">${pct(priceChange.h6)}</span></div>
        <div><b>24 HOURS</b><span class="${(priceChange.h24??0)>=0?'ok':'bad'}">${pct(priceChange.h24)}</span></div>
      </div>
    `;
    const socialsHTML = Array.isArray(socials) && socials.length
      ? `<div class="chips">${socials.map(s=>{
           const label = sanitizeHTML(s.label || (s.type? s.type[0].toUpperCase()+s.type.slice(1) : 'Link'));
           return s.url ? `<a class="chip" href="${sanitizeUrl(s.url)}" target="_blank" rel="noopener nofollow">${label}</a>` : '';
         }).join('')}</div>` : `<div class="muted">No socials detected.</div>`;
    const hypeHTML = this.renderHype(hype);
    return `
      <div class="grid grid-2">
        <div>
          <h3>📈 Price Trend</h3>
          ${trendHTML}
        </div>
        <div>
          <h3>🔗 Socials</h3>
          ${socialsHTML}
        </div>
        ${hypeHTML}
      </div>
    `;
  }

  renderHype(hype) {
    if (!hype || !hype.id) return '';
    const formatBig = (n)=>{
      if (n==null) return 'N/A';
      if (n>=1_000_000) return (n/1_000_000).toFixed(1)+'M';
      if (n>=1_000) return (n/1_000).toFixed(1)+'K';
      return String(n);
    };
    const tot = hype?.sentiment?.total || 0;
    const p = tot? Math.round((hype.sentiment.positive/tot)*100):0;
    const ne= tot? Math.round((hype.sentiment.neutral/tot)*100):0;
    const n = tot? Math.round((hype.sentiment.negative/tot)*100):0;
    return `
      <div class="full hype">
        <h3>🌪️ Hype & Resonance</h3>
        <div class="grid grid-3">
          <div class="kpi"><b>Social Interactions (24h)</b><span>${formatBig(hype.socialVolume)}</span></div>
          <div class="kpi"><b>Contributors (24h)</b><span>${formatBig(hype.contributors)}</span></div>
          <div class="kpi"><b>Momentum Score</b><span>${hype.momentumScore || 'N/A'}</span></div>
        </div>
        <div style="margin-top:12px;" class="chips">
          <span class="chip">Pos ${p}%</span>
          <span class="chip">Neu ${ne}%</span>
          <span class="chip">Neg ${n}%</span>
        </div>
      </div>
    `;
  }

  renderHoldersTab(distribution, clusters) {
    const topH = (distribution?.topHolders||[]).map(h=>`
      <li><a href="https://solscan.io/account/${h.address}" target="_blank" rel="noopener">${h.address.slice(0,6)}…${h.address.slice(-4)}</a> (${h.percent}%)</li>
    `).join('') || '<li class="muted">No significant individual holders found.</li>';

    const pools = (distribution?.allLpAddresses||[]).map(a=>`
      <li><a href="https://solscan.io/account/${a}" target="_blank" rel="noopener">${a.slice(0,10)}…${a.slice(-4)}</a></li>
    `).join('');

    const clustersHTML = this.renderClusters(clusters);

    return `
      <div class="grid grid-2">
        <div>
          <h3>💰 Top 10 Holders</h3>
          <ul class="clean">${topH}</ul>
          ${pools?`<h4 style="margin-top:14px;">Pools / CEX / Programmatic</h4><ul class="clean">${pools}</ul>`:''}
        </div>
        <div>
          <h3>🧩 Clusters (beta)</h3>
          ${clustersHTML}
        </div>
      </div>
    `;
  }

  renderClusters(clusters) {
    const arr = Array.isArray(clusters)? clusters : [];
    if (!arr.length) return `<div class="muted">No significant clusters detected.</div>`;
    const html = arr.map((c, i)=>{
      const reasons = (c.reasons? Object.keys(c.reasons):[]).slice(0,4);
      const conf = Number(c.confidence||0);
      const pct = (typeof c.supplyPct!=='undefined')? Number(c.supplyPct).toFixed(2) : '0.00';
      return `
        <div class="cl-item">
          <details ${i===0?'open':''}>
            <summary>
              <div class="cl-title">
                <span class="cl-index">${i+1}</span>
                <div class="cl-meta">
                  <span class="cl-chip">${c.addresses.length} addr</span>
                  <span class="cl-conf">Conf. ${conf}%</span>
                  <span class="cl-supply">≈ ${pct}%</span>
                </div>
              </div>
              <div class="cl-meta">
                ${reasons.map(r=>`<span class="cl-chip">${r.replace(/-/g,' ')}</span>`).join('')}
              </div>
            </summary>
            <div class="cl-body">
              <ul class="cl-addrs">
                ${c.addresses.map(a=>`<li><a href="https://solscan.io/account/${a}" target="_blank" rel="noopener">${a}</a></li>`).join('')}
              </ul>
            </div>
          </details>
        </div>
      `;
    }).join('');
    return `<div class="clusters">${html}</div>`;
  }

  renderSimTab(liquidityDrain, market) {
    if (!Array.isArray(liquidityDrain) || !liquidityDrain.length || !market?.marketCap)
      return `<div class="muted">Not enough data for simulation.</div>`;
    return `
      <div>
        <h3>💥 Dump Simulation</h3>
        <div style="display:flex; flex-direction:column; gap:10px;">
          <div style="background:#1e1e21; border:1px solid #2a2a30; border-radius:10px; overflow:hidden;">
            <div id="sim-bar" style="height:30px; width:100%; background:linear-gradient(to right, #9eff9e, #34d399); display:flex; align-items:center; justify-content:flex-end; padding:0 10px; font-weight:700; color:#001;">
              <span id="sim-val">$${Number(market.marketCap).toLocaleString('en-US')}</span>
            </div>
          </div>
          <div id="sim-log" style="min-height:90px; background:#121214; border:1px solid #26262a; border-radius:10px; padding:10px; font-family:ui-monospace, monospace; color:#bfc0c6;"></div>
          <button id="sim-btn" class="tab" style="border-radius:10px;">Run Simulation</button>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('dfn-patrol')) {
  customElements.define('dfn-patrol', DFNPatrol);
}
