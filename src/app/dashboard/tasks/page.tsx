"use client";

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getAllTasks, deleteTask, updateTask } from '@/services/tasks';
import { Todo, TaskType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Calendar, Pencil } from 'lucide-react';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { EditTaskModal } from '@/components/tasks/EditTaskModal';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getTaskTypeLabel } from '@/utils/labels';

export default function TasksPage() {
    const [tasks, setTasks] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState<TaskType | 'ALL'>('ALL');
    const [isArchivedOpen, setIsArchivedOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Todo | null>(null);

    const fetchTasks = () => {
        setLoading(true);
        getAllTasks().then(data => {
            setTasks(data);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar esta tarea?')) {
            await deleteTask(id);
            fetchTasks();
        }
    };

    const handleToggle = async (task: Todo) => {
        // Optimistic update
        setTasks(tasks.map(t => t.id === task.id ? { ...t, is_completed: !t.is_completed } : t));
        await updateTask(task.id, { is_completed: !task.is_completed });
    };

    const filteredTasks = tasks.filter(t => filter === 'ALL' || t.type === filter);
    const activeTasks = filteredTasks.filter(t => !t.is_completed);
    const archivedTasks = filteredTasks.filter(t => t.is_completed);

    const TaskItem = ({ task }: { task: Todo }) => (
        <div key={task.id} className="group flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => handleToggle(task)}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${task.is_completed ? 'bg-emerald-500 border-emerald-500' : 'border-white/30 hover:border-white'}`}
                >
                    {task.is_completed && <span className="text-black text-xs">✓</span>}
                </button>

                <div className="flex-1 min-w-0 cursor-pointer group/task" onClick={() => setEditingTask(task)}>
                    <div className="flex items-center justify-between">
                        <p className={`font-medium ${task.is_completed ? 'text-gray-500 line-through' : 'text-gray-200'} group-hover:text-white transition-colors`}>
                            {task.content}
                        </p>
                        <Pencil size={12} className="text-gray-600 opacity-0 group-hover/task:opacity-100 transition-opacity ml-2" />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <Badge variant="outline" className="text-[10px] py-0">{getTaskTypeLabel(task.type)}</Badge>
                        {task.due_date && (
                            <span className="flex items-center">
                                <Calendar size={12} className="mr-1" />
                                {format(new Date(task.due_date), "d 'de' MMMM", { locale: es })}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <button
                onClick={() => handleDelete(task.id)}
                className={`p-2 text-gray-600 hover:text-red-400 transition-all ${task.is_completed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            >
                <Trash2 size={16} />
            </button>
        </div>
    );

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Mis Tareas</h1>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} className="mr-2" /> Nueva Tarea
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                {(['ALL', 'DAILY', 'WEEKLY', 'MONTHLY', 'ROUTINE', 'EVENTUAL'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${filter === f ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                    >
                        {f === 'ALL' ? 'Todas' : getTaskTypeLabel(f)}
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>
            ) : (
                <div className="space-y-8">
                    {/* Active Tasks */}
                    <div className="space-y-2">
                        {activeTasks.length === 0 && archivedTasks.length === 0 && (
                            <p className="text-gray-500 text-center py-12">No hay tareas en esta categoría.</p>
                        )}
                        {activeTasks.length === 0 && archivedTasks.length > 0 && (
                            <p className="text-gray-500 text-center py-12">¡Todas las tareas completadas! 🎉</p>
                        )}
                        {activeTasks.map((task) => (
                            <TaskItem key={task.id} task={task} />
                        ))}
                    </div>

                    {/* Archived Tasks */}
                    {archivedTasks.length > 0 && (
                        <div className="pt-4 border-t border-white/5">
                            <button
                                onClick={() => setIsArchivedOpen(!isArchivedOpen)}
                                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors mb-4"
                            >
                                <span>{isArchivedOpen ? '▼' : '▶'}</span>
                                Tareas Completadas ({archivedTasks.length})
                            </button>

                            {isArchivedOpen && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {archivedTasks.map((task) => (
                                        <TaskItem key={task.id} task={task} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && (
                <CreateTaskModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => { setIsModalOpen(false); fetchTasks(); }}
                />
            )}

            {editingTask && (
                <EditTaskModal
                    task={editingTask}
                    onClose={() => setEditingTask(null)}
                    onSuccess={() => { setEditingTask(null); fetchTasks(); }}
                />
            )}
        </DashboardLayout>
    );
}
