"use client";

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminRequestManager } from '@/components/clients/AdminRequestManager';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminRequestsPage() {
    const router = useRouter();

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver al dashboard
                </button>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Gestión de Solicitudes</h1>
                    <p className="text-gray-400">Atiende las peticiones y consultas enviadas por los clientes.</p>
                </div>

                <AdminRequestManager />
            </div>
        </DashboardLayout>
    );
}
