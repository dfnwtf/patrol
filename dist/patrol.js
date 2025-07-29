// patrol.js (с выводом сырых данных)
console.log("[DFN Patrol] v3.0.5 initialized (Raw Debug Mode)");
let ws;
function connectToWebSocket(token) {
  if (!token) return;
  if (ws) ws.close();
  ws = new WebSocket(`wss://dfn.wtf/api/?embed=${token}`);
  ws.addEventListener("message", (e) => {
    const data = JSON.parse(e.data);
    const panel = document.querySelector("dfn-patrol");
    if (!panel) return;

    // НОВАЯ ЛОГИКА: Выводим сырые данные в консоль
    if (data.type === "debug_raw_asset") {
        console.log("--- RAW ASSET DATA FROM HELIUS ---");
        console.log(data.data);
        console.log("---------------------------------");
    } else if (data.type === "report") {
        customElements.whenDefined("dfn-patrol").then(() => {
            panel.setReport(data.data);
        });
    }
  });
}
// ... остальная часть файла без изменений ...
document.querySelector("#token-search")?.addEventListener("submit", (e) => { e.preventDefault(); const field = document.querySelector("#token-input"); const token = field.value.trim(); if (!token) return; const oldPanel = document.querySelector("dfn-patrol"); if (oldPanel) oldPanel.remove(); const newPanel = document.createElement("dfn-patrol"); newPanel.setAttribute("embed", token); newPanel.id = "patrol"; document.querySelector("#patrol-block")?.appendChild(newPanel); connectToWebSocket(token); field.value = ""; });
function waitForPatrolReady() { const panel = document.querySelector("dfn-patrol"); if (panel) { const token = panel.getAttribute("embed"); if (token) connectToWebSocket(token); } else { setTimeout(waitForPatrolReady, 100); } }
waitForPatrolReady();
