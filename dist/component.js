// patrol.js
console.log("[DFN Patrol] v4.9.1 initialized - WebSocket Handler");
let ws;

function connectToWebSocket(token) {
  if (!token) return;

  if (ws && ws.readyState < 2) {
      ws.close();
  }

  const scanButton = document.querySelector('#token-search button[type="submit"]');
  const panel = document.querySelector("dfn-patrol");

  ws = new WebSocket(`wss://dfn.wtf/api/?embed=${token}`);
  
  // Передаем WebSocket соединение в компонент
  if(panel) {
      customElements.whenDefined("dfn-patrol").then(() => {
        panel.setWebSocket(ws);
      });
  }

  const cleanup = () => {
      if (scanButton) {
          scanButton.disabled = false;
          scanButton.textContent = 'Scan';
      }
  };

  // Этот обработчик теперь в основном нужен для первоначального отчета
  ws.addEventListener("message", (e) => {
      const data = JSON.parse(e.data);
      // Первоначальный отчет по-прежнему устанавливается здесь
      if (panel && data.type === "report") {
          customElements.whenDefined("dfn-patrol").then(() => {
              panel.setReport(data.data);
          });
      }
      // Остальные сообщения (precise_impact_data и т.д.) обрабатываются внутри самого компонента
  });

  ws.addEventListener("error", (e) => {
      console.error("WebSocket Error:", e);
      if (panel) {
          panel.setReport({ error: "Connection to analysis server failed." });
      }
      cleanup();
  });

  ws.addEventListener("close", cleanup);
}

document.querySelector("#token-search")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const scanButton = e.currentTarget.querySelector('button[type="submit"]');
  const visibleField = document.querySelector("#token-input");
  const hiddenField = document.getElementById('hidden-mint-address');

  const token = (hiddenField ? hiddenField.value : visibleField.value).trim();
  if (!token) return;

  if(scanButton) {
    scanButton.disabled = true;
    scanButton.textContent = 'Scanning...';
  }

  const oldPanel = document.querySelector("dfn-patrol");
  if (oldPanel) oldPanel.remove();

  const newPanel = document.createElement("dfn-patrol");
  newPanel.setAttribute("embed", token);
  newPanel.id = "patrol";
  
  const patrolBlock = document.getElementById('patrol-block');
  if(patrolBlock) {
    patrolBlock.appendChild(newPanel);
  }
  
  if (hiddenField) {
      hiddenField.remove();
  }

  connectToWebSocket(token);
});

document.addEventListener('DOMContentLoaded', () => {
    const initialPanel = document.querySelector("dfn-patrol");
    if (initialPanel && initialPanel.hasAttribute("embed")) {
        const initialToken = initialPanel.getAttribute("embed");
        if (initialToken) {
            const scanButton = document.querySelector('#token-search button[type="submit"]');
            if(scanButton) {
                scanButton.disabled = true;
                scanButton.textContent = 'Scanning...';
            }
            connectToWebSocket(initialToken);
        }
    }
});
