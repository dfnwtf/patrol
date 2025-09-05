// component.js - v4.2.1 - New UI/UX
console.log("[DFN Components] v4.2.1 initialized - New UI");

function sanitizeHTML(str) {
    if (!str) return '';
    // DOMPurify is expected to be available globally from index.html
    if (typeof DOMPurify === 'undefined') return str; 
    return DOMPurify.sanitize(str.toString());
}

function sanitizeUrl(url) {
    if (typeof url !== 'string' || !url) {
        return '#';
    }
    try {
        const u = new URL(url);
        if (u.protocol === 'http:' || u.protocol === 'https:') {
            return u.href;
        }
    } catch (e) {}
    return '#';
}

const template = document.createElement('template');
template.innerHTML = `
  <style>
    /* Новые стили для компонента */
    :host {
      display: block;
      font-family: sans-serif;
      background: rgba(26, 26, 26, 0.5); /* Полупрозрачный фон */
      color: var(--fg-0, #EAEAEA);
      padding: 24px;
      border-radius: 16px;
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      backdrop-filter: blur(10px); /* Эффект матового стекла */
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    }
    h3 {
      margin: 24px 0 12px;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--fg-0, #EAEAEA);
      border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      padding-top: 24px;
      letter-spacing: 0px;
    }
    h3:first-of-type {
      margin-top: 0;
      padding-top: 0;
      border-top: none;
    }
    ul { list-style: none; padding-left: 0; font-size: 0.95rem; margin-top: 8px; }
    li { margin-bottom: 10px; line-height: 1.5; display: flex; align-items: center; word-break: break-word; color: var(--fg-1, #A0A0A0); }
    
    .placeholder, .error { text-align: center; padding: 40px; font-size: 1.1em; color: #888; }
    .error { color: #ff6b7b; }
    
    .ok::before, .bad::before, .warn::before { content: ''; width: 18px; height: 18px; margin-right: 12px; display: inline-block; vertical-align: middle; background-size: contain; background-repeat: no-repeat; background-position: center; }
    .ok { color: #9eff9e; }
    .bad { color: #ff6b7b; }
    .warn { color: #ffd447; }
    .bad::before { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ff6b7b'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'/%3E%3C/svg%3E"); }
    .ok::before { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239eff9e'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E"); }
    .warn::before { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffd447'%3E%3Cpath d='M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z'/%3E%3C/svg%3E"); }
    
    a { color: var(--accent, #FFD447); text-decoration: none; font-weight: 500; }
    a:hover { text-decoration: underline; }
    .text-ok { color: #9eff9e; }
    .text-bad { color: #ff6b7b; }

    .summary-block { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; padding-bottom: 24px; }
    .summary-token-info { display: flex; align-items: center; gap: 16px; }
    .token-logo { width: 56px; height: 56px; border-radius: 50%; background: #333; border: 2px solid rgba(255,255,255,0.1); }
    .token-name-symbol h2 { font-size: 2rem; margin: 0; line-height: 1.1; word-break: break-all; color: #fff; }
    .token-name-symbol span { font-size: 1rem; color: var(--fg-1, #A0A0A0); }
    
    .summary-market-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px 32px; text-align: right; }
    .stat-item { display: flex; flex-direction: column; }
    .stat-item b { font-size: 0.9rem; color: var(--fg-1, #A0A0A0); font-weight: 400; margin-bottom: 4px; }
    .stat-item span { font-size: 1.1rem; font-weight: 600; color: #fff; }
    .stat-item .buys-sells { font-weight: 600; }
    
    .report-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; }
    .report-grid > div { background: rgba(0,0,0,0.15); padding: 20px; border-radius: 12px; border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1)); }
    .full-width { grid-column: 1 / -1; }

    .socials-list { display: flex; flex-wrap: wrap; gap: 10px; list-style: none; padding: 0; margin-top: 4px;}
    .socials-list a { display: inline-block; padding: 6px 16px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1)); border-radius: 8px; font-size: 0.9rem; transition: background 0.2s; }
    .socials-list a:hover { background: rgba(255,255,255,0.1); }
    
    .drain-simulator { margin-top: 10px; padding: 0 5px; }
    .drain-bar-row { display: flex; align-items: center; margin-bottom: 8px; font-size: 0.9rem; }
    .drain-label { width: 120px; flex-shrink: 0; color: var(--fg-1, #A0A0A0); }
    .drain-bar-container { flex-grow: 1; background: rgba(0,0,0,0.2); border-radius: 4px; height: 22px; overflow: hidden; }
    .drain-bar { background: linear-gradient(to right, #e05068, #ff6b7b); height: 100%; font-size: 0.8rem; line-height: 22px; text-align: right; color: #fff; padding-right: 8px; box-sizing: border-box; white-space: nowrap; }
    .drain-result { margin-left: 12px; font-weight: 600; text-align: left; color: #fff;}
    
    @media (max-width: 900px) {
        .summary-block { flex-direction: column; align-items: flex-start; gap: 24px; }
        .summary-market-stats { width: 100%; text-align: left; }
    }
    @media (max-width: 600px) {
        .summary-market-stats { grid-template-columns: 1fr; }
        .token-name-symbol h2 { font-size: 1.5rem; }
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

    const { tokenInfo, security, distribution, market, liquidityDrain, socials } = this.report;
    const formatNum = (num) => num ? Number(num).toLocaleString('en-US', {maximumFractionDigits: 0}) : 'N/A';
    const priceChangeColor = market?.priceChange24h >= 0 ? 'text-ok' : 'text-bad';
    const price = Number(market?.priceUsd) < 0.000001 ? Number(market?.priceUsd).toExponential(2) : Number(market?.priceUsd).toLocaleString('en-US', {maximumFractionDigits: 8});

    const marketStatsHTML = `
        <div class="summary-market-stats">
            <div class="stat-item"><b>Price</b><span>$${price}</span></div>
            <div class="stat-item"><b>24h Change</b><span class="${priceChangeColor}">${market?.priceChange24h?.toFixed(2) || 'N/A'}%</span></div>
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

    const newContent = `
        <div class="summary-block">
            <div class="summary-token-info">
                ${tokenInfo.logoUrl ? `<img src="${sanitizeUrl(tokenInfo.logoUrl)}" alt="${sanitizeHTML(tokenInfo.symbol)} logo" class="token-logo">` : ''}
                <div class="token-name-symbol">
                    <h2>${sanitizeHTML(tokenInfo.name)}</h2>
                    <span>${sanitizeHTML(tokenInfo.symbol)}</span>
                </div>
            </div>
            ${marketStatsHTML}
        </div>

        <div class="report-grid">
            ${socials && socials.length > 0 ? `
            <div class="full-width">
                <h3>🔗 Socials</h3>
                <ul class="socials-list">
                    ${socials.map(social => {
                        try {
                            const link = typeof social === 'string' ? social : social.url;
                            if(!link) return '';
                            const label = typeof social === 'string'
                                          ? (new URL(link).hostname.replace('www.',''))
                                          : (social.label || social.type || 'Link');
                            return `<li><a href="${sanitizeUrl(link)}" target="_blank" rel="noopener nofollow">${sanitizeHTML(label)}</a></li>`;
                        } catch(e) { return ''; }
                    }).join('')}
                </ul>
            </div>` : ''}

            <div>
              <h3>🛡️ Security Flags</h3>
              <ul>
                ${security.lpStatus ? `<li class="${security.lpStatus === 'Burned' ? 'ok' : 'bad'}">Liquidity is ${security.lpStatus}.</li>` : ''}
                ${'isMutable' in security ? `<li class="${!security.isMutable ? 'ok' : 'bad'}">${!security.isMutable ? 'Metadata is immutable.' : 'Dev can change token info.'}</li>` : ''}
                ${'freezeAuthorityEnabled' in security ? `<li class="${!security.freezeAuthorityEnabled ? 'ok' : 'bad'}">Freeze authority is disabled.</li>` : ''}
                ${'mintRenounced' in security ? `<li class="${security.mintRenounced ? 'ok' : 'bad'}">${security.mintRenounced ? 'Mint authority is renounced.' : 'Dev can mint more tokens.'}</li>` : ''}
                ${'transferTax' in security ? `<li class="warn">Token has a transfer tax: ${security.transferTax}%.</li>` : ('noTransferTax' in security ? '<li class="ok">No transfer tax.</li>' : '')}
              </ul>
            </div>
            
            <div>
              <h3>💰 Distribution</h3>
              ${distribution.lpAddress ? `<p><b>LP Address:</b> <a href="https://solscan.io/account/${distribution.lpAddress}" target="_blank" rel="noopener">${distribution.lpAddress.slice(0, 4)}...${distribution.lpAddress.slice(-4)}</a></p>` : ''}
              <b>Top 10 Holders (Real):</b>
              <ul>
                  ${distribution.topHolders && distribution.topHolders.length > 0 
                      ? distribution.topHolders.map(h => `<li><a href="https://solscan.io/account/${h.address}" target="_blank" rel="noopener">${h.address.slice(0,6)}...</a> (${h.percent}%)</li>`).join('') 
                      : '<li>No significant individual holders found.</li>'}
              </ul>
            </div>

            ${liquidityDrain && liquidityDrain.filter(item => item.marketCapDropPercentage > 0).length > 0 ? `
            <div class="full-width">
                <h3>🌊 Liquidity Drain Simulator</h3>
                <div class="drain-simulator">
                    ${liquidityDrain.filter(item => item.marketCapDropPercentage > 0).map(item => {
                        const impact = Math.min(100, Math.max(0, item.marketCapDropPercentage));
                        const formatCap = (num) => num < 1000 ? `$${num.toFixed(0)}` : (num < 1000000 ? `$${(num/1000).toFixed(1)}K` : `$${(num/1000000).toFixed(2)}M`);
                        return `
                          <div class="drain-bar-row">
                            <span class="drain-label">${sanitizeHTML(item.group)}</span>
                            <div class="drain-bar-container"><div class="drain-bar" style="width: ${impact}%;">${impact > 20 ? `-${impact}%` : ''}</div></div>
                            <span class="drain-result">${impact > 20 ? '' : `-${impact}%`} → ${formatCap(item.marketCapAfterSale)}</span>
                          </div>
                        `;
                    }).join('')}
                </div>
            </div>` : ''}
        </div>
    `;
    
    this.container.innerHTML = newContent;
  }
}

if (!customElements.get("dfn-patrol")) {
  customElements.define("dfn-patrol", DFNPatrol);
}
