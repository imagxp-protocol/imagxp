
# ⚡ IMAGXP: The Identity Monetization Auto Governance Exchange Protocol

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Status: Stable](https://img.shields.io/badge/Status-Stable-green.svg)](https://imagxp.dev)
[![Spec: v1.2](https://img.shields.io/badge/Spec-v1.2-blue.svg)](./spec/v1.2.md)

**IMAGXP** is the open standard for the AI-Web Economy.

As AI Chatbots replace traditional web traffic, the **AdSense model is collapsing**, threatening the future of the open web. IMAGXP restores **Ecosystem Balance** by replacing the adversarial "Scraping War" with a cryptographic, automated handshake grounded in **Identity, Monetization, and Governance**. It ensures **Publishers** are paid and **Agents** get clean data.
**🌐 Website:** [https://imagxp.com](https://imagxp.com)

---

## 🏛️ The Architecture

The web is currently broken. Agents scrape for free, and Publishers block them violently. IMAGXP solves this deadlock by introducing a **Transactional Peace Treaty**:

1.  **Identity** (Anti-Spoofing): Agents sign requests. Publishers verify them via DNS.
2.  **Monetization** (The Broker): Zero-friction micro-payments ($0.001) for clean data.
3.  **Governance** (The Rules): Publishers set strict policies (No Training, RAG Only), while Agents enforce **Quality Standards** (No SEO Spam, No AI Slop) to ensure a fair and valuable exchange.

[📖 Read the Architecture Deep Dive](./docs/ARCHITECTURE.md) | [❓ Why IMAGXP?](./docs/WHY_IMAGXP.md)

---

## 🚀 Usage Snippets

> **Note:** These are minimal snippets to demonstrate the API. For a complete, running production setup, please read the [Official Installation Guide](./installation/INSTALLATION.md).

Follow this exact order to build the full loop.

### 1. The Agent (The Visitor)
*Goal: Crawl the web legally and get High-Quality JSON.*

```bash
npm install @imagxp/protocol
```

```typescript
import { IMAGXPAgent } from '@imagxp/protocol';

// 1. Generate Identity (One time)
// npx imagxp generate-identity

// 2. Start Crawling
const agent = await IMAGXPAgent.init();
const response = await agent.fetch("https://nytimes.com", { 
    purpose: "RAG_RETRIEVAL" 
});
```

### 2. The Broker (The Bank) - *Optional*
*Goal: Issue "Visas" (Auth Tokens) to Agents. Required only for centralized clearing; P2P payments can skip this.*

```typescript
import { SignJWT } from 'jose';
import { HEADERS, IMAGXP_VERSION } from '@imagxp/protocol';

// Agent pays you $1M -> You issue this Token
const token = await new SignJWT({ payment_status: "paid", ver: IMAGXP_VERSION })
  .setProtectedHeader({ alg: 'ES256' })
  .setIssuer('https://broker.imagxp.network')
  .setAudience('https://nytimes.com')
  .sign(BROKER_PRIVATE_KEY);
```

### 3. The Publisher (The Host)
*Goal: Block scraper bots, accept AAMP Agents, and get paid.*

```typescript
// src/middleware.ts
import { IMAGXPNext } from '@imagxp/protocol';

const imagxp = IMAGXPNext.init({
  policy: {
    requireIdentityBinding: true,  // 1. Anti-Spoofing (Security)
    monetization: {
      brokerUrl: "https://broker.imagxp.network" // 2. Enable Payments (Optional)
    }
  }
});

// Protect your "Premium" routes
export const middleware = imagxp.withProtection();
```

> **need the full code?** Check the [installation/](./installation/) folder.

---

## 📚 Documentation Index

| Topic | Description | Link |
| :--- | :--- | :--- |
| **Setup** | The Official Installation Guide | [INSTALLATION.md](./installation/INSTALLATION.md) |
| **Spec** | The Technical Specification (v1.2) | [spec/v1.0.md](./spec/v1.0.md) |
| **Logic** | System Architecture & Security | [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) |
| **Mission** | The Rationale & Market Analysis | [docs/WHY_IMAGXP.md](./docs/WHY_IMAGXP.md) |

---

**License**: Apache 2.0. Free for everyone forever. IMAGXP is a Protocol, not a Startup.
