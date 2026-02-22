/**
 * Layer 2: Publisher Middleware
 * Used by content owners to enforce policy, log access, and filter bots.
 */
import { HEADERS, MAX_CLOCK_SKEW_MS, WELL_KNOWN_AGENT_PATH } from './constants.js';
import { exportPublicKey, signData, verifySignature } from './crypto.js';
import { AccessPolicy, AccessPurpose, AgentIdentityManifest, ContentOrigin, EvaluationResult, IdentityCache, SignedAccessRequest, UnauthenticatedStrategy, ProtocolHeader } from './types.js';
import { verifyJwt } from './proof.js';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import stringify from 'fast-json-stable-stringify';

interface VerificationResult {
  allowed: boolean;
  reason: string;
  identityVerified: boolean;
  proofUsed?: string; // "WHITELIST", "CREDENTIAL_JWT", "AD_JWT"
  visitorType?: string; // For audit logs
}

/**
 * Default In-Memory Cache (Fallback only)
 * NOT recommended for high-traffic Serverless production.
 */
class MemoryCache implements IdentityCache {
  private store = new Map<string, { val: string, exp: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.exp) {
      this.store.delete(key);
      return null;
    }
    return item.val;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.store.set(key, {
      val: value,
      exp: Date.now() + (ttlSeconds * 1000)
    });
  }
}

export class IMAGXPPublisher {
  private policy: AccessPolicy;
  private keyPair: CryptoKeyPair | null = null;
  private unauthenticatedStrategy: UnauthenticatedStrategy;
  private cache: IdentityCache;
  private seenNonces: Map<string, number> = new Map();

  // Default TTL: 1 Hour
  private readonly CACHE_TTL_SECONDS = 3600;

  constructor(
    policy: AccessPolicy,
    strategy: UnauthenticatedStrategy = 'PASSIVE',
    cacheImpl?: IdentityCache
  ) {
    this.policy = policy;
    this.unauthenticatedStrategy = strategy;
    this.cache = cacheImpl || new MemoryCache();
  }

  async initialize(keyPair: CryptoKeyPair) {
    this.keyPair = keyPair;
  }

  getPolicy(): AccessPolicy {
    return this.policy;
  }

  /**
   * Main Entry Point: Evaluate ANY visitor (Human, Bot, or Agent)
   * STAGE 1: IDENTITY (Strict)
   * STAGE 2: POLICY (Permissions)
   * STAGE 3: ACCESS (HQ Content)
   */
  async evaluateVisitor(
    reqHeaders: Record<string, string | undefined>,
    rawPayload?: string
  ): Promise<EvaluationResult> {
    console.log(`\n--- [IMAGXP LOG START] New Request ---`);

    // --- STAGE 1: IDENTITY VERIFICATION ---
    console.log(`[IDENTITY] 🔍 Checking Identity Headers...`);

    const hasImagxp = reqHeaders[HEADERS.PAYLOAD] && reqHeaders[HEADERS.SIGNATURE] && reqHeaders[HEADERS.PUBLIC_KEY];

    if (hasImagxp) {
      // It claims to be an Agent. Verify it STRICTLY.
      return await this.handleAgentStrict(reqHeaders, rawPayload);
    }

    // If NO IMAGXP Headers -> FAIL IDENTITY immediately.
    console.log(`[IDENTITY] ❌ FAILED. No IMAGXP Headers found.`);

    // For now, retaining the legacy "Passive/Hybrid" switch just to avoid breaking browser demos completely 
    // BUT logging it as a specific "Identity Fail" flow.
    if (this.unauthenticatedStrategy === 'STRICT') {
      console.log(`[IDENTITY] ⛔ BLOCKING. Strategy is STRICT.`);
      return {
        allowed: false,
        status: 401,
        reason: "IDENTITY_REQUIRED: Missing IMAGXP Headers.",
        visitorType: 'UNIDENTIFIED_BOT'
      };
    }

    console.log(`[IDENTITY] ⚠️ SKIPPED (Legacy Mode). Checking Browser Heuristics...`);
    const isHuman = this.performBrowserHeuristics(reqHeaders);
    if (isHuman) {
      console.log(`[POLICY] 👤 ALLOWED. Browser Heuristics Passed.`);
      return { allowed: true, status: 200, reason: "BROWSER_VERIFIED", visitorType: 'LIKELY_HUMAN' };
    }

    console.log(`[IDENTITY] ❌ FAILED. Not a Browser, No Headers.`);
    console.log(`[ACCESS] ⛔ BLOCKED.`);
    return {
      allowed: false,
      status: 403,
      reason: "IDENTITY_FAIL: No Identity, No Browser.",
      visitorType: 'UNIDENTIFIED_BOT'
    };
  }

