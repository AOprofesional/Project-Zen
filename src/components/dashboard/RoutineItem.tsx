import { LucideIcon, Pencil } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface RoutineItemProps {
    label: string;
    icon?: LucideIcon;
    isDone?: boolean; // Just for visual feedback if clicked for today
    onClick?: () => void;
    onEdit?: () => void;
}

export function RoutineItem({ label, icon: Icon, isDone, onClick, onEdit }: RoutineItemProps) {
    return (
        <div
            className="relative group/routine"
        >
            <div
                onClick={onClick}
                className={twMerge(
                    "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all cursor-pointer w-24 h-24",
                    isDone
                        ? "bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                        : "bg-white/5 border-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/10"
                )}
            >
                {Icon && <Icon size={24} className="mb-2" />}
                <span className="text-xs font-medium text-center leading-tight">{label}</span>

                {/* Visual pulse for consistency */}
                {!isDone && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white/20" />}
            </div>

            {onEdit && (
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="absolute -top-1 -right-1 p-1.5 bg-white text-black rounded-full opacity-0 group-hover/routine:opacity-100 transition-opacity shadow-lg scale-75 hover:scale-90"
                    title="Editar Rutina"
                >
                    <Pencil size={12} />
                </button>
            )}
        </div>
    );
}
