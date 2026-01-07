"use client";

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserList } from '@/components/settings/UserList';

export default function UsersPage() {
    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header>
                    <h2 className="text-3xl font-bold">Gestión de Usuarios</h2>
                    <p className="text-gray-400">Administra todos los accesos al sistema, incluyendo administradores y clientes.</p>
                </header>

                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                    <UserList />
                </div>

                <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6">
                    <h4 className="font-bold text-blue-100 mb-2">Seguridad y Control</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Desde aquí puedes dar de alta nuevos miembros del equipo o clientes.
                        Recuerda que los <strong>Administradores</strong> tienen control total sobre el sistema,
                        mientras que los <strong>Clientes</strong> solo ven sus proyectos asignados.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}
