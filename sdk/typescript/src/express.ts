/**
 * Layer 3: Framework Adapters
 * Zero-friction integration for Express/Node.js.
 */
import { IMAGXPPublisher } from './publisher.js';
import { AccessPolicy, ContentOrigin, UnauthenticatedStrategy, IdentityCache } from './types.js';
import { generateKeyPair, importPrivateKey, importPublicKey } from './crypto.js';

declare const process: any;

export interface IMAGXPConfig {
  policy: Omit<AccessPolicy, 'version'>;
  meta: {
    origin: keyof typeof ContentOrigin;
    paymentPointer?: string;
  };
  strategy?: UnauthenticatedStrategy;
  // Optional: Provide a Redis/Memcached adapter here for production
  cache?: IdentityCache;
}

export class IMAGXP {
  private publisher: IMAGXPPublisher;
  private origin: ContentOrigin;
  private ready: Promise<void>;

  private constructor(config: IMAGXPConfig) {
    this.publisher = new IMAGXPPublisher(
      { version: '1.1', ...config.policy } as AccessPolicy,
      config.strategy || 'PASSIVE',
      config.cache
    );

    this.origin = ContentOrigin[config.meta.origin];

    const publisher = this.publisher;
    this.ready = (async () => {
      let keys: CryptoKeyPair | null = null;
      if (process.env.IMAGXP_PRIVATE_KEY && process.env.IMAGXP_PUBLIC_KEY) {
        try {
          const privateKey = await importPrivateKey(process.env.IMAGXP_PRIVATE_KEY);
          const publicKey = await importPublicKey(process.env.IMAGXP_PUBLIC_KEY);
          keys = { privateKey, publicKey };
        } catch (e) { console.error("IMAGXP: Failed to load keys from env", e); }
      }
      if (!keys) keys = await generateKeyPair();
      await publisher.initialize(keys);
    })();
  }

  static init(config: IMAGXPConfig): IMAGXP {
    return new IMAGXP(config);
  }

  /**
   * Express Middleware
   */
  middleware() {
    return async (req: any, res: any, next: any) => {
      await this.ready;

      // Normalize headers to lowercase dictionary
      const headers: Record<string, string> = {};
      Object.keys(req.headers).forEach(key => {
        headers[key.toLowerCase()] = req.headers[key] as string;
      });

      // Retrieve Raw Payload if available (optional but good for crypto)
      // Note: Express body parsing might interfere, so we usually rely on the header content.
      const rawPayload = headers['x-imagxp-payload'];

      // Evaluate Visitor
      const result = await this.publisher.evaluateVisitor(headers, rawPayload);

      // Enforce Decision
      if (!result.allowed) {
        res.status(result.status).json({
          error: result.reason,
          visitor_type: result.visitorType,
          proof_used: result.proofUsed
        });
        return;
      }

      // Inject Provenance Headers (For the humans/agents that got through)
      const respHeaders = await this.publisher.generateResponseHeaders(this.origin);
      Object.entries(respHeaders).forEach(([k, v]) => {
        res.setHeader(k, v);
      });

      // Attach metadata to request for downstream use
      req.aamp = {
        verified: result.visitorType === 'VERIFIED_AGENT',
        type: result.visitorType,
        ...result.metadata
      };

      next();
    };
  }

  discoveryHandler() {
    return (req: any, res: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(this.publisher.getPolicy(), null, 2));
    };
  }
}