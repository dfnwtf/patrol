// component.js
console.log("[DFN Components] v3.4.9 initialized (Raw Debug Mode)");
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
    // --- ИСПРАВЛЕННАЯ ЛОГИКА РЕНДЕРИНГА ---
    let html = `
      <style>
        :host { display: block; font-family: sans-serif; background: #1a1a1a; color: #eee; padding: 16px; border-radius: 12px; }
        pre { background: #111; padding: 12px; border-radius: 8px; white-space: pre-wrap; word-break: break-all; font-family: monospace; font-size: 12px; border: 1px solid #333; }
        h2, h3 { color: #f5d742; }
        p { text-align: center; }
        .placeholder { text-align: center; padding: 40px; font-size: 1.1em; color: #888; }
        .error { color: #ff6b7b; text-align: center; font-size: 1.1em; padding: 20px;}
      </style>
    `;
    
    if (!this.report) {
      html += `<div class="placeholder">Generating token health report...</div>`;
      this.shadowRoot.innerHTML = html;
      return;
    }
    if (this.report.error) {
       html += `<div class="error">${this.report.error}</div>`;
       this.shadowRoot.innerHTML = html;
       return;
    }
    
    const { debug_holdersResult, debug_pairInfoResult } = this.report;

    if (debug_holdersResult || debug_pairInfoResult) {
        html += `
            <div>
                <h2>DEBUG MODE: RAW API RESPONSES</h2>
                <p>Пожалуйста, скопируйте весь этот текст из обоих блоков и отправьте мне.</p>
                
                <h3>Ответ от getTokenLargestAccounts (Топ холдеры):</h3>
                <pre>${JSON.stringify(debug_holdersResult, null, 2)}</pre>
                
                <h3>Ответ от /v1/pairs (Информация о пуле):</h3>
                <pre>${JSON.stringify(debug_pairInfoResult, null, 2)}</pre>
            </div>
        `;
    } else {
      // Если мы когда-нибудь вернемся к обычному режиму, он будет здесь
      html += `<div>Something went wrong, no debug data.</div>`;
    }

    this.shadowRoot.innerHTML = html;
  }
}
if (!customElements.get("dfn-patrol")) {
  customElements.define("dfn-patrol", DFNPatrol);
}
