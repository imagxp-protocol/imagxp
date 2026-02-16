# IMAGXP Broker Service (The "Visa" Authority)

> 💰 **Business Opportunity:** This component is the foundation for a "Stripe for AI Agents" SaaS business.

## What is a Broker?

In the IMAGXP protocol, a **Broker** is a trusted third-party "Clearing House" that connects **AI Agents** (Buyers) with **Web Publishers** (Sellers).

Instead of an Agent implementing 1,000 different payment methods for 1,000 different websites, they pay the **Broker** once. The Broker then issues a cryptographic "Visa" (a signed JWT) that the Agent presents to Publishers to gain access.

### The Problem it Solves
1.  **For Agents:** One monthly bill instead of micro-managing payments for every single website they crawl.
2.  **For Publishers:** Guaranteed income from a trusted source without maintaining their own complex payment infrastructure.
3.  **For the Ecosystem:** Reduces friction, allowing instant access to premium content.

## 🏗️ Technical Architecture

The Broker Service has two main responsibilities:

1.  **Trust Endpoint (`/.well-known/jwks.json`)**
    *   Hosts the Public Keys that Publishers use to verify the "Visas".
    *   Publishers add this URL to their `IMAGXP` config.

2.  **Issuance Endpoint (`/issue-visa`)**
    *   Accepts payment from an Agent (e.g., via Stripe, Crypto, or Credits).
    *   Generates a **Signed JWT** (the "Visa") containing:
        *   `iss`: The Broker's Domain (e.g., `broker.imagxp.network`)
        *   `aud`: The Target Publisher (e.g., `nytimes.com`)
        *   `amount`: The value transferred.
    *   Signs it with the Broker's **Private Key**.

## 🚀 SaaS Startup Idea: "The Universal AI Pass"

**Pitch:** Build the centralized reliable broker that everyone trusts.

**MVP Features:**
1.  **Dashboard:** Allow Agents to buy "Credits".
2.  **API:** An endpoint where Agents request a Visa for a specific URL.
3.  **Settlement:** Automatically payout Publishers at the end of the month based on the Visas they accepted.

**Revenue Model:**
*   Take a small % fee on every transaction (like Visa/Mastercard).
*   Offer "Enterprise SSO" for AI companies (OpenAI/Google) to access the entire web.

## Running the Reference Implementation

The `example-server.ts` file provides a minimal, working example of a Broker.

### 1. Setup
```bash
npm install express jose @imagxp/protocol
```

### 2. Run
```bash
# Uses ts-node
npx ts-node example-server.ts
```

### 3. Test
Send a POST request to simulated payment:

```bash
curl -X POST http://localhost:3000/issue-visa
```

**Response:**
```json
{
  "token": "eyJhbGciOiJFUzI1NiIs...",
  "header_name": "x-imagxp-credential"
}
```

The Agent then adds this token to their request headers:
`x-imagxp-credential: eyJhbGciOiJFUzI1NiIs...`
