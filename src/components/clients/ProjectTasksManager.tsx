"use client";

import { useEffect, useState } from 'react';
import { Todo } from '@/types';
import { createTask, getAllTasks, deleteTask, updateTask } from '@/services/tasks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, CheckCircle, Circle, Trash2, Briefcase, Clock, PlayCircle, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';

interface ProjectTasksManagerProps {
    projectId: string;
}

export function ProjectTasksManager({ projectId }: ProjectTasksManagerProps) {
    const [tasks, setTasks] = useState<Todo[]>([]);
    const [newItem, setNewItem] = useState({ content: '', description: '', due_date: '', priority: 'NORMAL' as 'NORMAL' | 'MEDIUM' | 'URGENT' });
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Todo | null>(null);

    const fetchTasks = async () => {
        const all = await getAllTasks();
        const projectTasks = all.filter(t => t.project_id === projectId);
        setTasks(projectTasks);
    };

    useEffect(() => {
        fetchTasks();
    }, [projectId]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createTask({
                content: newItem.content,
                description: newItem.description,
                type: 'PROJECT_TASK',
                priority: newItem.priority,
                project_id: projectId,
                due_date: newItem.due_date || new Date().toISOString(),
                status: 'PENDING'
            });
            setNewItem({ content: '', description: '', due_date: '', priority: 'NORMAL' });
            setIsAdding(false);
            fetchTasks();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const cycleStatus = async (task: Todo) => {
        const nextStatus = task.status === 'PENDING' ? 'IN_PROGRESS' : task.status === 'IN_PROGRESS' ? 'COMPLETED' : 'PENDING';

        // Optimistic
        setTasks(tasks.map(t => t.id === task.id ? { ...t, status: nextStatus, is_completed: nextStatus === 'COMPLETED' } : t));

        await updateTask(task.id, {
            status: nextStatus,
            is_completed: nextStatus === 'COMPLETED'
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Borrar tarea?')) return;
        await deleteTask(id);
        fetchTasks();
    };

    const getStatusIcon = (status: string) => {
        if (status === 'COMPLETED') return <CheckCircle size={18} className="text-emerald-500" />;
        if (status === 'IN_PROGRESS') return <PlayCircle size={18} className="text-blue-400" />;
        return <Circle size={18} className="text-gray-500" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Briefcase size={18} className="text-indigo-400" /> Tareas del Proyecto
                </h3>
                {!isAdding && (
                    <Button size="sm" variant="secondary" onClick={() => setIsAdding(true)}>+ Nueva Tarea</Button>
                )}
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <Input
                        label="Nombre de la Tarea"
                        placeholder="Ej: Diseñar Wireframes"
                        value={newItem.content}
                        onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                        required
                        autoFocus
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-gray-400 ml-1">Fecha de Entrega</label>
                            <input
                                type="date"
                                className="glass-input w-full text-sm p-2 rounded-lg bg-black/20 border border-white/10 text-white focus:outline-none"
                                value={newItem.due_date}
                                onChange={(e) => setNewItem({ ...newItem, due_date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-gray-400 ml-1">Descripción (Opcional)</label>
                            <input
                                value={newItem.description}
                                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-400 ml-1">Prioridad</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['NORMAL', 'MEDIUM', 'URGENT'] as const).map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setNewItem({ ...newItem, priority: p })}
                                    className={`py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md border transition-all ${newItem.priority === p
                                        ? p === 'URGENT' ? 'bg-red-500 text-white border-red-500'
                                            : p === 'MEDIUM' ? 'bg-orange-500 text-white border-orange-500'
                                                : 'bg-white text-black border-white'
                                        : 'bg-transparent border-white/5 text-gray-500 hover:border-white/20'
                                        }`}
                                >
                                    {p === 'NORMAL' ? 'Normal' : p === 'MEDIUM' ? 'Media' : 'Urgente'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
                        <Button type="submit" size="sm" isLoading={loading}>Guardar Tarea</Button>
                    </div>
                </form>
            )}

            <div className="space-y-2">
                {tasks.length === 0 && !isAdding && (
                    <p className="text-sm text-gray-500 italic py-4 text-center border border-dashed border-white/10 rounded-lg">
                        No hay tareas registradas para este proyecto.
                    </p>
                )}
                {tasks.map(task => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition group border border-transparent hover:border-white/5">
                        <button onClick={() => cycleStatus(task)} className="mt-1 shrink-0 hover:scale-110 transition-transform" title="Cambiar Estado">
                            {getStatusIcon(task.status)}
                        </button>

                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedTask(task)}>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`font-medium text-sm ${task.status === 'COMPLETED' ? 'text-gray-500 line-through' : 'text-gray-200 hover:text-white transition-colors'}`}>
                                    {task.content}
                                </span>
                                {task.due_date && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${new Date(task.due_date) < new Date() && task.status !== 'COMPLETED' ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-white/10 text-gray-400 bg-white/5'} flex items-center gap-1`}>
                                        <Clock size={10} /> {new Date(task.due_date).toLocaleDateString()}
                                    </span>
                                )}
                            </div>

                            {task.description && (
                                <p className="text-xs text-gray-500 truncate">{task.description}</p>
                            )}

                            <div className="mt-2 flex gap-2 items-center">
                                <Badge variant={task.status === 'COMPLETED' ? 'success' : task.status === 'IN_PROGRESS' ? 'warning' : 'outline'} className="text-[10px] h-5 px-2">
                                    {task.status === 'COMPLETED' ? 'Finalizada' : task.status === 'IN_PROGRESS' ? 'En Progreso' : 'Pendiente'}
                                </Badge>
                                {task.priority && task.priority !== 'NORMAL' && (
                                    <Badge variant={task.priority === 'URGENT' ? 'error' : 'warning'} className="text-[10px] h-5 px-2 uppercase tracking-tighter">
                                        {task.priority === 'URGENT' ? 'Urgente' : 'Media'}
                                    </Badge>
                                )}
                                <span className="text-[10px] text-gray-600 flex items-center gap-1 hover:text-indigo-400 transition-colors">
                                    <MessageSquare size={10} /> Comentar
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => handleDelete(task.id)}
                            className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>

            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onUpdate={fetchTasks}
                />
            )}
        </div>
    );
}
