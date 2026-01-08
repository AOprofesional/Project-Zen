'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ProjectError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Project Detail Error:', error);
    }, [error]);

    return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                    <AlertCircle size={32} className="text-red-500" />
                </div>

                <h2 className="text-2xl font-bold mb-2">Algo salió mal</h2>
                <p className="text-gray-400 max-w-md mb-8">
                    No pudimos cargar los detalles del proyecto. Esto puede deberse a un problema temporal de conexión o un error de carga de archivos en el servidor.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                        onClick={() => reset()}
                        className="bg-white text-black hover:bg-gray-200"
                    >
                        <RefreshCcw size={18} className="mr-2" /> Reintentar
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => window.location.reload()}
                    >
                        Carga forzada (Ctrl + F5)
                    </Button>
                </div>

                {error.message && (
                    <div className="mt-12 p-4 bg-black/40 border border-white/5 rounded-lg text-left max-w-2xl overflow-auto group">
                        <p className="text-[10px] uppercase font-bold text-gray-600 mb-2">Detalles técnicos:</p>
                        <code className="text-xs text-gray-500 font-mono break-all">{error.message}</code>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
