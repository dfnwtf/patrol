// component.js - v4.4.1 - Chart Debugging

console.log("[DFN Components] v4.4.1 initialized - Chart Debugging");

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
        if (u.protocol === 'http:' || u.protocol === 'https:') {
            return u.href;
        }
    } catch (e) {}
    return '#';
}

const template = document.createElement('template');
template.innerHTML = `
  <style>
    /* Версия стилей с исправленными отступами и цветами */
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
    .token-logo { width: 48px; height: 48px; border-radius: 50%; background: #222; }
    .token-name-symbol h2 { font-size: 1.8rem; margin: 0; line-height: 1.1; color: #fff; }
    .token-name-symbol span { font-size: 1rem; color: #999; }
    
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

    .socials-list { display: flex; flex-wrap: wrap; gap: 10px; list-style: none; padding: 0; margin-top: 4px; }
    .socials-list a { display: inline-block; padding: 6px 16px; background: #252525; border-radius: 8px; font-size: 0.9rem; transition: background 0.2s; }
    .socials-list a:hover { background: #333; }
    
    .drain-simulator { margin-top: 10px; padding: 0; }
    .drain-bar-row { display: flex; align-items: center; margin-bottom: 8px; font-size: 0.9rem; }
    .drain-label { width: 120px; flex-shrink: 0; color: #aaa; }
    .drain-bar-container { flex-grow: 1; background: #252525; border-radius: 4px; height: 22px; overflow: hidden; }
    .drain-bar { background: linear-gradient(to right, #e05068, #ff6b7b); height: 100%; font-size: 0.8rem; line-height: 22px; text-align: right; color: #fff; padding-right: 8px; box-sizing: border-box; white-space: nowrap; }
    .drain-result { margin-left: 12px; font-weight: 600; text-align: left; color: #fff; }
    
    .chart-container {
      background: #191919;
      padding: 24px;
      border-radius: 8px;
      border: 1px solid #282828;
    }
    
    @media (max-width: 900px) {
        .summary-block { grid-template-columns: 1fr; }
        .summary-market-stats { text-align: left; }
    }
    @media (max-width: 600px) {
        .summary-market-stats { grid-template-columns: repeat(2, 1fr); }
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
    this.chartInstance = null;
  }
  
  setReport(report) {
    this.report = report;
    this.render();
  }

  renderVolumeChart(historyData) {
    const canvas = this.shadowRoot.querySelector('#volumeChart');
    
    console.log('Attempting to render chart. Canvas element found:', canvas);
    
    if (!canvas || !historyData || historyData.length === 0) {
        console.log('Bailing on chart render: no canvas or no data.');
        return;
    }

    if (this.chartInstance) {
        this.chartInstance.destroy();
    }

    const labels = historyData.map(d => new Date(d.timestamp * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
    const data = historyData.map(d => d.volumeUsd);

    const accentColor = '#FFD447';
    const accentGradient = canvas.getContext('2d').createLinearGradient(0, 0, 0, 250);
    accentGradient.addColorStop(0, accentColor);
    accentGradient.addColorStop(1, 'rgba(255, 212, 71, 0.2)');

    this.chartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Hourly Volume (USD)',
                data: data,
                backgroundColor: accentGradient,
                borderColor: accentColor,
                borderWidth: 1,
                borderRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#000',
                    titleFont: { size: 14 },
                    bodyFont: { size: 12 },
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) { label += ': '; }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: '#888',
                        callback: function(value) {
                            if (value >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M';
                            if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'K';
                            return '$' + value;
                        }
                    }
                },
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.0)' },
                    ticks: { color: '#888' }
                }
            }
        }
    });
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

    const { tokenInfo, security, distribution, market, liquidityDrain, socials, volumeHistory } = this.report;
    
    console.log('Received volume history from backend:', volumeHistory);

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
                            const hostname = new URL(link).hostname.replace('www.','');
                            const label = typeof social === 'string' ? hostname : (social.label || social.type || 'Link');
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
            
            ${volumeHistory && volumeHistory.length > 0 ? `
            <div class="full-width chart-container">
                <h3>📊 24h Trading Activity</h3>
                <div style="position: relative; height:250px;">
                    <canvas id="volumeChart"></canvas>
                </div>
            </div>
            ` : ''}

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
    
    setTimeout(() => {
        this.renderVolumeChart(volumeHistory);
    }, 0);
  }
}

if (!customElements.get("dfn-patrol")) {
  customElements.define("dfn-patrol", DFNPatrol);
}
