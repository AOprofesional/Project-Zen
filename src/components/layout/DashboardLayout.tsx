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
            <main className="md:ml-64 min-h-screen p-4 md:p-8 pt-20 md:pt-8 bg-gradient-radial from-white/5 to-transparent flex flex-col">
                <div className="max-w-7xl mx-auto w-full flex-1">
                    {children}
                </div>
                <footer className="mt-auto pt-10 pb-4 flex justify-end">
                    <p className="text-[10px] text-gray-600 font-medium tracking-widest uppercase opacity-40 hover:opacity-100 transition-opacity">
                        realizado por: <span className="text-gray-500">AO Profesional</span>
                    </p>
                </footer>
            </main>
        </div>
    );
}
