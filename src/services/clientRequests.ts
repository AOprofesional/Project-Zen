import { createClient } from '@/lib/supabase';
import { ClientRequest } from '@/types';

const supabase = createClient();

export async function getClientRequests(projectId?: string): Promise<ClientRequest[]> {
    let query = supabase
        .from('client_requests')
        .select('*, profiles(full_name, email), projects(name)')
        .order('created_at', { ascending: false });

    if (projectId) {
        query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching client requests", error);
        return [];
    }

    return (data || []) as ClientRequest[];
}

export async function createClientRequest(data: Partial<ClientRequest>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No authenticated user");

    const { error } = await supabase
        .from('client_requests')
        .insert({
            ...data,
            client_id: user.id,
            status: 'PENDING',
            is_read_by_admin: false
        });

    if (error) throw error;
}

export async function updateClientRequest(requestId: string, updates: Partial<ClientRequest>) {
    const { error } = await supabase
        .from('client_requests')
        .update(updates)
        .eq('id', requestId);

    if (error) throw error;
}

export async function markRequestAsRead(requestId: string) {
    const { error } = await supabase
        .from('client_requests')
        .update({ is_read_by_admin: true })
        .eq('id', requestId);

    if (error) throw error;
}

export async function deleteClientRequest(requestId: string) {
    const { error } = await supabase
        .from('client_requests')
        .delete()
        .eq('id', requestId);

    if (error) throw error;
}
