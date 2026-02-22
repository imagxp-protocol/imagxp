
# 🛠️ IMAGXP Protocol: The Official Setup Guide (v1.1)

**Real. Verified. Universal.**
This guide serves as the absolute source of truth. It combines the "Universal Trust" vision with the strict technical implementation (SDK 1.1.8).

---

## 🌍 IMAGXP Global Standard: The "Universal Trust" Model
*The Vision: "Connect, Verify, Decide"*

We replace manual allowlists with **Automated Protocols**.
*   **AI Agents** automatically detect if a site uses IMAGXP.
*   **Publishers** automatically verify the Agent's "Digital Passport" (DNS Binding).
*   **Strict Rules** are applied *after* identity is proven.

### 1. How it works "In the Wild" (The Automatic Flow)

**Scenario**: OpenAI Bot visits "New York Times" (AAMP-Enabled)

#### Step A: Discovery (The Handshake)
*   **Action**: The OpenAI Bot tries to visit `nytimes.com`.
*   **Detection**: The Bot sees a Signal (in `robots.txt` or a Header) saying: *"I speak IMAGXP."*
*   **Result**: The Bot switches from "Scraper Mode" to "Polite IMAGXP Mode" and prepares its Digital Passport.

#### Step B: Identity (The Passport Check)
*   **Action**: The Bot sends a request signed with its Private Key.
*   **Publisher Check**: The Publisher asks: *"Is this REALLY OpenAI, or a hacker?"*
*   **Verification**: The Publisher checks `openai.com/.well-known/imagxp-agent.json`.
    *   **Success**: The Key matches. This **IS** OpenAI.
    *   **Fail**: The Key doesn't match. It's a Fake. **BLOCK**.
*   **Note**: No manual list needed. If you own the domain, you are trusted as "Real".

#### Step C: The Rules (The Visa Check)
Now that we know it's OpenAI, we check the Publisher's Terms:
*   **If Policy = "No Training"**: Publisher says *"You are Real, but I don't assume training."* -> **BLOCK**.
*   **If Policy = "Pay Me"**: Publisher says *"You are Real. Where is the money?"* -> **CHECK WALLET**.
*   **If Policy = "Show Ads"**: Publisher says *"You are Real. Did you show my ads?"* -> **CHECK PROOF**.

#### Step D: The Reward (HQ Content)
*   **Action**: All checks passed.
*   **Result**: The Publisher serves the **High-Quality JSON** (Clean text, perfect structure).
*   **Why**: This is better data than scraping HTML. The Agent gets better intelligence; the Publisher gets paid/attribution.

---

## 🚀 2. The Setup (Zero-Boilerplate Vision)
*Goal: Install once, handle millions of agents automatically.*

**For Publishers (The Hosts)**
Goal: Install once, handle millions of agents automatically.

**For Agents (The Visitors)**
Goal: Scrape the web politely. Access High-Quality Data.

---

## 👩‍💻 Part 3: Publisher Technical Implementation (The "How")
**What you need:**
*   `@imagxp/protocol`: The Logic Engine.
*   `jose`: **Why?** It handles the sophisticated "JSON Web Signatures" (JWS) needed for the court-proof logging.
*   `uuid`: **Why?** Creates unique Trace IDs for every single request so you can debug "that one time it failed".

### Step 1: Install
```bash
npm install @imagxp/protocol
npm install jose uuid
```

### Step 1.5: Environment Variables (.env)
Create a `.env` file in your root directory. This ensures your Publisher Identity is persistent.

```bash
# .env
# 1. Your Publisher Identity (Generate via `npx imagxp generate-identity`)
IMAGXP_PRIVATE_KEY="MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEH..."
IMAGXP_PUBLIC_KEY="MFKwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE..."
```

### Step 2: The Gatekeeper (`src/middleware.ts`)
This code acts as a "Bouncer". It intercepts requests and runs the flow described above (Steps A-C).

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import { IMAGXPNext } from '@imagxp/protocol';

// Initialize the Protocol Engine
const imagxp = IMAGXPNext.init({
    meta: { 
        origin: 'HUMAN',             // Claim: "My content is human-written" 
        paymentPointer: '$wallet'    // Your direct payment address
    },
    policy: {
        // [SECURITY] STRICT IDENTIFICATION
        // Stops "Fake DNS" spoofing. We verify the Agent's Public Key matches their Domain.
        requireIdentityBinding: true, 

        // [ECONOMICS]
        requiresPayment: true,       // "Agents must pay or get blocked"
        
        // [PERMISSIONS]
        allowTraining: false,        // "Block Scrapers"
        allowRAG: true               // "Allow Search Engines"
    },
    strategy: 'HYBRID'               // "Allow Humans (Browsers) + Verified Agents"
});

