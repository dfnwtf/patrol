// component.js
console.log("[DFN Components] v1.4.0 initialized");

class DFNPatrol extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.state = {
      embed: this.getAttribute("embed") || "",
      snapshot: null,
      alerts: []
    };
  }

  static get observedAttributes() {
    return ["embed"];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === "embed" && oldVal !== newVal) {
      this.state.embed = newVal;
      this.render();
    }
  }

  connectedCallback() {
    this.render();
  }

  setSnapshot(data) {
    console.log("[Component] setSnapshot called", data);
    this.state.snapshot = data;
    this.render();
  }

  setAlert(data) {
    console.log("[Component] setAlert called", data);
    this.state.alerts.unshift(data);
    if (this.state.alerts.length > 5) this.state.alerts.pop();
    this.render();
    // Изменяем toast-сообщение, чтобы оно использовало полное сообщение-шепот
    this.showToast(data.event); 
  }

  render() {
    const { embed, snapshot, alerts } = this.state;

    this.shadowRoot.innerHTML = `
      <style>
        /* Existing styles... */
      
        .dfn-badge {
          position: fixed;
          bottom: 16px;
          left: 16px;
          background: #222;
          color: #ffd447;
          padding: 8px 14px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: bold;
          box-shadow: 0 0 8px rgba(255,212,71,0.3);
          z-index: 10000;
          opacity: 0.85;
          backdrop-filter: blur(4px);
        }
        .dfn-toast-container {
          position: fixed;
          bottom: 16px;
          right: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 10000;
        }
        .dfn-toast {
          background: #222;
          color: #fff;
          padding: 10px 16px;
          border-left: 4px solid #ffd447;
          border-radius: 8px;
          font-size: 0.85rem;
          box-shadow: 0 4px 10px rgba(0,0,0,0.4);
          animation: fadein 0.4s ease, fadeout 0.4s ease 7.6s;
        }
        @keyframes fadein { from {opacity:0;transform:translateY(10px)} to {opacity:1;transform:none} }
        @keyframes fadeout { to {opacity:0;transform:translateY(10px)} }

      </style>
      <div id="badge" class="dfn-badge">🛡 DFN Patrol running</div>
      <div id="toastContainer" class="dfn-toast-container"></div>
      
      <style>
        :host {
          display: block;
          font-family: sans-serif;
          background: #111;
          color: #eee;
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 0 12px rgba(0,0,0,0.4);
          margin-top: 20px;
        }
        h3 { margin: 0 0 10px; font-size: 18px; color: #f5d742; }
        .section { margin-bottom: 16px; }
        ul { list-style: none; padding-left: 0; font-size: 14px; }
        li { margin-bottom: 4px; }
        .placeholder { font-style: italic; color: #777; }
      
        .dfn-badge {
          position: fixed;
          bottom: 16px;
          left: 16px;
          background: #222;
          color: #ffd447;
          padding: 8px 14px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: bold;
          box-shadow: 0 0 8px rgba(255,212,71,0.3);
          z-index: 10000;
          opacity: 0.85;
          backdrop-filter: blur(4px);
        }
        .dfn-toast-container {
          position: fixed;
          bottom: 16px;
          right: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 10000;
        }
        .dfn-toast {
          background: #222;
          color: #fff;
          padding: 10px 16px;
          border-left: 4px solid #ffd447;
          border-radius: 8px;
          font-size: 0.85rem;
          box-shadow: 0 4px 10px rgba(0,0,0,0.4);
          animation: fadein 0.4s ease, fadeout 0.4s ease 7.6s;
        }
        @keyframes fadein { from {opacity:0;transform:translateY(10px)} to {opacity:1;transform:none} }
        @keyframes fadeout { to {opacity:0;transform:translateY(10px)} }

      </style>

      <div>
        <h3>📡 Monitoring Token:</h3>
        <div class="section">
          ${snapshot && snapshot.tokenInfo ? `
            <strong>${snapshot.tokenInfo.name} (${snapshot.tokenInfo.symbol})</strong><br/>
            ${embed}
          ` : embed}
        </div>

        <h3>💰 Top Holders</h3>
        <div class="section">
          ${snapshot && snapshot.holders?.length
            ? '<ul>' + snapshot.holders.map(h => `<li>${h.address}: ${h.balance}</li>`).join('') + '</ul>'
            : '<div class="placeholder">Waiting for data...</div>'}
        </div>

        <h3>🌊 Liquidity Pool Status</h3>
        <div class="section">
          ${snapshot && snapshot.liquidity
            ? `
              Pool: ${snapshot.liquidity.pool}<br/>
              Status: ${snapshot.liquidity.status}
            `
            : '<div class="placeholder">No liquidity info yet.</div>'}
        </div>

        <h3>🧬 Clusters</h3>
        <div class="section">
          ${snapshot && snapshot.cluster?.length
            ? '<ul>' + snapshot.cluster.map(a => `<li>${a}</li>`).join('') + '</ul>'
            : '<div class="placeholder">No cluster data.</div>'}
        </div>

        <h3>🚨 Recent Whispers</h3>
        <div class="section">
          ${alerts.length
            ? '<ul>' + alerts.map(a => `<li>${a.event}</li>`).join('') + '</ul>'
            : '<div class="placeholder">No whispers yet. All is quiet... too quiet.</div>'}
        </div>
      </div>
    `;
  }

  showToast(msg) {
    const container = this.shadowRoot.querySelector("#toastContainer");
    if (!container) return;
    const el = document.createElement("div");
    el.className = "dfn-toast";
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.remove(), 8000);
  }

}

if (!customElements.get("dfn-patrol")) {
  customElements.define("dfn-patrol", DFNPatrol);
}
