import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { YingYangIcon } from '@/components/ui/YingYangIcon';

interface DashboardLayoutProps {
    children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-background text-white selection:bg-accent/20">
            <Sidebar />
            {/* Main Content Area - offset by sidebar width on desktop */}
            <main className="md:ml-64 min-h-screen p-4 md:p-8 pt-20 md:pt-8 bg-gradient-radial from-white/5 to-transparent">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Mobile Overlay (Simplified for now) */}
            <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center px-4 z-40">
                <YingYangIcon size={20} className="text-white" />
                <span className="font-bold text-white">Project Zen</span>
            </div>
        </div>
    );
}
