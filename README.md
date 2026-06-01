
<p align="center"> 
  <img src="https://dfn.wtf/DFN_logo_IDK_center.png" alt="DFN Logo" width="150"/>
</p>

<h1 align="center">DFN Nonsense Patrol</h1>

<p align="center">
  <strong>A free, instant security scanner and risk analysis tool for Solana tokens.</strong>
  <br /><br />
  <a href="https://dfn.wtf/patrol">
    <img src="https://img.shields.io/badge/service-online-success.svg" alt="Service Status">
  </a>
  <a href="https://dfn.wtf/patrol">
    <img src="https://img.shields.io/badge/demo-dfn.wtf%2Fpatrol-blue.svg" alt="Live demo">
  </a>
  <a href="https://github.com/dfnwtf/patrol">
    <img src="https://img.shields.io/badge/platform-Solana-blueviolet.svg" alt="Platform">
  </a>
  <a href="https://opensource.org/license/mit">
    <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  </a>
</p>

---

### ✨ About The Project

**Nonsense Patrol** is a comprehensive token analysis service developed by the **Department of Financial Nonsense**.  
Our mission is to bring clarity and transparency to the chaotic and often unpredictable ecosystem of digital assets.  
We provide traders, investors, and project developers with powerful tools for quick and effective due diligence on Solana tokens.

The scanner collects and analyzes dozens of parameters in real‑time - from smart‑contract characteristics to market data and holder activity - to generate a single, easy‑to‑understand security rating: the **Trust Score**.  
Our goal is to help users make informed decisions and avoid potential risks.

---

### 🛡️ Key Analysis Features

Nonsense Patrol evaluates tokens across several key vectors to determine its Trust Score:

* **Smart Contract Security** – Checks for critical contract‑level risks: mint authority renounced, freeze authority, mutable metadata, etc.  
* **Liquidity Health** – Detects whether the liquidity pool (LP) is burned, locked, or left unlocked (major red flag).  
* **Holder Distribution** – Reveals the real ownership structure by filtering exchange and protocol wallets before calculating whale concentration.  
* **Threat Intelligence** – Scans the creator and top holders against a database of known scammers and exploiters.  
* **Price Impact Simulation** – Estimates potential market‑cap collapse if the largest holders decide to sell.

---

### 🚀 Showcase Your Trust Score

Confident in your token’s security? Display your DFN Trust Score on your site with our official widget.  
It ships with a transparent background and two color themes so it looks sharp on any design.

---

### 🛠️ How to Add the Widget

We ship a modern **Web Component** for quick, secure integration. Two easy steps:

#### Step 1 - Add the Widget Script

Insert this just before `</body>` (only once per page):

```html
<script src="https://dfn.wtf/badge.js" defer></script>
```

#### Step 2 - Place the Widget Element

Add the custom element where you want the badge to appear.  
Choose `theme="dark"` for dark backgrounds (light text) or `theme="light"` for light backgrounds (dark text).

```html
<!-- Dark theme -->
<dfn-trust-badge token="YOUR_TOKEN_ADDRESS_HERE" theme="dark"></dfn-trust-badge>

<!-- Light theme -->
<dfn-trust-badge token="YOUR_TOKEN_ADDRESS_HERE" theme="light"></dfn-trust-badge>
```

> Replace `YOUR_TOKEN_ADDRESS_HERE` with your project’s SPL token address.

#### Customization Options

| Attribute | Required | Description | Options |
|-----------|----------|-------------|---------|
| `token`   | ✅       | Solana address of the token to analyze. | any SPL address |
| `theme`   | ❌       | Color scheme of the badge. | `dark` (default) / `light` |

---

### 🔧 Troubleshooting & Content Security Policy (CSP)

If the widget doesn’t render, your site’s **CSP** may be blocking it.

**Fix:** add `https://dfn.wtf` to both `script-src` and `connect-src` directives.

##### CSP Configuration Examples

<details>
<summary>Static site meta‑tag</summary>

```html
<meta http-equiv="Content-Security-Policy" content="script-src 'self' https://dfn.wtf; connect-src 'self' https://dfn.wtf;">
```
</details>

<details>
<summary>NGINX</summary>

```nginx
add_header Content-Security-Policy "script-src 'self' https://dfn.wtf; connect-src 'self' https://dfn.wtf;";
```
</details>

<details>
<summary>Apache (.htaccess)</summary>

```apache
Header set Content-Security-Policy "script-src 'self' https://dfn.wtf; connect-src 'self' https://dfn.wtf;"
```
</details>

_Note: If you already have a CSP, merge these domains with your existing directives._

---

Distributed under the MIT License. See <a href="https://opensource.org/license/mit">LICENSE</a> for full text.

---

<p align="center">
  Powered by the <a href="https://dfn.wtf">Department of Financial Nonsense</a><br/>
  <a href="https://dfn.wtf">Website</a> | <a href="https://x.com/IDK_DFN">Twitter</a>
</p>
