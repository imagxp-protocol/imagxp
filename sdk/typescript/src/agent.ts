/**
 * Layer 2: Agent SDK
 */
import { AccessPurpose, ProtocolHeader, SignedAccessRequest, FeedbackSignal, QualityFlag, AgentIdentityManifest } from './types.js';
import { generateKeyPair, signData, exportPublicKey, importPrivateKey, importPublicKey } from './crypto.js';
import { IMAGXP_VERSION } from './constants.js';

declare const process: any;

export interface AccessOptions {
  adsDisplayed?: boolean;
}

export class IMAGXPAgent {
  private keyPair: CryptoKeyPair | null = null;
  public agentId: string = "pending";

  /**
   * Initialize the Agent Identity (Ephemeral or Persisted)
   * @param customAgentId For PRODUCTION, this should be your domain (e.g., "bot.openai.com")
   */
  async initialize(customAgentId?: string) {
    if (process.env.IMAGXP_PRIVATE_KEY && process.env.IMAGXP_PUBLIC_KEY) {
      // 1. Load Persistent Identity from Environment
      console.log(`[IMAGXP] Loading Agent Identity from Environment...`);
      try {
        const privateKey = await importPrivateKey(process.env.IMAGXP_PRIVATE_KEY);
        const publicKey = await importPublicKey(process.env.IMAGXP_PUBLIC_KEY);
        this.keyPair = { privateKey, publicKey };
      } catch (e) {
        console.error("Failed to load keys from env:", e);
      }
    }

    // Fallback or Normal Init
    if (!this.keyPair) {
      this.keyPair = await generateKeyPair();
    }

    // Use the provided ID (authentic) or generate a session ID (ephemeral)
    this.agentId = process.env.IMAGXP_AGENT_ID || customAgentId || "agent_" + Math.random().toString(36).substring(7);
  }

  async createAccessRequest(
    resource: string,
    purpose: AccessPurpose,
    options: AccessOptions = {}
  ): Promise<SignedAccessRequest> {
    if (!this.keyPair) throw new Error("Agent not initialized. Call initialize() first.");

    const header: ProtocolHeader = {
      v: IMAGXP_VERSION,
      ts: new Date().toISOString(),
      agent_id: this.agentId,
      resource,
      purpose,
      context: {
        ads_displayed: options.adsDisplayed || false
      }
    };

    const signature = await signData(this.keyPair.privateKey, JSON.stringify(header));
    const publicKeyExport = await exportPublicKey(this.keyPair.publicKey);

    return { header, signature, publicKey: publicKeyExport };
  }

  /**
   * Helper: Generate the JSON file you must host on your domain
   * Host this at: https://{agentId}/.well-known/imagxp-agent.json
   */
  async getIdentityManifest(contactEmail?: string): Promise<AgentIdentityManifest> {
    if (!this.keyPair) throw new Error("Agent not initialized.");

    const publicKey = await exportPublicKey(this.keyPair.publicKey);

    return {
      agent_id: this.agentId,
      public_key: publicKey,
      contact_email: contactEmail
    };
  }

  /**
   * NEW IN V1.1: Quality Feedback Loop
   * Allows the Agent to report spam or verify quality of a resource.
   */
  async generateFeedback(
    resource: string,
    score: number,
    flags: QualityFlag[]
  ): Promise<{ signal: FeedbackSignal, signature: string }> {
    if (!this.keyPair) throw new Error("Agent not initialized.");

    const signal: FeedbackSignal = {
      target_resource: resource,
      agent_id: this.agentId,
      quality_score: Math.max(0, Math.min(1, score)),
      flags,
      timestamp: new Date().toISOString()
    };

    const signature = await signData(this.keyPair.privateKey, JSON.stringify(signal));
    return { signal, signature };
  }
}