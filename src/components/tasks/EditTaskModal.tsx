"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Todo, TaskType } from '@/types';
import { updateTask } from '@/services/tasks';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { getTaskTypeLabel } from '@/utils/labels';
import { DaySelector } from '@/components/ui/DaySelector';

interface EditTaskModalProps {
    task: Todo;
    onClose: () => void;
    onSuccess: () => void;
}

export function EditTaskModal({ task, onClose, onSuccess }: EditTaskModalProps) {
    const [content, setContent] = useState(task.content);
    const [description, setDescription] = useState(task.description || '');
    const [type, setType] = useState<TaskType>(task.type);
    const [dueDate, setDueDate] = useState(() => {
        if (!task.due_date) return '';
        const d = new Date(task.due_date);
        return d.toISOString().split('T')[0];
    });
    const [selectedDays, setSelectedDays] = useState<string[]>(task.recurrence_days || []);
    const [monthDay, setMonthDay] = useState<number>(task.recurrence_month_day || 1);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await updateTask(task.id, {
                content,
                description,
                type,
                due_date: (type === 'ROUTINE' || type === 'WEEKLY' || type === 'MONTHLY') ? null : (dueDate ? new Date(dueDate).toISOString() : null),
                recurrence_days: type === 'WEEKLY' ? selectedDays : null,
                recurrence_month_day: type === 'MONTHLY' ? monthDay : null,
            });
            onSuccess();
        } catch (error: any) {
            console.error(error);
            alert('Error al actualizar: ' + (error.message || 'Desconocido'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-[#09090b] border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">Editar Tarea</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10 transition">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Nombre de la Tarea"
                        placeholder="¿Qué hay que hacer?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        autoFocus
                    />

                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-400 ml-1">Descripción (Opcional)</label>
                        <textarea
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-white/20 min-h-[100px] resize-none"
                            placeholder="Añade detalles adicionales..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1 flex items-center gap-2">
                            Tipo de Tarea
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['DAILY', 'WEEKLY', 'MONTHLY', 'EVENTUAL', 'ROUTINE'] as TaskType[]).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={`px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md border transition-all ${type === t ? 'bg-white text-black border-white' : 'bg-transparent border-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300'}`}
                                >
                                    {getTaskTypeLabel(t)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CONDITIONAL INPUTS BASED ON TYPE */}
                    {type === 'WEEKLY' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <DaySelector
                                label="Repetir los días"
                                selectedDays={selectedDays}
                                onChange={setSelectedDays}
                            />
                        </div>
                    )}

                    {type === 'MONTHLY' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <Input
                                label="Día del mes (1-31)"
                                type="number"
                                min={1}
                                max={31}
                                value={monthDay}
                                onChange={(e) => setMonthDay(parseInt(e.target.value))}
                                required
                            />
                        </div>
                    )}

                    {type === 'EVENTUAL' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <Input
                                label="Fecha del evento"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    {type === 'DAILY' && (
                        <div className="bg-white/5 border border-white/5 rounded-lg p-3 flex items-center justify-between">
                            <span className="text-xs text-gray-500">Se guardará como tarea diaria</span>
                            <span className="text-xs font-bold text-white flex items-center gap-1">
                                <CalendarIcon size={12} /> Hoy
                            </span>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="text-gray-500 hover:text-white">Cancelar</Button>
                        <Button type="submit" isLoading={loading} className="bg-white text-black hover:bg-gray-200">Guardar Cambios</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
