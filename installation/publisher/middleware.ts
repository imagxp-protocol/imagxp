
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
        allowRAG: true,              // "Allow Search Engines"

        // [MONETIZATION] Broker Setup (New v1.1)
        monetization: {
            brokerUrl: "https://broker.imagxp.network"
        }
    },
    strategy: 'HYBRID'               // "Allow Humans (Browsers) + Verified Agents"
});

// Protect specific routes (e.g. /posts, /articles)
export async function middleware(req: any) {
    if (req.nextUrl.pathname.startsWith('/posts')) {
        return imagxp.withProtection(async (req) => NextResponse.next())(req);
    }
    return NextResponse.next();
}
