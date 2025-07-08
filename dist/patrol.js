(function () {
  const WS_URL = "wss://alerts.dfn.wtf/alerts";
  let currentWS = null;

  const log = (...args) => console.log("[DFN Patrol]", ...args);

  const insertBadge = () => {
    if (document.querySelector("dfn-badge")) return;
    const badge = document.createElement("dfn-badge");
    document.body.appendChild(badge);
  };

  const showToast = (msg) => {
    const toast = document.createElement("div");
    toast.style = `
      position:fixed;bottom:80px;right:20px;z-index:9999;
      background:#222;color:#fff;padding:10px 14px;
      border-radius:8px;font-family:sans-serif;
      box-shadow:0 0 6px rgba(0,0,0,0.4);
    `;
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  };

  const mountPanel = () => {
    if (document.getElementById("dfn-patrol-panel")) return;

    const panel = document.createElement("div");
    panel.id = "dfn-patrol-panel";
    panel.style = `
      position:fixed;bottom:20px;right:20px;
      background:#111;color:#f5d742;padding:12px 16px;
      border-radius:12px;font-weight:bold;z-index:9999;
      font-family:monospace;box-shadow:0 0 10px rgba(0,0,0,0.5);
    `;
    panel.innerText = "🛡 DFN Patrol active";
    document.body.appendChild(panel);

    setTimeout(() => panel.remove(), 4000);
  };

  const connect = (embed) => {
    if (currentWS) {
      currentWS.close();
    }

    const ws = new WebSocket(`${WS_URL}?embed=${embed}`);
    currentWS = ws;

    ws.onopen = () => {
      log("WS open");
      showToast(`✅ Patrol connected to ${embed}`);
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "snapshot") {
          log("snapshot received", msg.data);
        } else if (msg.type === "alert") {
          const alertText = `🚨 [DFN] ${msg.event}: ${msg.amount || "–"}`;
          showToast(alertText);
          log("alert", msg);
        }
      } catch (err) {
        console.warn("Invalid WS message:", e.data);
      }
    };

    ws.onclose = () => {
      log("WS closed; retrying in 3s");
      setTimeout(() => connect(embed), 3000);
    };

    ws.onerror = (err) => {
      console.error("WS error", err);
      ws.close();
    };
  };

  const setToken = (mint) => {
    if (!mint) return;
    log("setToken", mint);
    connect(mint);
  };

  window.addEventListener("load", () => {
    log("initialized");
    insertBadge();
    mountPanel();

    const form = document.querySelector("#token-search");
    const input = document.querySelector("#token-input");
    if (form && input) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const mint = input.value.trim();
        if (mint.length > 0) setToken(mint);
      });
    }

    window.addEventListener("DFN_TEST_ALERT", () => {
      showToast("🚨 [DFN] TEST ALERT: Whale sold 9.3 SOL");
    });

    // 🔥 Default token
    setToken("6FtbGaqgZzti1TxJksBV4PSya5of9VqA9vJNDxPwbonk");
  });
})();
