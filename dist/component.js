// component.js
console.log("[DFN Components] v6.1.3 initialized - Final Hype Layout with Tooltips");

function sanitizeHTML(str) {
    if (!str) return '';
    if (typeof DOMPurify === 'undefined') return str;
    return DOMPurify.sanitize(str.toString());
}

function sanitizeUrl(url) {
    if (typeof url !== 'string' || !url) {
        return '#';
    }
    try {
        const u = new URL(url);
        if (u.protocol === 'http:' || u.protocol === 'https:' || u.protocol === 'tg:') {
            return u.href;
        }
    } catch (e) {}
    return '#';
}

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      font-family: sans-serif;
      background-color: #111;
      color: #eee;
      padding: 24px;
      border-radius: 12px;
      border: 1px solid #333;
    }
    h3, h4 {
      margin: 24px 0 16px;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--accent, #FFD447);
      border-top: 1px solid #333;
      padding-top: 24px;
    }
    h3:first-of-type {
      margin-top: 0;
      padding-top: 0;
      border-top: none;
    }
    h4 {
        font-size: 1rem;
        color: #ccc;
        border-top: none;
        padding-top: 0;
        margin-top: 0;
    }
    ul { list-style: none; padding-left: 0; font-size: 0.95rem; margin-top: 8px; }
    li { margin-bottom: 10px; line-height: 1.5; display: flex; align-items: center; word-break: break-word; color: #aaa; }
    
    .placeholder, .error { text-align: center; padding: 40px; font-size: 1.1em; color: #888; }
    .error { color: #ff6b7b; }
    
    .ok::before, .bad::before, .warn::before { content: '✓'; margin-right: 10px; font-weight: bold; font-size: 1.1em; }
    .ok { color: #9eff9e; }
    .bad { color: #ff6b7b; }
    .bad::before { content: '🔴'; }
    .ok::before { content: '✅'; }
    .warn { color: #ffd447; }
    .warn::before { content: '🟡'; }
    
    a { color: var(--accent, #FFD447); text-decoration: none; font-weight: 500; }
    a:hover { text-decoration: underline; }

    .summary-block {
      display: flex;
      flex-wrap: wrap;
      gap: 16px 32px;
      padding: 24px;
      background: #191919;
      border-radius: 8px;
      border: 1px solid #282828;
      margin-bottom: 24px;
      align-items: center;
    }
    .summary-token-info {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-grow: 1;
    }
    .token-logo { width: 48px; height: 48px; border-radius: 50%; background: #222; object-fit: cover; }
    .token-name-symbol h2 { font-size: 1.8rem; margin: 0; line-height: 1.1; color: #fff; }
    .token-name-symbol span { font-size: 1rem; color: #999; margin-top: 4px; display: block; }

    .address-container { 
        display: flex; 
        align-items: center; 
        gap: 8px; 
        margin-top: 12px;
        font-family: monospace; 
        font-size: 0.9em; 
        color: #888; 
        cursor: pointer; 
        padding: 4px 8px; 
        border-radius: 4px; 
        transition: background-color: 0.2s; 
        width: fit-content;
    }
    .address-container:hover { background-color: #252525; }
    .address-container .copy-icon { width: 14px; height: 14px; stroke: #888; transition: stroke 0.2s; }
    .address-container:hover .copy-icon { stroke: #eee; }

    .share-button {
        background: none;
        border: none;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 8px;
        font-family: monospace;
        font-size: 0.9em;
        color: #888;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background-color: 0.2s;
        width: fit-content;
    }
    .share-button:hover {
        background-color: #252525;
        color: #eee;
    }
    .share-button .copy-icon {
        width: 14px;
        height: 14px;
        stroke: #888;
        transition: stroke 0.2s;
    }
    .share-button:hover .copy-icon {
        stroke: #eee;
    }
    .copied-text {
        color: var(--accent, #FFD447);
    }

    .summary-market-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px 24px; text-align: right; }
    .stat-item { display: flex; flex-direction: column; }
    .stat-item b { font-size: 0.9rem; color: #888; font-weight: 500; margin-bottom: 4px; text-transform: uppercase; }
    .stat-item span { font-size: 1.2rem; font-weight: 600; color: #fff; }
    .stat-item span.text-ok, .stat-item .buys-sells .text-ok { color: #9eff9e; }
    .stat-item span.text-bad, .stat-item .buys-sells .text-bad { color: #ff6b7b; }
    .stat-item .buys-sells { font-weight: 600; }
    
    .score-container {
        position: relative;
        width: 120px;
        height: 120px;
        margin-left: auto;
    }
    .score-svg {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
    }
    .score-circle-bg {
        fill: none;
        stroke: #2a2a2a;
        stroke-width: 10;
    }
    .score-circle-fg {
        fill: none;
        stroke: #ff6b7b;
        stroke-width: 10;
        stroke-linecap: round;
        transition: stroke-dashoffset 1s ease-out, stroke 0.5s ease;
    }
    .score-text-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
    }
    .score-percentage {
        font-size: 2rem;
        font-weight: 700;
        color: #fff;
    }
    .score-label {
        font-size: 0.6rem;
        color: #888;
        text-transform: uppercase;
        margin-top: -4px;
        white-space: nowrap;
    }
    
    .report-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; }
    .report-grid > div { background: #191919; padding: 24px; border-radius: 8px; border: 1px solid #282828; }
    .full-width { grid-column: 1 / -1; }
    .socials-list { display: flex; flex-wrap: wrap; gap: 10px; list-style: none; padding: 0; margin: 0; }
    .socials-list a { display: inline-block; padding: 8px 18px; background: #252525; border: 1px solid #333; border-radius: 20px; font-size: 0.9rem; font-weight: 500; text-decoration: none; color: #ddd; transition: all 0.2s ease; }
    .socials-list a:hover { background-color: #333; color: #fff; border-color: #444; }

    .trend-indicator { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background-color: #282828; border: 1px solid #282828; border-radius: 8px; overflow: hidden; margin-bottom: 24px; }
    .trend-item { background-color: #191919; padding: 16px 12px; text-align: center; }
    .trend-item b { font-size: 0.75rem; color: #888; font-weight: 600; text-transform: uppercase; }
    .trend-item div { font-size: 1.5rem; font-weight: 700; margin-top: 8px; color: #fff; }
    .trend-item div.text-ok { color: #9eff9e; }
    .trend-item div.text-bad { color: #ff6b7b; }
    
    details.programmatic-accounts-details { margin-top: 16px; }
    summary { cursor: pointer; font-size: 0.9em; color: #888; outline: none; list-style-type: '▸ '; transition: color 0.2s ease; }
    summary:hover { color: #bbb; }
    details[open] > summary { list-style-type: '▾ '; }
    .programmatic-list { padding: 12px 0 4px 24px; list-style-type: square; font-size: 0.85em; }
    .programmatic-list li { margin-bottom: 8px; }
    
    .hype-analysis-block { grid-column: 1 / -1; }
    .hype-verdict { text-align: center; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .hype-verdict-title { font-size: 0.9rem; color: #aaa; text-transform: uppercase; margin: 0 0 8px; font-weight: 600; }
    .hype-verdict-text { font-size: 1.5rem; font-weight: 700; margin: 0; }
    .verdict-low-profile { background: rgba(158, 255, 158, 0.1); border: 1px solid #9eff9e44; color: #9eff9e; }
    .verdict-rising-attention { background: rgba(255, 212, 71, 0.1); border: 1px solid #ffd44744; color: #ffd447; }
    .verdict-irrational-optimism { background: rgba(255, 212, 71, 0.15); border: 1px solid #ffd44766; color: #ffd447; }
    .verdict-toxic-sentiment { background: rgba(255, 107, 123, 0.1); border: 1px solid #ff6b7b44; color: #ff6b7b; }
    
    .hype-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; text-align: center; }
    .hype-widget { background-color: #111; padding: 16px; border-radius: 6px; border: 1px solid #222; }
    .hype-widget-label { font-size: 0.8rem; font-weight: 600; color: #888; text-transform: uppercase; margin-bottom: 8px; }
    .hype-widget-value { font-size: 1.4rem; font-weight: 700; color: #fff; }
    
    .sentiment-breakdown { display: flex; justify-content: space-around; align-items: center; font-size: 1.1rem; }
    .sentiment-item { display: flex; flex-direction: column; align-items: center; }
    .sentiment-item span:first-child { font-size: 0.8rem; }
    .sentiment-positive { color: #9eff9e; }
    .sentiment-neutral { color: #aaa; }
    .sentiment-negative { color: #ff6b7b; }

    .breakdown-container { margin-top: 20px; }
    .breakdown-item { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .breakdown-label { width: 100px; font-size: 0.9em; color: #aaa; text-align: right; }
    .breakdown-bar-bg { flex-grow: 1; background-color: #222; border-radius: 4px; height: 20px; }
    .breakdown-bar-fg { height: 100%; background-color: var(--accent); border-radius: 4px; transition: width 0.5s ease-out; }
    .breakdown-value { font-size: 0.9em; font-weight: bold; min-width: 50px; text-align: left;}

    .recent-posts-container { margin-top: 20px; }
    .post-card { background-color: #111; border: 1px solid #222; border-radius: 6px; padding: 14px; margin-bottom: 12px; font-size: 0.9em; text-align: left; }
    .post-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .post-header img { width: 32px; height: 32px; border-radius: 50%; }
    .post-author-info { display: flex; flex-direction: column; }
    .post-author-info a { color: #eee; font-weight: bold; }
    .post-author-info span { color: #888; font-size: 0.85em; }
    .post-body { color: #ccc; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; max-height: 100px; overflow: hidden; }
    .post-body a { color: #58a6ff; }
    .post-footer { margin-top: 12px; font-size: 0.85em; color: #888; }
    
    #cascade-dump-simulator { text-align: center; background: #191919; padding: 24px; border-radius: 8px; border: 1px solid #282828;}
    #start-sim-btn {
        background-color: var(--accent); color: #000; border: none; padding: 10px 20px; margin-top: 16px;
        border-radius: 6px; font-weight: 600; cursor: pointer; transition: background-color 0.2s, transform 0.2s;
    }
    #start-sim-btn:hover:not(:disabled) { background-color: #ffc72c; transform: scale(1.05); }
    #start-sim-btn:disabled { background-color: #555; color: #999; cursor: not-allowed; transform: scale(1); }
    .sim-display { display: flex; flex-direction: column; gap: 12px; margin-top: 20px; text-align: left; }
    .sim-bar-container { width: 100%; height: 30px; background-color: #2a2a2a; border-radius: 6px; overflow: hidden; border: 1px solid #333; }
    .sim-bar {
        height: 100%; width: 100%;
        background: linear-gradient(to right, #9eff9e, #34d399);
        transition: width 1.2s cubic-bezier(0.25, 1, 0.5, 1);
        display: flex; align-items: center; justify-content: flex-end;
        font-size: 0.9em; color: #000; font-weight: 600;
        padding-right: 10px;
        box-sizing: border-box;
    }
    .sim-bar.draining { background: linear-gradient(to right, #ff6b7b, #e05068); color: #fff; }
    .sim-label { font-size: 0.9em; color: #aaa; }
    .sim-log { margin-top: 16px; min-height: 105px; background-color: #111; border-radius: 6px; padding: 12px; text-align: left; font-family: monospace; font-size: 0.9em; color: #aaa; overflow: hidden; }
    .sim-log-entry { animation: logFadeIn 0.5s ease; border-bottom: 1px solid #222; padding-bottom: 6px; margin-bottom: 6px; white-space: pre-wrap; }
    .sim-log-entry strong { color: #eee; }
    @keyframes logFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    .report-fade-in {
      animation: reportFadeInAnimation 0.5s ease-in-out;
    }

    @keyframes reportFadeInAnimation {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    @media (min-width: 901px) { .token-logo { width: 96px !important; height: 96px !important; } }
    @media (max-width: 900px) { .summary-market-stats { order: 3; width: 100%; text-align: left; } .summary-token-info { order: 1; } .score-container { order: 2; margin-left: 0; margin-top: 20px; } }
    @media (max-width: 600px) { .summary-market-stats { grid-template-columns: repeat(2, 1fr); } .trend-indicator { grid-template-columns: repeat(2, 1fr); } .hype-grid { grid-template-columns: repeat(2, 1fr); } }
  </style>
  <div id="report-container">
    <div class="placeholder">Generating token health report...</div>
  </div>
`;

class DFNPatrol extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.container = this.shadowRoot.querySelector('#report-container');
    this.copyIconSVG = `<svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>`;
    this.checkIconSVG = `<svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="#9eff9e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  }
  
  setReport(report) {
    this.report = report;
    this.render();
    if (report && typeof report.trustScore !== 'undefined') {
        this.updateScore(report.trustScore);
    }
  }

  updateScore(score) {
    const circle = this.shadowRoot.querySelector('.score-circle-fg');
    const percentageText = this.shadowRoot.querySelector('.score-percentage');
    if (!circle || !percentageText) return;

    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    
    setTimeout(() => {
        const offset = circumference - (score / 100) * circumference;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = offset;

        if (score >= 75) circle.style.stroke = '#9eff9e';
        else if (score >= 40) circle.style.stroke = '#ffd447';
        else circle.style.stroke = '#ff6b7b';
        
        const initialScoreText = percentageText.textContent;
        const initialScore = parseInt(initialScoreText.replace('%','')) || 0;
        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            if (elapsedTime > duration) {
                percentageText.textContent = `${score}%`;
                return;
            }
            const progress = elapsedTime / duration;
            const currentAnimatedScore = Math.round(initialScore + (score - initialScore) * progress);
            percentageText.textContent = `${currentAnimatedScore}%`;
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);

    }, 100);
  }

  handleAddressCopy() {
    if (!this.report?.tokenInfo?.address) return;
    navigator.clipboard.writeText(this.report.tokenInfo.address).then(() => {
        const addrContainer = this.shadowRoot.querySelector('.address-container');
        if (addrContainer) {
            const originalText = addrContainer.querySelector('span').textContent;
            addrContainer.innerHTML = `${this.checkIconSVG} <span>Copied!</span>`;
            setTimeout(() => { addrContainer.innerHTML = `${this.copyIconSVG} <span>${originalText}</span>`; }, 1500);
        }
    }).catch(err => { console.error('Failed to copy address: ', err); });
  }

  handleShareCopy() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const shareBtn = this.shadowRoot.querySelector('#share-button');
        if (shareBtn) {
            const originalContent = shareBtn.innerHTML;
            shareBtn.innerHTML = `${this.checkIconSVG} <span class="copied-text">Copied!</span>`;
            setTimeout(() => { shareBtn.innerHTML = originalContent; }, 2000);
        }
    }).catch(err => { console.error('Failed to copy link: ', err); });
  }

  async runSimulation() {
    const btn = this.shadowRoot.querySelector('#start-sim-btn');
    const log = this.shadowRoot.querySelector('#simulation-log');
    const mcBar = this.shadowRoot.querySelector('.sim-bar');
    const mcBarValue = this.shadowRoot.querySelector('.sim-bar-value');
    
    const drainScenarios = this.report.liquidityDrain;
    const topHolders = this.report.distribution.topHolders;
    if (!drainScenarios || drainScenarios.length === 0) {
        log.innerHTML = "Not enough data for simulation.";
        return;
    }
    
    const initialMarketCap = this.report.market.marketCap;
    if (!btn || !log || !mcBar || !mcBarValue || !initialMarketCap) return;

    btn.disabled = true;
    btn.textContent = 'Simulating...';
    log.innerHTML = '';
    
    const formatAsCurrency = (num) => `$${Number(num).toLocaleString('en-US', {maximumFractionDigits: 0})}`;
    const wait = (ms) => new Promise(res => setTimeout(res, ms));

    const updateBar = (mc) => {
        const barWidth = (mc / initialMarketCap) * 100;
        mcBar.style.width = `${barWidth < 0 ? 0 : barWidth}%`;
        mcBarValue.textContent = formatAsCurrency(mc);
    };
    
    const logEvent = (message) => {
        const entry = document.createElement('div');
        entry.className = 'sim-log-entry';
        entry.innerHTML = message;
        log.prepend(entry);
    };
    
    updateBar(initialMarketCap);
    mcBar.classList.remove('draining');
    logEvent(`Simulation started. Initial Market Cap: <strong>${formatAsCurrency(initialMarketCap)}</strong>`);
    await wait(1500);

    for (const scenario of drainScenarios) {
        mcBar.classList.add('draining');
        
        let ownershipPercent = 0;
        const match = scenario.group.match(/Top (\d+)/);
        if (match && topHolders) {
            const count = parseInt(match[1], 10);
            if (topHolders.length >= count) {
                ownershipPercent = topHolders.slice(0, count).reduce((sum, h) => sum + parseFloat(h.percent), 0);
            }
        }
        const ownershipText = ownershipPercent > 0 ? ` (owning ${ownershipPercent.toFixed(2)}% of supply)` : '';

        logEvent(`Analyzing impact of <strong>${scenario.group}</strong>${ownershipText} selling...`);
        await wait(2000);

        updateBar(scenario.marketCapAfterSale);
        logEvent(`→ Price would collapse by <strong style="color: #ff6b7b;">-${scenario.marketCapDropPercentage}%</strong>. New Market Cap: <strong>${formatAsCurrency(scenario.marketCapAfterSale)}</strong>`);
        await wait(3000);
    }
    
    mcBar.classList.remove('draining');
    logEvent(`<strong>SIMULATION END.</strong>`);
    btn.disabled = false;
    btn.textContent = 'Run Simulation Again';
  }


  render() {
    if (!this.report) {
        this.container.innerHTML = `<div class="placeholder">Generating token health report...</div>`;
        return;
    }
    if (this.report.error) {
       this.container.innerHTML = `<div class="error">${sanitizeHTML(this.report.error)}</div>`;
       return;
    }

    const { tokenInfo, security, distribution, market, socials, liquidityDrain, hype } = this.report;
    
    const displayName = tokenInfo.name && tokenInfo.name.length > 10 
        ? `${tokenInfo.name.substring(0, 7)}...` 
        : tokenInfo.name;

    const formatNum = (num) => num ? Number(num).toLocaleString('en-US', {maximumFractionDigits: 0}) : 'N/A';
    const priceChangeColor = market?.priceChange?.h24 >= 0 ? 'text-ok' : 'text-bad';
    const price = !market?.priceUsd ? 'N/A' : (Number(market.priceUsd) < 0.000001 ? `$${Number(market.priceUsd).toExponential(2)}` : `$${Number(market.priceUsd).toLocaleString('en-US', {maximumFractionDigits: 8})}`);
    
    let truncatedAddress = '';
    if(tokenInfo.address) {
        truncatedAddress = `${tokenInfo.address.slice(0, 4)}...${tokenInfo.address.slice(-4)}`;
    }
    const addressHTML = tokenInfo.address ? `<div class="address-container" title="Copy Address: ${tokenInfo.address}">${this.copyIconSVG}<span>${truncatedAddress}</span></div>` : '';
    const shareButtonHTML = tokenInfo.address ? `<button id="share-button" class="share-button" title="Copy report link">${this.copyIconSVG} <span>Share</span></button>` : '';
    
    const scoreHTML = typeof this.report.trustScore !== 'undefined' ? `
        <div class="score-container">
            <svg class="score-svg" viewBox="0 0 120 120">
                <circle class="score-circle-bg" cx="60" cy="60" r="54" />
                <circle class="score-circle-fg" cx="60" cy="60" r="54" style="stroke-dasharray: 339.292; stroke-dashoffset: 339.292;" />
            </svg>
            <div class="score-text-container">
                <div class="score-percentage">0%</div>
                <div class="score-label">Trust Score</div>
            </div>
        </div>
    ` : '';

    const marketStatsHTML = `
        <div class="summary-market-stats">
            <div class="stat-item"><b>Price</b><span>${price}</span></div>
            <div class="stat-item"><b>24h Change</b><span class="${priceChangeColor}">${market?.priceChange?.h24?.toFixed(2) || '0.00'}%</span></div>
            <div class="stat-item"><b>24h Volume</b><span>$${formatNum(market?.volume24h)}</span></div>
            <div class="stat-item"><b>Market Cap</b><span>$${formatNum(market?.marketCap)}</span></div>
            <div class="stat-item"><b>Liquidity</b><span>$${formatNum(market?.liquidity)}</span></div>
            <div class="stat-item">
                <b>24h TXNs</b>
                <span class="buys-sells">
                    <span class="text-ok">${market?.txns24h?.buys || 0}</span> / <span class="text-bad">${market?.txns24h?.sells || 0}</span>
                </span>
            </div>
        </div>
    `;

    const priceChange = market?.priceChange || {};
    const trendIndicatorHTML = `
      <div class="trend-indicator">
        <div class="trend-item"><b>5 MIN</b><div class="${priceChange.m5 >= 0 ? 'text-ok' : 'text-bad'}">${priceChange.m5?.toFixed(2) ?? '0.00'}%</div></div>
        <div class="trend-item"><b>1 HOUR</b><div class="${priceChange.h1 >= 0 ? 'text-ok' : 'text-bad'}">${priceChange.h1?.toFixed(2) ?? '0.00'}%</div></div>
        <div class="trend-item"><b>6 HOURS</b><div class="${priceChange.h6 >= 0 ? 'text-ok' : 'text-bad'}">${priceChange.h6?.toFixed(2) ?? '0.00'}%</div></div>
        <div class="trend-item"><b>24 HOURS</b><div class="${priceChange.h24 >= 0 ? 'text-ok' : 'text-bad'}">${priceChange.h24?.toFixed(2) ?? '0.00'}%</div></div>
      </div>
    `;

    const socialsHTML = socials && socials.length > 0 ? `
        <div class="full-width">
            <h3>🔗 Socials</h3>
            <div class="socials-list">
                ${socials.map(social => {
                    try {
                        const link = social.url;
                        if(!link) return '';
                        const label = social.label || social.type.charAt(0).toUpperCase() + social.type.slice(1);
                        return `<a href="${sanitizeUrl(link)}" target="_blank" rel="noopener nofollow">${sanitizeHTML(label)}</a>`;
                    } catch(e) { return ''; }
                }).join('')}
            </div>
        </div>
    ` : '';
    
    let hypeAnalysisHTML = '';
    if (hype && hype.id) {
        
        let verdict = { text: 'N/A', class: '' };
        const sentiment = hype.sentiment;
        const volume = hype.socialVolume;

        if (sentiment && typeof sentiment.total !== 'undefined') {
            const positivePercent = sentiment.total > 0 ? (sentiment.positive / sentiment.total) * 100 : 0;
            const negativePercent = sentiment.total > 0 ? (sentiment.negative / sentiment.total) * 100 : 0;

            if (negativePercent > 40) {
                verdict = { text: 'Toxic Sentiment', class: 'verdict-toxic-sentiment' };
            } else if (volume > 50000 && positivePercent > 60) {
                verdict = { text: 'Irrational Optimism', class: 'verdict-irrational-optimism' };
            } else if (volume > 10000) {
                verdict = { text: 'Rising Attention', class: 'verdict-rising-attention' };
            } else {
                 verdict = { text: 'Low Profile', class: 'verdict-low-profile' };
            }
        }
        
        const formatBigNum = (num) => {
            if (num === null || typeof num === 'undefined') return 'N/A';
            if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
            if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
            return num.toLocaleString('en-US');
        };
        
        const getSentimentPercent = (value, total) => {
            if (total === null || typeof total === 'undefined' || total === 0) return '0%';
            return `${Math.round((value / total) * 100)}%`;
        };
        
        const networkBreakdownData = hype.networkBreakdown ? Object.entries(hype.networkBreakdown) : [];
        const totalInteractions = networkBreakdownData.reduce((sum, [, value]) => sum + value, 0);

        const networkBreakdownHTML = totalInteractions > 0 ? `
            <div class="breakdown-container">
                <h4>Network Breakdown</h4>
                ${networkBreakdownData.map(([key, value]) => `
                    <div class="breakdown-item">
                        <div class="breakdown-label">${key.charAt(0).toUpperCase() + key.slice(1).replace('-post','')}</div>
                        <div class="breakdown-bar-bg">
                            <div class="breakdown-bar-fg" style="width: ${(value / totalInteractions) * 100}%;"></div>
                        </div>
                        <div class="breakdown-value">${formatBigNum(value)}</div>
                    </div>
                `).join('')}
            </div>
        ` : '';
        
        const recentPostsHTML = hype.recentPosts && hype.recentPosts.length > 0 ? `
            <div class="recent-posts-container">
                <h4>Top Social Posts</h4>
                ${hype.recentPosts.map(post => `
                    <div class="post-card">
                        <div class="post-header">
                            <img src="${sanitizeUrl(post.profile_image)}" alt="author profile">
                            <div class="post-author-info">
                                <a href="${sanitizeUrl(post.url)}" target="_blank" rel="noopener">${sanitizeHTML(post.display_name)}</a>
                                <span>@${sanitizeHTML(post.user_name)}</span>
                            </div>
                        </div>
                        <div class="post-body">${sanitizeHTML(post.body).replace(/#\w+/g, '<strong>$&</strong>').replace(/@\w+/g, '<strong>$&</strong>')}</div>
                        <div class="post-footer">${new Date(post.time * 1000).toLocaleString()} • Interactions: ${formatBigNum(post.interactions)}</div>
                    </div>
                `).join('')}
            </div>
        ` : '';

        hypeAnalysisHTML = `
            <div class="hype-analysis-block">
                <h3>🌪️ Hype & Resonance Analysis</h3>
                <div class="hype-verdict ${verdict.class}" title="Our summary verdict on the token's current social sentiment and activity level.">
                    <div class="hype-verdict-title">Overall Hype Index</div>
                    <div class="hype-verdict-text">${verdict.text}</div>
                </div>
                <div class="hype-grid">
                    <div class="hype-widget" title="The total number of likes, comments, replies, and shares on posts about this token in the last 24 hours.">
                        <div class="hype-widget-label">Social Interactions (24h)</div>
                        <div class="hype-widget-value">${formatBigNum(hype.socialVolume)}</div>
                    </div>
                    <div class="hype-widget" title="The percentage of positive, neutral, and negative interactions about this token.">
                        <div class="hype-widget-label">Sentiment Breakdown</div>
                        <div class="hype-widget-value sentiment-breakdown">
                           <div class="sentiment-item sentiment-positive"><span>Pos</span>${getSentimentPercent(hype.sentiment.positive, hype.sentiment.total)}</div>
                           <div class="sentiment-item sentiment-neutral"><span>Neu</span>${getSentimentPercent(hype.sentiment.neutral, hype.sentiment.total)}</div>
                           <div class="sentiment-item sentiment-negative"><span>Neg</span>${getSentimentPercent(hype.sentiment.negative, hype.sentiment.total)}</div>
                        </div>
                    </div>
                    <div class="hype-widget" title="The number of unique social media authors who created posts about this token in the last 24 hours.">
                        <div class="hype-widget-label">Contributors (24h)</div>
                        <div class="hype-widget-value">${formatBigNum(hype.contributors)}</div>
                    </div>
                    <div class="hype-widget" title="A combined score (1-100) that analyzes price, social volume, and sentiment to gauge the 'sanity' of the current hype.">
                        <div class="hype-widget-label">Momentum Score</div>
                        <div class="hype-widget-value">${hype.momentumScore || 'N/A'}</div>
                    </div>
                </div>
                ${networkBreakdownHTML}
                ${recentPostsHTML}
            </div>
        `;
    }


    const programmaticAccountsHTML = distribution.allLpAddresses && distribution.allLpAddresses.length > 0 ?
      `<details class="programmatic-accounts-details"><summary>Pools, CEX, etc.: ${distribution.allLpAddresses.length}</summary><ul class="programmatic-list">${distribution.allLpAddresses.map(addr => `<li><a href="https://solscan.io/account/${addr}" target="_blank" rel="noopener">${addr.slice(0, 10)}...${addr.slice(-4)}</a></li>`).join('')}</ul></details>` : '';

    const cascadeSimulatorHTML = liquidityDrain && liquidityDrain.length > 0 && market.marketCap > 0 ? `
        <div id="cascade-dump-simulator" class="full-width">
            <h3>💥 Price Collapse Drill</h3>
            <div class="sim-display">
                <div class="sim-label">Market Cap:</div>
                <div class="sim-bar-container">
                    <div class="sim-bar">
                        <span class="sim-bar-value">$${formatNum(market.marketCap)}</span>
                    </div>
                </div>
            </div>
            <div id="simulation-log" class="sim-log">Press the button to simulate "what-if" scenarios.</div>
            <button id="start-sim-btn">Run Simulation</button>
        </div>` : '';


    const newContent = `
        <div class="summary-block">
             <div class="summary-token-info">
                ${tokenInfo.logoUrl ? `<img src="${sanitizeUrl(tokenInfo.logoUrl)}" alt="${sanitizeHTML(tokenInfo.symbol)} logo" class="token-logo">` : `<div class="token-logo"></div>`}
                <div class="token-name-symbol">
                    <h2>${sanitizeHTML(displayName)}</h2>
                    <span>${sanitizeHTML(tokenInfo.symbol)}</span>
                    ${addressHTML}
                    ${shareButtonHTML}
                </div>
             </div>
            ${scoreHTML}
            ${marketStatsHTML}
        </div>
        ${trendIndicatorHTML}
        <div class="report-grid">
            ${socialsHTML}
            ${hypeAnalysisHTML}
            <div>
              <h3>🛡️ Security Flags</h3>
              <ul>
                ${security.launchpad ? `<li class="ok">Launched on a trusted platform: ${sanitizeHTML(security.launchpad)}.</li>` : ''}
                ${security.hackerFound ? `<li class="bad">${sanitizeHTML(security.hackerFound)}</li>` : ''}
                
                ${'holderConcentration' in security ? `<li class="${security.holderConcentration > 25 ? 'bad' : (security.holderConcentration > 10 ? 'warn' : 'ok')}">Top 10 holders own ${security.holderConcentration.toFixed(2)}%.</li>` : ''}
                
                // --- ИЗМЕНЕНИЕ: Новая логика отображения ---
                ${security.hasActiveAd ? `<li class="warn">Token has an active ad campaign on DexScreener.</li>` : ''}
                ${security.isCto ? `<li class="ok">Community Takeover</li>` : ''}
                ${security.isDexVerified ? `<li class="ok">DEX Paid</li>` : ''}
                ${!security.isDexVerified && !security.launchpad ? `<li class="bad">DEX Not Paid</li>` : ''}

                ${security.lpStatus ? `<li class="${security.lpStatus === 'Burned' || security.lpStatus === 'Locked/Burned' ? 'ok' : 'bad'}">Liquidity is ${security.lpStatus}.</li>` : '<li>Liquidity status is Unknown.</li>'}
                ${'isMutable' in security ? `<li class="${!security.isMutable ? 'ok' : 'bad'}">${!security.isMutable ? 'Metadata is immutable.' : 'Dev can change token info.'}</li>` : ''}
                ${'freezeAuthorityEnabled' in security ? `<li class="${!security.freezeAuthorityEnabled ? 'ok' : 'bad'}">${!security.freezeAuthorityEnabled ? 'Freeze authority is disabled.' : 'Freeze authority is enabled.'}</li>` : ''}
                ${'mintRenounced' in security ? `<li class="${security.mintRenounced ? 'ok' : 'bad'}">${security.mintRenounced ? 'Mint authority is renounced.' : 'Dev can mint more tokens.'}</li>` : ''}
                ${'transferTax' in security ? `<li class="warn">Token has a transfer tax: ${security.transferTax}%.</li>` : ('noTransferTax' in security ? '<li class="ok">No transfer tax.</li>' : '')}
              </ul>
            </div>
            <div>
              <h3>💰 Top 10 Holders</h3>
              <ul>
                  ${distribution.topHolders && distribution.topHolders.length > 0
                      ? distribution.topHolders.map(h => `<li><a href="https://solscan.io/account/${h.address}" target="_blank" rel="noopener">${h.address.slice(0,6)}...${h.address.slice(-4)}</a>&nbsp;(${h.percent}%)</li>`).join('') 
                      : '<li>No significant individual holders found.</li>'}
              </ul>
              ${programmaticAccountsHTML}
            </div>
            ${cascadeSimulatorHTML}
        </div>
    `;
    
    this.container.innerHTML = `<div class="report-fade-in">${newContent}</div>`;

    this.shadowRoot.querySelector('.address-container')?.addEventListener('click', () => this.handleAddressCopy());
    this.shadowRoot.querySelector('#share-button')?.addEventListener('click', () => this.handleShareCopy());
    this.shadowRoot.querySelector('#start-sim-btn')?.addEventListener('click', () => this.runSimulation());
    
    this.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

if (!customElements.get("dfn-patrol")) {
  customElements.define("dfn-patrol", DFNPatrol);
}
