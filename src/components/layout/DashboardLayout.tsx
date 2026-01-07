import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileMenu } from './MobileMenu';

interface DashboardLayoutProps {
    children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-background text-white selection:bg-accent/20">
            <Sidebar />
            <MobileMenu />
            {/* Main Content Area - offset by sidebar width on desktop */}
            <main className="md:ml-64 min-h-screen p-4 md:p-8 pt-20 md:pt-8 bg-gradient-radial from-white/5 to-transparent">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