  /**
   * Browser Heuristics (Hardened)
   * 1. Checks Known Bot Signatures (Fast Fail)
   * 2. Checks Trusted Upstream Signals (Cloudflare/Vercel)
   * 3. Checks Browser Header Consistency
   */
  private performBrowserHeuristics(headers: Record<string, string | undefined>): boolean {
    const userAgent = headers['user-agent'] || '';

    // A. The "Obvious Bot" Blocklist (Fast Fail)
    const botSignatures = ['python-requests', 'curl', 'wget', 'scrapy', 'bot', 'crawler', 'spider'];
    if (botSignatures.some(sig => userAgent.toLowerCase().includes(sig))) {
      return false;
    }

    // B. Trusted Infrastructure Signals (The Real World Solution)
    if (headers['cf-visitor'] || headers['cf-ray']) return true;
    if (headers['x-vercel-id']) return true;
    if (headers['cloudfront-viewer-address']) return true;

    // C. The "Browser Fingerprint" (Fallback for direct connections)
    const hasAcceptLanguage = !!headers['accept-language'];
    const hasSecFetchDest = !!headers['sec-fetch-dest'];
    const hasUpgradeInsecure = !!headers['upgrade-insecure-requests'];

    if (hasAcceptLanguage && (hasSecFetchDest || hasUpgradeInsecure)) {
      return true;
    }

    return false;
  }

  /**
   * Handle IMAGXP Protocol Logic (Strict Mode)
   */
  private async handleAgentStrict(reqHeaders: Record<string, string | undefined>, rawPayload?: string): Promise<EvaluationResult> {
    let agentId = "UNKNOWN";

    try {
      // 1. Decode Headers
      const payloadHeader = reqHeaders[HEADERS.PAYLOAD]!;
      const sigHeader = reqHeaders[HEADERS.SIGNATURE]!;
      const keyHeader = reqHeaders[HEADERS.PUBLIC_KEY]!;

      const headerJson = atob(payloadHeader);
      const requestHeader = JSON.parse(headerJson);
      agentId = requestHeader.agent_id;

      console.log(`[IDENTITY] 🆔 Claimed ID: ${agentId}`);

      // 2. Crypto & DNS Verification
      const signedRequest: SignedAccessRequest = {
        header: requestHeader,
        signature: sigHeader,
        publicKey: keyHeader
      };

      const agentKey = await crypto.subtle.importKey(
        "spki",
        new Uint8Array(atob(keyHeader).split('').map(c => c.charCodeAt(0))),
        { name: "ECDSA", namedCurve: "P-256" },
        true,
        ["verify"]
      );

      // Verify Core Logic (DNS + Crypto)
      const verification = await this.verifyRequestLogic(signedRequest, agentKey);

      if (!verification.identityVerified) {
        console.log(`[IDENTITY] ❌ FAILED. Reason: ${verification.reason}`);
        console.log(`[ACCESS] ⛔ BLOCKED.`);
        return { allowed: false, status: 403, reason: verification.reason, visitorType: 'UNIDENTIFIED_BOT' };
      }

      console.log(`[IDENTITY] ✅ PASSED. DNS Binding Verified.`);

      // --- STAGE 2: POLICY ENFORCEMENT ---
      console.log(`[POLICY] 📜 Checking Permissions for ${agentId}...`);

      const proofToken = reqHeaders[HEADERS.PROOF_TOKEN];
      const paymentCredential = reqHeaders[HEADERS.PAYMENT_CREDENTIAL];

      const policyResult = await this.checkPolicyStrict(requestHeader, proofToken, paymentCredential);

      if (!policyResult.allowed) {
        console.log(`[POLICY] ⛔ DENIED. Reason: ${policyResult.reason}`);
        console.log(`[ACCESS] ⛔ BLOCKED.`);
        return policyResult;
      }

      // --- STAGE 3: ACCESS GRANT ---
      console.log(`[POLICY] ✅ PASSED. Requirements Met.`);
      console.log(`[ACCESS] 🔓 GRANTED. Unlocking HQ Content.`);

      return {
        allowed: true,
        status: 200,
        reason: "IMAGXP_VERIFIED",
        visitorType: 'VERIFIED_AGENT',
        metadata: requestHeader,
        proofUsed: policyResult.proofUsed
      };

    } catch (e) {
      console.error(`[IMAGXP ERROR]`, e);
      return { allowed: false, status: 400, reason: "INVALID_SIGNATURE", visitorType: 'UNIDENTIFIED_BOT' };
    }
  }

