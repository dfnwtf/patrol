// patrol.js
console.log("[DFN Patrol] v4.0.5 initialized");
let ws;
let turnstileToken = null;

// Эта функция будет вызвана автоматически скриптом Turnstile, когда он будет готов
function onloadTurnstileCallback() {
    const searchForm = document.querySelector('#token-search');
    if (!searchForm) {
        console.error("Turnstile target #token-search not found.");
        return;
    }

    try {
        turnstile.render(searchForm, {
            // V-- ВАЖНО: Вставьте сюда ваш Site Key от Cloudflare Turnstile --V
            sitekey: 'ВАШ_SITE_KEY', 
            callback: onTurnstileSuccess,
            'error-callback': onTurnstileError,
            theme: 'dark',
        });
        const scanButton = searchForm.querySelector('button[type="submit"]');
        if(scanButton) {
            scanButton.disabled = true;
            scanButton.textContent = 'Verifying...';
        }
    } catch (e) {
        console.error("Failed to render Turnstile widget:", e);
        onTurnstileError();
    }
}

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

    if (!turnstileToken) {
        alert("Please wait for human verification check or refresh the page.");
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
    // Эта логика нужна для предзагрузки токена, который уже есть в HTML
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
