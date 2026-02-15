# @imagxp/protocol

The official TypeScript reference implementation of the **Identity Monetization Auto Governance Exchange Protocol (IMAGXP)**.

IMAGXP is an open standard that enables "Transactional Content Negotiation" between AI Agents and Web Publishers, replacing `robots.txt` with cryptographic signatures and micro-payments.

**Keywords:** `imagxp`, `aamp`, `protocol`, `ai agent`, `web monetization`, `content negotiation`, `rag`, `llm`, `crawler`, `publisher tool`

**Website:** https://imagxp.com (Coming Soon)  
**Repository:** [GitHub](https://github.com/imagxp-protocol/imagxp)

## 📦 Installation

```bash
npm install @imagxp/protocol
# Optional: Install 'jose' for crypto signing if you are building a custom implementation
npm install jose
```

## 🚀 Usage

### 1. For AI Agents (Clients)

Use `IMAGXPAgent` to crawl websites with automatic protocol negotiation.

```typescript
import { IMAGXPAgent } from '@imagxp/protocol';

async function main() {
    // 1. Initialize Identity (Loads from IMAGXP_PRIVATE_KEY env var)
    const agent = await IMAGXPAgent.init();

    // 2. Fetch URL (Automatically signs request if IMAGXP is detected)
    const response = await agent.fetch('https://example.com/article', {
        purpose: 'RAG_RETRIEVAL'
    });

    if (response.status === 200) {
        console.log('Success:', response.data);
    } else {
        console.error('Blocked:', response.status);
    }
}
```

### 2. For Publishers (Next.js Middleware)

Use `IMAGXPNext` to protect your routes.

```typescript
// src/middleware.ts
import { IMAGXPNext } from '@imagxp/protocol';
import { NextResponse } from 'next/server';

const imagxp = IMAGXPNext.init({
    meta: {
        origin: 'HUMAN',
        paymentPointer: '$wallet.example.com'
    },
    policy: {
        // Security: Verify DNS Binding
        requireIdentityBinding: true, 
        
        // Economics: Connect to Broker
        monetization: {
            brokerUrl: "https://broker.imagxp.network"
        }
    }
});

// Create the middleware handler
export const middleware = imagxp.withProtection(async (req) => {
    return NextResponse.next();
});

export const config = {
    matcher: ['/api/premium/:path*', '/articles/:path*']
};
```

## 🔑 Key Features

- **Zero Dependencies:** The core logic is dependency-free.
- **Isomorphic:** Works in Node.js, Edge Runtime (Vercel/Cloudflare), and Browsers.
- **Cryptographically Secure:** Implements ECDSA P-256 signatures and JSON Web Tokens.
- **Type Safe:** Written in strict TypeScript with full definition files included.

## 📚 API Reference

### `IMAGXPAgent`
- `init(options?)`: Create a new agent instance.
- `fetch(url, options)`: IMAGXP-aware fetch wrapper.
- `sendFeedback(url, feedback)`: Send Quality/Spam reports.

### `IMAGXPNext` (Adapter)
- `init(config)`: Configure the Publisher Policy Engine.
- `withProtection(handler)`: Wrap a Next.js Middleware or Route Handler.

## 📄 License

Apache 2.0

By the IMAGXP Community.
