import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { User, Mail, Lock, X } from 'lucide-react';

interface CreateUserModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateUserModal({ onClose, onSuccess }: CreateUserModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'CLIENT'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Error creando usuario');

            alert('Usuario creado correctamente');
            onSuccess();
        } catch (error: any) {
            console.error(error);
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <Card className="w-full max-w-md bg-[#0a0a0a] border-white/10 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Nuevo Usuario</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nombre Completo"
                        placeholder="Ej: Empresa S.A."
                        value={formData.full_name}
                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                        icon={<User size={16} />}
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        placeholder="contacto@empresa.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        icon={<Mail size={16} />}
                        required
                    />
                    <Input
                        label="Contraseña Temporal"
                        type="password"
                        placeholder="******"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        icon={<Lock size={16} />}
                        required
                        minLength={6}
                    />

                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest">Rol del Usuario</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={formData.role === 'CLIENT'}
                                    onChange={() => setFormData({ ...formData, role: 'CLIENT' })}
                                    className="accent-blue-500"
                                /> Cliente
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={formData.role === 'ADMIN'}
                                    onChange={() => setFormData({ ...formData, role: 'ADMIN' })}
                                    className="accent-purple-500"
                                /> Administrador
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="mr-2">Cancelar</Button>
                        <Button type="submit" isLoading={loading}>Crear Cuenta</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
