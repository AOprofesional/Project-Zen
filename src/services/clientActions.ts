import { createClient } from '@/lib/supabase';
import { ProjectAction } from '@/types';

const supabase = createClient();

export async function getClientActions(projectId: string): Promise<ProjectAction[]> {
    const { data, error } = await supabase
        .from('client_actions')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching client actions", error);
        return [];
    }

    return (data || []) as ProjectAction[];
}

export async function respondToAction(
    actionId: string,
    status: 'APPROVED' | 'CHANGES_REQUESTED' | 'SENT',
    response?: string
) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No authenticated user");

    const { error } = await supabase
        .from('client_actions')
        .update({
            status,
            client_response: response,
            response_at: new Date().toISOString(),
            response_by: user.id
        })
        .eq('id', actionId);

    if (error) throw error;
}

// Admin only functions
export async function createClientAction(data: Partial<ProjectAction>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No authenticated user");

    const { error } = await supabase
        .from('client_actions')
        .insert({
            ...data,
            created_by: user.id,
            status: 'PENDING'
        });

    if (error) throw error;
}
