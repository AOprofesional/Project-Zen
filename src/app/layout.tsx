import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
    title: 'Project Zen Dashboard',
    description: 'Premium Organization & Client Management',
    icons: {
        icon: '/icon.svg',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body className={`${inter.variable} min-h-screen bg-background text-primary selection:bg-accent/30`}>
                {children}
            </body>
        </html>
    );
}
