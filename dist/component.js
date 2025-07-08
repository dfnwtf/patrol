class DFNPatrol extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() { this.render(); }
  
  // Новая функция для приема отчета
  setReport(report) {
    this.report = report;
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `<style>/* ... стили ... */</style>`; // Стили для краткости опущены
    
    if (!this.report) {
      this.shadowRoot.innerHTML += `<div class="placeholder">Generating token health report...</div>`;
      return;
    }
    if (this.report.error) {
       this.shadowRoot.innerHTML += `<div class="error">${this.report.error}</div>`;
       return;
    }
    
    const { tokenInfo, security, distribution, socials } = this.report;
    
    // --- Генерация HTML для каждой секции ---
    const securityHTML = `
      <h3>🛡️ Security</h3>
      <ul>
        <li class="${security.mintRenounced ? 'ok' : 'bad'}">${security.mintRenounced ? '✅ Fixed Supply' : '🔴 Inflation Risk'}</li>
        <li class="${!security.isMutable ? 'ok' : 'bad'}">${!security.isMutable ? '✅ Immutable Metadata' : '🔴 Mutable Metadata'}</li>
        <li class="${security.lpIsLocked ? 'ok' : 'bad'}">${security.lpIsLocked ? '✅ Liquidity Locked/Safe' : '🔴 Unlocked Liquidity Risk'}</li>
      </ul>
    `;
    
    const distributionHTML = `
      <h3>💰 Distribution & LP</h3>
      <p>LP Address: ${distribution.lpAddress || 'Not Found'}</p>
      <p>Copycat tokens with same name: ${distribution.copycatCount}</p>
      <p>Top holders considered "fresh" (under 24h): ${distribution.freshWallets?.length || 0} / 5</p>
      <h4>Top 5 Holders:</h4>
      <ul>${distribution.topHolders?.map(h => `<li>${h.address.slice(0,6)}...: ${h.balance}</li>`).join('') || '<li>N/A</li>'}</ul>
    `;
    
    this.shadowRoot.innerHTML += `
      <h2>Report for ${tokenInfo.name} (${tokenInfo.symbol})</h2>
      ${securityHTML}
      ${distributionHTML}
      `;
  }
}
if (!customElements.get("dfn-patrol")) {
  customElements.define("dfn-patrol", DFNPatrol);
}
