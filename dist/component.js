// component.js
console.log("[DFN Components] v3.0.1 initialized (Stable)");

class DFNPatrol extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.state = {
      embed: this.getAttribute("embed") || "",
      snapshot: null,
      alerts: [] // Оставляем для будущих алертов
    };
  }

  static get observedAttributes() { return ["embed"]; }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === "embed" && oldVal !== newVal) {
      this.state.embed = newVal;
      this.render();
    }
  }

  connectedCallback() { this.render(); }

  // Возвращаем функцию setSnapshot
  setSnapshot(data) {
    this.state.snapshot = data;
    this.render();
  }

  render() {
    const { embed, snapshot } = this.state;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; font-family: sans-serif; background: #111; color: #eee; padding: 16px; border-radius: 12px; }
        h3 { margin: 16px 0 10px; font-size: 18px; color: #f5d742; }
        .section { margin-bottom: 16px; overflow-wrap: break-word; }
        ul { list-style: none; padding-left: 0; font-size: 14px; }
        li { margin-bottom: 4px; }
        .placeholder { color: #777; }
      </style>
      <div>
        <h3>📡 Monitoring Token:</h3>
        <div class="section">
          ${snapshot && snapshot.tokenInfo ? `<strong>${snapshot.tokenInfo.name} (${snapshot.tokenInfo.symbol})</strong><br/>${embed}` : '<div class="placeholder">Loading...</div>'}
        </div>

        <h3>💰 Top Holders</h3>
        <div class="section">
          ${snapshot && snapshot.holders?.length ? '<ul>' + snapshot.holders.map(h => `<li>${h.address}: ${h.balance}</li>`).join('') + '</ul>' : '<div class="placeholder">Waiting for data...</div>'}
        </div>
        
        <h3>🌊 Liquidity Pool Status</h3>
        <div class="section">
           ${snapshot && snapshot.liquidity ? `${snapshot.liquidity.pool}` : '<div class="placeholder">...</div>'}
        </div>
      </div>
    `;
  }
}

if (!customElements.get("dfn-patrol")) {
  customElements.define("dfn-patrol", DFNPatrol);
}
