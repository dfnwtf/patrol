// component.js
console.log("[DFN Components] v3.0.2 initialized (Stable)");

// component.js
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
        :host { display: block; font-family: sans-serif; background: #111; color: #eee; padding: 16px; border-radius: 12px; }
        h3 { margin: 20px 0 10px; font-size: 18px; color: #f5d742; border-top: 1px solid #333; padding-top: 16px; }
        h2 { font-size: 22px; text-align: center; }
        ul { list-style: none; padding-left: 0; font-size: 14px; }
        li { margin-bottom: 6px; }
        .placeholder { text-align: center; padding: 40px; font-size: 1.1em; color: #888; }
        .error { color: #ff6b7b; text-align: center; }
        .ok { color: #9eff9e; }
        .bad { color: #ff6b7b; }
        .warn { color: #ffd447; }
        .report-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 24px; }
        @media(max-width: 600px) { .report-grid { grid-template-columns: 1fr; } }
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
    
    const { tokenInfo, security, distribution, project } = this.report;
    
    const securityHTML = `
      <div>
        <h3>🛡️ Security</h3>
        <ul>
          <li class="${security.mintRenounced ? 'ok' : 'bad'}">${security.mintRenounced ? '✅ Mint authority renounced.' : '🔴 Dev can mint more tokens.'}</li>
          <li class="${!security.isMutable ? 'ok' : 'bad'}">${!security.isMutable ? '✅ Metadata is immutable.' : '🔴 Dev can change token info.'}</li>
        </ul>
      </div>
    `;
    
    const distributionHTML = `
      <div>
        <h3>💰 Distribution</h3>
        <p>LP Address: ${distribution.lpAddress || 'Not Found'}</p>
        <p class="${distribution.freshWallets > 1 ? 'bad' : 'ok'}">Fresh wallets in top 5: ${distribution.freshWallets || 0}</p>
        <h4>Top 5 Holders:</h4>
        <ul>${distribution.topHolders?.map(h => `<li>${h.address.slice(0,6)}... (${(h.uiAmountString / 1e9 * 100).toFixed(2)}%)</li>`).join('') || '<li>N/A</li>'}</ul>
      </div>
    `;

    const projectHTML = `
      <div>
          <h3>ℹ️ Project Info</h3>
          <p class="${project.copycatCount > 5 ? 'bad' : 'warn'}">Similar token names found: ${project.copycatCount}</p>
          <p>Website: ${project.links.website ? `<a href="${project.links.website}" target="_blank">Link</a>` : 'N/A'}</p>
          <p>Twitter: ${project.links.twitter ? `<a href="${project.links.twitter}" target="_blank">Link</a>` : 'N/A'}</p>
      </div>
    `;

    this.shadowRoot.innerHTML += `
      <h2>Report: ${tokenInfo.name} (${tokenInfo.symbol})</h2>
      <div class="report-grid">
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
if (!customElements.get("dfn-patrol")) {
  customElements.define("dfn-patrol", DFNPatrol);
}