// Protect specific routes (e.g. /posts, /articles)
export async function middleware(req) {
    if (req.nextUrl.pathname.startsWith('/posts')) {
        return imagxp.withProtection(async (req) => NextResponse.next())(req);
    }
    return NextResponse.next();
}
```

### Step 3: The Dashboard (Admin Only)
**Warning**: This dashboard contains Sensitive Logs. You **MUST** protect it.
*   **Safety**: Use Basic Auth or your existing Login system.
*   **Legal Proof**: The logs shown here prove *exactly* who accessed your data, signed with their private key.

*(Note: The Dashboard UI is auto-generated by the SDK at `/imagxp/dashboard` if configured).*

---

## 🤖 Part 4: Agent Technical Implementation (The "How")

### Step 1: The "Digital Passport" (One-Time Setup)
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

### Step 2: The "Universal" Crawler
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

---

## 💎 Part 5: The Quality Feedback Loop (The "Mutual" Deal)
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

---

## 📜 Part 6: The "Story Logs" (What you see in Dashboard)

### Story A: The "Real Deal"
> `[🔍 DISCOVERY]` IMAGXP-Enabled Visitor detected.
> `[🆔 IDENTITY]` Claimed ID: "perplexity.ai"
> `[✅ PASSED]` **Identity Verified**. This is really Perplexity.
> `[📜 RULES]` Checking Policy: "Payment Required".
> `[💰 WALLET]` Payment of $0.01 Received.
> `[🔓 ACCESS]` **GRANTED**. Serving High-Quality JSON.

### Story B: The "Fake" (Hacker)
> `[🔍 DISCOVERY]` IMAGXP-Enabled Visitor detected.
> `[🆔 IDENTITY]` Claimed ID: "openai.com"
> `[🔐 CHECK]` Verifying Signature...
> `[❌ FAILED]` **FAKE ID DETECTED**. Only the real OpenAI has the key. You are an imposter.
> `[⛔ ACTION]` **BLOCKED**.

### Story C: The "Junk" Publisher
> `[✅ IDENTITY]` Verified "google.com".
> `[🔓 ACCESS]` **GRANTED**. Served Article.
> `[📢 FEEDBACK]` Received Feedback from Google...
> `[⚠️ ALERT]` **Quality Score: 0.1/10**. Reason: "Spam".
> `[💰 WALLET]` Payment **REFUSED**.

---

## 🔐 Part 7: Security & Law Q&A

**Q: Is the Dashboard Public?**
A: **No.** It is Admin Only. Use your standard auth to protect the route `src/app/api/logs`.

**Q: How do I prove "It Wasn't Me" in court?**
A: **The Signature.** Every request in the log is signed with a Private Key. Since ONLY the owner has the Private Key, they cannot deny sending it. This is called "Non-Repudiation".

**Q: Does the Publisher see my Private Key?**
A: **Never.** They only see the Public Key (The Lock). Your Secret stays on your server.

---

## ⚖️ Part 8: The Conflict Protocol (Key Changes & Court)
**Scenario**: An Agent (e.g. OpenAI) changes their key today, then claims in court that they never signed the requests from last month.

**The "Snapshot Defense": How You Win**
Even if they change their key in the `.env` file, they cannot change the history of the internet.

1.  **The Public Record**: The file `/.well-known/imagxp-agent.json` is public. It is archived by:
    *   **The Internet Archive (Wayback Machine)**
    *   **Google Cache**
    *   **Common Crawl**
2.  **The Proof**:
    *   **You show the Log**: "On Jan 25th, this request was signed by Key A."
    *   **You show the Archive**: "On Jan 25th, OpenAI.com was hosting Key A."
    *   **Verdict**: It matches. They are liable.

**Note**: This effectively makes the `.well-known` file a "Public Ledger Entry" that is timestamped by the entire internet infrastructure.

---

## 📊 Part 9: Data Retention Strategy (Costs & Compliance)

**For Small Publishers (Low Cost)**
*   **Strategy**: "Ephemeral Logs".
*   **Cost**: $0.
*   **How**: Rely on Vercel/Netlify Logs (kept for 1-7 days). This is enough to check "Who scraped me yesterday?".
*   **IP Compliance**: The `middleware.ts` logs `req.ip` to the hosting provider's console automatically.

**For Enterprise (High Compliance)**
*   **Strategy**: "Log Shipping".
*   **Cost**: Database Storage Fees.
*   **How**: Modify your `src/app/api/logs/stream/route.ts` to `INSERT` logs into PostgreSQL/S3.
*   **Why**: Required for 7-year audit trails in regulated industries.

---

## 📂 Part 10: Clean Project Structure
**"Where does the code go?"**
In a standard Next.js app, AAMP adds exactly **3 files**.

```text
my-web-app/
├── .env                  <-- API Keys (Private Key)
├── public/
│   └── .well-known/
│       └── imagxp-agent.json  <-- Identity File (Part 1)
├── src/
│   ├── middleware.ts        <-- The Gatekeeper (Part 2)
│   └── app/
│       └── api/
│           └── logs/
│               └── stream/
│                   └── route.ts  <-- The Logs (Part 3)
```

---

## 🏦 Part 11: Monetization (The Broker Setup)
*aka "AdSense for Data"*

**Why a Broker?**
*   OpenAI doesn't want to send 1,000 invoices for $0.01.
*   You don't want to chase 1,000 companies for $0.01.
*   **The Broker** pools the money and handles the "Bond".

**How it Works (The "Bond" Model)**
1.  **Deposit**: OpenAI deposits $1M into the Broker (The Bond).
2.  **Token**: Broker gives OpenAI a cryptographic "Visa" (JWT).
3.  **Visit**: OpenAI visits your site and shows the "Visa".
4.  **Payment**: You verify the Visa (using IMAGXP SDK). The Broker automatically moves $0.01 to your account.

**How to Setup? (One-Line Config)**
In your `src/middleware.ts` initialization:

```typescript
const imagxp = IMAGXPNext.init({
    policy: {
        monetization: {
            brokerUrl: "https://broker.imagxp.network" // Just add this line!
        }
    }
});
```
*Note: The SDK automatically fetches trust keys from the Broker relative to this URL.*

### 💰 Q&A: Making Money Strategies

**Q: Why not just use "Google AdSense"?**
A: **It's impossible (right now).** Google AdSense relies on "User Clicks" and "Viewability". Bots don't have eyes and they don't click banners. Until Google updates their API for "Data Feeds", the Broker Model (Direct Payment) is the only way.

**Q: Can someone steal the Broker idea? (Open Source Risk)**
A: **They can copy the code, but not the business.**
*   A Broker is about **Liquidity**. The first broker to sign up `nytimes.com` wins.
*   **The Moat**: If OpenAI wants `nytimes.com`, they *must* use the Broker that has the contract.
*   **License**: The Protocol is MIT (Free). The Broker Platform (SaaS) is Proprietary.

**Q: How do we monetize immediately?**
A: **The "Spotify Model" (Data Pools).**
*   Instead of "Pay Per Click", OpenAI pays the Broker a flat fee (e.g., $10k/month).
*   The Broker distributes it to publishers based on "Usage Share" (recorded by IMAGXP Logs).
*   This works **today** without any complex ad-tech.

---

## 🧰 Part 12: Technical Internal & Q&A (Broker Mechanics)

**Q: Is "One Line" of Config Really Safe?**
A: **Yes. The complexity is Asymmetrical.**
*   **You (Publisher)**: Act as the "Card Reader". You just check the credentials using the public key.
*   **The Broker (Bank)**: Does the hard work (OIDC, Banking, Key Rotation).
*   Because you delegate trust to the Broker's URL, you inherit their banking-grade security with just one line of code.

**Q: What happens "Under the Hood" when I add `brokerUrl`?**
When the request hits your server:
1.  **Auto-Fetch**: The SDK silently fetches `https://broker.../.well-known/jwks.json` and caches the keys.
2.  **Extract Token**: It pulls the `x-imagxp-payment` header from the request.
3.  **Crypto Logic**: It runs `ECDSA_VERIFY(Token, BrokerPublicKey)`. This is math, not magic.
4.  **Audience Check**: It verifies the token was issued specifically for *your* domain (`"aud": "yoursite.com"`).
*   **Result**: If the math passes, the money is guaranteed.

