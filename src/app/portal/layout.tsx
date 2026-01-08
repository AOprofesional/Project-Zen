"use client";

import { ReactNode } from 'react';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { YingYangIcon } from '@/components/ui/YingYangIcon';

export default function ClientLayout({ children }: { children: ReactNode }) {
    const supabase = createClient();
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30">
            <header className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/5">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <YingYangIcon size={20} className="text-white" />
                        <span className="font-bold tracking-tight text-white">Project Zen Portal</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <LogOut size={14} />
                        Salir
                    </button>
                </div>
            </header>


            <main className="pt-24 pb-12 px-6 max-w-5xl mx-auto flex flex-col min-h-[calc(100vh-64px)]">
                <div className="flex-1">
                    {children}
                </div>
                <footer className="mt-20 flex justify-end opacity-20 hover:opacity-100 transition-opacity">
                    <p className="text-[9px] text-gray-400 font-medium tracking-[0.2em] uppercase">
                        realizado por: AO Profesional
                    </p>
                </footer>
            </main>
        </div>
    );
}
