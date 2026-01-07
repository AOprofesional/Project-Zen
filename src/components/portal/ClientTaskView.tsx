"use client";

import { useState } from 'react';
import { Todo } from '@/types';
import { updateTask } from '@/services/tasks';
import { CheckCircle, Circle, PlayCircle, Clock, MessageSquare, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';

interface ClientTaskViewProps {
    tasks: Todo[];
    onTasksChange: () => void; // Callback to refresh data
}

export function ClientTaskView({ tasks, onTasksChange }: ClientTaskViewProps) {
    const [selectedTask, setSelectedTask] = useState<Todo | null>(null);

    // Clients can move status forward (optional feature, or readonly)
    // For now, let's allow them to toggle status like in the dashboard?
    // User request: "el cliente asignado al proyecto puede dejar comentarios sobre la Tarea"
    // Usually clients don't complete tasks, but let's assume they can mark them as done for review.

    // For safety, let's keep it read-only status for now unless explicitly requested.
    // Wait, the Requirement says "Client manages project todos" in RLS.
    // Let's allow interaction but maybe visual indication is different.

    const cycleStatus = async (task: Todo) => {
        // Simple cycle for now
        const nextStatus = task.status === 'PENDING' ? 'IN_PROGRESS' : task.status === 'IN_PROGRESS' ? 'COMPLETED' : 'PENDING';
        try {
            await updateTask(task.id, {
                status: nextStatus,
                is_completed: nextStatus === 'COMPLETED'
            });
            onTasksChange();
        } catch (e) {
            console.error(e);
            alert('Error al actualizar estado. Verifica permisos.');
        }
    };

    const getStatusIcon = (status: string) => {
        if (status === 'COMPLETED') return <CheckCircle size={18} className="text-emerald-500" />;
        if (status === 'IN_PROGRESS') return <PlayCircle size={18} className="text-blue-400" />;
        return <Circle size={18} className="text-gray-500" />;
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 text-gray-300">
                <Briefcase size={18} className="text-indigo-400" /> Lista de Tareas
            </h3>

            <div className="space-y-2">
                {tasks.length === 0 && (
                    <p className="text-sm text-gray-500 italic py-4 text-center border border-dashed border-white/10 rounded-lg">
                        El equipo aún no ha asignado tareas para ti.
                    </p>
                )}

                {tasks.map(task => (
                    <div key={task.id} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition group border border-transparent hover:border-white/5 cursor-pointer" onClick={() => setSelectedTask(task)}>
                        {/* Status Toggle (Clickable) */}
                        <div
                            onClick={(e) => { e.stopPropagation(); cycleStatus(task); }}
                            className="mt-1 shrink-0 hover:scale-110 transition-transform cursor-pointer"
                            title="Cambiar Estado"
                        >
                            {getStatusIcon(task.status)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`font-medium text-sm ${task.status === 'COMPLETED' ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                                    {task.content}
                                </span>
                                {task.due_date && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${new Date(task.due_date) < new Date() && task.status !== 'COMPLETED' ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-white/10 text-gray-400 bg-white/5'} flex items-center gap-1`}>
                                        <Clock size={10} /> {new Date(task.due_date).toLocaleDateString()}
                                    </span>
                                )}
                            </div>

                            {task.description && (
                                <p className="text-xs text-gray-500 truncate mb-2">{task.description}</p>
                            )}

                            <div className="flex gap-2 items-center">
                                <Badge variant={task.status === 'COMPLETED' ? 'success' : task.status === 'IN_PROGRESS' ? 'warning' : 'outline'} className="text-[10px] h-5 px-2">
                                    {task.status === 'COMPLETED' ? 'Finalizada' : task.status === 'IN_PROGRESS' ? 'En Progreso' : 'Pendiente'}
                                </Badge>
                                <span className="text-[10px] text-gray-500 flex items-center gap-1 group-hover:text-indigo-400 transition-colors">
                                    <MessageSquare size={10} /> Chat / Detalles
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    onClose={() => { setSelectedTask(null); onTasksChange(); }}
                />
            )}
        </div>
    );
}
