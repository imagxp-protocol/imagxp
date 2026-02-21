import React from 'react';
import './globals.css';

export const metadata = {
    title: 'Writings',
    description: 'Essays and observations on design, code, and technology',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className="antialiased text-gray-900 bg-white max-w-2xl mx-auto px-6 py-12 font-sans">
                <header className="mb-16">
                    <h1 className="text-3xl font-light tracking-tight text-gray-800">Writings</h1>
                    <p className="text-gray-500 mt-2 text-sm">Essays and observations on design, code, and technology</p>
                </header>
                <main>{children}</main>
                <footer className="mt-20 pt-8 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                    <span>&copy; 2025 All thoughts are original</span>
                    <div className="space-x-4">
                        <a href="#" className="hover:text-gray-600">Twitter</a>
                        <a href="#" className="hover:text-gray-600">GitHub</a>
                        <a href="#" className="hover:text-gray-600">Email</a>
                    </div>
                </footer>
            </body>
        </html>
    );
}
