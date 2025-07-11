// component.js
console.log("[DFN Components] v4.1.0 initialized");

// --- ПУНКТЫ 1 и 2: БЕЗОПАСНЫЕ ФУНКЦИИ-ПОМОЩНИКИ ---
function sanitizeHTML(str) {
    if (!str) return '';
    // Простая функция для удаления HTML тегов
    return str.toString().replace(/<[^>]*>?/gm, '');
}

function sanitizeUrl(url) {
    try {
        const u = new URL(url);
        // Разрешаем только безопасные протоколы
        if (u.protocol === 'http:' || u.protocol === 'https:') {
            return u.href;
        }
    } catch (e) {
        // Если URL невалидный, ничего не возвращаем
    }
    return '#'; // Возвращаем безопасный "пустой" href
}

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
        a { color: #ffd447; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .text-ok { color: #9eff9e; }
        .text-bad { color: #ff6b7b; }

        .summary-block {
            grid-column: 1 / -1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
            padding: 10px;
            background: #111;
            border: 1px solid #222;
            border-radius: 8px;
            margin-bottom: 24px;
        }
        .summary-token-info {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .token-logo {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: #333;
        }
        .token-name-symbol h2 {
            font-size: 24px;
            margin: 0;
            line-height: 1.1;
            word-break: break-all;
        }
        .token-name-symbol span {
            font-size: 14px;
            color: #888;
        }
        .summary-market-stats {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px 24px;
            text-align: right;
        }
        .stat-item {
            display: flex;
            flex-direction: column;
        }
        .stat-item b {
            font-size: 12px;
            color: #aaa;
            font-weight: normal;
        }
        .stat-item span {
            font-size: 16px;
            font-weight: 600;
        }
        
        .report-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px 32px; }
        .report-grid > div { background: #111; padding: 16px; border-radius: 8px; border: 1px solid #222;}
        .full-width { grid-column: 1 / -1; }

        .socials-list { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; padding: 0; margin-top: 4px;}
        .socials-list a { display: inline-block; padding: 4px 12px; background: #252525; border: 1px solid #333; border-radius: 16px; font-size: 13px; }
        .socials-list a:hover { background: #333; }
        .drain-simulator { margin-top: 10px; padding: 0 5px; }
        .drain-bar-row { display: flex; align-items: center; margin-bottom: 8px; font-size: 13px; }
        .drain-label { width: 110px; flex-shrink: 0; color: #bbb; }
        .drain-bar-container { flex-grow: 1; background: rgba(0,0,0,0.2); border: 1px solid #333; border-radius: 4px; height: 20px; overflow: hidden; }
        .drain-bar { background: linear-gradient(to right, #ff6b7b, #e05068); height: 100%; border-radius: 3px 0 0 3px; font-size: 12px; line-height: 20px; text-align: right; color: #fff; padding-right: 6px; box-sizing: border-box; white-space: nowrap; }
        .drain-result { margin-left: 10px; font-weight: bold; text-align: left; color: #ddd;}
        
        @media (max-width: 600px) {
            .summary-block {
                flex-direction: column;
                align-items: flex-start;
                gap: 16px;
            }
            .summary-market-stats {
                width: 100%;
                text-align: left;
            }
            .stat-item {
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
                padding: 4px 0;
                border-bottom: 1px solid #222;
            }
            .token-name-symbol h2 {
                font-size: 22px;
            }
        }
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
    
    const { tokenInfo, security, distribution, market, liquidityDrain, socials } = this.report;
    const formatNum = (num) => num ? Number(num).toLocaleString('en-US', {maximumFractionDigits: 0}) : 'N/A';
    
    let marketStatsHTML = '';
    if (market && market.priceUsd) {
        const priceChangeColor = market.priceChange24h >= 0 ? 'text-ok' : 'text-bad';
        const price = Number(market.priceUsd) < 0.000001 ? Number(market.priceUsd).toExponential(2) : Number(market.priceUsd).toLocaleString('en-US', {maximumFractionDigits: 8});
        marketStatsHTML = `
            <div class="summary-market-stats">
                <div class="stat-item"><b>Price</b><span>$${price}</span></div>
                <div class="stat-item"><b>24h Change</b><span class="${priceChangeColor}">${market.priceChange24h?.toFixed(2) || 'N/A'}%</span></div>
                <div class="stat-item"><b>Market Cap</b><span>$${formatNum(market.marketCap)}</span></div>
                <div class="stat-item"><b>Liquidity</b><span>$${formatNum(market.liquidity)}</span></div>
            </div>
        `;
    }

    const summaryHTML = `
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
    `;

    let lpStatusHTML = '';
    if (security.lpStatus) {
        if (security.lpStatus === "Burned") { lpStatusHTML = `<li class="ok">Liquidity is Burned.</li>`; } 
        else if (security.lpStatus === "Unlocked") { lpStatusHTML = `<li class="bad">Liquidity is Unlocked.</li>`; }
    }

    const mintRenouncedHTML = 'mintRenounced' in security ? `<li class="${security.mintRenounced ? 'ok' : 'bad'}">${security.mintRenounced ? 'Mint authority is renounced.' : 'Dev can mint more tokens.'}</li>` : '';
    const freezeAuthorityHTML = 'freezeAuthorityEnabled' in security ? (security.freezeAuthorityEnabled ? `<li class="bad">Freeze authority is enabled.</li>` : `<li class="ok">Freeze authority is disabled.</li>`) : '';
    const securityHTML = `
      <div>
        <h3>🛡️ Security Flags</h3>
        <ul>
          ${lpStatusHTML}
          ${'isMutable' in security ? `<li class="${!security.isMutable ? 'ok' : 'bad'}">${!security.isMutable ? 'Metadata is immutable.' : 'Dev can change token info.'}</li>` : ''}
          ${freezeAuthorityHTML}
          ${mintRenouncedHTML}
          ${'transferTax' in security ? `<li class="warn">Token has a transfer tax: ${security.transferTax}%.</li>` : ('noTransferTax' in security ? '<li class="ok">No transfer tax.</li>' : '')}
          ${'isNewPool' in security ? `<li class="${!security.isNewPool ? 'ok' : 'warn'}">${!security.isNewPool ? 'Pool exists > 24h.' : 'Pool created < 24h ago.'}</li>` : ''}
          ${'hasSufficientLiquidity' in security ? `<li class="${security.hasSufficientLiquidity ? 'ok' : 'bad'}">${security.hasSufficientLiquidity ? 'Liquidity > $10,000' : 'Liquidity < $10,000'}</li>` : ''}
          ${'holderConcentration' in security && security.holderConcentration > 0 ? `<li class="${security.holderConcentration > 25 ? 'bad' : (security.holderConcentration > 10 ? 'warn' : 'ok')}">Top 10 holders own ${security.holderConcentration.toFixed(2)}%.</li>` : ''}
        </ul>
      </div>
    `;
    
    const distributionHTML = `
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
    `;
    
    let socialHTML = '';
    if (socials && socials.length > 0) {
        socialHTML = `
            <div class="full-width">
                <h3>🔗 Socials</h3>
                <ul class="socials-list">
        `;
        socials.forEach(social => {
            let safeUrl = sanitizeUrl(social.url);
            let label = social.label || social.type || 'Link';
            socialHTML += `<li><a href="${safeUrl}" target="_blank" rel="noopener nofollow">${sanitizeHTML(label)}</a></li>`;
        });
        socialHTML += '</ul></div>';
    }
    
    let drainHTML = '';
    if (liquidityDrain && liquidityDrain.length > 0) {
        const formatCap = (num) => {
            if (num < 1000) return `$${num.toFixed(0)}`;
            if (num < 1000000) return `$${(num/1000).toFixed(1)}K`;
            return `$${(num/1000000).toFixed(2)}M`;
        }
        const validResults = liquidityDrain.filter(item => item.marketCapDropPercentage && item.marketCapDropPercentage > 0);
        if (validResults.length > 0) {
            drainHTML = `
            <div class="full-width">
                <h3>🌊 Liquidity Drain Simulator</h3>
                <div class="drain-simulator">
            `;
            validResults.forEach(item => {
                const impact = Math.min(100, Math.max(0, item.marketCapDropPercentage));
                drainHTML += `
                  <div class="drain-bar-row">
                    <span class="drain-label">${sanitizeHTML(item.group)}</span>
                    <div class="drain-bar-container">
                      <div class="drain-bar" style="width: ${impact}%;">${impact > 20 ? `-${impact}%` : ''}</div>
                    </div>
                    <span class="drain-result">${impact > 20 ? '' : `-${impact}%`} → ${formatCap(item.marketCapAfterSale)}</span>
                  </div>
                `;
            });
            drainHTML += '</div></div>';
        }
    }

    this.shadowRoot.innerHTML += `
      <div class="report-grid">
        ${summaryHTML}
        ${socialHTML}
        ${securityHTML}
        ${distributionHTML}
        ${drainHTML}
      </div>
    `;
  }
}
if (!customElements.get("dfn-patrol")) {
  customElements.define("dfn-patrol", DFNPatrol);
}
