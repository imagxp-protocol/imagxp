# 🤖 Agent Implementation (IMAGXP)

## Step 1: The "Digital Passport" (One-Time Setup)
You need to prove you are `openai.com` (or your company).

**Run this command:**
```bash
npx imagxp generate-identity
```

**It gives you 2 things:**
1.  **A Public/Private Key Pair**: Save in `.env`. **NEVER SHARE THE PRIVATE KEY.**
    ```bash
    # .env
    IMAGXP_AGENT_ID="openai.com"
    IMAGXP_PRIVATE_KEY="MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEH..."
    IMAGXP_PUBLIC_KEY="MFKwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE..."
    ```

2.  **A Public File (ID Card)**: Save as `imagxp-agent.json`. Upload to `yoursite.com/.well-known/imagxp-agent.json`.
    ```json
    {
      "agent_id": "openai.com",
      "public_key": "MFKwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...",
      "contact_email": "security@openai.com",
      "version": "1.1"
    }
    ```

## Step 2: The "Universal" Crawler
This code works for **ANY** URL on the internet. You don't need a list.

```typescript
import { IMAGXPAgent } from '@imagxp/protocol';

// 1. Load your Identity
const agent = await IMAGXPAgent.init(); 

// 2. The Crawler Loop (Universal)
const queue = ["https://nytimes.com", "https://reddit.com", "https://blog.google"];

for (const url of queue) {
    // The SDK automatically checks: "Does this site speak IMAGXP?"
    // If YES -> It signs the request. If NO -> Standard fetch.
    const response = await agent.fetch(url, {
        purpose: "RAG_RETRIEVAL"
    });

    if (response.status === 200) {
        console.log(`[SUCCESS] Accessed ${url}.`);
        analyzeContent(response.data);
    } else {
        console.log(`[BLOCKED] ${url} refused access.`);
    }
}
```

## Step 3: The Quality Feedback Loop (The "Mutual" Deal)
**Scenario**: You paid for access, but the Publisher served "AI Slop" (Junk).
**Action**: You dispute the charge.

```typescript
function analyzeContent(content) {
    // 1. Run your Internal Quality Check
    const score = myAiDetector(content); // e.g., 0.1 (Spam)

    // 2. If it's Junk, Report it!
    if (score < 0.5) {
        // Send a "Signed Dispute" back to the Publisher
        await agent.sendFeedback(content.url, { 
            score: 0.1, 
            reason: "LOW_QUALITY_SPAM" 
        });
        
        console.log("Payment Refused: Quality too low.");
        // DO NOT TRIGGER PAYMENT
    } else {
        // Content is Good -> Trigger Payment (Handled by Broker automatically)
        payPublisher(0.01); 
    }
}
```
