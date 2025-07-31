// component.js
console.log("[DFN Components] v3.0.8 initialized (Raw Debug Mode)");
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
        li { margin-bottom: 8px; line-height: 1.4; display: flex; align-items: center; }
        .placeholder { text-align: center; padding: 40px; font-size: 1.1em; color: #888; }
        .error { color: #ff6b7b; text-align: center; }
        .ok::before, .bad::before, .warn::before { content: '✓'; margin-right: 8px; font-weight: bold; }
        .ok { color: #9eff9e; }
        .bad { color: #ff6b7b; }
        .bad::before { content: '🔴'; }
        .ok::before { content: '✅'; }
        .warn { color: #ffd447; }
        .warn::before { content: '🟡'; }
        .report-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 32px; }
        .report-grid > div { background: #111; padding: 16px; border-radius: 8px; border: 1px solid #222;}
        .full-width { grid-column: 1 / -1; }
        p { margin-bottom: 8px; }
        a { color: #ffd447; text-decoration: none; }
        a:hover { text-decoration: underline; }
        b { color: #aaa; }
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
    
    const tokenHTML = `<div class="full-width"><h2>Report: ${tokenInfo.name} (${tokenInfo.symbol})</h2></div>`;

    const securityHTML = `
      <div>
        <h3>🛡️ Security Flags</h3>
        <ul>
          <li class="${security.mintRenounced ? 'ok' : 'bad'}">${security.mintRenounced ? 'Mint authority is renounced.' : 'Dev can mint more tokens.'}</li>
          <li class="${!security.isMutable ? 'ok' : 'bad'}">${!security.isMutable ? 'Metadata is immutable.' : 'Dev can change token info.'}</li>
          <li class="${security.lpIsLocked ? 'ok' : 'bad'}">${distribution.lpAddress ? (security.lpIsLocked ? 'Liquidity is Locked/Burned.' : 'Unlocked Liquidity Risk!') : 'Liquidity pool not found.'}</li>
        </ul>
      </div>
    `;
    
    const distributionHTML = `
      <div>
        <h3>💰 Distribution</h3>
        <p><b>LP Address:</b> ${distribution.lpAddress ? `${distribution.lpAddress.slice(0, 4)}...${distribution.lpAddress.slice(-4)}` : 'Not Found'}</p>
        <p class="${distribution.freshWallets > 1 ? 'bad' : 'ok'}"><b>Fresh wallets in top 5:</b> ${distribution.freshWallets || 0}</p>
        <b>Top 5 Holders:</b>
        <ul>${distribution.topHolders?.map(h => `<li>${h.address.slice(0,6)}... (${(h.uiAmountString / 1e9 * 100).toFixed(2)}%)</li>`).join('') || '<li>N/A</li>'}</ul>
      </div>
    `;

    const projectHTML = `
      <div>
          <h3>ℹ️ Project & Socials</h3>
          <p class="${project.copycatCount > 5 ? 'bad' : (project.copycatCount > 0 ? 'warn' : 'ok')}"><b>Similar token names found:</b> ${project.copycatCount || 0}</p>
          <p><b>Website:</b> ${project.links.website ? `<a href="${project.links.website}" target="_blank" rel="noopener nofollow">Visit</a>` : 'Not Provided'}</p>
          <p><b>Twitter:</b> ${project.links.twitter ? `<a href="${project.links.twitter}" target="_blank" rel="noopener nofollow">Visit</a>` : 'Not Provided'}</p>
      </div>
    `;

    this.shadowRoot.innerHTML += `
      <div class="report-grid">
        ${tokenHTML}
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
