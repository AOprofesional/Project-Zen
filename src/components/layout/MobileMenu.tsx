"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Home, CheckSquare, FileText, Users, Settings, LogOut } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { createClient } from '@/lib/supabase';
import { YingYangIcon } from '@/components/ui/YingYangIcon';

const MENU_ITEMS = [
    { icon: Home, label: 'Inicio', href: '/dashboard' },
    { icon: CheckSquare, label: 'Mis Tareas', href: '/dashboard/tasks' },
    { icon: FileText, label: 'Notas', href: '/dashboard/notes' },
    { label: 'Clientes & Proyectos', href: '/dashboard/clients', icon: Users },
    { label: 'Configuración', href: '/dashboard/settings', icon: Settings },
];

export function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            window.location.href = '/login';
        } catch (error) {
            console.error('Error logging out:', error);
            router.push('/login');
        }
    };

    const toggleMenu = () => setIsOpen(!isOpen);

    // Fallback if icons are missing or failing to render (unlikely but good for debug)
    const MenuIcon = Menu || (() => <span>☰</span>);
    const CloseIcon = X || (() => <span>✕</span>);

    return (
        <>
            {/* Mobile Header - High visibility */}
            <header className="md:hidden fixed top-0 left-0 w-full h-16 bg-[#0c0c0e] border-b border-white/10 flex items-center justify-between px-4 z-[60] shadow-lg">
                <div className="flex items-center gap-2">
                    <YingYangIcon size={24} className="text-white" />
                    <span className="font-bold text-white tracking-tight">Project Zen</span>
                </div>
                <button
                    onClick={toggleMenu}
                    className="p-2 text-white bg-white/5 rounded-lg active:bg-white/10 transition-colors"
                    aria-label="Toggle menu"
                >
                    {isOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
                </button>
            </header>

            {/* Mobile Menu Overlay */}
            <div
                className={twMerge(
                    "fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] md:hidden transition-all duration-300",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={toggleMenu}
            />

            {/* Mobile Menu Content */}
            <aside
                className={twMerge(
                    "fixed top-0 right-0 h-screen w-72 bg-[#0c0c0e] border-l border-white/10 z-[80] md:hidden flex flex-col transition-transform duration-300 transform",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="p-6 flex justify-between items-center border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <YingYangIcon size={24} className="text-white" />
                        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                            Menú
                        </h1>
                    </div>
                    <button
                        onClick={toggleMenu}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {MENU_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={twMerge(
                                    "flex items-center gap-3 px-4 py-4 rounded-lg text-sm font-medium transition-all group",
                                    isActive
                                        ? "bg-white/10 text-white border border-white/5"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <Icon
                                    size={20}
                                    className={twMerge(
                                        "transition-colors",
                                        isActive ? "text-white" : "text-gray-500 group-hover:text-white"
                                    )}
                                />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5 pb-10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-4 w-full text-sm font-medium text-gray-400 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={20} />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>
        </>
    );
}
