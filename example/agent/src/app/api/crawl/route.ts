import { NextResponse } from 'next/server';
import { IMAGXPAgent, AccessPurpose } from '@imagxp/protocol';

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        // 1. Initialize Agent with Persistent Identity
        const agent = new IMAGXPAgent();
        await agent.initialize();

        console.log(`[AGENT] Crawling ${url}...`);

        // 2. Perform the IMAGXP Handshake locally
        // (The SDK doesn't have a built-in fetch method yet, so we do it manually)
        const { header, signature, publicKey } = await agent.createAccessRequest(
            url,
            AccessPurpose.RAG_RETRIEVAL,
            { adsDisplayed: false }
        );

        // 3. Make the actual HTTP request with IMAGXP Headers
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                // REQUIRED: The "Envelope" for verification
                'x-imagxp-payload': Buffer.from(JSON.stringify(header)).toString('base64'),
                'x-imagxp-signature': signature,
                'x-imagxp-public-key': publicKey || '',

                // Optional/Informational (Legacy)
                'x-imagxp-agent-id': header.agent_id,

                'Content-Type': 'application/json'
            }
        });

        // 4. Handle Response
        if (response.status !== 200) {
            return NextResponse.json(
                { error: `Publisher blocked access. Status: ${response.status}` },
                { status: response.status }
            );
        }

        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            // It's likely HTML (Next.js Page)
            data = await response.text();
        }

        // 5. Return the Clean Content
        return NextResponse.json({
            data: data,
            latency: Date.now() - new Date(header.ts).getTime()
        });

    } catch (error: any) {
        console.error("[AGENT ERROR]", error);
        return NextResponse.json(
            { error: error.message || "Internal Agent Error" },
            { status: 500 }
        );
    }
}
