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
    const [loginMode, setLoginMode] = useState<'password' | 'magic'>('password');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const supabase = createClient();

        if (loginMode === 'password') {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setMessage(`Error: ${error.message}`);
            } else {
                // Success - redirect is handled by manual logic or role check
                // For direct password login, we usually want to check role and redirect
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
        } else {
            // Using Magic Link
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                setMessage(`Error: ${error.message}`);
            } else {
                setMessage('¡Enlace mágico enviado! Revisa tu correo.');
            }
        }

        setIsLoading(false);
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
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
                        <div>
                            <Input
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-black/20"
                                label="Email"
                            />
                            {loginMode === 'password' && (
                                <div>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="bg-black/20"
                                        label="Contraseña"
                                    />
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-white text-black hover:bg-gray-200"
                                isLoading={isLoading}
                            >
                                {isLoading ? 'Cargando...' : (loginMode === 'password' ? 'Entrar' : 'Enviar Enlace Mágico')}
                            </Button>

                            <div className="flex items-center justify-between text-xs text-secondary px-1">
                                {loginMode === 'password' ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setLoginMode('magic')}
                                            className="hover:text-white transition-colors"
                                        >
                                            Usar enlace mágico
                                        </button>
                                        <Link href="/login/recovery" className="hover:text-white transition-colors">
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setLoginMode('password')}
                                        className="hover:text-white transition-colors text-center w-full"
                                    >
                                        Volver al acceso con contraseña
                                    </button>
                                )}
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
        </main>
    );
}
