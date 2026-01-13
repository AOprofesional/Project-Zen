"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { MessageSquare, Bell, ArrowRight, Loader2 } from 'lucide-react';
import { getClientRequests } from '@/services/clientRequests';
import { ClientRequest } from '@/types';
import Link from 'next/link';

export function ClientRequestNotification() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCounts = async () => {
            const requests = await getClientRequests();
            const unread = requests.filter(r => !r.is_read_by_admin && r.status === 'PENDING').length;
            setUnreadCount(unread);
            setLoading(false);
        };

        loadCounts();
        // Set up a small interval for "notifications"
        const interval = setInterval(loadCounts, 60000); // Every minute
        return () => clearInterval(interval);
    }, []);

    if (loading) return null;
    if (unreadCount === 0) return null;

    return (
        <Card className="bg-blue-600/10 border-blue-500/30 p-4 animate-pulse">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                    <Bell size={20} />
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-bold text-blue-100">Solicitudes de Clientes</h4>
                    <p className="text-xs text-blue-300/80 mt-1">
                        Tienes {unreadCount} {unreadCount === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'} de revisión.
                    </p>
                    <Link
                        href="/dashboard/requests"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 hover:text-blue-300 mt-3 uppercase tracking-wider transition-colors"
                    >
                        Ver todas las solicitudes <ArrowRight size={12} />
                    </Link>
                </div>
            </div>
        </Card>
    );
}
