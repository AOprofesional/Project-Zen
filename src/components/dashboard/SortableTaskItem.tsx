"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskItem } from './TaskItem';
import { Todo } from '@/types';
import { GripVertical } from 'lucide-react';

interface SortableTaskItemProps {
    task: Todo;
    onToggle: (id: string) => void;
    onEdit?: (task: Todo) => void;
}

export function SortableTaskItem({ task, onToggle, onEdit }: SortableTaskItemProps) {
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
        zIndex: isDragging ? 10 : 0,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group flex items-center">
            <div
                {...attributes}
                {...listeners}
                className="shrink-0 p-2 mr-1 text-gray-500 hover:text-white cursor-grab active:cursor-grabbing transition-colors md:opacity-0 md:group-hover:opacity-100"
                title="Arrastrar para reordenar"
            >
                <GripVertical size={16} />
            </div>
            <div className="flex-1 min-w-0">
                <TaskItem task={task} onToggle={onToggle} onEdit={onEdit} />
            </div>
        </div>
    );
}