  // Legacy handler kept for interface compatibility (deprecated)
  private async handleAgent(reqHeaders: Record<string, string | undefined>, rawPayload?: string): Promise<EvaluationResult> {
    return this.handleAgentStrict(reqHeaders, rawPayload);
  }

  /**
   * STAGE 2: POLICY ENFORCEMENT CHECK
   */
  private async checkPolicyStrict(
    requestHeader: any,
    proofToken?: string,
    paymentCredential?: string
  ): Promise<EvaluationResult> {

    // 1. Policy Check: Purpose Ban (e.g. No Training)
    if (requestHeader.purpose === AccessPurpose.CRAWL_TRAINING && !this.policy.allowTraining) {
      return { allowed: false, status: 403, reason: 'POLICY_DENIED: Training not allowed.', visitorType: 'VERIFIED_AGENT' };
    }

    // 2. BROKER CHECK (New v1.1)
    if (this.policy.monetization?.brokerUrl) {
      const brokerUrl = this.policy.monetization.brokerUrl;

      if (!paymentCredential) {
        return { allowed: false, status: 402, reason: "PAYMENT_REQUIRED: Missing Broker Credential", visitorType: 'UNIDENTIFIED_BOT' };
      }

      const isValid = await this.verifyBrokerCred(paymentCredential, brokerUrl);

      if (!isValid) {
        return { allowed: false, status: 403, reason: "PAYMENT_DENIED: Invalid Broker Token", visitorType: 'UNIDENTIFIED_BOT' };
      }

      // If valid, we record the "Proof Used" so we can settle later
      return { allowed: true, status: 200, reason: "IMAGXP_PAID", visitorType: "VERIFIED_AGENT", proofUsed: `BROKER_JWT:${paymentCredential.slice(0, 10)}...` };
    }
    if (requestHeader.purpose === AccessPurpose.RAG_RETRIEVAL && !this.policy.allowRAG) {
      return { allowed: false, status: 403, reason: 'POLICY_DENIED: RAG not allowed.', visitorType: 'VERIFIED_AGENT' };
    }

    // 2. Policy Check: Economics (v1.2) - Payment & Ads
    if (this.policy.requiresPayment) {
      let paymentSatisfied = false;

      // Method A: Flexible Payment Callback (DB / Custom Logic)
      if (this.policy.monetization?.checkPayment) {
        const isPaid = await this.policy.monetization.checkPayment(requestHeader.agent_id, requestHeader.purpose);
        if (isPaid) {
          console.log(`[POLICY] 💰 Payment Verified via Callback.`);
          return { allowed: true, status: 200, reason: 'OK', visitorType: 'VERIFIED_AGENT', proofUsed: 'WHITELIST_CALLBACK' };
        }
      }

      // Method B: Payment Credentials (Unified JWT)
      if (!paymentSatisfied && this.policy.monetization?.paymentConfig && paymentCredential) {
        const { jwksUrl, issuer } = this.policy.monetization.paymentConfig;
        console.log(`[POLICY] 🔐 Verifying Payment Credential (Issuer: ${issuer})...`);

        const isValidCredential = await verifyJwt(paymentCredential, jwksUrl, issuer);
        if (isValidCredential) {
          console.log(`[POLICY] ✅ Credential Signature VALID.`);
          return { allowed: true, status: 200, reason: 'OK', visitorType: 'VERIFIED_AGENT', proofUsed: 'PAYMENT_CREDENTIAL_JWT' };
        } else {
          console.log(`[POLICY] ❌ Credential Signature INVALID.`);
        }
      }

      // Method C: Ad-Supported (Proof Verification)
      if (!paymentSatisfied && this.policy.allowAdSupportedAccess && requestHeader.context?.ads_displayed) {
        if (proofToken && this.policy.monetization?.adNetwork) {
          const { jwksUrl, issuer } = this.policy.monetization.adNetwork;
          console.log(`[POLICY] 📺 Verifying Ad Proof (Issuer: ${issuer})...`);

          const isValidProof = await verifyJwt(proofToken, jwksUrl, issuer);
          if (isValidProof) {
            console.log(`[POLICY] ✅ Ad Proof Signature VALID.`);
            return { allowed: true, status: 200, reason: 'OK', visitorType: 'VERIFIED_AGENT', proofUsed: 'AD_PROOF_JWT' };
          } else {
            console.log(`[POLICY] ❌ Ad Proof Signature INVALID.`);
          }
        } else {
          console.log(`[POLICY] ⚠️ Ad Proof MISSING.`);
        }
      }

      return {
        allowed: false,
        status: 402,
        reason: 'PAYMENT_REQUIRED: Whitelist, Credential, and Ad Proof checks ALL failed.',
        visitorType: 'VERIFIED_AGENT',
        proofUsed: 'NONE'
      };
    }

    // If no payment required, allow.
    return { allowed: true, status: 200, reason: 'OK', visitorType: 'VERIFIED_AGENT' };
  }

