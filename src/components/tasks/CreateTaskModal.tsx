import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { TaskType } from '@/types';
import { createTask } from '@/services/tasks';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { getTaskTypeLabel } from '@/utils/labels';
import { DaySelector } from '@/components/ui/DaySelector';

interface CreateTaskModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateTaskModal({ onClose, onSuccess }: CreateTaskModalProps) {
    const [content, setContent] = useState('');
    const [type, setType] = useState<TaskType>('DAILY');
    const [dueDate, setDueDate] = useState('');
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [monthDay, setMonthDay] = useState<number>(1);
    const [loading, setLoading] = useState(false);

    // Auto-set today's date for DAILY tasks
    useEffect(() => {
        if (type === 'DAILY') {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            setDueDate(`${year}-${month}-${day}`);
        }
    }, [type]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createTask({
                content,
                type,
                due_date: (type === 'ROUTINE' || type === 'WEEKLY' || type === 'MONTHLY') ? null : (dueDate ? new Date(dueDate).toISOString() : null),
                recurrence_days: type === 'WEEKLY' ? selectedDays : null,
                recurrence_month_day: type === 'MONTHLY' ? monthDay : null,
                is_completed: false
            });
            onSuccess();
        } catch (error: any) {
            console.error(error);
            alert('Error en la creación: ' + (error.message || 'Desconocido'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-[#09090b] border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">Nueva Tarea</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                                    className={`px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md border transition-all ${type === t ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'bg-transparent border-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300'}`}
                                >
                                    {getTaskTypeLabel(t)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Input
                        label="¿Qué hay que hacer?"
                        placeholder="Ej: Meditación matutina..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        autoFocus
                    />

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
                            <span className="text-xs text-gray-500">Se guardará con la fecha de hoy:</span>
                            <span className="text-xs font-bold text-white flex items-center gap-1">
                                <CalendarIcon size={12} /> {new Date().toLocaleDateString()}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="text-gray-500 hover:text-white">Cancelar</Button>
                        <Button type="submit" isLoading={loading} className="bg-white text-black hover:bg-gray-200">Crear Tarea</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