---

## 🛡️ Part 13: Truth & Security FAQs (Genuine Analysis)

### 1. Is it a "Real Protocol"?
**Yes, but it's an "Application Layer" Protocol.**
*   **Why it IS a protocol**: It defines a strict standard (Identity Header + Public Key + DNS Binding) that two strangers (OpenAI & Publisher) use to trust each other.
*   **Why it's not "TCP/IP"**: It runs on top of HTTP. It's more like OAuth or JWT.
*   **Verdict**: It is a legitimate Application Protocol (Layer 7). It works exactly like `robots.txt`, but with cryptography.

### 2. Adoption Probability (The Brutal Truth)
*   **Publishers (70% Likely)**: They are desperate. If you tell them "Add 3 files to block bots securely," they will do it.
*   **AI Companies (30% Likely)**: Currently, they scrape for free. They will only adopt this if courts force them (e.g., NYTimes lawsuit). If a judge says "You must respect permissions," IMAGXP becomes their "Get Out of Jail Free" card.

### 3. Is it Hackable? (The Security Audit)

**Vector A: Spoofing the ID**
*   **Difficulty**: EXTREME (Military Grade).
*   **Why**: Uses ECDSA (Bitcoin Math). The only way to spoof is to steal OpenAI's Private Key from their server.
*   **Verdict**: Un-spoofable via network attacks.

