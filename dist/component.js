console.log("[DFN Components] beta-v2.2 initialized");

/* ---------------- helpers ---------------- */
function sanitizeHTML(str) {
  if (!str) return "";
  if (typeof DOMPurify === "undefined") return str;
  return DOMPurify.sanitize(str.toString());
}
function sanitizeUrl(url) {
  if (typeof url !== "string" || !url) return "#";
  try {
    const u = new URL(url);
    if (u.protocol === "http:" || u.protocol === "https:" || u.protocol === "tg:") return u.href;
  } catch {}
  return "#";
}
function fmtNum(n, digits = 0) {
  if (n == null || isNaN(n)) return "N/A";
  return Number(n).toLocaleString("en-US", { maximumFractionDigits: digits });
}
function fmtPrice(n) {
  if (n == null || isNaN(n)) return "N/A";
  const v = Number(n);
  if (v === 0) return "$0";
  if (v < 0.000001) return `$${v.toExponential(2)}`;
  return `$${v.toLocaleString("en-US", { maximumFractionDigits: 8 })}`;
}
function verdictFromScore(score) {
  if (score >= 90) return { text: "Prime", tone: "ok" };
  if (score >= 75) return { text: "Reliable", tone: "ok" };
  if (score >= 60) return { text: "Caution", tone: "warn" };
  if (score >= 40) return { text: "Risky", tone: "warn" };
  return { text: "High Risk", tone: "bad" };
}
// универсальная отрисовка path по массиву значений
function sparkPath(values, w = 120, h = 38, pad = 3) {
  const arr = (values || []).map(v => Number(v ?? 0));
  if (!arr.length) return "";
  const min = Math.min(...arr), max = Math.max(...arr);
  const dx = (w - pad * 2) / (arr.length - 1 || 1);
  const sy = v => (max === min) ? h / 2 : pad + (h - pad * 2) * (1 - (v - min) / (max - min));
  let d = "";
  arr.forEach((v, i) => {
    const x = pad + i * dx;
    const y = sy(v);
    d += (i === 0 ? `M ${x},${y}` : ` L ${x},${y}`);
  });
  return d;
}

/* ---------- построение плавных «истинных» мини-кривых из кумулятивов ---------- */
// S-easing
const easeInOutCubic = t => (t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2);

// разворачиваем сегмент "из точки from на delta" в N шагов
function expandSegment(from, delta, steps){
  const out = [];
  for (let i = 1; i <= steps; i++){
    const k = easeInOutCubic(i/steps);
    out.push(from + delta * k);
  }
  return out;
}

// генерируем мини-серии для 5m / 1h / 6h / 24h из кумулятивных процентов
function buildCurveSeries(pcRaw){
  const v = {
    m5: Number(pcRaw?.m5 || 0),
    h1: Number(pcRaw?.h1 || 0),
    h6: Number(pcRaw?.h6 || 0),
    h24: Number(pcRaw?.h24 || 0),
  };
  // приращения по сегментам
  const d5  = v.m5;
  const d1  = v.h1  - v.m5;
  const d6  = v.h6  - v.h1;
  const d24 = v.h24 - v.h6;

  const ser5  = [0, ...expandSegment(0, d5, 4)];

  const ser1h = [
    0,
    ...expandSegment(0, d5, 3),
    ...expandSegment(d5, d1, 6),
  ];

  const ser6h = [
    0,
    ...expandSegment(0, d5, 2),
    ...expandSegment(d5, d1, 4),
    ...expandSegment(d5 + d1, d6, 6),
  ];

  const ser24 = [
    0,
    ...expandSegment(0, d5, 2),
    ...expandSegment(d5, d1, 3),
    ...expandSegment(d5 + d1, d6, 5),
    ...expandSegment(d5 + d1 + d6, d24, 8),
  ];

  return { ser5, ser1h, ser6h, ser24 };
}

