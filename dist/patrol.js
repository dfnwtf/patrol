// patrol.js
console.log("[DFN Patrol] v4.0.4 initialized");
let ws;
let turnstileToken = null; // Глобальная переменная для хранения токена

// --- Функции обратного вызова для Turnstile ---
function onTurnstileSuccess(token) {
    turnstileToken = token;
    const scanButton = document.querySelector('#token-search button[type="submit"]');
    if (scanButton) {
        scanButton.disabled = false;
        scanButton.textContent = 'Scan';
    }
}

function onTurnstileError() {
    console.error("Turnstile challenge failed. Please refresh the page.");
    const panel = document.querySelector("dfn-patrol");
    if (panel) {
        panel.setReport({ error: "Security check failed. Please refresh." });
    }
}

function connectToWebSocket(token, turnstileResponse) {
  if (!token || !turnstileResponse) return;

  if (ws && ws.readyState < 2) { 
      ws.close();
  }
  
  const scanButton = document.querySelector('#token-search button[type="submit"]');

  // Передаем токен Turnstile в параметрах подключения
  ws = new WebSocket(`wss://dfn.wtf/api/?embed=${token}&turnstile=${turnstileResponse}`);

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
    // Разблокируем кнопку после получения отчета
    cleanup();
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

    if (!turnstileToken) {
        alert("Please wait for human verification check.");
        return;
    }
  
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
    
    connectToWebSocket(token, turnstileToken);
});

document.addEventListener('DOMContentLoaded', () => {
    // Рендерим виджет Turnstile в форме поиска
    const searchForm = document.querySelector('#token-search');
    if (searchForm) {
        try {
            turnstile.render(searchForm, {
                // V-- ВАЖНО: Вставьте сюда ваш Site Key от Cloudflare Turnstile --V
                sitekey: '0x4AAAAAABks_T_e262EnxzykJbNgrwCBOE', 
                callback: onTurnstileSuccess,
                'error-callback': onTurnstileError,
                theme: 'dark',
            });
            // Блокируем кнопку до успешной проверки
            const scanButton = searchForm.querySelector('button[type="submit"]');
            if(scanButton) {
                scanButton.disabled = true;
                scanButton.textContent = 'Verifying...';
            }
        } catch (e) {
            console.error("Failed to render Turnstile widget:", e);
        }
    }

    const initialPanel = document.querySelector("dfn-patrol");
    if (initialPanel) {
        const initialToken = initialPanel.getAttribute("embed");
        // Для предзагруженного токена запускаем Turnstile и потом соединение
        if (initialToken && turnstileToken) {
            connectToWebSocket(initialToken, turnstileToken);
        } else if (initialToken) {
            // Если токен есть, но Turnstile еще не сработал, ждем
            const interval = setInterval(() => {
                if(turnstileToken) {
                    clearInterval(interval);
                    connectToWebSocket(initialToken, turnstileToken);
                }
            }, 500);
        }
    }
});
