/**
 * Integration Test: Protocol Handshake
 * Run using: npm test
 * Location: sdk/typescript/test/handshake.spec.ts
 */
import { IMAGXPAgent } from '../src/agent.js';
import { IMAGXPPublisher } from '../src/publisher.js';
import { AccessPurpose } from '../src/types.js';
import { HEADERS } from '../src/constants.js';

async function runTest() {
  console.log("--- STARTING IMAGXP HANDSHAKE TEST ---");

  // 1. Setup Publisher with Economic Policy
  const publisher = new IMAGXPPublisher({
    version: '1.1',
    allowTraining: false,
    allowRAG: true,
    attributionRequired: true,
    requiresPayment: true,        // Publisher wants money...
    allowAdSupportedAccess: true, // ...OR ads
    paymentPointer: '$wallet.example.com/publisher'
  });

  // 2. Initialize Agent
  const agent = new IMAGXPAgent();
  await agent.initialize();

  // TEST CASE A: Requesting RAG without Ads (Should FAIL due to Payment Requirement)
  console.log("\n[TEST A] Requesting RAG (No Ads)...");
  const reqA = await agent.createAccessRequest('/doc/1', AccessPurpose.RAG_RETRIEVAL, { adsDisplayed: false });

  const payloadA = JSON.stringify(reqA.header);
  const headersA = {
    [HEADERS.PAYLOAD]: btoa(payloadA),
    [HEADERS.SIGNATURE]: reqA.signature,
    [HEADERS.PUBLIC_KEY]: reqA.publicKey!
  };

  const resA = await publisher.evaluateVisitor(headersA, payloadA);
  console.log("Result A (Expect Deny):", resA);
  if (resA.allowed) throw new Error("Test A Failed (Should require payment)");


  // TEST CASE B: Requesting RAG WITH Ads (Should SUCCEED via Exemption)
  console.log("\n[TEST B] Requesting RAG (With Ads)...");
  const reqB = await agent.createAccessRequest('/doc/1', AccessPurpose.RAG_RETRIEVAL, { adsDisplayed: true });

  const payloadB = JSON.stringify(reqB.header);
  const headersB = {
    [HEADERS.PAYLOAD]: btoa(payloadB),
    [HEADERS.SIGNATURE]: reqB.signature,
    [HEADERS.PUBLIC_KEY]: reqB.publicKey!
  };

  const resB = await publisher.evaluateVisitor(headersB, payloadB);
  console.log("Result B (Expect Allow):", resB);
  if (!resB.allowed) throw new Error("Test B Failed (Should allow via Ad exemption)");

  console.log("\n--- ALL TESTS PASSED ---");
}

runTest().catch(console.error);