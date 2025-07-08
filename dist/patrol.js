// patrol.js
console.log("[DFN Patrol] v3.0.1 initialized (Stable)");

let ws;

function connectToWebSocket(token) {
  if (!token) return;
  if (ws) ws.close();

  ws = new WebSocket(`wss://dfn.wtf/api/?embed=${token}`);
  ws.addEventListener("open", () => console.log("[DFN Patrol] WebSocket connection opened."));

  ws.addEventListener("message", (e) => {
    try {
      const data = JSON.parse(e.data);
      const panel = document.querySelector("dfn-patrol");
      if (!panel) return;

      customElements.whenDefined("dfn-patrol").then(() => {
        // ИСПРАВЛЕНО: Теперь он понимает "snapshot"
        if (data.type === "snapshot") {
          panel.setSnapshot(data);
        } else {
          console.log("[DFN Patrol] Unknown message type:", data);
        }
      });
    } catch (err) {
      console.error("[DFN Patrol] Failed to parse message:", err);
    }
  });
  ws.addEventListener("close", () => console.log("[DFN Patrol] WebSocket closed."));
  ws.addEventListener("error", (e) => console.error("[DFN Patrol] WebSocket error:", e));
}

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

function waitForPatrolReady() {
  const panel = document.querySelector("dfn-patrol");
  if (panel) {
    const token = panel.getAttribute("embed");
    if (token) connectToWebSocket(token);
  } else {
    setTimeout(waitForPatrolReady, 100);
  }
}

waitForPatrolReady();
