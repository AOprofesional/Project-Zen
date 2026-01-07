"use client";

import { useEffect, useState } from 'react';
import { TaskComment, UserProfile } from '@/types';
import { getTaskComments, createTaskComment } from '@/services/tasks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Send, User as UserIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface TaskCommentsProps {
    taskId: string;
}

export function TaskComments({ taskId }: TaskCommentsProps) {
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<string | null>(null);

    const supabase = createClient();

    const fetchComments = async () => {
        try {
            const data = await getTaskComments(taskId);
            setComments(data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setCurrentUser(data.user?.id || null);
        });
        fetchComments();
    }, [taskId]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            await createTaskComment(taskId, newComment);
            setNewComment('');
            fetchComments();
        } catch (e: any) {
            alert('Error al comentar: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-h-[400px]">
            <h4 className="text-sm font-bold text-gray-400 mb-4 px-1">Comentarios</h4>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                {comments.length === 0 && (
                    <p className="text-sm text-gray-600 italic text-center py-8">
                        No hay comentarios aún.
                    </p>
                )}
                {comments.map((comment) => {
                    const isMe = comment.user_id === currentUser;
                    return (
                        <div key={comment.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-gray-300">
                                    {comment.user?.full_name?.charAt(0).toUpperCase() || <UserIcon size={14} />}
                                </span>
                            </div>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMe
                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                    : 'bg-white/10 text-gray-200 rounded-tl-none'
                                }`}>
                                <p>{comment.content}</p>
                                <span className="text-[10px] opacity-50 block mt-1 text-right">
                                    {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="relative mt-auto pt-2 border-t border-white/10">
                <input
                    className="w-full bg-white/5 border border-white/10 rounded-full pl-5 pr-12 py-3 text-sm text-white focus:outline-none focus:bg-white/10 transition-colors"
                    placeholder="Escribe un comentario..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={loading || !newComment.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 disabled:opacity-50 disabled:bg-gray-700 transition-colors"
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
}
