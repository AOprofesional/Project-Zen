"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Plus, MessageSquare, X, Send, Loader2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { getClientRequests, createClientRequest } from '@/services/clientRequests';
import { ClientRequest } from '@/types';

export function ClientRequestManager({ projectId }: { projectId: string }) {
    const [requests, setRequests] = useState<ClientRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '' });
    const [submitting, setSubmitting] = useState(false);

    const loadRequests = async () => {
        setLoading(true);
        const data = await getClientRequests(projectId);
        setRequests(data);
        setLoading(false);
    };

    useEffect(() => {
        loadRequests();
    }, [projectId]);

    const handleSubmit = async () => {
        if (!formData.title.trim()) return;
        setSubmitting(true);
        try {
            await createClientRequest({
                ...formData,
                project_id: projectId
            });
            setFormData({ title: '', description: '' });
            setIsCreating(false);
            await loadRequests();
        } catch (e) {
            console.error("Error creating request", e);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2 text-blue-400">
                    <MessageSquare size={20} /> Tus Solicitudes al Admin
                </h3>
                {!isCreating && (
                    <Button onClick={() => setIsCreating(true)} size="sm" variant="primary" className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20">
                        <Plus size={16} className="mr-2" /> Nueva Solicitud
                    </Button>
                )}
            </div>

            {isCreating && (
                <Card className="p-4 border-blue-500/20 bg-blue-500/5 animate-in slide-in-from-top duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm font-bold text-blue-400">¿Qué necesitas solicitar?</p>
                        <button onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-white transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <Input
                            placeholder="Título de tu solicitud (ej: Necesito los logos en PNG)"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="bg-black/40 border-white/10"
                        />
                        <textarea
                            placeholder="Explica los detalles aquí..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm min-h-[100px] text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                        <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-500" isLoading={submitting}>
                            <Send size={16} className="mr-2" /> Enviar Solicitud
                        </Button>
                    </div>
                </Card>
            )}

            <div className="space-y-3">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="animate-spin text-blue-500" />
                    </div>
                ) : requests.length === 0 ? (
                    <p className="text-sm text-gray-500 italic text-center py-4 bg-white/[0.01] rounded-lg border border-dashed border-white/5">
                        No has realizado ninguna solicitud todavía.
                    </p>
                ) : (
                    requests.map(request => (
                        <Card key={request.id} className="p-4 border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors group">
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={
                                            request.status === 'RESOLVED' ? 'success' :
                                                request.status === 'PENDING' ? 'default' :
                                                    request.status === 'REJECTED' ? 'error' : 'warning'
                                        } className="text-[10px] uppercase font-bold tracking-wider">
                                            {request.status === 'PENDING' ? 'Pendiente' :
                                                request.status === 'IN_PROGRESS' ? 'En Proceso' :
                                                    request.status === 'RESOLVED' ? 'Resuelto' : 'Rechazado'}
                                        </Badge>
                                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                            <Clock size={10} /> {new Date(request.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-sm text-white">{request.title}</h4>
                                    {request.description && <p className="text-xs text-gray-400 line-clamp-2">{request.description}</p>}

                                    {request.admin_response && (
                                        <div className="mt-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                                            <p className="text-[10px] text-emerald-400 font-bold uppercase mb-1 flex items-center gap-1">
                                                <CheckCircle2 size={12} /> Respuesta del Admin:
                                            </p>
                                            <p className="text-xs text-gray-300 italic">"{request.admin_response}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