  private async verifyRequestLogic(
    request: SignedAccessRequest,
    requestPublicKey: CryptoKey,
  ): Promise<VerificationResult> {

    // 1. Replay Attack Prevention (Timestamp + Nonce Tracking)
    const requestTime = new Date(request.header.ts).getTime();
    const now = Date.now();
    if (Math.abs(now - requestTime) > MAX_CLOCK_SKEW_MS) {
      return { allowed: false, reason: 'TIMESTAMP_INVALID: Clock skew too large.', identityVerified: false };
    }

    if (!request.header.nonce) {
      return { allowed: false, reason: 'REPLAY_VIOLATION: Missing cryptographic nonce.', identityVerified: false };
    }

    const nonceKey = `${request.header.agent_id}:${request.header.nonce}`;
    if (this.seenNonces.has(nonceKey)) {
      return { allowed: false, reason: 'REPLAY_ATTACK: Nonce has already been used within the current time window.', identityVerified: false };
    }

    // Store the nonce and clean up old nonces to prevent memory leaks
    this.seenNonces.set(nonceKey, now);
    this.cleanupNonces(now);

    // 2. Crypto Verification (Must use canonical stringify!)
    const signableString = stringify(request.header);
    const isCryptoValid = await verifySignature(requestPublicKey, signableString, request.signature);
    if (!isCryptoValid) return { allowed: false, reason: 'CRYPTO_FAIL: Signature invalid.', identityVerified: false };

    // 3. Identity Verification (DNS Binding) with Cache
    let identityVerified = false;
    const claimedDomain = request.header.agent_id;
    const pubKeyString = await exportPublicKey(requestPublicKey);

    console.log(`[IDENTITY] 🔍 Verifying DNS Binding for: ${claimedDomain}`);

    // Check Cache First
    const cachedKey = await this.cache.get(claimedDomain);

    if (cachedKey === pubKeyString) {
      console.log("[IDENTITY] ⚡ Cache Hit. Identity Verified.");
      identityVerified = true;
    } else if (this.isDomain(claimedDomain)) {
      // Cache Miss: Perform DNS Fetch
      identityVerified = await this.verifyDnsBinding(claimedDomain, pubKeyString);
      if (identityVerified) {
        await this.cache.set(claimedDomain, pubKeyString, this.CACHE_TTL_SECONDS);
      }
    }

    if (this.policy.requireIdentityBinding && !identityVerified) {
      return { allowed: false, reason: 'IDENTITY_FAIL: DNS Binding could not be verified.', identityVerified: false };
    }

    // Return verified status so handleAgentStrict can proceed to Policy Check
    return { allowed: true, reason: 'OK', identityVerified: identityVerified };
  }

