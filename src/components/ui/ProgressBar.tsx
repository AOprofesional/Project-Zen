"use client";

import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ProgressBarProps {
    value: number; // 0 to 100
    label?: string;
    className?: string;
    colorClass?: string;
}

export function ProgressBar({ value, label, className, colorClass = "bg-blue-500" }: ProgressBarProps) {
    // Clamp value between 0 and 100
    const percentage = Math.min(Math.max(value, 0), 100);

    return (
        <div className={twMerge("w-full space-y-2", className)}>
            {(label || value !== undefined) && (
                <div className="flex justify-between items-end px-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        {label || 'Progreso Diario'}
                    </span>
                    <span className="text-xs font-bold text-white tabular-nums">
                        {Math.round(percentage)}%
                    </span>
                </div>
            )}
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div
                    className={twMerge(
                        "h-full transition-all duration-700 ease-out relative group",
                        colorClass
                    )}
                    style={{ width: `${percentage}%` }}
                >
                    {/* Glossy effect */}
                    <div className="absolute inset-0 bg-white/20 skew-x-[-30deg] -translate-x-full group-hover:animate-shimmer" />

                    {/* Shadow/Glow */}
                    <div className={twMerge(
                        "absolute right-0 top-0 h-full w-4 blur-md -mr-2 opacity-50",
                        colorClass
                    )} />
                </div>
            </div>
        </div>
    );
}
