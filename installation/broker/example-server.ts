
// index.ts (Broker Server)
// [OPTIONAL] Reference Implementation for a Broker
// This server issues "Visas" compatible with IMAGXP Publishers.

import express from 'express';
import { SignJWT, generateKeyPair } from 'jose';
import { HEADERS, IMAGXP_VERSION } from '@imagxp/protocol';

const app = express();
const PORT = 3000;

// 1. Generate/Load Secrets (In prod: Use KMS)
const { publicKey, privateKey } = await generateKeyPair('ES256');

// 2. The Trust Endpoint (Publishers check this)
app.get('/.well-known/jwks.json', async (req, res) => {
    // Export Public Key as JWK
    // implementation details omitted for brevity...
    res.json({ keys: [ /* exported_jwk */] });
});

// 3. The Issuance Endpoint (Agents pay here)
app.post('/issue-visa', async (req, res) => {
    // Verify Payment (Stripe/Bank)
    const paid = true;
    const agentId = "openai.com";
    const targetPublisher = "nytimes.com";

    if (paid) {
        // Sign the Visa (IMAGXP-Compatible JWT)
        const token = await new SignJWT({
            payment_status: "paid",
            amount: 0.001,
            ver: IMAGXP_VERSION
        })
            .setProtectedHeader({ alg: 'ES256' })
            .setIssuedAt()
            .setIssuer('https://broker.imagxp.network')
            .setAudience(targetPublisher)
            .setExpirationTime('1h')
            .sign(privateKey);

        // Return the token. The Agent will put this in: 
        // HEADERS.PAYMENT_CREDENTIAL ('x-imagxp-credential')
        res.json({
            token,
            header_name: HEADERS.PAYMENT_CREDENTIAL
        });
    } else {
        res.status(402).json({ error: "Payment Required" });
    }
});

app.listen(PORT, () => console.log(`Broker running on ${PORT}`));
