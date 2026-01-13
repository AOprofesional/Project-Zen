import { createClient } from '@/lib/supabase';
import { ProjectAction } from '@/types';

const supabase = createClient();

export async function getClientActions(projectId: string, includeArchived: boolean = false): Promise<ProjectAction[]> {
    let query = supabase
        .from('client_actions')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

    if (!includeArchived) {
        query = query.eq('is_archived', false);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching client actions", error);
        return [];
    }

    return (data || []) as ProjectAction[];
}

export async function deleteClientAction(actionId: string) {
    const { error } = await supabase
        .from('client_actions')
        .delete()
        .eq('id', actionId);

    if (error) throw error;
}

export async function archiveClientAction(actionId: string, archive: boolean = true) {
    const { error } = await supabase
        .from('client_actions')
        .update({ is_archived: archive })
        .eq('id', actionId);

    if (error) throw error;
}

export async function updateClientAction(actionId: string, updates: Partial<ProjectAction>) {
    const { error } = await supabase
        .from('client_actions')
        .update(updates)
        .eq('id', actionId);

    if (error) throw error;
}

export async function respondToAction(
    actionId: string,
    status: 'APPROVED' | 'CHANGES_REQUESTED' | 'SENT',
    response?: string
) {
    console.log("DEBUG: respondToAction called", { actionId, status, response });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.error("DEBUG: Auth error in respondToAction", authError);
        throw new Error("No authenticated user");
    }

    console.log("DEBUG: User authenticated", user.id);

    const { error } = await supabase
        .from('client_actions')
        .update({
            status,
            client_response: response,
            response_at: new Date().toISOString(),
            response_by: user.id
        })
        .eq('id', actionId);

    if (error) {
        console.error("DEBUG: Update error in respondToAction", error);
        throw error;
    }
    console.log("DEBUG: respondToAction success");
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
