"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { updateNote } from '@/services/notes';
import { Note } from '@/types';
import { X, Pin } from 'lucide-react';

interface EditNoteModalProps {
    note: Note;
    onClose: () => void;
    onSuccess: () => void;
}

const NOTE_COLORS = [
    { name: 'Default', value: '#1E1E1E' },
    { name: 'Red', value: '#450a0a' },
    { name: 'Blue', value: '#172554' },
    { name: 'Green', value: '#052e16' },
    { name: 'Purple', value: '#3b0764' },
    { name: 'Orange', value: '#431407' },
];

export function EditNoteModal({ note, onClose, onSuccess }: EditNoteModalProps) {
    const [content, setContent] = useState(note.content);
    const [selectedColor, setSelectedColor] = useState(note.color_code);
    const [isPinned, setIsPinned] = useState(note.is_pinned);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await updateNote(note.id, {
                content,
                color_code: selectedColor,
                is_pinned: isPinned
            });
            onSuccess();
        } catch (error: any) {
            console.error(error);
            alert('Error al actualizar nota: ' + (error.message || 'Desconocido'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <Card
                className="w-full max-w-md border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200 transition-colors"
                style={{ backgroundColor: selectedColor }}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">Editar Nota</h3>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsPinned(!isPinned)}
                            className={`p-1.5 rounded-full transition-colors ${isPinned ? 'bg-white text-black' : 'bg-white/10 text-white/60 hover:text-white'}`}
                            title={isPinned ? 'Desfijar de inicio' : 'Fijar al inicio'}
                        >
                            <Pin size={16} />
                        </button>
                        <button onClick={onClose} className="text-white/60 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10 transition">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <textarea
                            placeholder="Escribe tu idea aquí..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            autoFocus
                            className="w-full bg-black/20 text-white rounded-lg p-3 min-h-[150px] border border-white/10 focus:border-white/30 focus:outline-none resize-none placeholder:text-white/30"
                        />
                    </div>

                    <div className="flex gap-2 mb-4">
                        {NOTE_COLORS.map(c => (
                            <button
                                key={c.value}
                                type="button"
                                onClick={() => setSelectedColor(c.value)}
                                className={`w-6 h-6 rounded-full border-2 ${selectedColor === c.value ? 'border-white' : 'border-transparent hover:scale-110'} transition-all`}
                                style={{ backgroundColor: c.value }}
                                title={c.name}
                            />
                        ))}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose} className="text-white hover:bg-white/10">Cancelar</Button>
                        <Button type="submit" isLoading={loading} className="bg-white text-black hover:bg-white/90">Guardar Cambios</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
