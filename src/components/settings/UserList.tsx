import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { User, Trash2, Plus, RefreshCw } from 'lucide-react';
import { CreateUserModal } from './CreateUserModal';
import { createClient } from '@/lib/supabase';

interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: string;
    created_at: string;
}

interface UserListProps {
    currentRole?: string;
}

export function UserList({ currentRole }: UserListProps) {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(currentRole === 'ADMIN');

    // Initial check for current user role to show/hide this section
    useEffect(() => {
        if (currentRole) {
            if (currentRole === 'ADMIN') {
                setIsAdmin(true);
                fetchUsers();
            } else {
                setLoading(false);
            }
            return;
        }

        const checkRole = async () => {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data, error } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                    if (data?.role === 'ADMIN') {
                        setIsAdmin(true);
                        fetchUsers();
                    } else {
                        setLoading(false);
                    }
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error("Error checking role:", err);
                setLoading(false);
            }
        };
        checkRole();
    }, [currentRole]);

    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/users');

            // Check if response is JSON
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await res.text();
                console.error("Non-JSON response:", text);
                throw new Error(`Respuesta no válida del servidor (${res.status})`);
            }

            const data = await res.json();

            if (res.ok) {
                setUsers(data);
            } else {
                setError(data.error || 'Error al cargar usuarios');
            }
        } catch (error: any) {
            console.error("Fetch Users Error:", error);
            setError('Error de Red: ' + (error.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de eliminar a ${name}? Esta acción no se puede deshacer.`)) return;

        try {
            const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Falló al eliminar');

            setUsers(users.filter(u => u.id !== id));
        } catch (err) {
            alert('Error al eliminar usuario');
        }
    };

    if (!isAdmin && !loading) return null; // Don't show anything if not admin

    return (
        <section className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-300 flex items-center gap-2">
                    <User size={20} className="text-blue-400" /> Gestión de Usuarios
                </h3>
                <Button size="sm" onClick={() => setIsModalOpen(true)}>+ Nuevo Usuario</Button>
            </div>

            <Card className="bg-white/5 border-white/10 p-4">
                {loading ? (
                    <div className="flex justify-center p-4"><RefreshCw className="animate-spin" /></div>
                ) : (
                    <div className="space-y-2">
                        {error && (
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}
                        {users.length === 0 && !error && <p className="text-center text-gray-500 py-4">No hay usuarios registrados.</p>}

                        {users.map(user => (
                            <div key={user.id} className="flex justify-between items-center p-3 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'} flex items-center justify-center font-bold text-xs`}>
                                        {user.full_name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-white">{user.full_name || 'Sin Nombre'}</p>
                                            <Badge variant={user.role === 'ADMIN' ? 'success' : 'outline'} className="text-[8px] py-0 px-1">
                                                {user.role}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="text-[10px] hidden md:block">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </Badge>
                                    <button
                                        onClick={() => handleDelete(user.id, user.full_name)}
                                        className="text-gray-500 hover:text-red-400 transition-colors bg-white/5 p-2 rounded hover:bg-white/10"
                                        title="Eliminar Usuario"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {isModalOpen && (
                <CreateUserModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => { setIsModalOpen(false); fetchUsers(); }}
                />
            )}
        </section>
    );
}
