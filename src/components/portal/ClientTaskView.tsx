import { useState, useEffect } from 'react';
import { Todo } from '@/types';

import { updateTask, updateTasksOrder } from '@/services/tasks';
import { CheckCircle, Circle, PlayCircle, Clock, MessageSquare, Briefcase, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
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
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


interface ClientTaskViewProps {
    tasks: Todo[];
    onTasksChange: () => void; // Callback to refresh data
}

export function ClientTaskView({ tasks: initialTasks, onTasksChange }: ClientTaskViewProps) {
    const [selectedTask, setSelectedTask] = useState<Todo | null>(null);
    const [tasks, setTasks] = useState<Todo[]>(initialTasks);

    // Sync tasks when initialTasks changes
    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = tasks.findIndex(t => t.id === active.id);
        const newIndex = tasks.findIndex(t => t.id === over.id);

        const newTasks = arrayMove(tasks, oldIndex, newIndex);
        setTasks(newTasks);

        const updates = newTasks.map((t, i) => ({
            id: t.id,
            order_index: i
        }));

        try {
            await updateTasksOrder(updates);
            // Optional: refresh data to ensure we are in sync with DB
            // onTasksChange(); 
        } catch (error) {
            console.error(error);
            setTasks(initialTasks); // Rollback
        }
    };


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

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={tasks.map(t => t.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {tasks.map(task => (
                            <SortableClientTaskItem
                                key={task.id}
                                task={task}
                                onSelect={() => setSelectedTask(task)}
                                cycleStatus={cycleStatus}
                                getStatusIcon={getStatusIcon}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
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

function SortableClientTaskItem({ task, onSelect, cycleStatus, getStatusIcon }: {
    task: Todo,
    onSelect: () => void,
    cycleStatus: (task: Todo) => void,
    getStatusIcon: (status: string) => JSX.Element
}) {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : 0,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition group border border-transparent hover:border-white/5 cursor-pointer relative"
            onClick={onSelect}
        >
            <div
                {...attributes}
                {...listeners}
                className="shrink-0 p-2 text-gray-500 hover:text-white cursor-grab active:cursor-grabbing transition-colors md:opacity-0 md:group-hover:opacity-100"
                title="Arrastrar para reordenar"
            >
                <GripVertical size={18} />
            </div>

            {/* Status Toggle (Clickable) */}
            <div
                onClick={(e) => { e.stopPropagation(); cycleStatus(task); }}
                className="shrink-0 hover:scale-110 transition-transform cursor-pointer"
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
                    {task.priority && task.priority !== 'NORMAL' && (
                        <Badge variant={task.priority === 'URGENT' ? 'error' : 'warning'} className="text-[10px] h-5 px-2 uppercase tracking-tighter">
                            {task.priority === 'URGENT' ? 'Urgente' : 'Media'}
                        </Badge>
                    )}
                    <span className="text-[10px] text-gray-500 flex items-center gap-1 group-hover:text-indigo-400 transition-colors">
                        <MessageSquare size={10} /> Chat / Detalles
                    </span>
                </div>
            </div>
        </div>
    );
}
