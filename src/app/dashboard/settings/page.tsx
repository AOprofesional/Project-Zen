"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Mail, Shield, Save } from 'lucide-react';
import { updateProfile } from '@/services/settings';
import { Badge } from '@/components/ui/Badge';
import { UserList } from '@/components/settings/UserList';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [formData, setFormData] = useState({ full_name: '' });

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const loadData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                setProfile(profile);
                setFormData({ full_name: profile.full_name || '' });
            }
            setLoading(false);
        };
        loadData();
    }, [router, supabase]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateProfile(user.id, { full_name: formData.full_name });
            // Refresh local state or show success toast
            alert('Perfil actualizado con éxito');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Error al actualizar');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-[50vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-8">
                <header className="mb-8">
                    <h2 className="text-3xl font-bold">Configuración</h2>
                    <p className="text-gray-400">Administra tu perfil y preferencias.</p>
                </header>

                {/* Profile Section */}
                <section className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-300 flex items-center gap-2">
                        <User size={20} className="text-indigo-400" /> Perfil de Usuario
                    </h3>
                    <Card className="bg-white/5 border-white/10 p-6">
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                                    {formData.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Avatar generado automáticamente</p>
                                </div>
                            </div>

                            <Input
                                label="Nombre Completo"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                icon={<User size={16} />}
                                placeholder="Tu nombre visible"
                            />

                            <div className="flex justify-end">
                                <Button type="submit" isLoading={saving} className="bg-indigo-600 hover:bg-indigo-500">
                                    <Save size={16} className="mr-2" /> Guardar Cambios
                                </Button>
                            </div>
                        </form>
                    </Card>
                </section>

                {/* Account Info Section */}
                <section className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-300 flex items-center gap-2">
                        <Shield size={20} className="text-emerald-400" /> Información de Cuenta
                    </h3>
                    <Card className="bg-white/5 border-white/10 p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Correo Electrónico</label>
                                <div className="flex items-center gap-2 text-gray-300 bg-black/20 p-2 rounded-lg border border-white/5">
                                    <Mail size={14} />
                                    <span className="text-sm">{user.email}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Rol de Usuario</label>
                                <div className="flex items-center gap-2">
                                    <Badge variant={profile?.role === 'ADMIN' ? 'success' : 'outline'} className="py-1 px-3">
                                        {profile?.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-white/5">
                            User ID: {user.id}
                        </p>
                    </Card>
                </section>
                {/* User Management Section (Admin Only - Handled internally) */}
                <UserList currentRole={profile?.role} />
            </div>
        </DashboardLayout>
    );
}
