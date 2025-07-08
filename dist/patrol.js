// patrol.js
console.log("[DFN Patrol] v2.1.0 initialized (with new endpoint)");

let ws;

function connectToWebSocket(token) {
  if (!token) {
    console.warn("[DFN Patrol] No token provided for WebSocket.");
    return;
  }

  if (ws) {
    console.log("[DFN Patrol] Closing existing WebSocket.");
    ws.close();
  }

  console.log("[DFN Patrol] Connecting WebSocket to token:", token);

  // ИСПОЛЬЗУЕТСЯ НОВЫЙ, ПРАВИЛЬНЫЙ АДРЕС
  ws = new WebSocket(`wss://dfn.wtf/api/?embed=${token}`);

  ws.addEventListener("open", () => {
    console.log("[DFN Patrol] WebSocket connection opened.");
  });

  ws.addEventListener("message", (e) => {
    try {
      const data = JSON.parse(e.data);
      const panel = document.querySelector("dfn-patrol");

      if (!panel) {
        console.warn("[DFN Patrol] Panel not found in DOM.");
        return;
      }

      customElements.whenDefined("dfn-patrol").then(() => {
        if (data.type === "snapshot") {
          panel.setSnapshot(data);
        } else if (data.type === "alert") {
          panel.setAlert(data);
        } else if (data.type === "debug_info") {
          console.log("--- WORKER DEBUG INFO ---");
          console.table(data.payload);
        } else {
          console.log("[DFN Patrol] Unknown message type:", data);
        }
      });
    } catch (err) {
      console.error("[DFN Patrol] Failed to parse message:", err);
    }
  });

  ws.addEventListener("close", (e) => {
    console.log("[DFN Patrol] WebSocket closed.", e);
  });
  
  ws.addEventListener("error", (e) => {
    console.error("[DFN Patrol] WebSocket error:", e);
  });
}

// Form handling
document.querySelector("#token-search")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const field = document.querySelector("#token-input");
  const token = field.value.trim();
  if (!token) {
    console.warn("[DFN Patrol] Empty token submitted.");
    return;
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

// Wait until dfn-patrol is in DOM before initializing
function waitForPatrolReady() {
  const panel = document.querySelector("dfn-patrol");
  if (panel) {
    const token = panel.getAttribute("embed");
    if (token) {
      console.log("[DFN Patrol] Found panel on page load, connecting...");
      connectToWebSocket(token);
    } else {
      console.warn("[DFN Patrol] Panel found, but no token.");
    }
  } else {
    setTimeout(waitForPatrolReady, 100);
  }
}

waitForPatrolReady();
