"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RoutineItem } from '@/components/dashboard/RoutineItem';
import { TaskItem } from '@/components/dashboard/TaskItem';
import { NoteCard } from '@/components/dashboard/NoteCard';
import { Todo, Note, DashboardData } from '@/types';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getDashboardData, toggleTaskStatus } from '@/services/dashboard';
import { deleteNote, togglePinNote, updateNotesPositions } from '@/services/notes';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { CreateNoteModal } from '@/components/notes/CreateNoteModal';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { EditTaskModal } from '@/components/tasks/EditTaskModal';
import { EditNoteModal } from '@/components/notes/EditNoteModal';
import { updateTasksOrder } from '@/services/tasks';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableTaskItem } from '@/components/dashboard/SortableTaskItem';


export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [activeFilter, setActiveFilter] = useState<'PERSONAL' | 'CLIENTS'>('PERSONAL');
    const [loading, setLoading] = useState(true);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Todo | null>(null);
    const [editingNote, setEditingNote] = useState<Note | null>(null);

    const router = useRouter();
    const supabase = createClient();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const refreshData = () => {
        getDashboardData().then(d => setData(d));
    };

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            getDashboardData().then(d => {
                setData(d);
                setLoading(false);
            });
        };

        checkAuth();
    }, [router, supabase]);

    const handleDeleteNote = async (id: string) => {
        if (confirm('¿Eliminar nota?')) {
            await deleteNote(id);
            refreshData();
        }
    };

    const handleTogglePinNote = async (id: string, isPinned: boolean) => {
        await togglePinNote(id, isPinned);
        refreshData();
    };

    const handleToggleTask = async (taskId: string) => {
        if (!data) return;

        // 1. Optimistic Update
        const toggleInList = (list: any[]) =>
            list.map(t => t.id === taskId ? { ...t, is_completed: !t.is_completed } : t);

        const allTasks = [...data.dailyTasks, ...data.weeklyTasks, ...data.projectTasks];
        const target = allTasks.find(t => t.id === taskId);

        if (target) {
            toggleTaskStatus(taskId, target.is_completed);
        }

        setData({
            ...data,
            dailyTasks: toggleInList(data.dailyTasks),
            weeklyTasks: toggleInList(data.weeklyTasks),
            projectTasks: toggleInList(data.projectTasks),
        });
    };

    const handleToggleRoutine = (routineId: string) => {
        if (!data) return;

        const target = data.routines.find(r => r.id === routineId);
        if (target) {
            toggleTaskStatus(routineId, !!target.isDone);
        }

        setData({
            ...data,
            routines: data.routines.map(r => r.id === routineId ? { ...r, isDone: !r.isDone } : r)
        });
    };

    const handleMoveNote = async (id: string, direction: 'UP' | 'DOWN') => {
        if (!data) return;
        const newNotes = [...data.pinnedNotes];
        const index = newNotes.findIndex(n => n.id === id);
        const targetIndex = direction === 'UP' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newNotes.length) return;

        const [moved] = newNotes.splice(index, 1);
        newNotes.splice(targetIndex, 0, moved);

        const updates = newNotes.map((n, i) => ({ id: n.id, order_index: i }));

        setData({ ...data, pinnedNotes: newNotes.map((n, i) => ({ ...n, order_index: i })) });

        try {
            await updateNotesPositions(updates);
        } catch (error) {
            console.error(error);
            refreshData();
        }
    };

    const handleDragEnd = async (event: DragEndEvent, listKey: 'dailyTasks' | 'weeklyTasks' | 'projectTasks' | 'allProjectTasks') => {
        const { active, over } = event;
        if (!over || active.id === over.id || !data) return;

        let sourceList: Todo[] = [];
        let itemsForReorder: Todo[] = [];

        if (listKey === 'allProjectTasks') {
            // Special case for grouped projects: reorder only within the specific project's subset
            const task = [...data.dailyTasks, ...data.projectTasks].find(t => t.id === active.id);
            if (!task) return;
            const projectId = task.project_id;
            sourceList = [...data.dailyTasks.filter(t => t.project_id === projectId), ...data.projectTasks.filter(t => t.project_id === projectId)];
        } else {
            sourceList = data[listKey];
        }

        const oldIndex = sourceList.findIndex(t => t.id === active.id);
        const newIndex = sourceList.findIndex(t => t.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        const newTasks = arrayMove(sourceList, oldIndex, newIndex);

        // Prepare updates for backend
        const updates = newTasks.map((t, i) => ({
            id: t.id,
            order_index: i
        }));

        // Optimistic update (slightly trickier for allProjectTasks)
        if (listKey === 'allProjectTasks') {
            const updatedIds = new Set(newTasks.map(t => t.id));
            setData({
                ...data,
                dailyTasks: data.dailyTasks.map(t => updatedIds.has(t.id) ? { ...t, order_index: newTasks.findIndex(nt => nt.id === t.id) } : t),
                projectTasks: data.projectTasks.map(t => updatedIds.has(t.id) ? { ...t, order_index: newTasks.findIndex(nt => nt.id === t.id) } : t)
            });
        } else {
            setData({
                ...data,
                [listKey]: newTasks.map((t, i) => ({ ...t, order_index: i }))
            });
        }

        try {
            await updateTasksOrder(updates);
        } catch (error) {
            console.error(error);
            refreshData();
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[50vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!data) return null;

    // Filter Logic
    const personalDaily = data.dailyTasks.filter(t => t.type !== 'PROJECT_TASK');
    const allProjectTasks = [
        ...data.dailyTasks.filter(t => t.type === 'PROJECT_TASK'),
        ...data.projectTasks
    ];

    const sortTasksByOrder = (tasks: Todo[]) => {
        return [...tasks].sort((a, b) => {
            if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
            return (a.order_index ?? 0) - (b.order_index ?? 0);
        });
    };

    const sortedPersonalDaily = sortTasksByOrder(personalDaily);
    const sortedWeeklyTasks = sortTasksByOrder(data.weeklyTasks);
    const sortedProjectTasks = sortTasksByOrder(allProjectTasks);


    // Progress Calculations
    const calculateProgress = () => {
        if (activeFilter === 'PERSONAL') {
            const total = data.routines.length + personalDaily.length + data.weeklyTasks.length;
            if (total === 0) return 100;
            const done =
                data.routines.filter(r => r.isDone).length +
                personalDaily.filter(t => t.is_completed).length +
                data.weeklyTasks.filter(t => t.is_completed).length;
            return (done / total) * 100;
        } else {
            const total = allProjectTasks.length;
            if (total === 0) return 100;
            const done = allProjectTasks.filter(t => t.is_completed).length;
            return (done / total) * 100;
        }
    };

    const progressValue = calculateProgress();

    return (
        <DashboardLayout>
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold">Buenos días, Admin</h2>
                    <p className="text-gray-400">Aquí está tu enfoque para hoy.</p>
                </div>
                <Button
                    size="lg"
                    className="rounded-full px-6 shadow-[0_0_20px_rgba(59,130,246,0.5)] bg-accent hover:bg-accent/80 text-white border-none"
                    onClick={() => setIsCreateTaskOpen(true)}
                >
                    <Plus size={20} className="mr-2" /> Nuevo
                </Button>
            </header>

            {/* TAB SELECTOR & PROGRESS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveFilter('PERSONAL')}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${activeFilter === 'PERSONAL'
                            ? 'bg-white text-black border-white'
                            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                            }`}
                    >
                        Personal
                    </button>
                    <button
                        onClick={() => setActiveFilter('CLIENTS')}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${activeFilter === 'CLIENTS'
                            ? 'bg-white text-black border-white'
                            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                            }`}
                    >
                        Clientes
                    </button>
                </div>

                <div className="w-full md:w-64">
                    <ProgressBar
                        value={progressValue}
                        label={activeFilter === 'PERSONAL' ? "Enfoque Personal" : "Enfoque Proyectos"}
                        colorClass={activeFilter === 'PERSONAL' ? "bg-blue-500" : "bg-indigo-500"}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* COL 1 & 2: Main Feed */}
                <div className="lg:col-span-2 space-y-8">

                    {activeFilter === 'PERSONAL' ? (
                        <>
                            {/* SECTION: ROUTINES */}
                            <section>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Rutinas Diarias</h3>
                                {data.routines.length > 0 ? (
                                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                        {data.routines.map(r => (
                                            <RoutineItem
                                                key={r.id}
                                                label={r.content}
                                                icon={r.icon}
                                                isDone={r.isDone}
                                                onClick={() => handleToggleRoutine(r.id)}
                                                onEdit={() => setEditingTask(r)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600 italic">No hay rutinas definidas.</p>
                                )}
                            </section>

                            {/* SECTION: TODAY / FOCUS */}
                            <section>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Foco de Hoy</h3>
                                <Card className="p-1">
                                    {sortedPersonalDaily.length === 0 ? (
                                        <p className="text-center text-gray-500 py-8">Nada pendiente para hoy. ¡Disfruta!</p>
                                    ) : (
                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={(e) => handleDragEnd(e, 'dailyTasks')}
                                        >
                                            <SortableContext
                                                items={sortedPersonalDaily.map(t => t.id)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                <div className="space-y-1 py-1">
                                                    {sortedPersonalDaily.map(task => (
                                                        <SortableTaskItem key={task.id} task={task} onToggle={handleToggleTask} onEdit={setEditingTask} />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                    )}
                                </Card>
                            </section>

                            {/* SECTION: THIS WEEK */}
                            <section>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Esta Semana</h3>
                                <Card className="p-1 bg-white/5 border-white/5">
                                    {sortedWeeklyTasks.length === 0 ? (
                                        <p className="text-xs text-gray-600 p-2">Limpio por esta semana.</p>
                                    ) : (
                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={(e) => handleDragEnd(e, 'weeklyTasks')}
                                        >
                                            <SortableContext
                                                items={sortedWeeklyTasks.map(t => t.id)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                <div className="space-y-1 py-1">
                                                    {sortedWeeklyTasks.map(task => (
                                                        <SortableTaskItem key={task.id} task={task} onToggle={handleToggleTask} onEdit={setEditingTask} />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                    )}
                                </Card>
                            </section>

                        </>
                    ) : (
                        /* CLIENTS VIEW */
                        <div className="space-y-6">
                            {data.projects.map(project => {
                                const projectTasks = allProjectTasks.filter(t => t.project_id === project.id);
                                if (projectTasks.length === 0) return null;

                                return (
                                    <section key={project.id}>
                                        <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                            {project.name}
                                        </h3>
                                        <Card className="p-1">
                                            {projectTasks.length === 0 ? (
                                                <p className="text-center text-gray-500 py-4 text-xs">Sin tareas.</p>
                                            ) : (
                                                <DndContext
                                                    sensors={sensors}
                                                    collisionDetection={closestCenter}
                                                    onDragEnd={(e) => handleDragEnd(e, 'allProjectTasks')}
                                                >
                                                    <SortableContext
                                                        items={sortTasksByOrder(projectTasks).map(t => t.id)}
                                                        strategy={verticalListSortingStrategy}
                                                    >
                                                        <div className="space-y-1 py-1">
                                                            {sortTasksByOrder(projectTasks).map(task => (
                                                                <SortableTaskItem key={task.id} task={task} onToggle={handleToggleTask} onEdit={setEditingTask} />
                                                            ))}
                                                        </div>
                                                    </SortableContext>
                                                </DndContext>
                                            )}
                                        </Card>
                                    </section>
                                );
                            })}
                            {allProjectTasks.length === 0 && (
                                <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-xl">
                                    <p>No tienes tareas de clientes pendientes.</p>
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* COL 3: Sidebar / Context */}
                <div className="space-y-8">
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Notas Fijadas</h3>
                            <button onClick={() => setIsNoteModalOpen(true)} className="text-xs text-blue-400 hover:text-blue-300 flex items-center transition-colors">
                                <Plus size={14} className="mr-1" /> Nueva
                            </button>
                        </div>
                        <div className="space-y-4">
                            {data.pinnedNotes.map((note, index) => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    onDelete={handleDeleteNote}
                                    onPin={handleTogglePinNote}
                                    onEdit={setEditingNote}
                                    onMoveUp={index > 0 ? (id) => handleMoveNote(id, 'UP') : undefined}
                                    onMoveDown={index < data.pinnedNotes.length - 1 ? (id) => handleMoveNote(id, 'DOWN') : undefined}
                                />
                            ))}
                            {data.pinnedNotes.length === 0 && (
                                <div onClick={() => setIsNoteModalOpen(true)} className="p-4 border border-dashed border-white/20 rounded-xl text-center text-sm text-gray-500 hover:border-white/40 hover:text-gray-300 cursor-pointer transition-all">
                                    + Agregar nota rápida
                                </div>
                            )}
                        </div>
                    </section>

                    <section>
                        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                            <h4 className="font-bold text-indigo-300 mb-2">Visión Mensual</h4>
                            <p className="text-sm text-gray-400">
                                Estamos en la última semana del mes. ¿Ya revisaste tus objetivos?
                            </p>
                        </Card>
                    </section>
                </div>
            </div>

            {isNoteModalOpen && (
                <CreateNoteModal
                    onClose={() => setIsNoteModalOpen(false)}
                    onSuccess={() => { setIsNoteModalOpen(false); refreshData(); }}
                />
            )}

            {isCreateTaskOpen && (
                <CreateTaskModal
                    onClose={() => setIsCreateTaskOpen(false)}
                    onSuccess={() => { setIsCreateTaskOpen(false); refreshData(); }}
                />
            )}

            {editingTask && (
                <EditTaskModal
                    task={editingTask}
                    onClose={() => setEditingTask(null)}
                    onSuccess={() => { setEditingTask(null); refreshData(); }}
                />
            )}

            {editingNote && (
                <EditNoteModal
                    note={editingNote}
                    onClose={() => setEditingNote(null)}
                    onSuccess={() => { setEditingNote(null); refreshData(); }}
                />
            )}
        </DashboardLayout>
    );
}
