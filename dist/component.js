class DFNPatrol extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.container = document.createElement("div");
    this.container.innerHTML = "<p style='color:#ccc;font-family:monospace'>Loading DFN Patrol...</p>";
    this.shadowRoot.appendChild(this.container);
  }

  connectedCallback() {
    const mint = this.getAttribute("embed") || "N/A";
    const theme = this.getAttribute("data-theme") || "dark";
    const tabs = this.getAttribute("data-tabs")?.split(",") || ["overview"];

    const html = `
      <style>
        .dfn-box {
          background: #111;
          color: #ffd447;
          border: 1px solid #444;
          padding: 16px;
          border-radius: 12px;
          font-family: monospace;
        }
        .dfn-header {
          font-size: 1.2rem;
          margin-bottom: 12px;
        }
        .dfn-tab {
          margin-top: 6px;
          color: #aaa;
        }
      </style>
      <div class="dfn-box">
        <div class="dfn-header">🔍 Monitoring Token</div>
        <div><strong>Embed:</strong> ${mint}</div>
        ${tabs.map(t => `<div class="dfn-tab">Tab: ${t}</div>`).join("")}
        <div style="margin-top:12px;font-size:0.9rem;color:#888">[Live data will appear here]</div>
      </div>
    `;

    this.container.innerHTML = html;
  }
}

customElements.define("dfn-patrol", DFNPatrol);
