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

    window.addEventListener("dfn-snapshot", (e) => {
      this.state.snapshot = e.detail;
      this.render();
    });

    window.addEventListener("dfn-alert", (e) => {
      this.state.alerts.unshift(e.detail);
      if (this.state.alerts.length > 5) this.state.alerts.pop();
      this.render();
    });
  }

  render() {
    const { embed, snapshot, alerts } = this.state;

    this.shadowRoot.innerHTML = \`
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
      </style>

      <div>
        <h3>📡 Monitoring Token:</h3>
        <div class="section">\${embed}</div>

        <h3>💰 Top Holders</h3>
        <div class="section">
          \${snapshot && snapshot.holders?.length
            ? '<ul>' + snapshot.holders.map(h => \`<li>\${h.address}: \${h.balance}</li>\`).join('') + '</ul>'
            : '<div class="placeholder">Waiting for data…</div>'}
        </div>

        <h3>🌊 Liquidity</h3>
        <div class="section">
          \${snapshot && snapshot.liquidity
            ? \`Pool: \${snapshot.liquidity.pool}<br/>Volume: \${snapshot.liquidity.volume}<br/>Price: \${snapshot.liquidity.price}\`
            : '<div class="placeholder">No liquidity info yet.</div>'}
        </div>

        <h3>🧬 Clusters</h3>
        <div class="section">
          \${snapshot && snapshot.cluster?.length
            ? '<ul>' + snapshot.cluster.map(a => \`<li>\${a}</li>\`).join('') + '</ul>'
            : '<div class="placeholder">No cluster data.</div>'}
        </div>

        <h3>🚨 Recent Alerts</h3>
        <div class="section">
          \${alerts.length
            ? '<ul>' + alerts.map(a => \`<li>\${a.event}: \${a.amount || '–'}</li>\`).join('') + '</ul>'
            : '<div class="placeholder">No alerts yet.</div>'}
        </div>
      </div>
    \`;
  }
}

customElements.define("dfn-patrol", DFNPatrol);
