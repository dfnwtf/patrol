// component.js
console.log("[DFN Components] v4.7.8 initialized - Final Report Structure");

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

    .summary-market-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px 24px;
      text-align: right;
    }
    .stat-item { display: flex; flex-direction: column; }
    .stat-item b { font-size: 0.9rem; color: #888; font-weight: 500; margin-bottom: 4px; text-transform: uppercase; }
    .stat-item span { font-size: 1.2rem; font-weight: 600; color: #fff; }
    
    .stat-item span.text-ok, .stat-item .buys-sells .text-ok { color: #9eff9e; }
    .stat-item span.text-bad, .stat-item .buys-sells .text-bad { color: #ff6b7b; }

    .stat-item .buys-sells { font-weight: 600; }
    
    .report-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
    }
    .report-grid > div {
      background: #191919;
      padding: 24px;
      border-radius: 8px;
      border: 1px solid #282828;
    }
    .full-width { grid-column: 1 / -1; }
    .socials-intro-text {
      font-size: 0.9rem;
      color: #aaa;
      margin-bottom: 16px;
      padding-left: 4px;
    }
    .socials-list { 
      display: flex; 
      flex-wrap: wrap; 
      gap: 10px; 
      list-style: none; 
      padding: 0; 
      margin: 0;
    }
    .socials-list a {
      display: inline-block;
      padding: 8px 18px;
      background: #252525;
      border: 1px solid #333;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
      text-decoration: none;
      color: #ddd;
      transition: all 0.2s ease;
    }
    .socials-list a:hover {
      background-color: #333;
      color: #fff;
      border-color: #444;
    }

    .trend-indicator {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1px;
      background-color: #282828;
      border: 1px solid #282828;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 24px;
    }
    .trend-item {
      background-color: #191919;
      padding: 16px 12px;
      text-align: center;
    }
    .trend-item b {
      font-size: 0.75rem;
      color: #888;
      font-weight: 600;
      text-transform: uppercase;
    }
    .trend-item div {
      font-size: 1.5rem;
      font-weight: 700;
      margin-top: 8px;
      color: #fff;
    }
    .trend-item div.text-ok { color: #9eff9e; }
    .trend-item div.text-bad { color: #ff6b7b; }
    
    details.programmatic-accounts-details {
      border: 1px solid #282828;
      border-radius: 8px;
      margin-bottom: 16px;
      background-color: #1c1c1c;
      transition: background-color 0.2s ease;
    }
    details.programmatic-accounts-details:hover {
        background-color: #222;
    }
    summary {
      cursor: pointer;
      padding: 12px 16px;
      font-weight: 600;
      color: #ccc;
      outline: none;
      list-style-position: inside;
    }
    details[open] > summary {
      border-bottom: 1px solid #282828;
    }
    .programmatic-list {
      padding: 12px 16px 4px 40px;
      list-style-type: square;
      font-size: 0.85em;
    }
    .programmatic-list li {
      margin-bottom: 8px;
    }

    @media (max-width: 900px) {
        .summary-block { grid-template-columns: 1fr; }
        .summary-market-stats { text-align: left; }
    }
    @media (max-width: 600px) {
        .summary-market-stats { grid-template-columns: repeat(2, 1fr); }
        .trend-indicator { grid-template-columns: repeat(2, 1fr); }
    }
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
  }
  
  setReport(report) {
    this.report = report;
    this.render();
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

    const { tokenInfo, security, distribution, market, socials } = this.report;
    const formatNum = (num) => num ? Number(num).toLocaleString('en-US', {maximumFractionDigits: 0}) : 'N/A';
    const priceChangeColor = market?.priceChange?.h24 >= 0 ? 'text-ok' : 'text-bad';
    const price = !market?.priceUsd ? 'N/A' : (Number(market.priceUsd) < 0.000001 ? `$${Number(market.priceUsd).toExponential(2)}` : `$${Number(market.priceUsd).toLocaleString('en-US', {maximumFractionDigits: 8})}`);

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
        <div class="trend-item">
          <b>5 MIN</b>
          <div class="${priceChange.m5 >= 0 ? 'text-ok' : 'text-bad'}">${priceChange.m5?.toFixed(2) ?? '0.00'}%</div>
        </div>
        <div class="trend-item">
          <b>1 HOUR</b>
          <div class="${priceChange.h1 >= 0 ? 'text-ok' : 'text-bad'}">${priceChange.h1?.toFixed(2) ?? '0.00'}%</div>
        </div>
        <div class="trend-item">
          <b>6 HOURS</b>
          <div class="${priceChange.h6 >= 0 ? 'text-ok' : 'text-bad'}">${priceChange.h6?.toFixed(2) ?? '0.00'}%</div>
        </div>
        <div class="trend-item">
          <b>24 HOURS</b>
          <div class="${priceChange.h24 >= 0 ? 'text-ok' : 'text-bad'}">${priceChange.h24?.toFixed(2) ?? '0.00'}%</div>
        </div>
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
      `
      <details class="programmatic-accounts-details">
          <summary>Pools, CEX, etc.: ${distribution.allLpAddresses.length}</summary>
          <ul class="programmatic-list">
              ${distribution.allLpAddresses.map(addr => `
                  <li><a href="https://solscan.io/account/${addr}" target="_blank" rel="noopener">${addr.slice(0, 10)}...${addr.slice(-4)}</a></li>
              `).join('')}
          </ul>
      </details>
      `
    : '';


    const newContent = `
        <div class="summary-block">
            <div class="summary-token-info">
                ${tokenInfo.logoUrl ? `<img src="${sanitizeUrl(tokenInfo.logoUrl)}" alt="${sanitizeHTML(tokenInfo.symbol)} logo" class="token-logo">` : `<div class="token-logo"></div>`}
                <div class="token-name-symbol">
                    <h2>${sanitizeHTML(tokenInfo.name)}</h2>
                    <span>${sanitizeHTML(tokenInfo.symbol)}</span>
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
              <h3>💰 Distribution</h3>
              
              ${programmaticAccountsHTML}
              
              <b>Top 10 Holders (Real):</b>
              <ul>
                  ${distribution.topHolders && distribution.topHolders.length > 0
                      ? distribution.topHolders.map(h => `<li><a href="https://solscan.io/account/${h.address}" target="_blank" rel="noopener">${h.address.slice(0,6)}...${h.address.slice(-4)}</a> (${h.percent}%)</li>`).join('') 
                      : '<li>No significant individual holders found.</li>'}
              </ul>
            </div>
        </div>
    `;
    
    this.container.innerHTML = newContent;
  }
}

if (!customElements.get("dfn-patrol")) {
  customElements.define("dfn-patrol", DFNPatrol);
}
