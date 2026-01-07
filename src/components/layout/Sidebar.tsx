"use client";

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, Lightbulb, LogOut, Users, Settings, Home, FileText } from 'lucide-react';
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

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter(); // Asegúrate de importar esto

    // Lazy import or use standard import if already available. 
    // Usually useRouter is from 'next/navigation'.
    // We need to import createClient from browser lib here.
    const supabase = createClient();

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            // Usamos un redirect forzado para limpiar cualquier estado persistente
            window.location.href = '/login';
        } catch (error) {
            console.error('Error logging out:', error);
            router.push('/login');
        }
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-black/40 border-r border-white/5 backdrop-blur-xl flex flex-col hidden md:flex z-50">
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <YingYangIcon size={24} className="text-white" />
                    <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Project Zen
                    </h1>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={twMerge(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
                                isActive
                                    ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/5"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Icon
                                size={18}
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

            <div className="p-4 border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-gray-500 hover:text-red-400 transition-colors"
                >
                    <LogOut size={18} />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}
