"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Plus, Loader2, CheckCircle, RefreshCcw, Send, Trash2, X } from 'lucide-react';
import { getClientActions, createClientAction } from '@/services/clientActions';
import { ProjectAction } from '@/types';

export function AdminClientActions({ projectId }: { projectId: string }) {
    const [actions, setActions] = useState<ProjectAction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newAction, setNewAction] = useState<{
        title: string;
        description: string;
        type: 'APPROVAL' | 'INFORMATION';
    }>({
        title: '',
        description: '',
        type: 'APPROVAL'
    });

    const loadActions = async () => {
        setLoading(true);
        const data = await getClientActions(projectId);
        setActions(data);
        setLoading(false);
    };

    useEffect(() => {
        loadActions();
    }, [projectId]);

    const handleCreate = async () => {
        if (!newAction.title.trim()) return;
        setLoading(true);
        try {
            await createClientAction({
                ...newAction,
                project_id: projectId
            });
            setNewAction({ title: '', description: '', type: 'APPROVAL' });
            setIsCreating(false);
            await loadActions();
        } catch (e) {
            console.error("Error creating client action", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading && actions.length === 0) {
        return <Loader2 className="animate-spin text-emerald-500 mx-auto" />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Send size={20} className="text-emerald-500" /> Pendientes del Cliente
                </h3>
                {!isCreating && (
                    <Button onClick={() => setIsCreating(true)} size="sm" variant="secondary" className="h-8">
                        <Plus size={14} className="mr-1" /> Nueva Solicitud
                    </Button>
                )}
            </div>

            {isCreating && (
                <Card className="p-4 border-emerald-500/20 bg-emerald-500/5 animate-in slide-in-from-top duration-300">
                    <div className="flex justify-between mb-4">
                        <p className="text-sm font-bold text-emerald-400">Crear Nueva Solicitud</p>
                        <button onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <Input
                            placeholder="Título claro (ej: Aprobar diseño final)"
                            value={newAction.title}
                            onChange={e => setNewAction({ ...newAction, title: e.target.value })}
                        />
                        <textarea
                            placeholder="Descripción de lo que se necesita..."
                            value={newAction.description}
                            onChange={e => setNewAction({ ...newAction, description: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm min-h-[80px]"
                        />
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                                <input
                                    type="radio"
                                    name="actionType"
                                    checked={newAction.type === 'APPROVAL'}
                                    onChange={() => setNewAction(prev => ({ ...prev, type: 'APPROVAL' }))}
                                /> Aprobación
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                                <input
                                    type="radio"
                                    name="actionType"
                                    checked={newAction.type === 'INFORMATION'}
                                    onChange={() => setNewAction(prev => ({ ...prev, type: 'INFORMATION' }))}
                                /> Información/Archivo
                            </label>
                        </div>
                        <Button onClick={handleCreate} className="w-full" size="sm">
                            Enviar al Cliente
                        </Button>
                    </div>
                </Card>
            )}

            <div className="space-y-3">
                {actions.length === 0 && !isCreating && (
                    <p className="text-sm text-gray-600 italic">No se han solicitado acciones al cliente.</p>
                )}
                {actions.map(action => (
                    <Card key={action.id} className="p-4 border-white/5 bg-white/[0.01]">
                        <div className="flex justify-between items-start gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant={
                                        action.status === 'APPROVED' ? 'success' :
                                            action.status === 'CHANGES_REQUESTED' ? 'warning' : 'default'
                                    } className="text-[10px]">
                                        {action.status === 'PENDING' ? 'PENDIENTE' :
                                            action.status === 'APPROVED' ? 'APROBADO' :
                                                action.status === 'SENT' ? 'RECIBIDO' : 'CON CAMBIOS'}
                                    </Badge>
                                    <span className="text-[10px] text-gray-500">{action.type}</span>
                                </div>
                                <h4 className="font-bold text-sm text-white">{action.title}</h4>
                                {action.description && <p className="text-xs text-gray-400 line-clamp-2">{action.description}</p>}

                                {action.client_response && (
                                    <div className="mt-3 p-2 bg-black/20 rounded border border-white/5">
                                        <p className="text-[10px] uppercase text-gray-500 mb-1 font-bold">Respuesta del cliente:</p>
                                        <p className="text-xs text-gray-300 italic">"{action.client_response}"</p>
                                    </div>
                                )}
                            </div>

                            {action.status === 'PENDING' && (
                                <button className="text-gray-600 hover:text-red-400 transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
