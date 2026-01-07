import { createClient } from '@/lib/supabase';
import { Project, ProjectResource, UserProfile } from '@/types';

const supabase = createClient();

// Get all projects for the list view
export async function getProjects() {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
    return data as Project[];
}

// Get single project details including Resources and Assigned Client
export async function getProjectDetails(id: string) {
    // 1. Get Project Data
    const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

    if (projectError) throw projectError;

    // 2. Get Resources
    const { data: resources, error: resError } = await supabase
        .from('project_resources')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false });

    if (resError) throw resError;

    // 3. Get Assigned Client (Using project.client_id if present)
    let client = null;
    if (project.client_id) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', project.client_id)
            .single();
        client = profile;
    }

    // It's okay if no client is assigned yet, ignore error/null

    return {
        project: project as Project,
        resources: (resources || []) as ProjectResource[],
        client: (client || null) as UserProfile | null
    };
}

export async function createProject(project: Partial<Project>) {
    const { data, error } = await supabase
        .from('projects')
        .insert([{ ...project, status: 'ACTIVE' }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateProject(id: string, updates: Partial<Project>) {
    const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateProjectStatus(id: string, status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED') {
    const { error } = await supabase
        .from('projects')
        .update({ status })
        .eq('id', id);

    if (error) throw error;
}

export async function deleteProject(id: string) {
    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function updateProjectsPositions(updates: { id: string, order_index: number }[]) {
    const promises = updates.map(u =>
        supabase
            .from('projects')
            .update({ order_index: u.order_index })
            .eq('id', u.id)
    );

    await Promise.all(promises);
}

// --- CLIENT ASSIGNMENT ---

export async function getAvailableClients() {
    // Fetch all profiles that are CLIENTS
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'CLIENT');

    if (error) throw error;
    return data as UserProfile[];
}

export async function assignClientToProject(userId: string, projectId: string) {
    const { error } = await supabase
        .from('projects')
        .update({ client_id: userId })
        .eq('id', projectId);

    if (error) throw error;
}

export async function removeClientFromProject(projectId: string) {
    const { error } = await supabase
        .from('projects')
        .update({ client_id: null })
        .eq('id', projectId);

    if (error) throw error;
}

// --- RESOURCES ---

export async function createResource(resource: Partial<ProjectResource>) {
    const { error } = await supabase
        .from('project_resources')
        .insert([resource]);

    if (error) throw error;
}

export async function deleteResource(id: string) {
    const { error } = await supabase
        .from('project_resources')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
