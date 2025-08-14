// component.js
console.log("[DFN Components] v3.3.7 initialized (Raw Debug Mode)");
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
        pre { background: #111; padding: 12px; border-radius: 8px; white-space: pre-wrap; word-break: break-all; font-family: monospace; font-size: 12px; }
        h3 { color: #f5d742; }
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
    
    // --- ДИАГНОСТИЧЕСКИЙ ВЫВОД ---
    const { debug_holdersResult, debug_pairInfoResult } = this.report;

    if (debug_holdersResult || debug_pairInfoResult) {
        this.shadowRoot.innerHTML += `
            <h2>DEBUG MODE: RAW API RESPONSES</h2>
            <p>Пожалуйста, скопируйте весь этот текст и отправьте мне.</p>
            
            <h3>Ответ от getTokenLargestAccounts:</h3>
            <pre>${JSON.stringify(debug_holdersResult, null, 2)}</pre>
            
            <h3>Ответ от /v1/pairs:</h3>
            <pre>${JSON.stringify(debug_pairInfoResult, null, 2)}</pre>
        `;
        return;
    }
    // --- КОНЕЦ ДИАГНОСТИКИ ---

    // Если нет debug данных, показываем обычный отчет (для других токенов)
    // ... Сюда можно будет вернуть код обычного рендеринга, когда мы все починим
    this.shadowRoot.innerHTML += `<div>Normal report would be here.</div>`;
  }
}
if (!customElements.get("dfn-patrol")) {
  customElements.define("dfn-patrol", DFNPatrol);
}
