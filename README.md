# DFN Nonsense Patrol

🎛 A lightweight realtime crypto monitor panel for meme coins.
Includes:

- 🧱 `<dfn-patrol>` Web Component (UI)
- 🧠 `patrol.js` WebSocket client for live alerts
- 🦆 Built by the Department of Financial Nonsense

---

## 🔧 Usage

Add both scripts to your site:

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/dfnwtf/patrol@v1.1.9/dist/component.js"></script>
<script type="module" defer src="https://cdn.jsdelivr.net/gh/dfnwtf/patrol@v1.1.9/dist/patrol.js"></script>
```

Embed the panel:

```html
<dfn-patrol embed="YOUR_MINT_HERE"
            data-layout="full"
            data-tabs="overview,security,clusters"
            data-theme="dark"
            data-allow-pick>
</dfn-patrol>
```

---

## 📡 WebSocket Server

This client expects a WebSocket server that sends alerts like:

```json
{
  "type": "alert",
  "event": "Whale sold",
  "amount": "10.2 SOL"
}
```

Use Cloudflare Workers or your own backend.
