
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

---

### 🚀 Showcase Your Trust Score

You can display your DFN Trust Score directly on your website using our official widget. The badge has a transparent background and is available in two themes to ensure it looks great on any site.

### How to Add the Widget

Installation is a two‑step process:

#### **Step 1: Add the Widget Script**

Place the following `<script>` tag just before the closing `</body>` tag in your HTML file:

```html
<script src="https://dfn.wtf/badge.js" defer></script>
```

#### **Step 2: Place the Widget Element**

Paste this custom HTML element where you want the badge to appear. Use the `theme` attribute to match your site's background.

*For **dark** backgrounds (light text):*

```html
<dfn-trust-badge token="YOUR_TOKEN_ADDRESS_HERE" theme="dark"></dfn-trust-badge>
```

*For **light** backgrounds (dark text):*

```html
<dfn-trust-badge token="YOUR_TOKEN_ADDRESS_HERE" theme="light"></dfn-trust-badge>
```

> Replace `YOUR_TOKEN_ADDRESS_HERE` with your project's Solana token address.

---

### ⚙️ Customization Options

| Attribute | Required | Description | Options |
|-----------|----------|-------------|---------|
| `token`   | ✅       | The Solana address of the token to analyze. | *Any valid SPL address* |
| `theme`   | ❌       | Sets the badge text color scheme. | `dark` *(default)* / `light` |

---

### 🔧 Troubleshooting & Content Security Policy (CSP)

If the badge doesn't appear, it's likely blocked by your site's **Content Security Policy (CSP)**.

**Fix:** Add `https://dfn.wtf` to both `script-src` and `connect-src` directives.

_Examples for meta‑tags, NGINX, Apache, and Express/Helmet are identical to the full documentation._

---

<p align="center">
  Powered by the <a href="https://dfn.wtf">Department of Financial Nonsense</a><br/>
  <a href="https://dfn.wtf">Website</a> | <a href="https://x.com/IDK_DFN">Twitter</a>
</p>
