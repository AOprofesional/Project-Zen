"use client";

import { useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { getAvailableClients, assignClientToProject, removeClientFromProject } from '@/services/projects';
import { Button } from '@/components/ui/Button';
import { User, UserPlus, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface ClientAssignerProps {
    projectId: string;
    currentClient: UserProfile | null;
    onUpdate: () => void;
}

export function ClientAssigner({ projectId, currentClient, onUpdate }: ClientAssignerProps) {
    const [availableClients, setAvailableClients] = useState<UserProfile[]>([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isSelecting) {
            getAvailableClients().then(setAvailableClients);
        }
    }, [isSelecting]);

    const handleAssign = async (userId: string) => {
        setLoading(true);
        await assignClientToProject(userId, projectId);
        setIsSelecting(false);
        setLoading(false);
        onUpdate();
    };

    const handleRemove = async () => {
        if (!currentClient || !confirm(`¿Desvincular a ${currentClient.email}?`)) return;
        setLoading(true);
        await removeClientFromProject(projectId);
        setLoading(false);
        onUpdate();
    };

    if (currentClient) {
        return (
            <Card className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-indigo-500/30">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
                            {currentClient.email?.[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-indigo-200">Cliente Asignado</p>
                            <p className="text-base text-white">{currentClient.email}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleRemove} isLoading={loading}>
                        Desvincular
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className="border-dashed border-white/20 bg-transparent hover:bg-white/5 transition-colors">
            {!isSelecting ? (
                <div
                    onClick={() => setIsSelecting(true)}
                    className="flex flex-col items-center justify-center py-4 cursor-pointer text-gray-400 hover:text-white"
                >
                    <UserPlus size={24} className="mb-2" />
                    <p className="font-medium">Asignar un Cliente a este Proyecto</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-sm">Seleccionar Cliente Disponible</h4>
                        <button onClick={() => setIsSelecting(false)}><X size={16} /></button>
                    </div>
                    {availableClients.length === 0 ? (
                        <p className="text-sm text-gray-500 py-2">No hay usuarios con rol 'CLIENT' libres.</p>
                    ) : (
                        <div className="max-h-40 overflow-y-auto space-y-2">
                            {availableClients.map(client => (
                                <div key={client.id} className="flex justify-between items-center p-2 bg-black/40 rounded hover:bg-white/10 transition">
                                    <span className="text-sm">{client.email}</span>
                                    <Button size="sm" onClick={() => handleAssign(client.id)} isLoading={loading}>Asignar</Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}
