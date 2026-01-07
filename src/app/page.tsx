import Link from 'next/link';
import { YingYangIcon } from '@/components/ui/YingYangIcon';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
                <div className="flex items-center justify-center gap-3 mb-8">
                    <YingYangIcon size={48} className="text-white" />
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                        Project Zen
                    </h1>
                </div>
                <p className="text-secondary text-lg mb-8">
                    Sistema de Organización Premium
                </p>

                <div className="flex justify-center w-full">
                    <Link href="/login" className="glass-panel p-8 rounded-2xl hover:bg-white/5 transition-all cursor-pointer border border-white/10 w-full max-w-sm group">
                        <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors">Iniciar Sesión &rarr;</h2>
                        <p className="text-gray-400">Acceso para Administradores y Clientes vinculados.</p>
                    </Link>
                </div>
            </div>
        </main>
    );
}
