// component.js - v4.1.7 - Улучшена обработка соц. ссылок
console.log("[DFN Components] v4.1.8 initialized - Optimized");

function sanitizeHTML(str) {
    if (!str) return '';
    // DOMPurify должен быть подключен в index.html
    return DOMPurify.sanitize(str.toString());
}

function sanitizeUrl(url) {
    // Проверка, чтобы избежать ошибок, если url не строка
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

// Создаём шаблон один раз при загрузке скрипта
const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display: block; font-family: sans-serif; background: #1a1a1a; color: #eee; padding: 16px; border-radius: 12px; }
    h3 { margin: 20px 0 10px; font-size: 18px; color: #f5d742; border-top: 1px solid #333; padding-top: 20px; }
    ul { list-style: none; padding-left: 0; font-size: 14px; margin-top: 8px; }
    li { margin-bottom: 8px; line-height: 1.4; display: flex; align-items: center; word-break: break-word; }
    .placeholder, .error { text-align: center; padding: 40px; font-size: 1.1em; color: #888; }
    .error { color: #ff6b7b; }
    .ok::before, .bad::before, .warn::before { content: '✓'; margin-right: 8px; font-weight: bold; }
    .ok { color: #9eff9e; } .bad { color: #ff6b7b; } .bad::before { content: '🔴'; } .ok::before { content: '✅'; } .warn { color: #ffd447; } .warn::before { content: '🟡'; }
    a { color: #ffd447; text-decoration: none; } a:hover { text-decoration: underline; }
    .text-ok { color: #9eff9e; } .text-bad { color: #ff6b7b; }

    .summary-block { grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; padding: 10px; background: #111; border: 1px solid #222; border-radius: 8px; margin-bottom: 24px; }
    .summary-token-info { display: flex; align-items: center; gap: 16px; }
    .token-logo { width: 48px; height: 48px; border-radius: 50%; background: #333; }
    .token-name-symbol h2 { font-size: 24px; margin: 0; line-height: 1.1; word-break: break-all; }
    .token-name-symbol span { font-size: 14px; color: #888; }
    .summary-market-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 24px; text-align: right; }
    .stat-item { display: flex; flex-direction: column; }
    .stat-item b { font-size: 12px; color: #aaa; font-weight: normal; }
    .stat-item span { font-size: 16px; font-weight: 600; }
    
    .report-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px 32px; }
    .report-grid > div { background: #111; padding: 16px; border-radius: 8px; border: 1px solid #222;}
    .full-width { grid-column: 1 / -1; }

    .socials-list { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; padding: 0; margin-top: 4px;}
    .socials-list a { display: inline-block; padding: 4px 12px; background: #252525; border: 1px solid #333; border-radius: 16px; font-size: 13px; } .socials-list a:hover { background: #333; }
    
    .drain-simulator { margin-top: 10px; padding: 0 5px; }
    .drain-bar-row { display: flex; align-items: center; margin-bottom: 8px; font-size: 13px; }
    .drain-label { width: 110px; flex-shrink: 0; color: #bbb; }
    .drain-bar-container { flex-grow: 1; background: rgba(0,0,0,0.2); border: 1px solid #333; border-radius: 4px; height: 20px; overflow: hidden; }
    .drain-bar { background: linear-gradient(to right, #ff6b7b, #e05068); height: 100%; border-radius: 3px 0 0 3px; font-size: 12px; line-height: 20px; text-align: right; color: #fff; padding-right: 6px; box-sizing: border-box; white-space: nowrap; }
    .drain-result { margin-left: 10px; font-weight: bold; text-align: left; color: #ddd;}
    
    @media (max-width: 600px) {
        .summary-block { flex-direction: column; align-items: flex-start; gap: 16px; }
        .summary-market-stats { width: 100%; text-align: left; }
        .stat-item { flex-direction: row; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid #222; }
        .token-name-symbol h2 { font-size: 22px; }
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

    const newContent = `
        <div class="report-grid">
            <div class="summary-block">
                <div class="summary-token-info">
                    ${tokenInfo.logoUrl ? `<img src="${sanitizeUrl(tokenInfo.logoUrl)}" alt="${sanitizeHTML(tokenInfo.symbol)} logo" class="token-logo">` : ''}
                    <div class="token-name-symbol">
                        <h2>${sanitizeHTML(tokenInfo.name)}</h2>
                        <span>${sanitizeHTML(tokenInfo.symbol)}</span>
                    </div>
                </div>
                <div class="summary-market-stats">
                    <div class="stat-item"><b>Price</b><span>$${price}</span></div>
                    <div class="stat-item"><b>24h Change</b><span class="${priceChangeColor}">${market?.priceChange24h?.toFixed(2) || 'N/A'}%</span></div>
                    <div class="stat-item"><b>Market Cap</b><span>$${formatNum(market?.marketCap)}</span></div>
                    <div class="stat-item"><b>Liquidity</b><span>$${formatNum(market?.liquidity)}</span></div>
                </div>
            </div>

            ${socials && socials.length > 0 ? `
            <div class="full-width">
                <h3>🔗 Socials</h3>
                <ul class="socials-list">
                    ${socials.map(social => {
                        const link = typeof social === 'string' ? social : social.url;
                        const label = typeof social === 'string'
                                      ? (new URL(link).hostname.replace('www.',''))
                                      : (social.label || social.type || 'Link');
                        return `<li><a href="${sanitizeUrl(link)}" target="_blank" rel="noopener nofollow">${sanitizeHTML(label)}</a></li>`;
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
