// patrol.js
console.log("[DFN Patrol] v3.0.0 initialized (Report Mode)");

let ws;

function connectToWebSocket(token) {
  if (!token) return;
  if (ws) ws.close();

  console.log("[DFN Patrol] Connecting to WebSocket for token:", token);
  ws = new WebSocket(`wss://dfn.wtf/api/?embed=${token}`);

  ws.addEventListener("open", () => {
    console.log("[DFN Patrol] WebSocket connection opened.");
  });

  ws.addEventListener("message", (e) => {
    try {
      const data = JSON.parse(e.data);
      const panel = document.querySelector("dfn-patrol");
      if (!panel) return;

      customElements.whenDefined("dfn-patrol").then(() => {
        // Изменено: теперь мы ожидаем сообщение с типом 'report'
        if (data.type === "report") {
          console.log("[DFN Patrol] Report received:", data.data);
          // Вызываем новую функцию в компоненте
          panel.setReport(data.data);
        } else {
          console.log("[DFN Patrol] Unknown message type:", data);
        }
      });
    } catch (err) {
      console.error("[DFN Patrol] Failed to parse message:", err);
    }
  });

  ws.addEventListener("close", () => {
    console.log("[DFN Patrol] WebSocket closed.");
  });
  
  ws.addEventListener("error", (e) => {
    console.error("[DFN Patrol] WebSocket error:", e);
  });
}

// Form handling (без изменений)
document.querySelector("#token-search")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const field = document.querySelector("#token-input");
  const token = field.value.trim();
  if (!token) return;

  const oldPanel = document.querySelector("dfn-patrol");
  if (oldPanel) oldPanel.remove();

  const newPanel = document.createElement("dfn-patrol");
  newPanel.setAttribute("embed", token);
  newPanel.id = "patrol";
  document.querySelector("#patrol-block")?.appendChild(newPanel);

  connectToWebSocket(token);
  field.value = "";
});

// Initializer (без изменений)
function waitForPatrolReady() {
  const panel = document.querySelector("dfn-patrol");
  if (panel) {
    const token = panel.getAttribute("embed");
    if (token) {
      console.log("[DFN Patrol] Found panel on page load, connecting...");
      connectToWebSocket(token);
    }
  } else {
    setTimeout(waitForPatrolReady, 100);
  }
}

waitForPatrolReady();
