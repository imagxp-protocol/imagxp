
// src/app/api/logs/stream/route.ts
// [OPTIONAL] Custom Dashboard Logger
// This is NOT core SDK code. This is a helper to verify your installation.

import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    // 1. Setup Server-Sent Events (SSE) Stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {

            // 2. Poll for logs (In production, replace with Redis PubSub)
            // This is a naive polling implementation for local testing.
            const interval = setInterval(() => {
                // Mock: Fetch latest log from memory/db
                const recentLog = globalThis._IMAGXP_LATEST_LOG;

                if (recentLog) {
                    const data = JSON.stringify(recentLog);
                    controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                    globalThis._IMAGXP_LATEST_LOG = null; // Clear after sending
                }
            }, 1000);

            // Cleanup on close
            req.signal.addEventListener('abort', () => {
                clearInterval(interval);
                controller.close();
            });
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
