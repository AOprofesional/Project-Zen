"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { YingYangIcon } from '@/components/ui/YingYangIcon';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const supabase = createClient();

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user?.id)
                .single();

            if (profile?.role === 'ADMIN') {
                router.push('/dashboard');
            } else {
                router.push('/portal');
            }
        }

        setIsLoading(false);
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background relative">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3">
                        <YingYangIcon size={32} className="text-white" />
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                            Project Zen
                        </h1>
                    </div>
                    <p className="text-secondary text-sm mt-2">Acceso unificado para Administradores y Clientes</p>
                </div>

                <Card className="border-white/10 backdrop-blur-xl">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-4 px-1">
                            <Input
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-black/20"
                                label="Email"
                            />
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-black/20"
                                label="Contraseña"
                            />

                            <Button
                                type="submit"
                                className="w-full bg-white text-black hover:bg-gray-200"
                                isLoading={isLoading}
                            >
                                {isLoading ? 'Cargando...' : 'Entrar'}
                            </Button>

                            <div className="flex items-center justify-end text-xs text-secondary px-1">
                                <Link href="/login/recovery" className="hover:text-white transition-colors">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>

                            {message && (
                                <div className={`p-3 rounded text-sm text-center ${message.includes('Error') ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                    {message}
                                </div>
                            )}

                            <div className="text-center pt-2">
                                <Link href="/" className="text-xs text-gray-500 hover:text-white transition-colors">
                                    &larr; Volver
                                </Link>
                            </div>
                        </div>
                    </form>
                </Card>
            </div>
            <div className="fixed bottom-6 right-8 opacity-20 hover:opacity-100 transition-opacity">
                <p className="text-[9px] text-gray-500 font-medium tracking-widest uppercase">
                    realizado por: AO Profesional
                </p>
            </div>
        </main>
    );
}
