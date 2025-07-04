/* DFN Nonsense Patrol — Free‑Tier Widget (MVP)
   --------------------------------------------------
   ⚠️  This is an early scaffold to embed a DFN badge
   and pop‑up dashboard on any partner site.
   • Scope: FREE features only (price ticker, security snapshot,
     whale/bundle alerts, cluster count).
   • No external build step required — pure ES module (~15 KB once minified).
   • Upstream data delivered by Edge WS:  wss://edge.dfn.watch/alerts?embed=<ID>

   TODO (backend):
   ──────────────────────────────────────────────
   1. Create Supabase tables: projects, alerts, clusters.
   2. Cloudflare Worker streams Solana events via Helius/Jito
      → applies heuristics (whale >0.5% supply OR >3 SOL).
   3. Worker pushes typed JSON packets to client:
        {
          type: "price",    price, volume24h,
        }
        {
          type: "alert",    category:"whale-sell", amount, tx, ts,
        }
        {
          type: "snapshot", riskScore, jitPct, top5Pct, clusters,
        }
   4. Public HTTPS endpoint /project/<embedId> returns
      static JSON (name, logo, color, thresholds).
*/

(() => {
  /* Utility --------------------------------------------------------- */
  const cssURL = "https://cdn.dfn.watch/patrol.css";
  function loadCSS() {
    if (document.getElementById("dfnPatrolCSS")) return;
    const link = document.createElement("link");
    link.id = "dfnPatrolCSS";
    link.rel = "stylesheet";
    link.href = cssURL;
    document.head.append(link);
  }

  function createSVG(theme) {
    const svg = `<svg viewBox='0 0 24 24' width='24' height='24' fill='none' stroke='${theme==="light"?"#000":"#ffd447"}' stroke-width='1.8'><path d='M12 2l7 4v4c0 5-3 9-7 12-4-3-7-7-7-12V6l7-4Z'/></svg>`;
    const span = document.createElement("span");
    span.innerHTML = svg;
    span.style.display = "inline-block";
    return span;
  }

  /* Core class ------------------------------------------------------ */
  class DFNPatrol {
    constructor(el) {
      this.el = el;
      this.id = el.getAttribute("embed");
      this.theme = el.dataset.theme || "dark";
      this.position = el.dataset.position || "br";
      this.hover = el.dataset.hover === "open";
      this.state = { open: false };
      this.mount();
    }

    mount() {
      this.badge = createSVG(this.theme);
      this.badge.className = "dfn-badge";
      this.badge.title = "Under DFN Surveillance";
      this.el.replaceWith(this.badge);
      loadCSS();

      const onOpen = () => this.toggle(true);
      if (this.hover) {
        this.badge.addEventListener("mouseenter", onOpen);
      } else {
        this.badge.addEventListener("click", onOpen);
      }
    }

    toggle(force) {
      if (this.state.open && !force) return;
      this.state.open = true;
      this.renderModal();
      this.connect();
    }

    renderModal() {
      this.modal = document.createElement("div");
      this.modal.className = "dfn-modal";
      this.modal.innerHTML = `
        <div class="dfn-modal-box">
          <header>
            <h3>DFN Patrol</h3>
            <button>&times;</button>
          </header>
          <section id="overview">Loading…</section>
          <section id="alerts" style="display:none"></section>
        </div>`;
      document.body.append(this.modal);
      this.modal.querySelector("button").onclick = () => {
        this.modal.remove();
        this.state.open = false;
        if (this.ws) this.ws.close();
      };
    }

    connect() {
      fetch(`https://edge.dfn.watch/project/${this.id}`)
        .then(r => r.json())
        .then(cfg => {
          this.cfg = cfg;
          this.updateOverview(cfg);
          this.ws = new WebSocket(`wss://edge.dfn.watch/alerts?embed=${this.id}`);
          this.ws.onmessage = evt => this.onPacket(evt.data);
        })
        .catch(console.error);
    }

    onPacket(msg) {
      try {
        const p = JSON.parse(msg);
        if (p.type === "price") this.updateOverview(p);
        else if (p.type === "alert") this.pushAlert(p);
        else if (p.type === "snapshot") this.updateSecurity(p);
      } catch (e) {
        console.warn("DFN packet error", e);
      }
    }

    updateOverview({ price, volume24h }) {
      const box = this.modal.querySelector("#overview");
      box.innerHTML = `<b>Price:</b> ${price ?? "-"}<br><b>24 h vol:</b> ${volume24h ?? "-"}`;
    }

    pushAlert(a) {
      const wrap = this.modal.querySelector("#alerts");
      if (wrap.style.display === "none") wrap.style.display = "block";
      const li = document.createElement("div");
      li.className = `alert ${a.category}`;
      li.textContent = `${new Date(a.ts).toLocaleTimeString()} — ${a.category.replace(/-/g,' ')} ${a.amount}`;
      wrap.prepend(li);
    }

    updateSecurity(snap) {
      const box = this.modal.querySelector("#overview");
      box.insertAdjacentHTML('beforeend', `<br><b>Risk:</b> ${snap.riskScore}\n`);
    }
  }

  /* boot ------------------------------------------------------------- */
  window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("dfn-badge[embed]").forEach(el => new DFNPatrol(el));
  });
})();
