'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Dashboard Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-white p-8 text-center">
            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-8 border border-amber-500/20">
                <AlertTriangle size={40} className="text-amber-500" />
            </div>

            <h1 className="text-3xl font-bold mb-4">Error en el Dashboard</h1>
            <p className="text-gray-400 max-w-md mb-10 leading-relaxed">
                Se ha producido un error inesperado en la interfaz. Intenta reiniciar la aplicación o volver al inicio.
            </p>

            <div className="flex gap-4">
                <Button
                    onClick={() => reset()}
                    className="bg-white text-black hover:bg-gray-200"
                >
                    Intentar de nuevo
                </Button>

                <Link href="/dashboard">
                    <Button variant="outline">
                        <Home size={18} className="mr-2" /> Volver al Inicio
                    </Button>
                </Link>
            </div>

            <div className="mt-16 pt-8 border-t border-white/5 w-full max-w-lg opacity-30">
                <p className="text-[10px] font-mono text-gray-500 break-all">
                    ID: {error.digest || 'N/A'}<br />
                    {error.message}
                </p>
            </div>
        </div>
    );
}
