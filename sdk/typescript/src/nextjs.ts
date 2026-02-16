/**
 * Layer 3: Framework Adapters
 * Serverless integration for Next.js (App Router & API Routes).
 */
import { IMAGXPPublisher } from './publisher.js';
import { AccessPolicy, ContentOrigin, UnauthenticatedStrategy, IdentityCache } from './types.js';
import { generateKeyPair, importPrivateKey, importPublicKey } from './crypto.js';

declare const process: any;

type NextRequest = any;
type NextResponse = any;

const createJsonResponse = (body: any, status = 200) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
};

export interface IMAGXPConfig {
  policy: Omit<AccessPolicy, 'version'>;
  meta: {
    origin: keyof typeof ContentOrigin;
    paymentPointer?: string;
  };
  strategy?: UnauthenticatedStrategy;
  // Optional: Provide a KV/Redis adapter here for production
  cache?: IdentityCache;
}

export class IMAGXPNext {
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

  static init(config: IMAGXPConfig): IMAGXPNext {
    return new IMAGXPNext(config);
  }


  /**
   * Serverless Route Wrapper
   */
  withProtection(handler: (req: NextRequest) => Promise<NextResponse>) {
    return async (req: NextRequest) => {
      await this.ready;

      // Extract Headers map
      const headers: Record<string, string> = {};
      req.headers.forEach((value: string, key: string) => {
        headers[key.toLowerCase()] = value;
      });

      // Evaluate
      const result = await this.publisher.evaluateVisitor(headers, headers['x-imagxp-payload']);

      if (!result.allowed) {
        return createJsonResponse({
          error: result.reason,
          visitor_type: result.visitorType,
          proof_used: result.proofUsed
        }, result.status);
      }

      // Execute Handler
      const response = await handler(req);

      // Inject Provenance
      const imagxpHeaders = await this.publisher.generateResponseHeaders(this.origin);
      if (response && response.headers) {
        Object.entries(imagxpHeaders).forEach(([k, v]) => {
          response.headers.set(k, v);
        });
      }

      return response;
    };
  }

  discoveryHandler() {
    return async () => {
      return createJsonResponse(this.publisher.getPolicy());
    };
  }
}