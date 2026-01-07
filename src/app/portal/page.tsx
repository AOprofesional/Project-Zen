"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle, Clock, FileText, ExternalLink, Loader2, LayoutGrid, AlertCircle } from 'lucide-react';
import { getClientPortalData, getClientProjects, PortalData } from '@/services/portal';
import { ClientTaskView } from '@/components/portal/ClientTaskView';
import { Project } from '@/types';

export default function ClientPortalPage() {
    const [data, setData] = useState<PortalData | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const router = useRouter();

    const loadProjects = async () => {
        const clientProjects = await getClientProjects();
        setProjects(clientProjects);
        if (clientProjects.length > 0 && !selectedProjectId) {
            setSelectedProjectId(clientProjects[0].id);
        } else if (clientProjects.length === 0) {
            setLoading(false);
        }
    };

    const loadProjectData = async (id: string) => {
        setLoading(true);
        try {
            const portalData = await getClientPortalData(id);
            setData(portalData);
        } catch (e) {
            console.error("Failed to load portal data", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        if (selectedProjectId) {
            loadProjectData(selectedProjectId);
        }
    }, [selectedProjectId]);

    if (loading && !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <Loader2 className="animate-spin text-emerald-500" size={48} />
                <p className="text-gray-500 animate-pulse">Cargando tus proyectos...</p>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="text-center py-20 px-4">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-12 max-w-xl mx-auto backdrop-blur-xl">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-400">
                        <LayoutGrid size={40} />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">No hay proyectos asignados</h1>
                    <p className="text-gray-400 leading-relaxed">
                        Parece que aún no tienes proyectos vinculados a tu cuenta. <br />
                        Cuando el administrador te asigne uno, aparecerá aquí automáticamente.
                    </p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { project, resources, tasks, actions } = data;

    // Calculate Actions
    const pendingActions = actions.filter(a => a.status === 'PENDING' || a.status === 'CHANGES_REQUESTED');
    const hasPendingActions = pendingActions.length > 0;

    // Calculate Stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const nextDeadline = tasks
        .filter(t => t.status !== 'COMPLETED' && t.due_date)
        .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())[0];

    const documents = resources.filter(r => r.type === 'DOCUMENT');
    const deliverables = resources.filter(r => r.type === 'DELIVERABLE');

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            {/* Project Selector (Only if multiple) */}
            {projects.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {projects.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedProjectId(p.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${selectedProjectId === p.id
                                ? 'bg-white text-black'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            {p.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Project Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Badge variant={hasPendingActions ? 'warning' : (project.status === 'ACTIVE' ? 'success' : 'default')} className="px-3 py-1 text-sm">
                        {hasPendingActions ? 'En espera de tu respuesta' : (project.status === 'ACTIVE' ? 'En curso' : 'En Pausa')}
                    </Badge>
                    {project.deadline && (
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock size={14} /> Entrega: {new Date(project.deadline).toLocaleDateString()}
                        </span>
                    )}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                    {project.name}
                </h1>
                {project.description && (
                    <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                        {project.description}
                    </p>
                )}
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex flex-col gap-4 border-emerald-500/20 bg-emerald-500/5">
                    <div className="p-3 bg-emerald-500/10 w-fit rounded-lg text-emerald-400">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{progress}% Completado</h3>
                        <p className="text-sm text-gray-400">Progreso de tareas</p>
                    </div>
                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-auto">
                        <div
                            className="bg-emerald-500 h-full transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </Card>

                <Card className="flex flex-col gap-4">
                    <div className="p-3 bg-white/10 w-fit rounded-lg text-white">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Próximo Hito</h3>
                        <p className="text-sm text-gray-400">
                            {nextDeadline
                                ? `${nextDeadline.content} (${new Date(nextDeadline.due_date!).toLocaleDateString()})`
                                : 'No hay tareas pendientes con fecha.'}
                        </p>
                    </div>
                </Card>

                <Card className="flex flex-col gap-4">
                    <div className={`p-3 w-fit rounded-lg ${hasPendingActions ? 'bg-amber-500/10 text-amber-500' : 'bg-white/10 text-gray-400'}`}>
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Acciones Requeridas</h3>
                        <p className="text-sm text-gray-400">
                            {hasPendingActions
                                ? `${pendingActions.length} pendientes de tu parte`
                                : 'No hay acciones pendientes'}
                        </p>
                    </div>
                    {hasPendingActions && (
                        <button
                            onClick={() => router.push(`/portal/actions?project=${project.id}`)}
                            className="mt-auto text-xs font-medium text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
                        >
                            Ver pendientes <ExternalLink size={12} />
                        </button>
                    )}
                </Card>

                <Card className="flex flex-col gap-4">
                    <div className="p-3 bg-blue-500/10 w-fit rounded-lg text-blue-400">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Recursos</h3>
                        <p className="text-sm text-gray-400">{resources.length} Archivos disponibles</p>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left: Tasks */}
                <div className="lg:col-span-2">
                    <ClientTaskView tasks={tasks} onTasksChange={() => loadProjectData(selectedProjectId!)} />
                </div>

                {/* Right: Resources */}
                <div className="space-y-8">
                    <div>
                        <h3 className="text-lg font-bold text-gray-300 mb-4 flex items-center gap-2">
                            <CheckCircle size={18} className="text-emerald-500" /> Entregables
                        </h3>
                        <div className="space-y-3">
                            {deliverables.length === 0 && <p className="text-sm text-gray-600 italic">No hay entregables listos.</p>}
                            {deliverables.map(r => (
                                <Card key={r.id} className="p-3 bg-emerald-900/10 border-emerald-500/20 hover:bg-emerald-900/20 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <p className="font-medium text-emerald-100 text-sm">{r.title}</p>
                                        {r.url && (
                                            <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded hover:bg-emerald-500/30 transition-colors">
                                                <ExternalLink size={12} /> Abrir
                                            </a>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-300 mb-4 flex items-center gap-2">
                            <FileText size={18} className="text-blue-500" /> Documentación
                        </h3>
                        <div className="space-y-3">
                            {documents.length === 0 && <p className="text-sm text-gray-600 italic">No hay documentos compartidos.</p>}
                            {documents.map(r => (
                                <Card key={r.id} className="p-3 bg-blue-900/10 border-blue-500/20 hover:bg-blue-900/20 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <p className="font-medium text-blue-100 text-sm">{r.title}</p>
                                        {r.url && (
                                            <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-500/30 transition-colors">
                                                <ExternalLink size={12} /> Abrir
                                            </a>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
