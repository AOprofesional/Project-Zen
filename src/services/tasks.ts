import { createClient } from '@/lib/supabase';
import { Todo, TaskType, TaskComment } from '@/types';

const supabase = createClient();

export async function getAllTasks() {
    const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('due_date', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }
    return data as Todo[];
}

export async function createTask(task: Partial<Todo>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from('todos')
        .insert([{ ...task, user_id: user.id }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteTask(id: string) {
    const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function updateTask(id: string, updates: Partial<Todo>) {
    const { data, error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getTaskComments(taskId: string) {
    const { data, error } = await supabase
        .from('task_comments')
        .select('*, user:profiles(*)') // Join with profiles to get name/avatar
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data as TaskComment[];
}

export async function createTaskComment(taskId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from('task_comments')
        .insert([{
            task_id: taskId,
            user_id: user.id,
            content
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
}
