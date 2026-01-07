import { TaskType } from '@/types';

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
    DAILY: 'Diaria',
    WEEKLY: 'Semanal',
    MONTHLY: 'Mensual',
    ROUTINE: 'Rutina',
    EVENTUAL: 'Eventual',
    PROJECT_TASK: 'Cliente'
};

export const getTaskTypeLabel = (type: TaskType | string): string => {
    return TASK_TYPE_LABELS[type as TaskType] || type;
};
