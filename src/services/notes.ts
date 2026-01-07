import { createClient } from '@/lib/supabase';
import { Note } from '@/types';

const supabase = createClient();

export async function getNotes() {
    const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching notes:', error);
        return [];
    }
    return data as Note[];
}

export async function createNote(note: Partial<Note>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from('notes')
        .insert([{
            ...note,
            user_id: user.id,
            is_pinned: note.is_pinned || false,
            tags: note.tags || []
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteNote(id: string) {
    const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function updateNote(id: string, updates: Partial<Note>) {
    const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function togglePinNote(id: string, isPinned: boolean) {
    const { error } = await supabase
        .from('notes')
        .update({ is_pinned: !isPinned })
        .eq('id', id);

    if (error) throw error;
}

export async function updateNotesPositions(updates: { id: string, order_index: number }[]) {
    const promises = updates.map(u =>
        supabase
            .from('notes')
            .update({ order_index: u.order_index })
            .eq('id', u.id)
    );

    await Promise.all(promises);
}
