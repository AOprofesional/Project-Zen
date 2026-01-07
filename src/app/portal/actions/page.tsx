"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2, ArrowLeft, CheckCircle, RefreshCcw, Send, FileUp, Info } from 'lucide-react';
import { getClientActions, respondToAction } from '@/services/clientActions';
import { ProjectAction } from '@/types';

function ClientActionsContent() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get('project');
    const router = useRouter();
    const [actions, setActions] = useState<ProjectAction[]>([]);
    const [loading, setLoading] = useState(true);
    const [responding, setResponding] = useState<string | null>(null);
    const [comment, setComment] = useState("");

    const loadActions = async () => {
        if (!projectId) return;
        setLoading(true);
        const data = await getClientActions(projectId);
        setActions(data);
        setLoading(false);
    };

    useEffect(() => {
        loadActions();
    }, [projectId]);

    const handleResponse = async (actionId: string, status: 'APPROVED' | 'CHANGES_REQUESTED' | 'SENT') => {
        if (status === 'CHANGES_REQUESTED' && !comment.trim()) {
            alert("Por favor, explica qué cambios necesitas.");
            return;
        }

        setResponding(actionId);
        try {
            await respondToAction(actionId, status, comment);
            setComment("");
            await loadActions();
        } catch (e) {
            console.error("Failed to respond to action", e);
        } finally {
            setResponding(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <Loader2 className="animate-spin text-emerald-500" size={48} />
                <p className="text-gray-500">Cargando pendientes...</p>
            </div>
        );
    }

    const pendingOnClient = actions.filter(a => a.status === 'PENDING' || a.status === 'CHANGES_REQUESTED');

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver al proyecto
            </button>

            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Pendientes de tu parte</h1>
                <p className="text-gray-400">Acciones necesarias para que el proyecto pueda avanzar.</p>
            </div>

            {pendingOnClient.length === 0 ? (
                <Card className="py-12 text-center bg-emerald-500/5 border-emerald-500/10">
                    <CheckCircle className="mx-auto text-emerald-500 mb-4" size={48} />
                    <h2 className="text-xl font-bold text-emerald-100">¡Todo al día!</h2>
                    <p className="text-gray-400 mt-2">No hay acciones pendientes de tu parte en este momento.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {pendingOnClient.map(action => (
                        <Card key={action.id} className="p-6 border-white/5 bg-white/[0.02]">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3">
                                        <Badge variant={action.type === 'APPROVAL' ? 'warning' : 'default'} className="uppercase text-[10px] tracking-wider">
                                            {action.type === 'APPROVAL' ? 'Aprobación' : 'Información'}
                                        </Badge>
                                        <span className="text-xs text-secondary italic">Creado el {new Date(action.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">{action.title}</h3>
                                        <p className="text-gray-400 leading-relaxed">{action.description}</p>
                                    </div>

                                    {action.status === 'CHANGES_REQUESTED' && (
                                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                            <p className="text-xs font-bold text-amber-500 mb-1 flex items-center gap-1">
                                                <RefreshCcw size={12} /> Cambios solicitados anteriormente:
                                            </p>
                                            <p className="text-sm text-amber-200/80 italic">"{action.client_response}"</p>
                                        </div>
                                    )}
                                </div>

                                <div className="w-full md:w-80 space-y-4 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-white/5 md:pl-6 leading-relaxed">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-4">Tu Respuesta</p>

                                    <div className="space-y-4">
                                        <textarea
                                            placeholder={action.type === 'APPROVAL' ? "Opcional: Comentarios o ajustes necesarios..." : "Escribe aquí la información solicitada o el link al archivo..."}
                                            value={responding === action.id ? comment : (responding === null ? "" : "")}
                                            onChange={(e) => {
                                                setResponding(action.id);
                                                setComment(e.target.value);
                                            }}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all min-h-[100px] resize-none"
                                        />

                                        <div className="grid grid-cols-2 gap-2">
                                            {action.type === 'APPROVAL' ? (
                                                <>
                                                    <Button
                                                        variant="success"
                                                        className="w-full h-10 text-xs"
                                                        onClick={() => handleResponse(action.id, 'APPROVED')}
                                                        isLoading={responding === action.id}
                                                    >
                                                        <CheckCircle size={14} className="mr-2" /> Aprobar
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full h-10 text-xs border-amber-500/20 text-amber-500 hover:bg-amber-500/10"
                                                        onClick={() => handleResponse(action.id, 'CHANGES_REQUESTED')}
                                                        isLoading={responding === action.id}
                                                    >
                                                        <RefreshCcw size={14} className="mr-2" /> Solicitar Cambios
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    variant="primary"
                                                    className="w-full h-10 text-xs col-span-2 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                                                    onClick={() => handleResponse(action.id, 'SENT')}
                                                    isLoading={responding === action.id}
                                                >
                                                    <Send size={14} className="mr-2" /> Marcar como Enviado
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6 flex gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 h-fit">
                    <Info size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-blue-100">Colaboración Zen</h4>
                    <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                        Para continuar con el proyecto necesitamos tu confirmación en estos puntos.
                        Tu respuesta nos ayuda a mantener el ritmo y asegurar que el resultado final sea exactamente lo que esperas.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function ClientActionsPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <Loader2 className="animate-spin text-emerald-500" size={48} />
                <p className="text-gray-500">Iniciando...</p>
            </div>
        }>
            <ClientActionsContent />
        </Suspense>
    );
}
