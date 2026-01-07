"use client";

import { useState } from 'react';
import { ProjectResource } from '@/types';
import { createResource, deleteResource } from '@/services/projects';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileText, Link as LinkIcon, Trash2, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface ResourceManagerProps {
    projectId: string;
    resources: ProjectResource[];
    onUpdate: () => void;
}

export function ResourceManager({ projectId, resources, onUpdate }: ResourceManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({ title: '', url: '', type: 'DELIVERABLE' as const });
    const [loading, setLoading] = useState(false);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createResource({
                project_id: projectId,
                title: newItem.title,
                url: newItem.url,
                type: newItem.type,
                status: 'PENDING'
            });
            setIsAdding(false);
            setNewItem({ title: '', url: '', type: 'DELIVERABLE' });
            onUpdate();
        } catch (err: any) {
            console.error(err);
            alert('Error al guardar: ' + (err.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Borrar este recurso?')) return;
        await deleteResource(id);
        onUpdate();
    };

    const deliverables = resources.filter(r => r.type === 'DELIVERABLE');
    const documents = resources.filter(r => r.type === 'DOCUMENT');

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <h3 className="text-xl font-bold">Recursos & Entregables</h3>
                {!isAdding && (
                    <Button size="sm" variant="secondary" onClick={() => setIsAdding(true)}>+ Agregar Recurso</Button>
                )}
            </div>

            {isAdding && (
                <Card className="bg-white/5 border-white/10 animate-in slide-in-from-top-2">
                    <form onSubmit={handleAdd} className="space-y-3">
                        <div className="flex gap-2">
                            <select
                                className="bg-black/20 border border-white/10 rounded p-2 text-sm text-white focus:outline-none"
                                value={newItem.type}
                                onChange={(e) => setNewItem({ ...newItem, type: e.target.value as any })}
                            >
                                <option value="DELIVERABLE">Entregable</option>
                                <option value="DOCUMENT">Documento</option>
                            </select>
                            <Input
                                placeholder="Título (ej: Logo Final)"
                                value={newItem.title}
                                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                required
                                className="flex-1"
                            />
                        </div>
                        <Input
                            placeholder="URL del archivo (Drive, Figma, etc)"
                            value={newItem.url}
                            onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                            icon={<LinkIcon size={14} />}
                        />
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancelar</Button>
                            <Button type="submit" size="sm" isLoading={loading}>Guardar</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* DELIVERABLES */}
                <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle size={14} className="text-emerald-500" /> Entregables
                    </h4>
                    {deliverables.length === 0 && <p className="text-sm text-gray-600 italic">No hay entregables aún.</p>}
                    {deliverables.map(r => (
                        <div key={r.id} className="flex justify-between items-center p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg group">
                            <div className="flex items-center gap-3">
                                <p className="font-medium text-emerald-100">{r.title}</p>
                                {r.url && (
                                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded hover:bg-emerald-500/20 transition-colors">
                                        <ExternalLink size={10} /> Abrir
                                    </a>
                                )}
                            </div>
                            <button onClick={() => handleDelete(r.id)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                        </div>
                    ))}
                </div>

                {/* DOCUMENTS */}
                <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <FileText size={14} className="text-blue-500" /> Documentación
                    </h4>
                    {documents.length === 0 && <p className="text-sm text-gray-600 italic">No hay documentos aún.</p>}
                    {documents.map(r => (
                        <div key={r.id} className="flex justify-between items-center p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg group">
                            <div className="flex items-center gap-3">
                                <p className="font-medium text-blue-100">{r.title}</p>
                                {r.url && (
                                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded hover:bg-blue-500/20 transition-colors">
                                        <ExternalLink size={10} /> Abrir
                                    </a>
                                )}
                            </div>
                            <button onClick={() => handleDelete(r.id)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