  private async verifyDnsBinding(domain: string, requestKeySpki: string): Promise<boolean> {
    try {
      // Allow HTTP for localhost testing
      const protocol = (domain.includes('localhost') || domain.match(/:\d+$/)) ? 'http' : 'https';
      const url = `${protocol}://${domain}${WELL_KNOWN_AGENT_PATH}`;

      console.log(`   🌍 [IMAGXP DNS] Fetching Manifest: ${url} ...`);

      // In production, we need a short timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s max for DNS check

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log(`   ❌ [IMAGXP DNS] Fetch Failed: ${response.status}`);
        return false;
      }

      const manifest = await response.json() as AgentIdentityManifest;
      console.log(`   📄 [IMAGXP DNS] Manifest received. Agent ID: ${manifest.agent_id}`);

      // CHECK 1: Does the manifest actually belong to the domain?
      if (manifest.agent_id !== domain) {
        console.log(`   ❌ [IMAGXP DNS] Mismatch: Manifest ID ${manifest.agent_id} != Claimed ${domain}`);
        return false;
      }

      // CHECK 2: Does the key match?
      if (manifest.public_key !== requestKeySpki) {
        console.log(`   ❌ [IMAGXP DNS] Key Mismatch: DNS Key != Request Key`);
        return false;
      }

      console.log(`   ✅ [IMAGXP DNS] Identity Confirmed.`);
      return true;
    } catch (e: any) {
      console.log(`   ❌ [IMAGXP DNS] Error: ${e.message}`);
      return false;
    }
  }

  /**
   * NEW: Verify a Broker-Issued Token (JWT)
   * Checks if the request contains a valid "Visa" from the Broker.
   */
  private async verifyBrokerCred(credential: string, brokerUrl: string): Promise<boolean> {
    try {
      // 1. Fetch Broker's Public Keys (JWKS)
      const JWKS = createRemoteJWKSet(new URL(`${brokerUrl}/.well-known/jwks.json`));

      // 2. Verify the Token Signature
      const { payload } = await jwtVerify(credential, JWKS, {
        issuer: brokerUrl, // Ensure it came from THE Broker
        clockTolerance: 5  // Allow 5s clock skew
      });

      console.log(`[BROKER] 💰 Valid Payment Token from ${payload.iss} for amount ${payload.amount}`);
      return true;

    } catch (e: any) {
      console.warn(`[BROKER] ❌ Invalid Token:`, e.message);
      return false;
    }
  }

  private cleanupNonces(now: number) {
    // Only cleanup roughly every 100 requests to avoid overhead
    if (Math.random() > 0.01) return;

    for (const [key, timestamp] of this.seenNonces.entries()) {
      if (Math.abs(now - timestamp) > MAX_CLOCK_SKEW_MS) {
        this.seenNonces.delete(key);
      }
    }
  }

  private isDomain(s: string): boolean {
    // Basic regex, allows localhost with ports
    return /^[a-zA-Z0-9.-]+(:\d+)?$/.test(s) || /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(s);
  }

  async generateResponseHeaders(origin: ContentOrigin): Promise<Record<string, string>> {
    if (!this.keyPair) throw new Error("Publisher keys not initialized");
    const payload = JSON.stringify({ origin, ts: Date.now() });
    const signature = await signData(this.keyPair.privateKey, payload);
    return {
      [HEADERS.CONTENT_ORIGIN]: origin,
      [HEADERS.PROVENANCE_SIG]: signature
    };
  }

  /**
   * Handling Quality Feedback (The "Dispute" Layer)
   * This runs when an Agent sends 'x-imagxp-feedback'.
   */
  private async handleFeedback(token: string, headers: Record<string, string | undefined>) {
    // NOTE: In production, you would fetch the Agent's specific key. 
    // For now, we assume standard Discovery or a centralized Key Set (like adNetwork).
    // Ideally, the SDK config should have a 'qualityOracle' key set.

    // 1. We just Decode it to Log it (Verification is optional but recommended)
    try {
      const parts = token.split('.');
      const payload = JSON.parse(atob(parts[1]));

      console.log(`\n📢 [IMAGXP QUALITY ALERT] Feedback Received from ${payload.agent_id}`);
      console.log(`   Reason: ${payload.reason} | Score: ${payload.quality_score}`);
      console.log(`   Resource: ${payload.url}`);
      console.log(`   (Signature available for dispute evidence)`);

    } catch (e) {
      console.log(`   ⚠️ [IMAGXP Warning] Malformed Feedback Token.`);
    }
  }
}