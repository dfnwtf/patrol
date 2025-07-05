
console.log("[DFN Patrol] initialized");

let ws;

function connectToWebSocket(token) {
  if (!token) return;

  if (ws) {
    console.log("[DFN Patrol] closing previous WS");
    ws.close();
  }

  console.log("[DFN Patrol] setToken", token);

  ws = new WebSocket(`wss://dfn-alerts-gateway.official-716.workers.dev/?embed=${token}`);

  ws.addEventListener("open", () => {
    console.log("[DFN Patrol] WS open");
  });

  ws.addEventListener("message", (e) => {
    try {
      const data = JSON.parse(e.data);
      const panel = document.querySelector("dfn-patrol");

      if (data.type === "snapshot") {
        console.log("[DFN Patrol] snapshot >", data);
        panel?.setSnapshot(data);
      }
      if (data.type === "alert") {
        console.log("[DFN Patrol] alert >", data);
        panel?.setAlert(data);
      }
    } catch (err) {
      console.error("[DFN Patrol] Invalid message", err);
    }
  });

  ws.addEventListener("close", () => {
    console.log("[DFN Patrol] WS closed");
  });
}

// Form handling
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

// Wait for DOM and then auto-connect
window.addEventListener("DOMContentLoaded", () => {
  const panel = document.querySelector("dfn-patrol");
  if (panel) {
    const token = panel.getAttribute("embed");
    if (token) connectToWebSocket(token);
  }
});
