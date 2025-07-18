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

### ✨ What is Nonsense Patrol?

**Nonsense Patrol** is a comprehensive token analysis service developed by the Department of Financial Nonsense. Our mission is to bring clarity to a chaotic ecosystem by providing traders and investors with the tools they need to perform quick and effective due diligence on Solana tokens.

The scanner combines on-chain data, market statistics, and security checks to generate a single, easy-to-understand **Trust Score**, helping users identify potential risks before they invest.

### 🛡️ Key Analysis Features

Nonsense Patrol evaluates tokens across several key vectors to determine its Trust Score:

* **Smart Contract Security**: Checks for critical contract-level risks, such as whether the mint authority has been renounced, if a freeze authority exists, or if the token's metadata is mutable.
* **Liquidity Health**: Determines if the token's liquidity pool (LP) is burned, locked, or remains unlocked (a major red flag).
* **Holder Distribution**: Analyzes the concentration of top holders (whales) after filtering out exchange and protocol-owned wallets to reveal the true ownership structure.
* **Threat Intelligence**: Scans the token creator's wallet and top holder wallets against a database of known hackers and scammers.
* **Price Impact Simulation**: Simulates the potential market cap collapse if the largest holders were to sell their tokens, giving insight into the token's stability.

---

### 🚀 Showcase Your Trust Score

Are you a project developer and confident in your token's security? You can display your DFN Trust Score directly on your website using our official widget. It's a simple way to build community trust and show that you're committed to transparency.

**Widget Demo:**
![DFN Trust Score Badge Example](https://i.imgur.com/83pL8G3.png)

#### How to Add the Widget to Your Site

It's incredibly simple. All you need to do is copy the HTML snippet below and paste it where you want the badge to appear on your webpage.

```html
<iframe
  src="[https://dfn.wtf/badge?token=YOUR_TOKEN_ADDRESS_HERE](https://dfn.wtf/badge?token=YOUR_TOKEN_ADDRESS_HERE)"
  style="width: 240px; height: 80px; border: none; overflow: hidden;"
  title="DFN.WTF Trust Score"
></iframe>
