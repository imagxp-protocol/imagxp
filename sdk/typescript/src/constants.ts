/**
 * Layer 1: Protocol Constants
 * These values are immutable and defined by the IMAGXP Specification.
 */

export const IMAGXP_VERSION = '1.1';

// The path where Agents MUST host their public key to prove identity.
// Example: https://bot.openai.com/.well-known/imagxp-agent.json
export const WELL_KNOWN_AGENT_PATH = '/.well-known/imagxp-agent.json';

// HTTP Headers used for the handshake
export const HEADERS = {
  // Transport: The signed payload (Base64 encoded JSON of ProtocolHeader)
  PAYLOAD: 'x-imagxp-payload',
  // Transport: The cryptographic signature (Hex)
  SIGNATURE: 'x-imagxp-signature',
  // Transport: The Agent's Public Key (Base64 SPKI)
  PUBLIC_KEY: 'x-imagxp-public-key',

  // Informational / Legacy (Optional if Payload is present)
  AGENT_ID: 'x-imagxp-agent-id',
  TIMESTAMP: 'x-imagxp-timestamp',
  ALGORITHM: 'x-imagxp-alg',

  // v1.1 Addition: Provenance (Server to Agent)
  CONTENT_ORIGIN: 'x-imagxp-content-origin',
  PROVENANCE_SIG: 'x-imagxp-provenance-sig',

  // v1.2 Proof of Value
  PROOF_TOKEN: 'x-imagxp-proof',

  // v1.2 Payment Credential (The "Digital Receipt")
  PAYMENT_CREDENTIAL: 'x-imagxp-credential',

  // v1.2 Quality Feedback (The "Dispute Token")
  FEEDBACK: 'x-imagxp-feedback'
} as const;

// Cryptographic Settings
export const CRYPTO_CONFIG = {
  ALGORITHM_NAME: 'ECDSA',
  CURVE: 'P-256',
  HASH: 'SHA-256',
} as const;

// Tolerance
export const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000; // 5 minutes