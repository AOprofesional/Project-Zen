import { createClient } from '@/lib/supabase';

const supabase = createClient();

export async function updateProfile(userId: string, updates: { full_name?: string }) {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating profile:', error);
        throw error;
    }

    return data;
}
