"use client";

import React from 'react';
import { twMerge } from 'tailwind-merge';

const DAYS = [
    { id: 'MON', label: 'L' },
    { id: 'TUE', label: 'M' },
    { id: 'WED', label: 'M' },
    { id: 'THU', label: 'J' },
    { id: 'FRI', label: 'V' },
    { id: 'SAT', label: 'S' },
    { id: 'SUN', label: 'D' },
];

interface DaySelectorProps {
    selectedDays: string[];
    onChange: (days: string[]) => void;
    label?: string;
}

export function DaySelector({ selectedDays, onChange, label }: DaySelectorProps) {
    const toggleDay = (dayId: string) => {
        if (selectedDays.includes(dayId)) {
            onChange(selectedDays.filter(d => d !== dayId));
        } else {
            onChange([...selectedDays, dayId]);
        }
    };

    return (
        <div className="space-y-2">
            {label && <label className="block text-xs font-medium text-gray-400 ml-1">{label}</label>}
            <div className="flex gap-2">
                {DAYS.map((day) => {
                    const isSelected = selectedDays.includes(day.id);
                    return (
                        <button
                            key={day.id}
                            type="button"
                            onClick={() => toggleDay(day.id)}
                            className={twMerge(
                                "w-8 h-8 rounded-full text-xs font-bold transition-all border flex items-center justify-center",
                                isSelected
                                    ? "bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                                    : "bg-white/5 border-white/10 text-gray-500 hover:border-white/30 hover:text-white"
                            )}
                        >
                            {day.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
