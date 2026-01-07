"use client";

import { Todo } from '@/types';
import { Card } from '@/components/ui/Card';
import { X, Calendar, Clock, CheckCircle, PlayCircle, Circle } from 'lucide-react';
import { TaskComments } from './TaskComments';
import { Badge } from '@/components/ui/Badge';
import { useState } from 'react';
import { EditTaskModal } from './EditTaskModal';
import { Pencil } from 'lucide-react';

interface TaskDetailModalProps {
    task: Todo;
    onClose: () => void;
    onUpdate?: () => void;
}

export function TaskDetailModal({ task, onClose, onUpdate }: TaskDetailModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl bg-[#09090b] border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200 h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start mb-6 shrink-0">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge variant={task.status === 'COMPLETED' ? 'success' : task.status === 'IN_PROGRESS' ? 'warning' : 'outline'}>
                                {task.status === 'COMPLETED' ? 'Finalizada' : task.status === 'IN_PROGRESS' ? 'En Progreso' : 'Pendiente'}
                            </Badge>
                            <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Tarea</span>
                        </div>
                        <h2 className="text-2xl font-bold">{task.content}</h2>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-gray-500 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
                            title="Editar Tarea"
                        >
                            <Pencil size={18} />
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 min-h-0">
                    {/* Left: Metadata & Description */}
                    <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2">
                        {task.description ? (
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 mb-2">Descripción</h4>
                                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{task.description}</p>
                            </div>
                        ) : (
                            <p className="text-gray-600 italic text-sm">Sin descripción detallada.</p>
                        )}

                        <div className="p-4 bg-white/5 rounded-xl space-y-3">
                            {task.due_date && (
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><Calendar size={18} /></div>
                                    <div>
                                        <p className="text-gray-400 text-xs">Fecha de Entrega</p>
                                        <p className="font-medium text-gray-200">{new Date(task.due_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-sm">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Clock size={18} /></div>
                                <div>
                                    <p className="text-gray-400 text-xs">Creada el</p>
                                    <p className="font-medium text-gray-200">{new Date(task.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Comments */}
                    <div className="flex flex-col h-full bg-black/20 rounded-xl p-4 border border-white/5">
                        <TaskComments taskId={task.id} />
                    </div>
                </div>
            </Card>

            {isEditing && (
                <EditTaskModal
                    task={task}
                    onClose={() => setIsEditing(false)}
                    onSuccess={() => {
                        setIsEditing(false);
                        onUpdate?.();
                        onClose(); // Close detail as well to force refresh or just let it stay? usually refresh is better
                    }}
                />
            )}
        </div>
    );
}
