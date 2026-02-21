/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                // Matches all API routes and Pages
                source: "/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" }, // In production, replace '*' with specific domains
                    { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-imagxp-payload, x-imagxp-version, x-imagxp-date, x-imagxp-agent-id, x-imagxp-purpose, x-imagxp-signature, x-imagxp-public-key" }
                ]
            }
        ]
    }
};

module.exports = nextConfig;
