export type UserRole = 'ADMIN' | 'CLIENT';

export type TaskType =
    | 'ROUTINE'
    | 'DAILY'
    | 'WEEKLY'
    | 'MONTHLY'
    | 'EVENTUAL'
    | 'PROJECT_TASK';

export type TaskPriority = 'NORMAL' | 'MEDIUM' | 'URGENT';

export interface UserProfile {
    id: string;
    email: string | null;
    full_name: string | null;
    role: UserRole;
    assigned_project_id?: string | null;
    created_at: string;
}

export interface Project {
    id: string;
    client_id?: string | null;
    name: string;
    status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
    description?: string;
    start_date?: string | null; // ISO Date
    deadline?: string | null; // ISO Date
    created_at: string;
}

export interface ProjectAction {
    id: string;
    project_id: string;
    created_by: string;
    title: string;
    description?: string;
    type: 'APPROVAL' | 'INFORMATION';
    status: 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED' | 'SENT';
    admin_notes?: string;
    client_response?: string;
    response_at?: string;
    response_by?: string;
    created_at: string;
}

export interface TaskComment {
    id: string;
    task_id: string;
    user_id: string;
    content: string;
    created_at: string;
    user?: UserProfile; // Joined data
}

export interface ProjectResource {
    id: string;
    project_id: string;
    title: string;
    type: 'DELIVERABLE' | 'DOCUMENT';
    url?: string | null;
    status: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'DELIVERED';
    created_at: string;
}

export interface Todo {
    id: string;
    user_id: string;
    project_id?: string | null;
    content: string;
    description?: string; // New field
    is_completed: boolean; // Deprecated, mapped to status
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'; // New field
    type: TaskType;
    priority: TaskPriority;
    due_date?: string | null; // ISO Date string
    visualization_date?: string | null; // ISO Date string
    recurrence_days?: string[] | null; // e.g. ["MON", "WED"]
    recurrence_month_day?: number | null; // 1-31
    order_index: number;
    created_at: string;
}

export interface Note {
    id: string;
    user_id: string;
    content: string;
    color_code: string;
    is_pinned: boolean;
    tags: string[];
    created_at: string;
}

// Frontend specific types for Dashboard State
export interface DashboardData {
    routines: (Todo & { icon?: any, isDone?: boolean })[];
    dailyTasks: Todo[];
    weeklyTasks: Todo[];
    pinnedNotes: Note[];
    projectTasks: Todo[];
    projects: Project[];
}
