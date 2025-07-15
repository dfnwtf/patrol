// component.js
console.log("[DFN Components] v4.8.6 initialized - Cascade Dump Simulator");

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
    h3 {
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
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 16px 32px;
      padding: 24px;
      background: #191919;
      border-radius: 8px;
      border: 1px solid #282828;
      margin-bottom: 24px;
    }
    .summary-token-info { display: flex; align-items: center; gap: 16px; }
    .token-logo { width: 48px; height: 48px; border-radius: 50%; background: #222; object-fit: cover; }
    .token-name-symbol h2 { font-size: 1.8rem; margin: 0; line-height: 1.1; color: #fff; }
    .token-name-symbol span { font-size: 1rem; color: #999; margin-top: 4px; display: block; }

    .address-container { display: flex; align-items: center; gap: 8px; margin-top: 8px; font-family: monospace; font-size: 0.9em; color: #888; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: background-color 0.2s; }
    .address-container:hover { background-color: #252525; }
    .address-container .copy-icon { width: 14px; height: 14px; stroke: #888; transition: stroke 0.2s; }
    .address-container:hover .copy-icon { stroke: #eee; }

    .summary-market-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px 24px; text-align: right; }
    .stat-item { display: flex; flex-direction: column; }
    .stat-item b { font-size: 0.9rem; color: #888; font-weight: 500; margin-bottom: 4px; text-transform: uppercase; }
    .stat-item span { font-size: 1.2rem; font-weight: 600; color: #fff; }
    .stat-item span.text-ok, .stat-item .buys-sells .text-ok { color: #9eff9e; }
    .stat-item span.text-bad, .stat-item .buys-sells .text-bad { color: #ff6b7b; }
    .stat-item .buys-sells { font-weight: 600; }
    
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
    
    /* --- NEW SIMULATOR STYLES --- */
    #cascade-dump-simulator { text-align: center; }
    #start-sim-btn {
        background-color: var(--accent); color: #000; border: none; padding: 10px 20px;
        border-radius: 6px; font-weight: 600; cursor: pointer; transition: background-color 0.2s, transform 0.2s;
    }
    #start-sim-btn:hover { background-color: #ffc72c; transform: scale(1.05); }
    #start-sim-btn:disabled { background-color: #555; cursor: not-allowed; transform: scale(1); }
    .sim-display { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-top: 20px; text-align: left; }
    .sim-bar-container { flex-grow: 1; height: 30px; background-color: #2a2a2a; border-radius: 6px; overflow: hidden; border: 1px solid #333; }
    .sim-bar {
        height: 100%; width: 100%;
        background: linear-gradient(to right, #9eff9e, #34d399);
        transition: width 0.8s ease-in-out;
        display: flex; align-items: center; justify-content: flex-end;
        font-size: 0.9em; color: #000; font-weight: 500;
        padding-right: 10px;
    }
    .sim-bar.draining { background: linear-gradient(to right, #ff6b7b, #e05068); }
    .sim-log { margin-top: 16px; min-height: 80px; background-color: #111; border-radius: 6px; padding: 12px; text-align: left; font-family: monospace; font-size: 0.9em; color: #aaa; }
    .sim-log-entry { animation: logFadeIn 0.5s ease; border-bottom: 1px solid #222; padding-bottom: 6px; margin-bottom: 6px; }
    @keyframes logFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    /* --- END OF SIMULATOR STYLES --- */

    @media (min-width: 901px) { .token-logo { width: 96px !important; height: 96px !important; } }
    @media (max-width: 900px) { .summary-block { grid-template-columns: 1fr; } .summary-market-stats { text-align: left; } }
    @media (max-width: 600px) { .summary-market-stats { grid-template-columns: repeat(2, 1fr); } .trend-indicator { grid-template-columns: repeat(2, 1fr); } }
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
    this.copyIconSVG = `<svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    this.checkIconSVG = `<svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9eff9e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  }
  
  setReport(report) {
    this.report = report;
    this.render();
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

  // --- NEW SIMULATION LOGIC ---
  async runSimulation() {
      const btn = this.shadowRoot.querySelector('#start-sim-btn');
      const log = this.shadowRoot.querySelector('#simulation-log');
      const lpBar = this.shadowRoot.querySelector('.sim-bar');
      const lpBarValue = this.shadowRoot.querySelector('.sim-bar-value');
      const drainData = this.report.liquidityDrain.filter(item => item.marketCapDropPercentage > 0);

      if (!btn || !log || !lpBar || drainData.length === 0) return;

      btn.disabled = true;
      btn.textContent = 'Simulating...';
      log.innerHTML = '';
      
      const initialLiquidity = this.report.market.liquidity;
      lpBarValue.textContent = `$${Number(initialLiquidity).toLocaleString('en-US')}`;

      // Helper to pause execution
      const wait = (ms) => new Promise(res => setTimeout(res, ms));

      for (const step of drainData) {
          await wait(1500);

          const logEntry = document.createElement('div');
          logEntry.className = 'sim-log-entry';
          logEntry.innerHTML = `Calculating impact of <strong>${step.group}</strong> sale...`;
          log.prepend(logEntry);
          
          await wait(500);

          const percentageRemaining = 100 - parseFloat(step.marketCapDropPercentage);
          lpBar.classList.add('draining');
          lpBar.style.width = `${percentageRemaining}%`;
          lpBarValue.textContent = `$${Number(step.marketCapAfterSale).toLocaleString('en-US', {maximumFractionDigits: 0})}`;
          
          logEntry.innerHTML += ` Price Impact: <strong style="color: #ff6b7b;">-${step.marketCapDropPercentage}%</strong>. Remaining Liquidity: <strong>~$${Number(step.marketCapAfterSale).toLocaleString('en-US', {maximumFractionDigits: 0})}</strong>`;
      }
      
      await wait(2000);
      btn.disabled = false;
      btn.textContent = 'Run Simulation Again';
      lpBar.classList.remove('draining');
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

    const { tokenInfo, security, distribution, market, socials, liquidityDrain } = this.report;
    const formatNum = (num) => num ? Number(num).toLocaleString('en-US', {maximumFractionDigits: 0}) : 'N/A';
    const priceChangeColor = market?.priceChange?.h24 >= 0 ? 'text-ok' : 'text-bad';
    const price = !market?.priceUsd ? 'N/A' : (Number(market.priceUsd) < 0.000001 ? `$${Number(market.priceUsd).toExponential(2)}` : `$${Number(market.priceUsd).toLocaleString('en-US', {maximumFractionDigits: 8})}`);
    
    let truncatedAddress = '';
    if(tokenInfo.address) {
        truncatedAddress = `${tokenInfo.address.slice(0, 4)}...${tokenInfo.address.slice(-4)}`;
    }
    const addressHTML = tokenInfo.address ? `<div class="address-container" title="Copy Address: ${tokenInfo.address}">${this.copyIconSVG}<span>${truncatedAddress}</span></div>` : '';

    const marketStatsHTML = `...`; // Omitted for brevity, no changes here
    const trendIndicatorHTML = `...`; // Omitted for brevity, no changes here
    const socialsHTML = `...`; // Omitted for brevity, no changes here
    const programmaticAccountsHTML = `...`; // Omitted for brevity, no changes here

    // --- REPLACED STATIC DRAIN SIMULATOR WITH NEW INTERACTIVE ONE ---
    const cascadeSimulatorHTML = liquidityDrain && liquidityDrain.length > 0 ? `
        <div id="cascade-dump-simulator" class="full-width">
            <h3>💥 Financial Collapse Drill</h3>
            <div class="sim-display">
                <span>Current Liquidity:</span>
                <div class="sim-bar-container">
                    <div class="sim-bar">
                        <span class="sim-bar-value">$${formatNum(market.liquidity)}</span>
                    </div>
                </div>
            </div>
            <div id="simulation-log" class="sim-log"></div>
            <button id="start-sim-btn">Run Simulation</button>
        </div>` : '';


    const newContent = `
        <div class="summary-block">
             <div class="summary-token-info">
                ${tokenInfo.logoUrl ? `<img src="${sanitizeUrl(tokenInfo.logoUrl)}" alt="${sanitizeHTML(tokenInfo.symbol)} logo" class="token-logo">` : `<div class="token-logo"></div>`}
                <div class="token-name-symbol">
                    <h2>${sanitizeHTML(tokenInfo.name)}</h2>
                    <span>${sanitizeHTML(tokenInfo.symbol)}</span>
                    ${addressHTML}
                </div>
            </div>
            ${marketStatsHTML}
        </div>
        ${trendIndicatorHTML}
        <div class="report-grid">
            ${socialsHTML}
            <div>
              <h3>🛡️ Security Flags</h3>
              <ul>...</ul>
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
    
    this.container.innerHTML = newContent; // Render all content first

    // Add event listeners after content is in the DOM
    this.shadowRoot.querySelector('.address-container')?.addEventListener('click', () => this.handleAddressCopy());
    this.shadowRoot.querySelector('#start-sim-btn')?.addEventListener('click', () => this.runSimulation());
  }
}

if (!customElements.get("dfn-patrol")) {
  customElements.define("dfn-patrol", DFNPatrol);
}
