(function () {
  const WS_URL = "wss://alerts.dfn.wtf/alerts"

  const mountPanel = () => {
    if (document.getElementById("dfn-patrol-panel")) return

    const panel = document.createElement("div")
    panel.id = "dfn-patrol-panel"
    panel.style = `
      position:fixed;bottom:20px;right:20px;
      background:#111;color:#f5d742;padding:12px 16px;
      border-radius:12px;font-weight:bold;z-index:9999;
      font-family:monospace;box-shadow:0 0 10px rgba(0,0,0,0.5);
    `
    panel.innerText = "🔍 DFN Patrol active"
    document.body.appendChild(panel)

    setTimeout(() => panel.remove(), 4000)
  }

  const showToast = (text) => {
    const toast = document.createElement("div")
    toast.style = `
      position:fixed;bottom:80px;right:20px;
      background:#222;color:#fff;padding:10px 14px;
      border-radius:8px;font-family:sans-serif;
      box-shadow:0 0 6px rgba(0,0,0,0.4);z-index:9999;
    `
    toast.innerText = text
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 5000)
  }

  const connect = (embed) => {
    const ws = new WebSocket(`${WS_URL}?embed=${embed}`)

    ws.onopen = () => {
      console.log("[Patrol] WS open")
      showToast("✅ DFN Patrol connected")
    }

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === "snapshot") {
          console.log("[Patrol] snapshot received", msg.data)
        } else if (msg.type === "alert") {
          showToast(`🚨 [DFN] ${msg.event}: ${msg.amount || ""}`)
          console.log("[Patrol] alert", msg)
        }
      } catch (err) {
        console.warn("Invalid message", e.data)
      }
    }

    ws.onclose = () => {
      console.warn("[Patrol] WS closed; retry")
      setTimeout(() => connect(embed), 3000)
    }

    ws.onerror = (err) => {
      console.error("[Patrol] WS error", err)
      ws.close()
    }
  }

  const setToken = (mint) => {
    console.log("[Patrol] setToken", mint)
    connect(mint)
  }

  // Init on load
  window.addEventListener("load", () => {
    console.log("DFN Patrol: initialized")
    mountPanel()

    const form = document.querySelector("#token-search")
    const input = document.querySelector("#token-input")
    if (form && input) {
      form.addEventListener("submit", (e) => {
        e.preventDefault()
        const val = input.value.trim()
        if (val.length > 0) setToken(val)
      })
    }

    // Test alert shortcut
    window.addEventListener("DFN_TEST_ALERT", () => {
      showToast("🚨 [DFN] TEST ALERT: Whale sold 9.3 SOL")
    })
  })
})()