/* ---------------- template ---------------- */
const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{
      --bg:#0b0c0f; --panel:#121317; --panel-2:#16181d; --line:#23252d; --muted:#a4a7af; --text:#f4f6fb; --accent:#FFD447;
      --ok:#8af2a0; --warn:#ffd447; --bad:#ff6b7b;
      display:block; color:var(--text); background:var(--bg);
      border:1px solid var(--line); border-radius:18px; padding:22px;
      font-family:ui-sans-serif,-apple-system,Segoe UI,Roboto,Inter,Arial,"Noto Sans","Apple Color Emoji","Segoe UI Emoji";
      position:relative; overflow:hidden;
    }

    /* blue glow aura */
    :host::before{
      content:""; position:absolute; inset:0; pointer-events:none; border-radius:18px;
      background:
        radial-gradient(1200px 600px at 85% -10%, rgba(255,212,71,0.08), transparent 50%),
        radial-gradient(900px 480px at -10% 20%, rgba(80,120,255,0.10), transparent 50%);
      mix-blend-mode:screen; filter:saturate(1.2);
    }

    /* fade-ins */
    @keyframes fadeInSlow { from{opacity:0; transform:translateY(8px)} to{opacity:1; transform:none} }
    .fade-placeholder { animation: fadeInSlow 1.2s ease forwards; } /* заставка — ещё медленнее */
    .fade-report { animation: fadeInSlow 0.9s ease forwards; }      /* сам отчёт — плавно */

    h2{ margin:0; font-size:clamp(1.4rem,1.2rem + 1vw,2rem); letter-spacing:.2px; }
    h3{ margin:0 0 12px; font-size:1.02rem; color:var(--accent); font-weight:800; }
    h4{ margin:10px 0 8px; font-size:.95rem; color:#cfd2db; }
    a{ color:var(--accent); text-decoration:none; } a:hover{ text-decoration:underline; }
    .muted{ color:var(--muted); }

    .hero{
      position:relative; display:grid; grid-template-columns:1fr auto; gap:18px; align-items:stretch;
      background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
      border:1px solid var(--line); border-radius:14px; padding:16px; overflow:hidden;
    }
    .hero::after{ content:""; position:absolute; inset:0; pointer-events:none; border-radius:14px;
      background: radial-gradient(500px 160px at 60% -20%, rgba(255,212,71,0.15), transparent 40%); }

    .token{ display:flex; align-items:stretch; gap:14px; min-width:0; }
   .logo{
  width:96px; min-height:96px; height:auto;
  border-radius:14px; background:#1a1b20; border:1px solid #24262e;
  object-fit:cover;
  align-self:center;              /* было: align-self:stretch — из-за этого на мобиле уводило влево */
}

    .meta{ min-width:0; display:flex; flex-direction:column; justify-content:space-between; }
    .symbol{ color:#c7c9cf; font-size:.92rem; margin-top:2px; }
    .row-actions{ display:flex; flex-wrap:wrap; gap:8px; margin-top:8px; }
    .pill{ display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:9px; border:1px solid var(--line); background:#15171c; color:#ccd0da; font-size:.85rem; cursor:pointer; }
    .pill:hover{ background:#191c22; }

    .score{ position:relative; width:132px; height:132px; justify-self:end; }
    .score svg{ width:100%; height:100%; transform:rotate(-90deg); }
    .ring-bg{ stroke:#1f2229; stroke-width:12; fill:none; }
    .ring-fg{ stroke:#ff6b7b; stroke-width:12; fill:none; stroke-linecap:round; transition:stroke-dashoffset 900ms ease, stroke .35s; }
    .score-txt{ position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
    .score-num{ font-size:1.9rem; font-weight:900; }
    .score-cap{ font-size:.68rem; color:#aeb1bb; text-transform:uppercase; margin-top:-2px; }
    .verdict{ margin-top:6px; font-weight:800; font-size:.9rem; }
    .verdict.ok{ color:var(--ok) } .verdict.warn{ color:var(--warn) } .verdict.bad{ color:var(--bad) }

    .kpis{ display:grid; gap:10px; grid-template-columns:repeat(6, minmax(120px,1fr)); margin-top:14px; }
    .kpi{ background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:12px 14px; }
    .kpi b{ display:block; color:#aeb1bb; font-size:.72rem; text-transform:uppercase; letter-spacing:.3px; }
    .kpi span{ display:block; margin-top:6px; font-weight:800; font-size:1.06rem; white-space:nowrap; }
    .kpi .inline{ display:inline-flex; gap:6px; align-items:baseline; white-space:nowrap; }
    .kpi .ok{ color:var(--ok) } .kpi .bad{ color:var(--bad) }

    .risk{ margin-top:14px; display:flex; flex-wrap:wrap; gap:8px; }
    .chip{ background:#14161b; border:1px solid #24262e; color:#d6d9e1; padding:6px 10px; border-radius:999px; font-size:.86rem; white-space:nowrap; }
    .chip.ok{ border-color:#234126; color:#b6f3bf } .chip.bad{ border-color:#3f1f28; color:#ff8ea0 } .chip.warn{ border-color:#3a2f18; color:#ffe2a3 }

    section{ margin-top:18px; background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:16px; }
    .grid{ display:grid; gap:16px; }
    .grid-2{ grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); }
    .grid-3{ grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); }

    .trend{ display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; }
    .tcard{ background:var(--panel-2); border:1px solid var(--line); border-radius:12px; padding:12px; }
    .tcap{ color:#aeb1bb; font-size:.72rem; text-transform:uppercase; }
    .tval{ font-weight:900; font-size:1.1rem; margin-top:6px; }
    .spark{ margin-top:8px; height:38px; }
    .spark path{ fill:none; stroke:#8fb2ff; stroke-width:2; opacity:.95; }

    .list{ list-style:none; padding:0; margin:0; }
    .list li{ margin:8px 0; color:#d0d3db; word-break:break-word; }
    .mono{ font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace; }
    .barbg{ height:12px; background:#1a1c22; border:1px solid #262a33; border-radius:8px; overflow:hidden; }
    .barfg{ height:100%; background:linear-gradient(90deg, #ffd447, #ff9f40); }

    /* Clusters as collapsible details */
    .clusters{ display:grid; gap:12px; }
    .cl{ background:var(--panel-2); border:1px solid var(--line); border-radius:12px; }
    .cl summary{ display:flex; justify-content:space-between; align-items:center; gap:10px; padding:12px; list-style:none; cursor:pointer; }
    .cl summary::-webkit-details-marker{ display:none; }
    .cl-left{ display:flex; align-items:center; gap:10px; }
    .cl-idx{ width:28px; height:28px; border-radius:999px; display:flex; align-items:center; justify-content:center; background:#1b1d23; border:1px solid #2a2d36; font-weight:800; }
    .cl-meta{ display:flex; gap:8px; flex-wrap:wrap; }
    .badge{ padding:3px 8px; border-radius:999px; background:#1b1d23; border:1px solid #2a2d36; font-size:.78rem; color:#cdd2dd; white-space:nowrap; }
    .cl-supply{ font-weight:800; }
    .cl-body{ padding:12px; border-top:1px dashed #2a2d36; }
    .addrgrid{ display:grid; grid-template-columns:repeat(auto-fill, minmax(150px,1fr)); gap:8px; }
    .addrgrid a{ color:#9fd3ff; border-bottom:1px dotted #2a6fa8; text-decoration:none; overflow:hidden; text-overflow:ellipsis; display:block; }
    .addrgrid a:hover{ text-decoration:underline; }

    .kcube{ background:var(--panel-2); border:1px solid var(--line); border-radius:12px; padding:14px; text-align:center; }

    .sim{ display:flex; flex-direction:column; gap:12px; }
    .simbar{
  position:relative; height:30px;
  background:#1e2026; border:1px solid #2a2d36; border-radius:10px; overflow:hidden;
}
.sim-fill{
  position:absolute; left:0; top:0; bottom:0; width:100%;
  background:linear-gradient(90deg, #9eff9e, #34d399);
  transition: width 1s cubic-bezier(.25,1,.5,1);
}
.sim-label{
  position:absolute; top:50%; transform:translateY(-50%);
  font-weight:800; white-space:nowrap; pointer-events:none;
  padding:2px 6px; border-radius:6px;
  color:#0b0c0f; background:rgba(255,255,255,0.85);  /* читаемо на малой ширине */
}

    .simlog{ min-height:90px; background:#121319; border:1px dashed #2a2d36; border-radius:10px; padding:10px; font-family:ui-monospace,monospace; color:#bfc3cc; }
    .sbtn{ align-self:flex-start; padding:10px 14px; border-radius:10px; border:1px solid var(--line); background:#20232b; color:#e9ecf4; font-weight:800; cursor:pointer; }
    .sbtn:hover{ background:#242833; }

    .disc{ margin-top:18px; font-size:.84rem; color:#9aa0ab; text-align:center; border-top:1px solid var(--line); padding-top:14px; }

    /* responsive */
    @media (max-width:960px){ .kpis{ grid-template-columns:repeat(3, minmax(120px,1fr)); } }
    @media (max-width:640px){
  .hero{ grid-template-columns:1fr; place-items:center; text-align:center; padding:14px; }
  .token{ flex-direction:column; align-items:center; width:100%; }
  .meta{ align-items:center; }
  .row-actions{ justify-content:center; }
  .score{ justify-self:center; margin-top:10px; }
  .logo{ width:120px; min-height:120px; margin:0 auto; align-self:center; } /* принудительно по центру */
  .kpis{ grid-template-columns:repeat(2, minmax(120px,1fr)); }
  .trend{ grid-template-columns:repeat(2,1fr); }
  .kpi span{ font-size:1rem; }
}
  </style>

  <div id="root" style="text-align:center; padding:40px; color:var(--muted);">
    <div class="fade-placeholder">Generating token health report…</div>
  </div>
`;

/* ---------------- component ---------------- */
class DFNPatrol extends HTMLElement {
  constructor(){
    super();
    this.attachShadow({ mode:"open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.root = this.shadowRoot.querySelector("#root");
  }

  setReport(report){
    this.report = report;
    this.render();
    if (report && typeof report.trustScore === "number") this.animateScore(report.trustScore);
  }

  animateScore(score){
    const ring = this.shadowRoot.querySelector(".ring-fg");
    const num  = this.shadowRoot.querySelector(".score-num");
    if (!ring || !num) return;
    const r = ring.r.baseVal.value || 56;
    const C = 2 * Math.PI * r;
    ring.style.strokeDasharray = `${C} ${C}`;
    const off = C - (score / 100) * C;
    requestAnimationFrame(() => { ring.style.strokeDashoffset = off; });
    ring.style.stroke = (score >= 75) ? "var(--ok)" : (score >= 40 ? "var(--warn)" : "var(--bad)");

    const start = 0, end = Math.round(score), dur = 900, t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      num.textContent = `${Math.round(start + (end - start) * k)}%`;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  copy(text, el){
    navigator.clipboard.writeText(text).then(()=>{
      const prev = el.innerHTML; el.innerHTML = "✓ Copied";
      setTimeout(()=> el.innerHTML = prev, 1200);
    });
  }

  runSimulation(){
    const log     = this.shadowRoot.querySelector(".simlog");
const barWrap = this.shadowRoot.querySelector(".simbar");
const bar     = this.shadowRoot.querySelector(".sim-fill");
const label   = this.shadowRoot.querySelector(".sim-label");

    if (!log || !bar) return;

    const data = this.report?.liquidityDrain || [];
    const mc0  = this.report?.market?.marketCap || 0;
    const th   = this.report?.distribution?.topHolders || [];
    const fmt$ = (n)=> `$${fmtNum(n)}`;
    const wait = (ms)=> new Promise(r=>setTimeout(r, ms));

    const setBar = (mc)=>{
  const ratio = mc0 ? Math.max(0, mc / mc0) : 0;
  bar.style.width = (ratio * 100) + "%";
  label.textContent = `$${fmtNum(mc)}`;

  // Позиционируем подпись так, чтобы она не «вылезала» за границы
  const wrapW = barWrap.clientWidth;
  const labW  = label.offsetWidth;
  const fillW = Math.round(wrapW * ratio);

  // пытаемся держать подпись внутри зелёной части; если она слишком узкая — прижимаем к левому внутреннему отступу
  const left = Math.max(8, Math.min(fillW - labW - 8, wrapW - labW - 8));
  label.style.left = left + "px";
};

    const logLine = (html)=>{
      const d = document.createElement("div");
      d.innerHTML = html;
      log.prepend(d);
    };

    log.innerHTML = "";
    setBar(mc0);

    (async ()=>{
      for (const s of data){
        let ownPct = 0;
        const m = s.group.match(/Top (\d+)/);
        if (m){
          const n = +m[1];
          ownPct = th.slice(0,n).reduce((a,h)=> a + parseFloat(h.percent||0), 0);
        }
        logLine(`Analyzing <b>${s.group}</b>${ownPct?` (own ${ownPct.toFixed(2)}%)`:``}…`);
        await wait(600);
        setBar(s.marketCapAfterSale);
        logLine(`→ Price impact <b style="color:var(--bad)">-${s.marketCapDropPercentage}%</b>. New MC: <b>${fmt$(
          s.marketCapAfterSale
        )}</b>`);
        await wait(900);
      }
      logLine("<b>SIMULATION END</b>");
    })();
  }

  render(){
    const report = this.report;
    if (!report){
      this.root.innerHTML = `<div class="fade-placeholder">Generating token health report…</div>`;
      return;
    }
    if (report.error){
      this.root.innerHTML = `<div class="fade-report" style="color:var(--bad); text-align:center; padding:40px;">${sanitizeHTML(report.error)}</div>`;
      return;
    }

    const { tokenInfo, security, distribution, market, socials, liquidityDrain, hype, clusterSummary } = report;

    const name = tokenInfo?.name || "Token";
    const nameShort = name.length > 22 ? name.slice(0,19) + "…" : name;
    const symbol = tokenInfo?.symbol || "";
    const addr   = tokenInfo?.address || "";
    const addrShort = addr ? `${addr.slice(0,4)}…${addr.slice(-4)}` : "";
    const price = fmtPrice(market?.priceUsd);

    const score = typeof report.trustScore === "number" ? report.trustScore : 0;
    const verdict = verdictFromScore(score);

    // пер-хоризонты: реальная кривая из кумулятивов
    const pc = market?.priceChange || {};
    const series = buildCurveSeries(pc);
    const p5  = sparkPath(series.ser5);
    const p1h = sparkPath(series.ser1h);
    const p6h = sparkPath(series.ser6h);
    const p24 = sparkPath(series.ser24);

    const txns = market?.txns24h || {};

   // risk chips
const chips = [];
if (security?.launchpad) chips.push({ t:`Launchpad: ${security.launchpad}`, cls:"ok" });
if (security?.hackerFound) chips.push({ t:`${security.hackerFound}`, cls:"bad" });

if ("holderConcentration" in security){
  const hc = Number(security.holderConcentration || 0);
  chips.push({
    t: `Top10 ${hc.toFixed(2)}%`,
    cls: hc > 25 ? "bad" : (hc > 10 ? "warn" : "ok")
  });
}

if (security?.isDexVerified) chips.push({ t:"DEX Paid", cls:"ok" });
else chips.push({ t:"DEX Not Paid", cls:"bad" });

if (security?.isCto) chips.push({ t:"Community Takeover", cls:"ok" });
if (security?.lpStatus) chips.push({
  t:`LP: ${security.lpStatus}`,
  cls: (security.lpStatus === "Burned" || security.lpStatus === "Locked/Burned") ? "ok" : "bad"
});
if ("isMutable" in security) chips.push({ t: security.isMutable ? "Mutable meta" : "Immutable meta", cls: security.isMutable ? "bad" : "ok" });
if ("freezeAuthorityEnabled" in security) chips.push({ t: security.freezeAuthorityEnabled ? "Freeze on" : "No freeze", cls: security.freezeAuthorityEnabled ? "bad" : "ok" });
if ("mintRenounced" in security) chips.push({ t: security.mintRenounced ? "Mint renounced" : "Mint active", cls: security.mintRenounced ? "ok" : "bad" });
if ("transferTax" in security) chips.push({ t:`Tax ${security.transferTax}%`, cls:"warn" });
else if ("noTransferTax" in security) chips.push({ t:"No transfer tax", cls:"ok" });


    const hcPct = Number(security?.holderConcentration || 0);
    const top10Width = Math.max(0, Math.min(100, hcPct));

    const clusters = Array.isArray(report.clusters) ? report.clusters : [];

    const poolsDetails = (Array.isArray(distribution?.allLpAddresses) && distribution.allLpAddresses.length) ? `
      <details style="margin-top:12px;">
        <summary class="pill" style="background:#15171c;">Pools / CEX / Programmatic — ${distribution.allLpAddresses.length}</summary>
        <ul class="list" style="margin-top:10px;">
          ${distribution.allLpAddresses.map(a=>`<li><a href="https://solscan.io/account/${a}" target="_blank" rel="noopener">${a.slice(0,10)}…${a.slice(-4)}</a></li>`).join("")}
        </ul>
      </details>` : "";

    const hypeHTML = (hype && hype.id) ? (() => {
      const tot = hype?.sentiment?.total || 0;
      const p = tot ? Math.round((hype.sentiment.positive/tot)*100) : 0;
      const n = tot ? Math.round((hype.sentiment.negative/tot)*100) : 0;
      const ne= tot ? 100 - p - n : 0;
      return `
      <section class="section">
        <h3>🌐 Social & Hype</h3>
        <div class="grid grid-3">
          <div class="kcube"><h4>Social Interactions (24h)</h4><div style="font-weight:900; font-size:1.2rem;">${fmtNum(hype.socialVolume)}</div></div>
          <div class="kcube"><h4>Contributors (24h)</h4><div style="font-weight:900; font-size:1.2rem;">${fmtNum(hype.contributors)}</div></div>
          <div class="kcube"><h4>Momentum Score</h4><div style="font-weight:900; font-size:1.2rem;">${hype.momentumScore || "N/A"}</div></div>
        </div>
        <div class="kcube" style="margin-top:10px;">
          <h4>Sentiment</h4>
          <div style="display:flex; gap:14px; justify-content:center; font-weight:800;">
            <div style="color:var(--ok)">Pos ${p}%</div>
            <div style="color:#cfd2db">Neu ${ne}%</div>
            <div style="color:var(--bad)">Neg ${n}%</div>
          </div>
        </div>
      </section>`;
    })() : "";

    const html = `
      <div class="report">
        <div class="hero">
          <div class="token">
            ${tokenInfo?.logoUrl ? `<img src="${sanitizeUrl(tokenInfo.logoUrl)}" alt="logo" class="logo">` : `<div class="logo"></div>`}
            <div class="meta">
              <div>
                <h2>${sanitizeHTML(nameShort)}</h2>
                <div class="symbol">${sanitizeHTML(symbol)}</div>
              </div>
              <div class="row-actions">
                ${addr ? `<button class="pill mono" id="copy-addr">${addrShort}</button>` : ""}
                <button class="pill mono" id="copy-link">Share</button>
              </div>
            </div>
          </div>
          <div class="score">
            <svg viewBox="0 0 132 132">
              <circle class="ring-bg" cx="66" cy="66" r="56"></circle>
              <circle class="ring-fg" cx="66" cy="66" r="56" style="stroke-dasharray:351.86; stroke-dashoffset:351.86"></circle>
            </svg>
            <div class="score-txt">
              <div class="score-num">0%</div>
              <div class="score-cap">Trust Score</div>
              <div class="verdict ${verdict.tone}">${verdict.text}</div>
            </div>
          </div>
        </div>

        <div class="kpis">
          <div class="kpi"><b>Price</b><span>${price}</span></div>
          <div class="kpi"><b>24h Change</b><span class="${(pc.h24??0)>=0?"ok":"bad"}">${(pc.h24??0).toFixed(2)}%</span></div>
          <div class="kpi"><b>24h Volume</b><span>$${fmtNum(market?.volume24h)}</span></div>
          <div class="kpi"><b>Market Cap</b><span>$${fmtNum(market?.marketCap)}</span></div>
          <div class="kpi"><b>Liquidity</b><span>$${fmtNum(market?.liquidity)}</span></div>
          <div class="kpi"><b>24h TXNs</b>
            <span class="inline"><span class="ok">${txns.buys||0}</span>/<span class="bad">${txns.sells||0}</span></span>
          </div>
        </div>

        <div class="risk">
          ${chips.map(c=>`<span class="chip ${c.cls}">${sanitizeHTML(c.t)}</span>`).join("")}
          ${(clusterSummary?.penalty>0 || clusterSummary?.macroBonus>0) ? `<span class="chip" title="Macro bonus / cluster penalty">Credibility: +${clusterSummary?.macroBonus||0} / -${clusterSummary?.penalty||0}</span>` : ""}
        </div>

        <section class="section">
          <h3>📈 Micro Trend</h3>
          <div class="trend">
            <div class="tcard">
              <div class="tcap">5 MIN</div>
              <div class="tval ${(Number(pc.m5)||0)>=0?"ok":"bad"}">${(Number(pc.m5)||0).toFixed(2)}%</div>
              <svg class="spark" viewBox="0 0 120 38" preserveAspectRatio="none"><path d="${p5}"/></svg>
            </div>
            <div class="tcard">
              <div class="tcap">1 HOUR</div>
              <div class="tval ${(Number(pc.h1)||0)>=0?"ok":"bad"}">${(Number(pc.h1)||0).toFixed(2)}%</div>
              <svg class="spark" viewBox="0 0 120 38" preserveAspectRatio="none"><path d="${p1h}"/></svg>
            </div>
            <div class="tcard">
              <div class="tcap">6 HOURS</div>
              <div class="tval ${(Number(pc.h6)||0)>=0?"ok":"bad"}">${(Number(pc.h6)||0).toFixed(2)}%</div>
              <svg class="spark" viewBox="0 0 120 38" preserveAspectRatio="none"><path d="${p6h}"/></svg>
            </div>
            <div class="tcard">
              <div class="tcap">24 HOURS</div>
              <div class="tval ${(Number(pc.h24)||0)>=0?"ok":"bad"}">${(Number(pc.h24)||0).toFixed(2)}%</div>
              <svg class="spark" viewBox="0 0 120 38" preserveAspectRatio="none"><path d="${p24}"/></svg>
            </div>
          </div>
        </section>

        <section class="section">
          <h3>💰 Holders & Distribution</h3>
          <div class="grid grid-2">
            <div>
              <h4>Top 10 Holders</h4>
              <ul class="list">
                ${(distribution?.topHolders||[]).map(h=>`<li><a href="https://solscan.io/account/${h.address}" target="_blank" rel="noopener">${h.address.slice(0,6)}…${h.address.slice(-4)}</a> <span class="muted">(${h.percent}%)</span></li>`).join("") || '<li class="muted">No significant holders.</li>'}
              </ul>
              ${poolsDetails}
            </div>
            <div>
              <h4>Supply Concentration (Top 10)</h4>
              <div class="barbg" title="Top10 vs Rest"><div class="barfg" style="width:${top10Width}%;"></div></div>
              <div class="muted" style="margin-top:6px;">Top 10 own ${hcPct.toFixed(2)}% • Rest ${Math.max(0,(100-hcPct)).toFixed(2)}%</div>

              ${clusters.length ? `
              <h4 style="margin-top:14px;">Detected Clusters</h4>
              <div class="clusters">
                ${clusters.map((c,i)=>{
                  const pct = (typeof c.supplyPct !== "undefined") ? Number(c.supplyPct).toFixed(2) : "0.00";
                  const reasons = (c.reasons ? Object.keys(c.reasons) : []).slice(0,4).map(r=>`<span class="badge">${r.replace(/-/g," ")}</span>`).join("");
                  return `
                    <details class="cl">
                      <summary>
                        <div class="cl-left">
                          <span class="cl-idx">${i+1}</span>
                          <div class="cl-meta">
                            <span class="badge">${c.addresses.length} addr</span>
                            <span class="badge">Conf. ${c.confidence}%</span>
                            <span class="badge cl-supply">≈ ${pct}%</span>
                          </div>
                        </div>
                        <div class="cl-meta">${reasons}</div>
                      </summary>
                      <div class="cl-body">
                        <div class="addrgrid">
                          ${c.addresses.map(a=>`<a href="https://solscan.io/account/${a}" target="_blank" rel="noopener">${a}</a>`).join("")}
                        </div>
                      </div>
                    </details>`;
                }).join("")}
              </div>` : `<div class="muted" style="margin-top:10px;">No significant clusters detected.</div>`}
            </div>
          </div>
        </section>

        ${hypeHTML}

        ${Array.isArray(liquidityDrain) && liquidityDrain.length && market?.marketCap ? `
        <section class="section">
          <h3>💥 Dump Simulation</h3>
         <div class="sim">
  <div class="simbar">
    <div class="sim-fill" style="width:100%"></div>
    <div class="sim-label">$${fmtNum(market.marketCap)}</div>
  </div>
  <div class="simlog">Press the button to simulate scenarios.</div>
  <button class="sbtn" id="sim-btn">Run Simulation</button>
</div>

        </section>` : ""}

        <div class="disc">Disclaimer: Automated report for informational purposes only. Always DYOR.</div>
      </div>
    `;

    // Вставляем и добавляем медленный fade-in к отчёту
    this.root.innerHTML = html;
    const reportEl = this.shadowRoot.querySelector(".report");
    if (reportEl) {
      // ставим изначально прозрачность через класс + следом триггерим анимацию
      reportEl.style.opacity = "0";
      reportEl.style.transform = "translateY(8px)";
      requestAnimationFrame(()=>{
        reportEl.classList.add("fade-report");
        // сброс inline, чтобы не конфликтовать с повторными рендерами
        reportEl.style.opacity = "";
        reportEl.style.transform = "";
      });
    }

    // interactions
    if (addr){
      const btn = this.shadowRoot.querySelector("#copy-addr");
      btn?.addEventListener("click", ()=> this.copy(addr, btn));
    }
    const share = this.shadowRoot.querySelector("#copy-link");
    share?.addEventListener("click", ()=> this.copy(window.location.href, share));

    const simBtn = this.shadowRoot.querySelector("#sim-btn");
    simBtn?.addEventListener("click", ()=> this.runSimulation());
  }
}

if (!customElements.get("dfn-patrol")) {
  customElements.define("dfn-patrol", DFNPatrol);
}
