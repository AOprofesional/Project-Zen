import { Note } from '@/types';
import { Pin, Trash2, Pencil, ArrowUp, ArrowDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface NoteCardProps {
    note: Note;
    onDelete?: (id: string) => void;
    onPin?: (id: string, isPinned: boolean) => void;
    onEdit?: (note: Note) => void;
    onMoveUp?: (id: string) => void;
    onMoveDown?: (id: string) => void;
}

export function NoteCard({ note, onDelete, onPin, onEdit, onMoveUp, onMoveDown }: NoteCardProps) {
    return (
        <div
            className={twMerge(
                "p-4 rounded-xl border border-white/10 relative overflow-hidden group transition-all hover:scale-[1.02]",
                onEdit && "cursor-pointer"
            )}
            style={{ backgroundColor: `${note.color_code}20` }}
            onClick={() => onEdit?.(note)}
        >
            <div
                className="absolute left-0 top-0 w-1 h-full"
                style={{ backgroundColor: note.color_code }}
            />

            <div className="flex justify-between items-start mb-2">
                <span
                    className="text-xs font-bold uppercase tracking-wider opacity-70"
                    style={{ color: note.color_code }}
                >
                    {note.tags[0] || 'Nota'}
                </span>
                <div className="flex gap-1 relative z-10">
                    {(onMoveUp || onMoveDown) && (
                        <div className="flex bg-white/5 rounded-lg mr-1 overflow-hidden border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                            {onMoveUp && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onMoveUp(note.id); }}
                                    className="p-1 text-gray-500 hover:text-white hover:bg-white/5"
                                >
                                    <ArrowUp size={12} />
                                </button>
                            )}
                            {onMoveUp && onMoveDown && <div className="w-px bg-white/10" />}
                            {onMoveDown && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onMoveDown(note.id); }}
                                    className="p-1 text-gray-500 hover:text-white hover:bg-white/5"
                                >
                                    <ArrowDown size={12} />
                                </button>
                            )}
                        </div>
                    )}

                    {onPin && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onPin(note.id, note.is_pinned); }}
                            className={twMerge(
                                "transition-all p-1 rounded-full hover:bg-white/10",
                                note.is_pinned ? "text-white opacity-100" : "text-gray-500 opacity-0 group-hover:opacity-100"
                            )}
                            title={note.is_pinned ? "Desfijar" : "Fijar al inicio"}
                        >
                            <Pin size={12} fill={note.is_pinned ? "currentColor" : "none"} />
                        </button>
                    )}
                    {!onPin && note.is_pinned && (
                        <Pin size={12} className="text-gray-400" fill="currentColor" />
                    )}

                    {onEdit && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(note); }}
                            className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        >
                            <Pencil size={12} />
                        </button>
                    )}

                    {onDelete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                            className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        >
                            <Trash2 size={12} />
                        </button>
                    )}
                </div>
            </div>

            <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap font-light">
                {note.content}
            </p>
        </div>
    );
}
