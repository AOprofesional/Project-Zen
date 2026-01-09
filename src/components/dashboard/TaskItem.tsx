import { Todo } from '@/types';
import { Check, Calendar as CalendarIcon, Briefcase, Pencil } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface TaskItemProps {
    task: Todo;
    onToggle: (id: string) => void;
    onEdit?: (task: Todo) => void;
}

export function TaskItem({ task, onToggle, onEdit }: TaskItemProps) {
    const isClientTask = task.type === 'PROJECT_TASK';

    return (
        <div className={twMerge(
            "group flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-all border border-transparent",
            task.priority === 'URGENT' && !task.is_completed && "bg-red-500/5 border-red-500/20 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]"
        )}>
            <button
                onClick={() => onToggle(task.id)}
                className={twMerge(
                    "flex-shrink-0 w-5 h-5 mt-0.5 rounded border flex items-center justify-center transition-all",
                    task.is_completed
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500"
                        : "border-white/20 hover:border-white/40 text-transparent"
                )}
            >
                <Check size={14} className={twMerge("transform scale-0 transition-transform", task.is_completed && "scale-100")} />
            </button>

            <div
                className={twMerge("flex-1 min-w-0", onEdit && "cursor-pointer")}
                onClick={() => onEdit?.(task)}
            >
                <div className="flex items-center justify-between">
                    <p className={twMerge(
                        "text-sm font-medium transition-all truncate group-hover:text-white",
                        task.is_completed ? "text-gray-500 line-through" : "text-gray-200"
                    )}>
                        {task.content}
                    </p>
                    {onEdit && (
                        <Pencil size={12} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
                    )}
                </div>

                <div className="flex items-center gap-2 mt-1">
                    {isClientTask && (
                        <span className="flex items-center text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                            <Briefcase size={10} className="mr-1" />
                            Cliente
                        </span>
                    )}
                    {task.priority && task.priority !== 'NORMAL' && (
                        <span className={twMerge(
                            "flex items-center text-[10px] px-1.5 py-0.5 rounded uppercase tracking-tighter font-bold",
                            task.priority === 'URGENT' ? "text-red-400 bg-red-500/10" : "text-orange-400 bg-orange-500/10"
                        )}>
                            {task.priority === 'URGENT' ? 'Urgente' : 'Media'}
                        </span>
                    )}
                    {task.due_date && (
                        <span className="flex items-center text-[10px] text-gray-500">
                            <CalendarIcon size={10} className="mr-1" />
                            Hoy
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
