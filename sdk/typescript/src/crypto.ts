/**
 * Layer 1: Cryptographic Primitives
 * Implementation of ECDSA P-256 signing/verification.
 */

export async function generateKeyPair(): Promise<CryptoKeyPair> {
  // Uses standard Web Crypto API (Node 19+ compatible)
  return await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  );
}

export async function signData(privateKey: CryptoKey, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    privateKey,
    encoded as any
  );
  return bufToHex(signature);
}

export async function verifySignature(publicKey: CryptoKey, data: string, signatureHex: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const signatureBytes = hexToBuf(signatureHex);

  console.log("   🔐 [IMAGXP Crypto] Verifying ECDSA P-256 Signature...");

  const isValid = await crypto.subtle.verify(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    publicKey,
    signatureBytes as any,
    encodedData as any
  );

  console.log(`   ${isValid ? "✅" : "❌"} [IMAGXP Crypto] Signature Result: ${isValid ? "VALID" : "INVALID"}`);
  return isValid;
}

export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("spki", key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

export async function importPublicKey(keyData: string): Promise<CryptoKey> {
  const binaryString = atob(keyData);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return await crypto.subtle.importKey(
    "spki",
    bytes,
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["verify"]
  );
}

export async function exportPrivateKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("pkcs8", key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

export async function importPrivateKey(keyData: string): Promise<CryptoKey> {
  const binaryString = atob(keyData);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return await crypto.subtle.importKey(
    "pkcs8",
    bytes,
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign"]
  );
}

// Helpers
function bufToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuf(hex: string): Uint8Array {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
}