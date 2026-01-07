"use client";

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getProjectDetails, deleteProject } from '@/services/projects';
import { Project, ProjectResource, UserProfile } from '@/types';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Calendar, Briefcase, Clock, Trash2, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ClientAssigner } from '@/components/clients/ClientAssigner';
import { ResourceManager } from '@/components/clients/ResourceManager';
import { Badge } from '@/components/ui/Badge';
import { ProjectTasksManager } from '@/components/clients/ProjectTasksManager';
import { AdminClientActions } from '@/components/clients/AdminClientActions';
import { EditProjectModal } from '@/components/clients/EditProjectModal';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
    const [data, setData] = useState<{ project: Project; resources: ProjectResource[]; client: UserProfile | null } | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const router = useRouter();

    const fetchData = async () => {
        try {
            const result = await getProjectDetails(params.id);
            setData(result);
        } catch (e) {
            console.error(e);
            // router.push('/dashboard/clients'); // handle error
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (confirm('¿Eliminar este proyecto y todas sus tareas asociadas?')) {
            await deleteProject(params.id);
            router.push('/dashboard/clients');
        }
    };

    useEffect(() => {
        fetchData();
    }, [params.id]);

    if (loading || !data) {
        return <DashboardLayout><div className="flex justify-center p-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div></DashboardLayout>;
    }

    const { project, resources, client } = data;

    return (
        <DashboardLayout>
            <div className="mb-8">
                <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-white flex items-center gap-1 mb-4 transition-colors">
                    <ArrowLeft size={14} /> Volver a proyectos
                </button>

                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl font-bold">{project.name}</h1>
                            <Badge variant={project.status === 'ACTIVE' ? 'default' : 'outline'}>{project.status}</Badge>

                            <button
                                onClick={() => setIsEditing(true)}
                                className="ml-4 p-2 text-gray-600 hover:text-white opacity-50 hover:opacity-100 transition-all border border-transparent hover:border-white/10 rounded-lg"
                                title="Editar Proyecto"
                            >
                                <Pencil size={20} />
                            </button>
                            <button
                                onClick={handleDelete}
                                className="p-2 text-gray-600 hover:text-red-400 opacity-50 hover:opacity-100 transition-all border border-transparent hover:border-red-400/20 rounded-lg"
                                title="Eliminar Proyecto"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                        {project.description && <p className="text-gray-400 max-w-2xl">{project.description}</p>}

                        <div className="flex gap-6 mt-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><Calendar size={14} /> Inicio: {project.start_date || '-'}</span>
                            <span className="flex items-center gap-1"><Clock size={14} /> Deadline: {project.deadline || 'Sin fecha'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: Resources & Tasks */}
                <div className="lg:col-span-2 space-y-10">

                    {/* RESOURCES MODULE */}
                    <ResourceManager
                        projectId={project.id}
                        resources={resources}
                        onUpdate={fetchData}
                    />

                    <div className="w-full h-px bg-white/10 my-8" />

                    {/* TASKS MODULE */}
                    <ProjectTasksManager projectId={project.id} />
                </div>

                {/* RIGHT COLUMN: Client & Settings */}
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Cliente Asignado</h3>
                        <ClientAssigner
                            projectId={project.id}
                            currentClient={client}
                            onUpdate={fetchData}
                        />
                        <p className="text-xs text-gray-600 mt-2 p-1">
                            El usuario asignado podrá ver este proyecto al iniciar sesión en su portal.
                        </p>
                    </div>

                    <div className="w-full h-px bg-white/10 my-8" />

                    <AdminClientActions projectId={project.id} />
                </div>
            </div>

            {isEditing && (
                <EditProjectModal
                    project={project}
                    onClose={() => setIsEditing(false)}
                    onSuccess={() => { setIsEditing(false); fetchData(); }}
                />
            )}
        </DashboardLayout>
    );
}

// Clock component is imported or defined locally if needed, but imported from lucide above.
// Removed local definition to assume lucide usage or if lucide doesn't have it, keep simple.
// Added Clock to imports from 'lucide-react'
