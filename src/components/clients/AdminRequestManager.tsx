"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MessageSquare, CheckCircle2, XCircle, Clock, Loader2, Send } from 'lucide-react';
import { getClientRequests, updateClientRequest, markRequestAsRead } from '@/services/clientRequests';
import { ClientRequest } from '@/types';

export function AdminRequestManager() {
    const [requests, setRequests] = useState<ClientRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [respondingTo, setRespondingTo] = useState<string | null>(null);
    const [response, setResponse] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const loadRequests = async () => {
        setLoading(true);
        const data = await getClientRequests();
        setRequests(data);
        setLoading(false);
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleAction = async (requestId: string, status: 'RESOLVED' | 'REJECTED' | 'IN_PROGRESS') => {
        setSubmitting(true);
        try {
            await updateClientRequest(requestId, {
                status,
                admin_response: response || undefined,
                is_read_by_admin: true
            });
            setRespondingTo(null);
            setResponse("");
            await loadRequests();
        } catch (e) {
            console.error("Error updating request", e);
        } finally {
            setSubmitting(false);
        }
    };

    const handleMarkAsRead = async (requestId: string) => {
        try {
            await markRequestAsRead(requestId);
            setRequests(requests.map(r => r.id === requestId ? { ...r, is_read_by_admin: true } : r));
        } catch (e) {
            console.error("Error marking as read", e);
        }
    };

    if (loading && requests.length === 0) {
        return <Loader2 className="animate-spin text-blue-500 mx-auto my-10" />;
    }

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                <MessageSquare size={20} className="text-blue-500" /> Solicitudes de Clientes
            </h3>

            <div className="space-y-4">
                {requests.length === 0 ? (
                    <Card className="p-10 text-center border-dashed border-white/10 bg-white/[0.01]">
                        <p className="text-gray-500 italic">No hay solicitudes de clientes.</p>
                    </Card>
                ) : (
                    requests.map(request => (
                        <Card
                            key={request.id}
                            className={`p-5 border-white/5 transition-all ${!request.is_read_by_admin ? 'bg-blue-600/5 ring-1 ring-blue-500/20' : 'bg-white/[0.02]'}`}
                            onMouseEnter={() => !request.is_read_by_admin && handleMarkAsRead(request.id)}
                        >
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={
                                                request.status === 'RESOLVED' ? 'success' :
                                                    request.status === 'REJECTED' ? 'error' :
                                                        request.status === 'PENDING' ? 'default' : 'warning'
                                            } className="text-[10px]">
                                                {request.status}
                                            </Badge>
                                            {!request.is_read_by_admin && (
                                                <Badge variant="default" className="bg-blue-500 text-white text-[10px]">NUEVO</Badge>
                                            )}
                                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                <Clock size={10} /> {new Date(request.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-lg text-white">{request.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-medium text-blue-400">
                                                {request.profiles?.full_name || request.profiles?.email || 'Cliente desconocido'}
                                            </span>
                                            <span className="text-gray-600">•</span>
                                            <span className="text-xs text-gray-500">
                                                {request.projects?.name || 'Proyecto desconocido'}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-[10px] h-7 px-2 border-white/10"
                                        onClick={() => setRespondingTo(respondingTo === request.id ? null : request.id)}
                                    >
                                        {respondingTo === request.id ? 'Cerrar' : 'Responder'}
                                    </Button>
                                </div>

                                <p className="text-sm text-gray-400 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                                    {request.description || <span className="italic">Sin descripción</span>}
                                </p>

                                {request.admin_response && respondingTo !== request.id && (
                                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                                        <p className="text-[10px] text-emerald-400 font-bold uppercase mb-1">Tu Respuesta:</p>
                                        <p className="text-xs text-gray-300 italic">"{request.admin_response}"</p>
                                    </div>
                                )}

                                {respondingTo === request.id && (
                                    <div className="space-y-4 pt-2 animate-in slide-in-from-top-2">
                                        <textarea
                                            placeholder="Escribe tu respuesta aquí..."
                                            value={response}
                                            onChange={(e) => setResponse(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                variant="success"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => handleAction(request.id, 'RESOLVED')}
                                                isLoading={submitting}
                                            >
                                                <CheckCircle2 size={16} className="mr-2" /> Resolver
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 text-red-400 border-red-500/20 hover:bg-red-500/10"
                                                onClick={() => handleAction(request.id, 'REJECTED')}
                                                isLoading={submitting}
                                            >
                                                <XCircle size={16} className="mr-2" /> Rechazar
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
