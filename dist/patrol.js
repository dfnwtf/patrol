// patrol.js
console.log("[DFN Patrol] v3.1.1 initialized (Report Mode)");
let ws;

function connectToWebSocket(token) {
  if (!token) return;
  if (ws) ws.close();

  const scanButton = document.querySelector('#token-search button[type="submit"]');

  // Используйте ваш реальный домен
  ws = new WebSocket(`wss://dfn.wtf/api/?embed=${token}`);

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
  });

  // Повторно включаем кнопку, когда соединение закрывается (при успехе или ошибке)
  ws.addEventListener("close", () => {
    if (scanButton) {
        scanButton.disabled = false;
        scanButton.textContent = 'Scan';
    }
  });
}

document.querySelector("#token-search")?.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const scanButton = e.currentTarget.querySelector('button[type="submit"]');
  const field = document.querySelector("#token-input");
  const token = field.value.trim();
  
  if (!token) return;

  // Отключаем кнопку и показываем обратную связь
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
  
  connectToWebSocket(token);
  field.value = "";
});

function waitForPatrolReady() {
  const panel = document.querySelector("dfn-patrol");
  if (panel) {
    const token = panel.getAttribute("embed");
    if (token) connectToWebSocket(token);
  } else {
    setTimeout(waitForPatrolReady, 100);
  }
}

// Запускаем это только при начальной загрузке страницы, если панель уже существует
if (document.querySelector("dfn-patrol")) {
    waitForPatrolReady();
}
