'use client';

import { useState } from 'react';

export default function Home() {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setResult(null);
        setError('');

        try {
            const res = await fetch('/api/crawl', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: query })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to fetch');

            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">

                {/* Header */}
                <div className="p-8 text-center border-b border-gray-50 bg-white">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">IMAGXP Search Agent</h1>
                    <p className="text-gray-500 mt-2">Enter a URL to access protected content via the Protocol.</p>
                </div>

                {/* Search Input */}
                <div className="p-8 bg-gray-50/50">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="url"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="https://my-blog-publisher.vercel.app/posts/minimalist-design"
                            className="w-full pl-5 pr-12 py-4 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm text-gray-800 placeholder-gray-400"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="absolute right-3 top-3 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            )}
                        </button>
                    </form>
                </div>

                {/* Results Area */}
                <div className="min-h-[300px] p-8 bg-white">
                    {error && (
                        <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-start gap-3">
                            <span className="text-xl">⚠️</span>
                            <div>
                                <strong className="font-semibold block">Access Denied</strong>
                                <span className="text-sm opacity-90">{error}</span>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div className="animate-fade-in">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded border border-green-200">
                                    VERIFIED ACCESS
                                </span>
                                <span className="text-xs text-gray-400 font-mono">
                                    {result.latency}ms
                                </span>
                            </div>

                            <div className="prose prose-sm max-w-none text-gray-800">
                                {/* We render the raw HTML content we fetched */}
                                <div dangerouslySetInnerHTML={{ __html: result.data }} />
                            </div>
                        </div>
                    )}

                    {!result && !error && !loading && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-4 py-12">
                            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                                <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                            </div>
                            <p>Ready to search the decentralized web.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
