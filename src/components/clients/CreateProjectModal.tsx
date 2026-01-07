"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { createProject } from '@/services/projects';
import { X } from 'lucide-react';

interface CreateProjectModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateProjectModal({ onClose, onSuccess }: CreateProjectModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createProject({ name, description });
            onSuccess();
        } catch (error: any) {
            console.error(error);
            alert('Error al crear proyecto: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-[#09090b] border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">Nuevo Proyecto / Cliente</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Nombre del Proyecto o Cliente"
                        placeholder="Ej: Rediseño Web Adidas"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoFocus
                    />

                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-400 ml-1">Descripción (Opcional)</label>
                        <textarea
                            className="glass-input w-full text-sm placeholder:text-gray-600 min-h-[80px] p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30 resize-none"
                            placeholder="Breve descripción del alcance..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" isLoading={loading}>Crear Proyecto</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
