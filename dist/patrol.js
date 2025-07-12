// patrol.js
console.log("[DFN Patrol] v4.4.0 initialized");
let ws;

function connectToWebSocket(token) {
  if (!token) return;

  if (ws && ws.readyState < 2) {
      ws.close();
  }

  const scanButton = document.querySelector('#token-search button[type="submit"]');

  ws = new WebSocket(`wss://dfn.wtf/api/?embed=${token}`);

  const cleanup = () => {
      if (scanButton) {
          scanButton.disabled = false;
          scanButton.textContent = 'Scan';
      }
  };

  ws.addEventListener("message", (e) => {
      const data = JSON.parse(e.data);
      const panel = document.querySelector("dfn-patrol");
      if (panel && data.type === "report") {
          customElements.whenDefined("dfn-patrol").then(() => {
              panel.setReport(data.data);
          });
      }
  });

  ws.addEventListener("error", (e) => {
      console.error("WebSocket Error:", e);
      const panel = document.querySelector("dfn-patrol");
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

  // --- ИЗМЕНЕНИЕ ЗДЕСЬ ---
  // Приоритет отдаем адресу из скрытого поля (выбранного из списка).
  // Если его нет, берем то, что введено вручную.
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
  document.querySelector("#patrol-block")?.appendChild(newPanel);
  
  // После выбора из списка, удаляем скрытое поле, чтобы не мешать следующим ручным поискам
  if (hiddenField) {
      hiddenField.remove();
  }

  connectToWebSocket(token);
});

document.addEventListener('DOMContentLoaded', () => {
    const initialPanel = document.querySelector("dfn-patrol");
    if (initialPanel) {
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
