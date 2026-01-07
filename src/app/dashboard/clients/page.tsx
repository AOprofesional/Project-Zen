"use client";

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Plus, Trash2, Briefcase, Pencil, ArrowUp, ArrowDown } from 'lucide-react';
import { getProjects, deleteProject, updateProjectStatus, updateProjectsPositions } from '@/services/projects';
import { Project } from '@/types';
import { Button } from '@/components/ui/Button';
import { CreateProjectModal } from '@/components/clients/CreateProjectModal';
import { EditProjectModal } from '@/components/clients/EditProjectModal';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function ClientsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const fetchProjects = () => {
        setLoading(true);
        getProjects().then(data => {
            setProjects(data);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('¿Eliminar este proyecto y todas sus tareas asociadas?')) {
            await deleteProject(id);
            fetchProjects();
        }
    };

    const cycleStatus = async (project: Project) => {
        const nextStatus = project.status === 'ACTIVE' ? 'COMPLETED' : project.status === 'COMPLETED' ? 'ON_HOLD' : 'ACTIVE';

        // Optimistic
        setProjects(projects.map(p => p.id === project.id ? { ...p, status: nextStatus } : p));

        await updateProjectStatus(project.id, nextStatus);
    };

    const handleMoveProject = async (index: number, direction: 'UP' | 'DOWN') => {
        const newProjects = [...projects];
        const targetIndex = direction === 'UP' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newProjects.length) return;

        // Swap
        const [moved] = newProjects.splice(index, 1);
        newProjects.splice(targetIndex, 0, moved);

        // Update indices
        const updates = newProjects.map((p, i) => ({ id: p.id, order_index: i }));

        // Optimistic update
        setProjects(newProjects.map((p, i) => ({ ...p, order_index: i })));

        try {
            await updateProjectsPositions(updates);
        } catch (error) {
            console.error(error);
            fetchProjects(); // Rollback
        }
    };

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Clientes y Proyectos</h1>
                    <p className="text-gray-400 text-sm mt-1">Gestiona tus compromisos externos.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} className="mr-2" /> Nuevo Proyecto
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-xl">
                            <p>No tienes proyectos activos.</p>
                        </div>
                    )}
                    {projects.map((project, index) => (
                        <Link key={project.id} href={`/dashboard/clients/${project.id}`}>
                            <Card className="group relative hover:border-white/20 transition-all h-full cursor-pointer hover:bg-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                        <Briefcase size={20} />
                                    </div>
                                    <div className="flex gap-1 z-10">
                                        <div className="flex bg-white/5 rounded-lg mr-2 overflow-hidden border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMoveProject(index, 'UP'); }}
                                                disabled={index === 0}
                                                className="p-2 text-gray-500 hover:text-white hover:bg-white/5 disabled:opacity-20"
                                            >
                                                <ArrowUp size={16} />
                                            </button>
                                            <div className="w-px bg-white/10" />
                                            <button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMoveProject(index, 'DOWN'); }}
                                                disabled={index === projects.length - 1}
                                                className="p-2 text-gray-500 hover:text-white hover:bg-white/5 disabled:opacity-20"
                                            >
                                                <ArrowDown size={16} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingProject(project); }}
                                            className="text-gray-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-2"
                                            title="Editar Proyecto"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(project.id); }}
                                            className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                                            title="Eliminar Proyecto"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-2">{project.name}</h3>

                                <div className="flex justify-between items-center mt-6">
                                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); cycleStatus(project); }} className="z-10">
                                        <Badge
                                            variant={project.status === 'ACTIVE' ? 'default' : project.status === 'COMPLETED' ? 'outline' : 'warning'}
                                            className="cursor-pointer select-none"
                                        >
                                            {project.status === 'ACTIVE' ? 'Activo' : project.status === 'COMPLETED' ? 'Completado' : 'En Pausa'}
                                        </Badge>
                                    </button>

                                    <p className="text-xs text-gray-500">
                                        {new Date(project.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <CreateProjectModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => { setIsModalOpen(false); fetchProjects(); }}
                />
            )}

            {editingProject && (
                <EditProjectModal
                    project={editingProject}
                    onClose={() => setEditingProject(null)}
                    onSuccess={() => { setEditingProject(null); fetchProjects(); }}
                />
            )}
        </DashboardLayout>
    );
}
