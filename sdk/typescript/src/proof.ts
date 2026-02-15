import { createRemoteJWKSet, jwtVerify } from 'jose';

// In-memory cache for JWKS to avoid repeated fetches
// Jose's createRemoteJWKSet handles caching/cooldowns internally.

/**
 * Verifies a JWT (Proof Token or Payment Credential) using JWKS.
 * 
 * @param token The JWT string 
 * @param jwksUrl The URL to fetch Public Keys
 * @param issuer The expected issuer
 * @param audience The expected audience range
 */
export async function verifyJwt(
    token: string,
    jwksUrl: string,
    issuer: string,
    audience?: string
): Promise<boolean> {
    try {
        const JWKS = createRemoteJWKSet(new URL(jwksUrl));

        const { payload } = await jwtVerify(token, JWKS, {
            issuer: issuer,
            audience: audience // specific audience check if provided
        });

        // Check specific IMAGXP claims if we standardize them
        // if (payload.type !== 'AD_IMPRESSION') return false;

        return true;
    } catch (error) {
        // console.error("Ad Proof Verification Failed:", error);
        return false;
    }
}
