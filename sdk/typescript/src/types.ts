/**
 * Layer 1: Protocol Definitions
 * Shared types used by both Agent and Publisher.
 */

export enum AccessPurpose {
  CRAWL_TRAINING = 'CRAWL_TRAINING',
  RAG_RETRIEVAL = 'RAG_RETRIEVAL',
  SUMMARY = 'SUMMARY',
  QUOTATION = 'QUOTATION',
  EMBEDDING = 'EMBEDDING'
}

export enum ContentOrigin {
  HUMAN = 'HUMAN',         // Created by humans. High training value.
  SYNTHETIC = 'SYNTHETIC', // Created by AI. Risk of model collapse.
  HYBRID = 'HYBRID'        // Edited by humans, drafted by AI.
}

export enum QualityFlag {
  SEO_SPAM = 'SEO_SPAM',
  INACCURATE = 'INACCURATE',
  HATE_SPEECH = 'HATE_SPEECH',
  HIGH_QUALITY = 'HIGH_QUALITY'
}

/**
 * DNS Identity Manifest
 * Hosted at: https://{agent_id}/.well-known/imagxp-agent.json
 */
export interface AgentIdentityManifest {
  agent_id: string;   // e.g. "bot.openai.com"
  public_key: string; // Base64 SPKI
  contact_email?: string;
}

/**
 * PRODUCTION INFRASTRUCTURE: Cache Interface
 * Required for Serverless/Edge environments to prevent repeated DNS fetches.
 */
export interface IdentityCache {
  get(key: string): Promise<string | null>; // Returns stored PublicKey
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
}

/**
 * Optional Monetization (The Settlement Layer)
 */
/**
 * Optional Monetization (The Settlement Layer)
 */
export interface MonetizationConfig {
  // Method 1: Payments (Flexible Callback)
  // Developers implement their own logic (Database check, CMS lookup, etc.)
  // Returns TRUE if the agent is a paid subscriber for this specific purpose.
  checkPayment?: (agentId: string, purpose: string) => boolean | Promise<boolean>;

  // Method 2: Ads (Proof Verification)
  // Configuration to verify tokens from your Ad Provider (e.g. Google)
  adNetwork?: {
    jwksUrl: string;   // e.g. "https://www.googleapis.com/oauth2/v3/certs"
    issuer: string;    // e.g. "https://accounts.google.com"
  };

  // Method 3: Broker Integration (NEW)
  // For third-party clearing houses (AdSense for Data)
  brokerUrl?: string; // e.g. "https://broker.imagxp.network"

  // Method 4: Payment Credentials (Unified JWT)
  // Verifies "x-imagxp-credential" for Broker or Direct payments.
  paymentConfig?: {
    jwksUrl: string;   // e.g. "https://my-site.com/.well-known/jwks.json"
    issuer: string;    // e.g. "my-site.com"
  };
}



/**
 * Handling Non-IMAGXP Visitors
 * 
 * PASSIVE: Allow everyone (Legacy web behavior).
 * HYBRID: Allow verified Agents AND likely Humans (Browser Heuristics). Block bots.
 * STRICT: Allow ONLY verified IMAGXP Agents. (API Mode).
 */
export type UnauthenticatedStrategy = 'PASSIVE' | 'HYBRID' | 'STRICT';

export interface AccessPolicy {
  version: '1.1';
  allowTraining: boolean;
  allowRAG: boolean;
  attributionRequired: boolean;

  // Economic Signals
  allowAdSupportedAccess: boolean;
  requiresPayment: boolean;
  paymentPointer?: string;

  // Identity Strictness
  requireIdentityBinding?: boolean;

  // V1.1: Optional Settlement Info
  monetization?: MonetizationConfig;
}

export interface ProtocolHeader {
  v: '1.1';
  ts: string;
  agent_id: string;
  resource: string;
  purpose: AccessPurpose;
  context: {
    ads_displayed: boolean;
  };
}

export interface SignedAccessRequest {
  header: ProtocolHeader;
  signature: string;
  publicKey?: string;
}

export interface FeedbackSignal {
  target_resource: string;
  agent_id: string;
  quality_score: number;
  flags: QualityFlag[];
  timestamp: string;
}

// Result of the full evaluation pipeline
// Result of the full evaluation pipeline
export interface EvaluationResult {
  allowed: boolean;
  status: 200 | 400 | 401 | 402 | 403;
  reason: string;
  visitorType: 'VERIFIED_AGENT' | 'LIKELY_HUMAN' | 'UNIDENTIFIED_BOT';
  metadata?: any;
  payment_status?: 'PAID_SUBSCRIBER' | 'AD_FUNDED' | 'UNPAID';
  proofUsed?: string;
}

// Signed Quality Feedback (The "Report Card")
export interface FeedbackSignalToken {
  url: string;           // The resource being flagged
  agent_id: string;      // Who is flagging it (e.g. "bot.openai.com")
  quality_score: number; // 0.0 to 1.0
  reason: string;        // e.g. "SEO_SPAM", "HATE_SPEECH"
  timestamp: number;
}