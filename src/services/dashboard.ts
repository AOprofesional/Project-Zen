import { createClient } from '@/lib/supabase';
import { DashboardData, Todo, Note } from '@/types';
import { Brain, Dumbbell, Feather, CheckSquare, Clock } from 'lucide-react';

const supabase = createClient();

// Helper to map icons to routines based on content keywords (naive but effective for demo)
const getIconForRoutine = (content: string) => {
    const lower = content.toLowerCase();
    if (lower.includes('medit')) return Brain;
    if (lower.includes('entren') || lower.includes('ejerc')) return Dumbbell;
    if (lower.includes('escrib')) return Feather;
    return Clock;
};

export async function getDashboardData(): Promise<DashboardData> {
    try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) throw new Error("No authentitcated user");

        // 1. Fetch Todos
        const { data: todos, error: todosError } = await supabase
            .from('todos')
            .select('*')
            .or(`is_completed.eq.false,type.eq.ROUTINE,type.eq.DAILY`)
            .order('order_index', { ascending: true });

        if (todosError) throw todosError;

        // 2. Fetch Pinned Notes
        const { data: notes, error: notesError } = await supabase
            .from('notes')
            .select('*')
            .eq('is_pinned', true)
            .order('order_index', { ascending: true });

        if (notesError) throw notesError;

        // 3. Fetch Projects
        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('*')
            .neq('status', 'COMPLETED')
            .order('order_index', { ascending: true });

        if (projectsError) throw projectsError;

        // 4. Process & Categorize
        const now = new Date();
        const todayDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
        const todayDate = now.getDate();

        const routines = todos.filter(t => t.type === 'ROUTINE').map(r => ({
            ...r,
            icon: getIconForRoutine(r.content),
            isDone: r.is_completed
        }));

        const dailyTasks = todos.filter(t => {
            if (t.type === 'DAILY') return true;
            if (t.type === 'EVENTUAL' || t.type === 'PROJECT_TASK') {
                if (!t.due_date) return false;
                const d = new Date(t.due_date);
                return d.getFullYear() === now.getFullYear() &&
                    d.getMonth() === now.getMonth() &&
                    d.getDate() === now.getDate();
            }
            return false;
        });

        const weeklyTasks = todos.filter(t =>
            t.type === 'WEEKLY' && (t.recurrence_days?.includes(todayDay))
        );

        const monthlyTasks = todos.filter(t =>
            t.type === 'MONTHLY' && t.recurrence_month_day === todayDate
        );

        const projectTasks = todos.filter(t =>
            t.type === 'PROJECT_TASK' && !dailyTasks.find(d => d.id === t.id)
        );

        return {
            routines,
            dailyTasks: [...dailyTasks, ...monthlyTasks] as Todo[],
            weeklyTasks: weeklyTasks as Todo[],
            projectTasks: projectTasks as Todo[],
            pinnedNotes: (notes || []) as Note[],
            projects: (projects || [])
        };

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return {
            routines: [],
            dailyTasks: [],
            weeklyTasks: [],
            projectTasks: [],
            pinnedNotes: [],
            projects: []
        };
    }
}

export async function toggleTaskStatus(id: string, currentStatus: boolean) {
    const { error } = await supabase
        .from('todos')
        .update({ is_completed: !currentStatus })
        .eq('id', id);

    if (error) console.error("Error toggling task:", error);
}
