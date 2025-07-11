// patrol.js
console.log("[DFN Patrol] v4.0.9 initialized");
let ws;
let turnstileToken = null;
let tokenToScan = null;

// --- Функции обратного вызова для Turnstile ---
function onTurnstileSuccess(token) {
    turnstileToken = token;
    const scanButton = document.querySelector('#token-search button[type="submit"]');

    // Если мы ждали токен для конкретного сканирования, запускаем его
    if (tokenToScan) {
        connectToWebSocket(tokenToScan, turnstileToken);
        tokenToScan = null; // Сбрасываем, чтобы не запустить снова
    } else if (scanButton) {
        // Это была первоначальная загрузка, просто активируем кнопку
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
    const scanButton = document.querySelector('#token-search button[type="submit"]');
    if (scanButton) {
        scanButton.disabled = false;
        scanButton.textContent = 'Scan Failed';
    }
}

function connectToWebSocket(token, turnstileResponse) {
  if (!token || !turnstileResponse) return;

  if (ws && ws.readyState < 2) { 
      ws.close();
  }
  
  const scanButton = document.querySelector('#token-search button[type="submit"]');

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
  
    const scanButton = e.currentTarget.querySelector('button[type="submit"]');
    const field = document.querySelector("#token-input");
    const token = field.value.trim();
    
    if (!token) return;

    if(scanButton) {
        scanButton.disabled = true;
        scanButton.textContent = 'Verifying...';
    }

    const oldPanel = document.querySelector("dfn-patrol");
    if (oldPanel) oldPanel.remove();
    
    const newPanel = document.createElement("dfn-patrol");
    newPanel.setAttribute("embed", token);
    newPanel.id = "patrol";
    document.querySelector("#patrol-block")?.appendChild(newPanel);
    
    // Сохраняем токен, который хотим сканировать
    tokenToScan = token;
    // И запускаем проверку Turnstile заново, чтобы получить новый токен
    try {
        turnstile.execute();
    } catch(err) {
        console.error("Failed to execute Turnstile:", err);
        onTurnstileError();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.querySelector('#token-search');
    if (searchForm) {
        try {
            turnstile.render(searchForm, {
                sitekey: '0x4AAAAAABks_fM_MFRf0FP_', // <-- УБЕДИТЕСЬ, ЧТО ЗДЕСЬ ВАШ ПРАВИЛЬНЫЙ КЛЮЧ
                callback: onTurnstileSuccess,
                'error-callback': onTurnstileError,
                theme: 'dark',
                // 'execution': 'execute', // Этот режим позволяет вызывать проверку вручную
            });
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
        if (initialToken) {
            const interval = setInterval(() => {
                if(turnstileToken) {
                    clearInterval(interval);
                    connectToWebSocket(initialToken, turnstileToken);
                }
            }, 500);
        }
    }
});
