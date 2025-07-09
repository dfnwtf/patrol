// component.js
console.log("[DFN Components] v3.2.9 initialized (Raw Debug Mode)");
class DFNPatrol extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() { this.render(); }
  
  setReport(report) {
    this.report = report;
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; font-family: sans-serif; background: #1a1a1a; color: #eee; padding: 16px; border-radius: 12px; }
        h2 { font-size: 22px; text-align: center; margin-bottom: 24px; word-break: break-all; }
        h3 { margin: 20px 0 10px; font-size: 18px; color: #f5d742; border-top: 1px solid #333; padding-top: 20px; }
        ul { list-style: none; padding-left: 0; font-size: 14px; }
        li { margin-bottom: 8px; line-height: 1.4; display: flex; align-items: center; word-break: break-word; }
        .placeholder { text-align: center; padding: 40px; font-size: 1.1em; color: #888; }
        .error { color: #ff6b7b; text-align: center; font-size: 1.1em; padding: 20px;}
        .ok::before, .bad::before, .warn::before { content: '✓'; margin-right: 8px; font-weight: bold; }
        .ok { color: #9eff9e; }
        .bad { color: #ff6b7b; }
        .bad::before { content: '🔴'; }
        .ok::before { content: '✅'; }
        .warn { color: #ffd447; }
        .warn::before { content: '🟡'; }
        .report-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px 32px; }
        .report-grid > div { background: #111; padding: 16px; border-radius: 8px; border: 1px solid #222;}
        .full-width { grid-column: 1 / -1; }
        p { margin-bottom: 8px; }
        a { color: #ffd447; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .market-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px 16px; }
        .market-list li { margin-bottom: 0; }
        .market-list b { color: #aaa; }
        .note { font-size: 0.85em; color: #888; margin-left: 4px; }
        /* Добавляем классы для цветного текста */
        .text-ok { color: #9eff9e; }
        .text-bad { color: #ff6b7b; }
      </style>
    `;
    
    if (!this.report) {
      this.shadowRoot.innerHTML += `<div class="placeholder">Generating token health report...</div>`;
      return;
    }
    if (this.report.error) {
       this.shadowRoot.innerHTML += `<div class="error">${this.report.error}</div>`;
       return;
    }
    
    const { tokenInfo, security, distribution, project, market } = this.report;
    
    const tokenHTML = `<div class="full-width"><h2>Report: ${tokenInfo.name} (${tokenInfo.symbol})</h2></div>`;
    
    const mintRenouncedHTML = 'mintRenounced' in security 
        ? `<li class="${security.mintRenounced ? 'ok' : 'bad'}">${security.mintRenounced ? 'Mint authority is renounced.' : 'Dev can mint more tokens <span class="note">(ignore for pump.fun/meteora)</span>.'}</li>` 
        : '';
        
    const freezeAuthorityHTML = security.freezeAuthorityEnabled 
        ? `<li class="bad">Freeze authority is enabled <span class="note">(ignore for pump.fun/meteora)</span>.</li>` 
        : '';

    const securityHTML = `
      <div>
        <h3>🛡️ Security Flags</h3>
        <ul>
          ${'isMutable' in security ? `<li class="${!security.isMutable ? 'ok' : 'bad'}">${!security.isMutable ? 'Metadata is immutable.' : 'Dev can change token info.'}</li>` : ''}
          ${freezeAuthorityHTML}
          ${mintRenouncedHTML}
          ${'transferTax' in security ? `<li class="warn">Token has a transfer tax: ${security.transferTax}%.</li>` : ('noTransferTax' in security ? '<li class="ok">No transfer tax.</li>' : '')}
          ${'isNewPool' in security ? `<li class="${!security.isNewPool ? 'ok' : 'warn'}">${!security.isNewPool ? 'Pool exists > 24h.' : 'Pool created < 24h ago.'}</li>` : ''}
          ${'hasSufficientLiquidity' in security ? `<li class="${security.hasSufficientLiquidity ? 'ok' : 'bad'}">${security.hasSufficientLiquidity ? 'Liquidity > $10,000' : 'Liquidity < $10,000'}</li>` : ''}
          ${'holderConcentration' in security ? `<li class="${security.holderConcentration > 25 ? 'bad' : (security.holderConcentration > 10 ? 'warn' : 'ok')}">Top 10 holders own ${security.holderConcentration.toFixed(2)}%.</li>` : ''}
        </ul>
      </div>
    `;
    
    const distributionHTML = `
      <div>
        <h3>💰 Distribution</h3>
        ${distribution.lpAddress ? `<p><b>LP Address:</b> ${distribution.lpAddress.slice(0, 4)}...${distribution.lpAddress.slice(-4)}</p>` : ''}
        <b>Top 10 Holders:</b>
        <ul>${distribution.topHolders && distribution.topHolders.length > 0 ? distribution.topHolders.map(h => `<li>${h.address.slice(0,6)}... (${h.percent}%)</li>`).join('') : '<li>N/A</li>'}</ul>
      </div>
    `;

    let marketHTML = '';
    if (market && market.priceUsd) {
        const formatNum = (num) => num ? Number(num).toLocaleString('en-US', {maximumFractionDigits: 0}) : 'N/A';
        const priceChangeColor = market.priceChange24h >= 0 ? 'ok' : 'bad';
        const price = Number(market.priceUsd) < 0.000001 ? Number(market.priceUsd).toExponential(2) : Number(market.priceUsd).toLocaleString('en-US', {maximumFractionDigits: 8});
        
        let txnsHTML = '';
        if (market.txns24h) {
            const buys = market.txns24h.buys;
            const sells = market.txns24h.sells;
            let txClass = '';
            if (buys > sells) {
                txClass = 'text-ok'; // Зеленый класс для текста
            } else if (sells > buys) {
                txClass = 'text-bad'; // Красный класс для текста
            }
            txnsHTML = `<li><b>24h Txs:</b> <span class="${txClass}">${formatNum(buys)} Buys / ${formatNum(sells)} Sells</span></li>`;
        }

        marketHTML = `
            <div class="full-width">
                <h3>📈 Market Data</h3>
                <ul class="market-list">
                    <li><b>Price:</b> $${price}</li>
                    <li><b>Market Cap:</b> $${formatNum(market.marketCap)}</li>
                    <li><b>Liquidity:</b> $${formatNum(market.liquidity)}</li>
                    <li><b>24h Volume:</b> $${formatNum(market.volume24h)}</li>
                    <li><b>24h Change:</b> <span class="${priceChangeColor}">${market.priceChange24h?.toFixed(2) || 'N/A'}%</span></li>
                    ${txnsHTML}
                </ul>
            </div>
        `;
    }
    
    let projectHTML = '';
    if (project && project.links && Object.keys(project.links).length > 0) {
        const createLink = (key, url) => {
            if (!url) return '';
            const title = key.charAt(0).toUpperCase() + key.slice(1);
            return `<li><b>${title}:</b> <a href="${url}" target="_blank" rel="noopener nofollow">Visit</a></li>`;
        };
        const linksHTML = [
            createLink('website', project.links.website),
            createLink('twitter', project.links.twitter),
            createLink('telegram', project.links.telegram),
            createLink('discord', project.links.discord)
        ].join('');
        if (linksHTML.trim() !== '') {
            projectHTML = `
              <div>
                <h3>ℹ️ Project & Socials</h3>
                <ul>
                  ${linksHTML}
                </ul>
              </div>
            `;
        }
    }

    this.shadowRoot.innerHTML += `
      <div class="report-grid">
        ${tokenHTML}
        ${marketHTML}
        ${securityHTML}
        ${distributionHTML}
        ${projectHTML}
      </div>
    `;
  }
}
if (!customElements.get("dfn-patrol")) {
  customElements.define("dfn-patrol", DFNPatrol);
}
