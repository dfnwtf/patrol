// patrol.js
console.log("[DFN Patrol] v3.1.2 initialized (Report Mode)");
let ws;

function connectToWebSocket(token) {
  if (!token) return;

  // Если WebSocket уже открыт или подключается, закрываем его перед созданием нового.
  if (ws && ws.readyState < 2) { // readyState < 2 означает CONNECTING или OPEN
      ws.close();
  }

  const scanButton = document.querySelector('#token-search button[type="submit"]');

  // Используйте ваш реальный домен
  ws = new WebSocket(`wss://dfn.wtf/api/?embed=${token}`);

  // Функция для возвращения кнопки в исходное состояние
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
      cleanup(); // Возвращаем кнопку в исходное состояние при ошибке
  });

  ws.addEventListener("close", cleanup); // Возвращаем кнопку, когда соединение закрывается
}

document.querySelector("#token-search")?.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const scanButton = e.currentTarget.querySelector('button[type="submit"]');
  const field = document.querySelector("#token-input");
  const token = field.value.trim();
  
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
  
  connectToWebSocket(token);
});

// --- ЛОГИКА ДЛЯ НАЧАЛЬНОЙ ЗАГРУЗКИ СТРАНИЦЫ ---
// Этот код выполняется один раз, когда страница полностью загружена.
document.addEventListener('DOMContentLoaded', () => {
    const initialPanel = document.querySelector("dfn-patrol");
    if (initialPanel) {
        const initialToken = initialPanel.getAttribute("embed");
        if (initialToken) {
            // Показываем, что идет загрузка для встроенного токена
            const scanButton = document.querySelector('#token-search button[type="submit"]');
            if(scanButton) {
                scanButton.disabled = true;
                scanButton.textContent = 'Scanning...';
            }
            connectToWebSocket(initialToken);
        }
    }
});
