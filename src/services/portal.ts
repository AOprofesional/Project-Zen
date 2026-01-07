import { createClient } from '@/lib/supabase';
import { Project, ProjectResource, Todo, UserProfile, ProjectAction } from '@/types';

// Data Transfer Object for Portal
export interface PortalData {
    client: UserProfile;
    project: Project;
    resources: ProjectResource[];
    tasks: Todo[];
    actions: ProjectAction[];
}

const supabase = createClient();

export async function getClientProjects(): Promise<Project[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching client projects", error);
        return [];
    }

    return projects as Project[];
}

export async function getClientPortalData(projectId?: string): Promise<PortalData | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // 1. Get User Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) {
        console.error("Portal Error: No profile", profileError);
        return null;
    }

    // 2. Identify the target project
    let targetProjectId = projectId;

    if (!targetProjectId) {
        const projects = await getClientProjects();
        if (projects.length === 0) return null;
        targetProjectId = projects[0].id; // Default to first project
    }

    // 3. Get Project Details
    const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', targetProjectId)
        .eq('client_id', user.id) // Security check
        .single();

    if (projectError || !project) {
        console.error("Portal Error: Project not found or unauthorized", projectError);
        return null;
    }

    // 4. Get Resources
    const { data: resources, error: resError } = await supabase
        .from('project_resources')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });

    // 5. Get Tasks associated with this project
    const { data: tasks, error: taskError } = await supabase
        .from('todos')
        .select('*')
        .eq('project_id', project.id)
        .order('due_date', { ascending: true });

    // 6. Get Client Actions
    const { data: actions, error: actionError } = await supabase
        .from('client_actions')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });

    return {
        client: profile as UserProfile,
        project: project as Project,
        resources: (resources || []) as ProjectResource[],
        tasks: (tasks || []) as Todo[],
        actions: (actions || []) as ProjectAction[]
    };
}
