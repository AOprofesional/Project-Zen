"use client";

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getNotes, deleteNote, togglePinNote, updateNotesPositions } from '@/services/notes';
import { Note } from '@/types';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { CreateNoteModal } from '@/components/notes/CreateNoteModal';
import { EditNoteModal } from '@/components/notes/EditNoteModal';
import { NoteCard } from '@/components/dashboard/NoteCard';

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);

    const fetchNotes = () => {
        setLoading(true);
        getNotes().then(data => {
            setNotes(data);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('¿Eliminar esta nota permanentemente?')) {
            await deleteNote(id);
            fetchNotes();
        }
    };

    const handleTogglePin = async (id: string, isPinned: boolean) => {
        await togglePinNote(id, isPinned);
        fetchNotes();
    };

    const handleMoveNote = async (id: string, direction: 'PREV' | 'NEXT') => {
        const newNotes = [...notes];
        const index = newNotes.findIndex(n => n.id === id);

        // Find adjacent note with same pinned status
        const isPinned = newNotes[index].is_pinned;
        const targetIndex = direction === 'PREV'
            ? [...newNotes].slice(0, index).reverse().findIndex(n => n.is_pinned === isPinned)
            : newNotes.slice(index + 1).findIndex(n => n.is_pinned === isPinned);

        if (targetIndex === -1) return;

        const actualTargetIndex = direction === 'PREV'
            ? index - 1 - targetIndex
            : index + 1 + targetIndex;

        // Swap
        const [moved] = newNotes.splice(index, 1);
        newNotes.splice(actualTargetIndex, 0, moved);

        // Update indices for the relevant section
        const sectionNotes = newNotes.filter(n => n.is_pinned === isPinned);
        const updates = sectionNotes.map((n, i) => ({ id: n.id, order_index: i }));

        setNotes(newNotes);

        try {
            await updateNotesPositions(updates);
        } catch (error) {
            console.error(error);
            fetchNotes();
        }
    };

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Mis Notas e Ideas</h1>
                    <p className="text-gray-400 text-sm mt-1">Espacio de pensamiento libre.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} className="mr-2" /> Nueva Nota
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">
                    {notes.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-xl">
                            <p>Tu mente está despejada. Agrega una nota para comenzar.</p>
                        </div>
                    )}
                    {notes.map((note, index) => (
                        <div key={note.id} className="h-full">
                            <NoteCard
                                note={note}
                                onDelete={handleDelete}
                                onPin={handleTogglePin}
                                onEdit={setEditingNote}
                                onMoveUp={(id) => handleMoveNote(id, 'PREV')}
                                onMoveDown={(id) => handleMoveNote(id, 'NEXT')}
                            />
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <CreateNoteModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => { setIsModalOpen(false); fetchNotes(); }}
                />
            )}

            {editingNote && (
                <EditNoteModal
                    note={editingNote}
                    onClose={() => setEditingNote(null)}
                    onSuccess={() => { setEditingNote(null); fetchNotes(); }}
                />
            )}
        </DashboardLayout>
    );
}
