
import { IMAGXPAgent } from '@imagxp/protocol';

async function main() {
    // 1. Load your Identity (Requires .env IMAGXP_PRIVATE_KEY)
    const agent = await IMAGXPAgent.init();

    // 2. The Crawler Loop (Universal)
    // In a Real App: You don't hardcode a list here. 
    // You fetch 100 URLs at a time from your Database (The "Crawl Priority List").
    // This allows you to scale to Billions of pages.
    const queue = ["https://nytimes.com", "https://random-blog.com", "https://any-site.org"];

    for (const url of queue) {
        console.log(`[CRAWL] Visiting ${url}...`);

        // IMAGXP SDK automatically:
        // 1. Checks if site supports AAMP
        // 2. Signs the request using Identity
        // 3. Negotiates access
        const response = await agent.fetch(url, {
            purpose: "RAG_RETRIEVAL"
        });

        if (response.status === 200) {
            console.log(`[SUCCESS] Accessed ${url}.`);
            await analyzeContent(agent, response.data, url);
        } else {
            console.log(`[BLOCKED] ${url} refused access. Status: ${response.status}`);
        }
    }
}

async function analyzeContent(agent: any, content: any, url: string) {
    // 1. Run your Internal Quality Check
    // Example: myAiDetector(content);
    const score = 0.9; // Assume good content

    // 2. If it's Junk, Report it!
    if (score < 0.5) {
        // Send a "Signed Dispute" back to the Publisher
        await agent.sendFeedback(url, {
            score: 0.1,
            reason: "LOW_QUALITY_SPAM"
        });

        console.log("Payment Refused: Quality too low.");
    } else {
        // Content is Good -> Trigger Payment (Handled by Broker automatically)
        console.log("Quality Verified. Payment Authorized.");
    }
}

main();
