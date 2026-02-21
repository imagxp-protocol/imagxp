import { NextResponse } from 'next/server';
import { IMAGXPNext } from '@imagxp/protocol';

// Initialize IMAGXP Protocol
// This "Bouncer" checks every request to /posts/*
const imagxp = IMAGXPNext.init({
    meta: {
        origin: (process.env.IMAGXP_CONTENT_ORIGIN as any) || 'HUMAN',
        paymentPointer: process.env.IMAGXP_PAYMENT_POINTER || '$wallet.example.com'
    },
    policy: {
        // [SECURITY] STRICT IDENTIFICATION
        requireIdentityBinding: process.env.IMAGXP_REQUIRE_IDENTITY_BINDING !== 'false', // Default: true 
        // [ECONOMICS] Controlled via ENV
        requiresPayment: process.env.IMAGXP_PAYMENT_REQUIRED === 'true',
        allowAdSupportedAccess: process.env.IMAGXP_ALLOW_ADS === 'true',

        // [PERMISSIONS] Controlled via ENV
        allowTraining: process.env.IMAGXP_ALLOW_TRAINING === 'true',
        allowRAG: process.env.IMAGXP_ALLOW_RAG !== 'false', // Default true if not set
        attributionRequired: process.env.IMAGXP_ATTRIBUTION_REQUIRED !== 'false'
    },
    strategy: 'HYBRID'
});

export async function middleware(req: any) {
    // PROTECT: Only applying to blog posts
    if (req.nextUrl.pathname.startsWith('/posts')) {
        return imagxp.withProtection(async (req) => NextResponse.next())(req);
    }
    return NextResponse.next();
}

export const config = {
    matcher: '/posts/:path*',
};
