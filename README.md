
<p align="center">
  <img src="https://dfn.wtf/DFN_logo_IDK_center.png" alt="DFN Logo" width="150"/>
</p>

<h1 align="center">DFN Nonsense Patrol</h1>

<p align="center">
  <strong>A free, instant security scanner and risk analysis tool for Solana tokens.</strong>
  <br />
  <br />
  <a href="https://dfn.wtf/patrol">
    <img src="https://img.shields.io/badge/service-online-success.svg" alt="Service Status">
  </a>
  <a href="https://github.com/dfnwtf/patrol">
    <img src="https://img.shields.io/badge/platform-Solana-blueviolet.svg" alt="Platform">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  </a>
</p>

---

### ✨ About The Project

**Nonsense Patrol** is a comprehensive token analysis service developed by the Department of Financial Nonsense. Our mission is to bring clarity to a chaotic ecosystem by providing traders and investors with the tools they need to perform quick and effective due diligence on Solana tokens.

The scanner combines on-chain data, market statistics, and security checks to generate a single, easy-to-understand **Trust Score**, helping users identify potential risks before they invest.

### 🛡️ Key Analysis Features

Nonsense Patrol evaluates tokens across several key vectors to determine its Trust Score:

* **Smart Contract Security** – Checks for critical contract-level risks, such as whether the mint authority has been renounced, if a freeze authority exists, or if the token's metadata is mutable.  
* **Liquidity Health** – Determines if the token's liquidity pool (LP) is burned, locked, or remains unlocked (a major red flag).  
* **Holder Distribution** – Analyzes the concentration of top holders (whales) after filtering out exchange and protocol-owned wallets to reveal the true ownership structure.  
* **Threat Intelligence** – Scans the token creator's wallet and top holder wallets against a database of known hackers and scammers.  
* **Price Impact Simulation** – Simulates the potential market cap collapse if the largest holders were to sell their tokens, giving insight into the token's stability.

---

### 🚀 Showcase Your Trust Score

Are you a project developer and confident in your token's security? You can display your DFN Trust Score directly on your website using our official widget. It's a simple way to build community trust and show that you're committed to transparency.

**Widget Demo:**  
![DFN Trust Score Badge Example](https://dfn.wtf/badge_demo.png)

### How to Add the Widget to Your Site

We use a modern Web Component for a simple and secure integration. Installation is a two-step process:

#### Step 1: Add the Widget Script

Place the following `<script>` tag just before the closing `</body>` tag in your HTML file. This only needs to be done once per page.

```html
<script src="https://dfn.wtf/badge.js" defer></script>
```

#### Step 2: Place the Widget Element

Paste this custom HTML element where you want the widget to appear in your site's layout.

```html
<dfn-trust-badge token="YOUR_TOKEN_ADDRESS_HERE"></dfn-trust-badge>
```

Remember to replace `YOUR_TOKEN_ADDRESS_HERE` with your project's Solana token address.

---

### 🔧 Troubleshooting & Content Security Policy (CSP)

If the widget doesn't appear on your page, it is most likely being blocked by a Content Security Policy (CSP) on your server. This is a standard security feature built into modern websites, not a bug in the widget.

**The Fix:** Explicitly allow your website to load and execute the widget script from our domain and allow it to make API calls. This is done by adding `https://dfn.wtf` to the `script-src` and `connect-src` directives in your site's CSP header.

#### Configuration Examples

Choose the one that applies to your project.

1. **HTML Meta Tag (for static sites)**

   ```html
   <meta http-equiv="Content-Security-Policy" content="script-src 'self' https://dfn.wtf; connect-src 'self' https://dfn.wtf;">
   ```

2. **NGINX**

   ```nginx
   add_header Content-Security-Policy "script-src 'self' https://dfn.wtf; connect-src 'self' https://dfn.wtf;";
   ```

3. **Apache**

   ```apache
   Header set Content-Security-Policy "script-src 'self' https://dfn.wtf; connect-src 'self' https://dfn.wtf;"
   ```

4. **Node.js (Express + Helmet)**

   ```js
   const helmet = require('helmet');

   app.use(
     helmet.contentSecurityPolicy({
       directives: {
         ...helmet.contentSecurityPolicy.getDefaultDirectives(),
         "script-src": ["'self'", "https://dfn.wtf"],
         "connect-src": ["'self'", "https://dfn.wtf"],
       },
     })
   );
   ```

> **Note:** If you already have a CSP, merge our domain with your existing directives instead of replacing them.

---

<p align="center">
  Powered by the <a href="https://dfn.wtf">Department of Financial Nonsense</a>
</p>