**Vector B: Replay Attacks (The "Copycat")**
*   **Difficulty**: HARD (With Timestamp).
*   **Defense**: IMAGXP includes a timestamp (`ts`) in every signature. Requests older than 5 minutes are rejected automatically.
*   **Verdict**: Solar Safe.

**Vector C: Bypassing the Middleware**
*   **Difficulty**: MEDIUM (Human Error).
*   **Risk**: If you add `middleware.ts` but exclude your API routes from the matcher config, hackers walk right in.
*   **Verdict**: AAMP is a strong lock, but you have to actually lock the door.

**Vector D: DDOS (The Overload)**
*   **Difficulty**: EASY.
*   **Risk**: Verifying crypto signatures takes CPU. A hacker sending 10M requests can crash your verification server.
*   **Defense**: Use Cloudflare or Vercel Edge Caching in front of IMAGXP.
*   **Verdict**: IMAGXP is an ID Checker, not a Firewall. You still need Cloudflare.

---

## 🕵️‍♂️ Part 14: Auto-Detection & Zero Lists Q&A

**Q: Do I need to maintain a list of "Protected Sites" in my crawler?**
A: **NO.**
*   **The Auto-Detect Mechanism**: The Agent crawls blindly (just like GoogleBot).
*   **The Upgrade**: When it hits a site, it checks for an IMAGXP signal.
    *   **Signal Found**: It automatically signs the request and pays the fee.
    *   **No Signal**: It treats it as a standard web page (respecting `robots.txt`).
*   **Benefit**: You don't need a database of "IMAGXP Sites". You just crawl the web, and the protocol handles the negotiation dynamically.

**Q: Does the Publisher need a list of "AI Companies"?**
A: **NO.**
*   **Dynamic Verification**: The Publisher accepts traffic from *anyone* with a valid signature.
*   **The Handshake**: When a request arrives, the logic runs:
    1.  Read Identity (`openai.com`).
    2.  Fetch Keys from DNS (`openai.com/.well-known/...`).
    3.  Verify Signature.
*   **Benefit**: You don't need to whitelist IP addresses or maintain a list of "Good Bots". If they have a valid key, they are who they say they are.

---

## 🕷️ Part 15: SEO Impact (Will I Block Google?)

**Q: If I install IMAGXP, will I accidentally block Googlebot and hurt my SEO?**
A: **No, but correct configuration is key.**

1.  **Hybrid Mode (Safe Default)**: The SDK `strategy: 'HYBRID'` is designed for this.
    *   **Verified Agents**: Pass if they pay/follow rules.
    *   **Browsers**: Pass (User Experience).
    *   **Legacy Bots (Google/Bing)**: The SDK detects them as "Non-IMAGXP" traffic. Since they don't have a signature, they fall back to standard `robots.txt` behavior.
    
2.  **Strict Mode**: If you set `strategy: 'STRICT'`, you MIGHT block Google because Google does not sign its requests (yet).
    *   **Fix**: If using `STRICT`, add this line to your middleware *before* IMAGXP:
    ```typescript
    if (req.headers.get('user-agent')?.includes('Googlebot')) return NextResponse.next();
    ```

**Recommendation**: Start with `'HYBRID'`. It keeps your site SEO-friendly while blocking the undocumented AI Scrapers.
