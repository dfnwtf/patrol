// patrol.js
console.log("[DFN Patrol] beta-v2.1 initialized");
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

  const token = (hiddenField ? hiddenField.value : visibleField.value).trim();

  if (!token) return;

  // --- НОВАЯ ЛОГИКА: ОБНОВЛЕНИЕ URL БРАУЗЕРА ---
  const newUrl = `/patrol/${token}`;
  // Обновляем URL без перезагрузки страницы
  history.pushState({token: token}, '', newUrl);

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
  if (patrolBlock) {
      patrolBlock.appendChild(newPanel);
  }
  
  if (hiddenField) {
      hiddenField.remove();
  }

  connectToWebSocket(token);
});

// Логика начальной загрузки со страницы patrol.html теперь полностью обрабатывается в main.js
// Этот блок больше не нужен для авто-запуска, но оставляем его пустым на случай будущих доработок.
document.addEventListener('DOMContentLoaded', () => {
    const initialPanel = document.querySelector("dfn-patrol[embed]");
    if (initialPanel) {
        // Логика авто-сканирования при прямом URL уже обрабатывается в main.js
    }
});
