// patrol.js
console.log("[DFN Patrol] v4.9.1 initialized - WebSocket Handler");
let ws;

function connectToWebSocket(token) {
  if (!token) return;

  if (ws && ws.readyState < 2) {
      ws.close();
  }

  const scanButton = document.querySelector('#token-search button[type="submit"]');
  const panel = document.querySelector("dfn-patrol");

  ws = new WebSocket(`wss://dfn.wtf/api/?embed=${token}`);
  
  // --- NEW LINE ADDED HERE ---
  if(panel) panel.setWebSocket(ws); // Pass the WebSocket connection to the component

  const cleanup = () => {
      if (scanButton) {
          scanButton.disabled = false;
          scanButton.textContent = 'Scan';
      }
  };

  ws.addEventListener("message", (e) => {
      const data = JSON.parse(e.data);
      if (panel && data.type === "report") {
          customElements.whenDefined("dfn-patrol").then(() => {
              panel.setReport(data.data);
          });
      }
      // The component will now handle its own messages
  });

  ws.addEventListener("error", (e) => {
      console.error("WebSocket Error:", e);
      if (panel) {
          panel.setReport({ error: "Connection to analysis server failed." });
      }
      cleanup();
  });

  ws.addEventListener("close", cleanup);
}

document.querySelector("#token-search")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const scanButton = e.currentTarget.querySelector('button[type="submit"]');
  const visibleField = document.querySelector("#token-input");
  const hiddenField = document.getElementById('hidden-mint-address');

  const token = (hiddenField ? hiddenField.value : visibleField.value).trim();
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
  
  // Ensure the container exists before appending
  let patrolBlock = document.getElementById('patrol-block');
  if(!patrolBlock) {
      patrolBlock = document.createElement('section');
      patrolBlock.id = 'patrol-block';
      document.body.appendChild(patrolBlock); // Or a more specific container
  }
  patrolBlock.appendChild(newPanel);
  
  if (hiddenField) {
      hiddenField.remove();
  }

  connectToWebSocket(token);
});

document.addEventListener('DOMContentLoaded', () => {
    const initialPanel = document.querySelector("dfn-patrol");
    if (initialPanel && initialPanel.hasAttribute("embed")) {
        const initialToken = initialPanel.getAttribute("embed");
        if (initialToken) {
            const scanButton = document.querySelector('#token-search button[type="submit"]');
            if(scanButton) {
                scanButton.disabled = true;
                scanButton.textContent = 'Scanning...';
            }
            connectToWebSocket(initialToken);
        }
    }
});
