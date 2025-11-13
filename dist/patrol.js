// patrol.js
console.log("[DFN Patrol] beta-v3.3 initialized");

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

// Form handling - только для ручного ввода/выбора токена
document.querySelector("#token-search")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const scanButton = e.currentTarget.querySelector('button[type="submit"]');
  const visibleField = document.querySelector("#token-input");
  const hiddenField = document.getElementById('hidden-mint-address');

  const token = (hiddenField ? hiddenField.value : visibleField.value).trim();

  if (!token) return;

  // Обновляем URL только если это валидный токен (32-44 символа Base58)
  const isValidToken = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(token);
  if (isValidToken) {
    const newUrl = `/patrol/${token}`;
    history.pushState({ token: token }, '', newUrl);
  }

  if (scanButton) {
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

// Обработка навигации назад/вперёд в браузере
window.addEventListener('popstate', (e) => {
  if (e.state && e.state.token) {
    const token = e.state.token;
    const visibleField = document.querySelector("#token-input");
    const patrolBlock = document.getElementById('patrol-block');
    
    if (visibleField) visibleField.value = token;
    if (patrolBlock) patrolBlock.classList.add('is-visible');
    
    const oldPanel = document.querySelector("dfn-patrol");
    if (oldPanel) oldPanel.remove();

    const newPanel = document.createElement("dfn-patrol");
    newPanel.setAttribute("embed", token);
    newPanel.id = "patrol";
    
    if (patrolBlock) patrolBlock.appendChild(newPanel);
    
    connectToWebSocket(token);
  }
});

// Автозапуск при прямом переходе по URL /patrol/TOKEN
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const match = path.match(/^\/patrol\/([1-9A-HJ-NP-Za-km-z]{32,44})$/);
  
  if (match && match[1]) {
    const token = match[1];
    const visibleField = document.querySelector("#token-input");
    const patrolBlock = document.getElementById('patrol-block');
    const scanButton = document.querySelector('#token-search button[type="submit"]');
    const clearInputBtn = document.getElementById('clear-input-btn');
    
    // Устанавливаем состояние UI
    if (visibleField) visibleField.value = token;
    if (patrolBlock) patrolBlock.classList.add('is-visible');
    if (clearInputBtn) clearInputBtn.style.display = 'block';
    if (scanButton) {
      scanButton.disabled = true;
      scanButton.textContent = 'Scanning...';
    }
    
    // Сохраняем состояние в history для корректной навигации
    history.replaceState({ token: token }, '', path);
    
    // Создаём панель и подключаемся
    const oldPanel = document.querySelector("dfn-patrol");
    if (oldPanel) oldPanel.remove();

    const newPanel = document.createElement("dfn-patrol");
    newPanel.setAttribute("embed", token);
    newPanel.id = "patrol";
    
    if (patrolBlock) patrolBlock.appendChild(newPanel);
    
    connectToWebSocket(token);
  }
});
