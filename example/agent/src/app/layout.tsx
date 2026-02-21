import React from 'react';
import './globals.css';

export const metadata = {
    title: 'IMAGXP Search Agent',
    description: 'AI-Powered Search',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className="antialiased">{children}</body>
        </html>
    );
}
