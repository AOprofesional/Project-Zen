"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Plus, Loader2, CheckCircle, RefreshCcw, Send, Trash2, X, Archive, ArchiveRestore, Eye, EyeOff, MessageSquare, ArrowRight } from 'lucide-react';
import { getClientActions, createClientAction, deleteClientAction, archiveClientAction, updateClientAction } from '@/services/clientActions';
import { getClientRequests } from '@/services/clientRequests';
import { ProjectAction, ClientRequest } from '@/types';
import Link from 'next/link';

export function AdminClientActions({ projectId }: { projectId: string }) {
    const [actions, setActions] = useState<ProjectAction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showArchived, setShowArchived] = useState(false);
    const [clientRequests, setClientRequests] = useState<ClientRequest[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [formData, setFormData] = useState<{
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
        const data = await getClientActions(projectId, showArchived);
        setActions(data);
        setLoading(false);
    };

    const loadClientRequests = async () => {
        setLoadingRequests(true);
        const data = await getClientRequests(projectId);
        setClientRequests(data.filter(r => r.status === 'PENDING'));
        setLoadingRequests(false);
    };

    useEffect(() => {
        loadActions();
        loadClientRequests();
    }, [projectId, showArchived]);

    const resetForm = () => {
        setFormData({ title: '', description: '', type: 'APPROVAL' });
        setEditingId(null);
        setIsCreating(false);
    };

    const handleEdit = (action: ProjectAction) => {
        setFormData({
            title: action.title,
            description: action.description || '',
            type: action.type
        });
        setEditingId(action.id);
        setIsCreating(true);
    };

    const handleSubmit = async () => {
        if (!formData.title.trim()) return;
        setLoading(true);
        try {
            if (editingId) {
                await updateClientAction(editingId, {
                    ...formData,
                    // If status was changes requested, reset to pending so client sees it again
                    // If it was completed/sent, we might want to keep it or confirm reset. 
                    // For now, assume editing always implies re-submission/correction.
                    status: 'PENDING',
                    // Optional: Append previous response to admin notes or description?
                    // For now, we just update the content.
                    client_response: undefined, // Clear client response so they can respond again
                });
            } else {
                await createClientAction({
                    ...formData,
                    project_id: projectId
                });
            }
            resetForm();
            await loadActions();
        } catch (e) {
            console.error("Error saving client action", e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar permanentemente esta solicitud?')) return;
        try {
            await deleteClientAction(id);
            await loadActions();
        } catch (e) {
            console.error("Error deleting action", e);
        }
    };

    const handleArchive = async (id: string, archive: boolean) => {
        try {
            await archiveClientAction(id, archive);
            await loadActions();
        } catch (e) {
            console.error("Error archiving action", e);
        }
    };

    if (loading && actions.length === 0) {
        return <Loader2 className="animate-spin text-emerald-500 mx-auto" />;
    }

    return (
        <div className="space-y-6">
            {clientRequests.length > 0 && (
                <Card className="bg-blue-600/10 border-blue-500/20 p-4 animate-in slide-in-from-top duration-500">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                <MessageSquare size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-blue-100">Este cliente tiene solicitudes</h4>
                                <p className="text-xs text-blue-300/80">Hay {clientRequests.length} {clientRequests.length === 1 ? 'pedido pendiente' : 'pedidos pendientes'} de revisión para este proyecto.</p>
                            </div>
                        </div>
                        <Link href="/dashboard/requests">
                            <Button size="sm" variant="secondary" className="h-8 text-xs bg-blue-600 hover:bg-blue-500 border-none text-white whitespace-nowrap">
                                Ver Solicitudes <ArrowRight size={14} className="ml-2" />
                            </Button>
                        </Link>
                    </div>
                </Card>
            )}

            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Send size={20} className="text-emerald-500" /> Pendientes del Cliente
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowArchived(!showArchived)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors ${showArchived ? 'bg-gray-700 text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                    >
                        {showArchived ? <EyeOff size={12} /> : <Eye size={12} />}
                        {showArchived ? 'Ocultar archivados' : 'Ver archivados'}
                    </button>
                    {!isCreating && (
                        <Button onClick={() => { resetForm(); setIsCreating(true); }} size="sm" variant="secondary" className="h-8">
                            <Plus size={14} className="mr-1" /> Nueva Solicitud
                        </Button>
                    )}
                </div>
            </div>

            {isCreating && (
                <Card className="p-4 border-emerald-500/20 bg-emerald-500/5 animate-in slide-in-from-top duration-300">
                    <div className="flex justify-between mb-4">
                        <p className="text-sm font-bold text-emerald-400">
                            {editingId ? 'Editar / Responder Solicitud' : 'Crear Nueva Solicitud'}
                        </p>
                        <button onClick={resetForm} className="text-gray-500 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <Input
                            placeholder="Título claro (ej: Aprobar diseño final)"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                        <textarea
                            placeholder="Descripción de lo que se necesita..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm min-h-[80px]"
                        />
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                                <input
                                    type="radio"
                                    name="actionType"
                                    checked={formData.type === 'APPROVAL'}
                                    onChange={() => setFormData(prev => ({ ...prev, type: 'APPROVAL' }))}
                                /> Aprobación
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                                <input
                                    type="radio"
                                    name="actionType"
                                    checked={formData.type === 'INFORMATION'}
                                    onChange={() => setFormData(prev => ({ ...prev, type: 'INFORMATION' }))}
                                /> Información/Archivo
                            </label>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleSubmit} className="flex-1" size="sm">
                                {editingId ? 'Actualizar y Reenviar' : 'Enviar al Cliente'}
                            </Button>
                            {editingId && (
                                <Button
                                    onClick={() => handleDelete(editingId)}
                                    variant="outline"
                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 px-3"
                                    size="sm"
                                    title="Eliminar Solicitud"
                                >
                                    <Trash2 size={16} />
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            <div className="space-y-3">
                {actions.length === 0 && !isCreating && (
                    <p className="text-sm text-gray-600 italic">No se han solicitado acciones al cliente.</p>
                )}
                {actions.map(action => (
                    <Card key={action.id} className={`p-4 border-white/5 relative group ${action.is_archived ? 'bg-white/[0.005] opacity-60' : 'bg-white/[0.02]'}`}>
                        <div className="flex justify-between items-start gap-4">
                            <div className="space-y-2 flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    {action.is_archived && (
                                        <Badge variant="default" className="text-[10px] bg-gray-500/20 text-gray-400">ARCHIVADO</Badge>
                                    )}
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
                                <h4 className="font-bold text-sm text-white truncate" title={action.title}>{action.title}</h4>
                                {action.description && <p className="text-xs text-gray-400 line-clamp-2">{action.description}</p>}

                                {action.client_response && (
                                    <div className={`mt-3 p-3 rounded border border-white/5 ${action.status === 'CHANGES_REQUESTED' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-black/20'}`}>
                                        <p className={`text-[10px] uppercase mb-1 font-bold ${action.status === 'CHANGES_REQUESTED' ? 'text-amber-400' : 'text-gray-500'}`}>
                                            {action.status === 'CHANGES_REQUESTED' ? '⚠️ Cambios Solicitados por Cliente:' : 'Respuesta del cliente:'}
                                        </p>
                                        <p className="text-xs text-gray-300 italic">"{action.client_response}"</p>

                                        {action.status === 'CHANGES_REQUESTED' && !action.is_archived && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="mt-2 w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs h-7"
                                                onClick={() => handleEdit(action)}
                                            >
                                                <RefreshCcw size={12} className="mr-2" /> Responder / Editar Solicitud
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg p-1 border border-white/10 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2">
                                {!action.is_archived && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(action); }}
                                        className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-md transition-all"
                                        title="Editar / Responder"
                                    >
                                        <RefreshCcw size={16} />
                                    </button>
                                )}
                                {action.is_archived ? (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleArchive(action.id, false); }}
                                        className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded-md transition-all"
                                        title="Restaurar"
                                    >
                                        <ArchiveRestore size={16} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleArchive(action.id, true); }}
                                        className="p-1.5 text-amber-400 hover:bg-amber-500/20 rounded-md transition-all"
                                        title="Archivar"
                                    >
                                        <Archive size={16} />
                                    </button>
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(action.id); }}
                                    className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-md transition-all"
                                    title="Eliminar permanentemente"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
