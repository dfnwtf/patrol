// component.js
console.log("[DFN Components] v4.9.2 initialized - Agressive Cascade Simulation");

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
    
    /* --- CASCADE DUMP SIMULATOR STYLES --- */
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
        background: linear-gradient(to right, #ff6b7b, #e05068);
        transition: width 1.2s cubic-bezier(0.25, 1, 0.5, 1);
        display: flex; align-items: center; justify-content: flex-end;
        font-size: 0.9em; color: #fff; font-weight: 600;
        padding-right: 10px;
        box-sizing: border-box;
    }
    .sim-label { font-size: 0.9em; color: #aaa; }
    .sim-log { margin-top: 16px; min-height: 145px; background-color: #111; border-radius: 6px; padding: 12px; text-align: left; font-family: monospace; font-size: 0.9em; color: #aaa; overflow: hidden; }
    .sim-log-entry { animation: logFadeIn 0.5s ease; border-bottom: 1px solid #222; padding-bottom: 6px; margin-bottom: 6px; white-space: pre-wrap; }
    .sim-log-entry strong { color: #eee; }
    @keyframes logFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    /* --- END OF SIMULATOR STYLES --- */
    
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

  async runSimulation() {
      const btn = this.shadowRoot.querySelector('#start-sim-btn');
      const log = this.shadowRoot.querySelector('#simulation-log');
      const mcBar = this.shadowRoot.querySelector('.sim-bar');
      const mcBarValue = this.shadowRoot.querySelector('.sim-bar-value');
      
      const topHolders = this.report.distribution.topHolders;
      const top10DrainInfo = this.report.liquidityDrain.find(d => d.group === 'Top 10 Holders');

      if (!topHolders || topHolders.length < 5) {
          log.innerHTML = "Not enough holder data for a full simulation.";
          return;
      }

      const initialMarketCap = this.report.market.marketCap;
      if (!btn || !log || !mcBar || !mcBarValue || !initialMarketCap) return;

      btn.disabled = true;
      btn.textContent = 'Simulating...';
      log.innerHTML = '';
      
      let currentMarketCap = initialMarketCap;
      
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

      const simulateSale = async (holder) => {
          const holderShare = parseFloat(holder.percent);
          const marketCapImpact = currentMarketCap * (holderShare / 100);
          
          currentMarketCap -= marketCapImpact;
          updateBar(currentMarketCap);
          await wait(1000);
      };

      // --- The New Simulation Story ---
      updateBar(initialMarketCap);
      await wait(500);

      // Act 1
      logEvent(`<strong>ACT 1:</strong> The largest whale (Holder #1, ${topHolders[0].percent}%) initiates a sale...`);
      await simulateSale(topHolders[0]);

      // Act 2
      await wait(1500);
      logEvent(`<strong>ACT 2:</strong> This move triggers a panic cascade from other large holders...`);
      await wait(1200);
      logEvent(`...Holder #2 (${topHolders[1].percent}%) is dumping!`);
      await simulateSale(topHolders[1]);

      await wait(800);
      logEvent(`...Holder #3 (${topHolders[2].percent}%) follows suit!`);
      await simulateSale(topHolders[2]);
      
      await wait(800);
      logEvent(`...Holders #4 & #5 are also selling out!`);
      await simulateSale(topHolders[3]);
      await simulateSale(topHolders[4]);


      // Act 3: The Finale
      await wait(2500);
      logEvent(`<strong>FINALE:</strong> What if all Top 10 Holders sold?`);
      await wait(1500);
      
      if(top10DrainInfo && top10DrainInfo.marketCapAfterSale) {
        const finalMC = top10DrainInfo.marketCapAfterSale;
        updateBar(finalMC);
        logEvent(`Total price collapse of <strong style="color: #ff6b7b;">-${top10DrainInfo.marketCapDropPercentage}%</strong>. Final Market Cap: <strong>${formatAsCurrency(finalMC)}</strong>`);
      } else {
        logEvent(`Top 10 holder impact data not available. Concluding simulation.`);
        updateBar(currentMarketCap); // Show the final state from the cascade
      }

      await wait(2000);
      logEvent(`<strong>SIMULATION END:</strong> High ownership concentration poses a significant risk.`);
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

    const { tokenInfo, security, distribution, market, socials, liquidityDrain } = this.report;
    const formatNum = (num) => num ? Number(num).toLocaleString('en-US', {maximumFractionDigits: 0}) : 'N/A';
    const priceChangeColor = market?.priceChange?.h24 >= 0 ? 'text-ok' : 'text-bad';
    const price = !market?.priceUsd ? 'N/A' : (Number(market.priceUsd) < 0.000001 ? `$${Number(market.priceUsd).toExponential(2)}` : `$${Number(market.priceUsd).toLocaleString('en-US', {maximumFractionDigits: 8})}`);
    
    let truncatedAddress = '';
    if(tokenInfo.address) {
        truncatedAddress = `${tokenInfo.address.slice(0, 4)}...${tokenInfo.address.slice(-4)}`;
    }
    const addressHTML = tokenInfo.address ? `<div class="address-container" title="Copy Address: ${tokenInfo.address}">${this.copyIconSVG}<span>${truncatedAddress}</span></div>` : '';

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
    
    const programmaticAccountsHTML = distribution.allLpAddresses && distribution.allLpAddresses.length > 0 ?
      `<details class="programmatic-accounts-details"><summary>Pools, CEX, etc.: ${distribution.allLpAddresses.length}</summary><ul class="programmatic-list">${distribution.allLpAddresses.map(addr => `<li><a href="https://solscan.io/account/${addr}" target="_blank" rel="noopener">${addr.slice(0, 10)}...${addr.slice(-4)}</a></li>`).join('')}</ul></details>` : '';

    const cascadeSimulatorHTML = distribution.topHolders && distribution.topHolders.length > 0 && market.marketCap > 0 ? `
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
            <div id="simulation-log" class="sim-log">Press the button to simulate a price collapse caused by top holders.</div>
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
              <ul>
                ${security.hackerFound ? `<li class="bad">${sanitizeHTML(security.hackerFound)}</li>` : ''}
                ${'holderConcentration' in security && security.holderConcentration > 0 ? `<li class="${security.holderConcentration > 25 ? 'bad' : (security.holderConcentration > 10 ? 'warn' : 'ok')}">Top 10 holders own ${security.holderConcentration.toFixed(2)}%.</li>` : ''}
                ${security.isCto ? `<li class="ok">Community Takeover</li>` : ''}
                ${security.lpStatus ? `<li class="${security.lpStatus === 'Burned' ? 'ok' : 'bad'}">Liquidity is ${security.lpStatus}.</li>` : '<li>Liquidity status is Unknown.</li>'}
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
    
    this.container.innerHTML = newContent;

    this.shadowRoot.querySelector('.address-container')?.addEventListener('click', () => this.handleAddressCopy());
    this.shadowRoot.querySelector('#start-sim-btn')?.addEventListener('click', () => this.runSimulation());
  }
}

if (!customElements.get("dfn-patrol")) {
  customElements.define("dfn-patrol", DFNPatrol);
}
