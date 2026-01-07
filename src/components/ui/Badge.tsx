import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'outline';
}

export const Badge = ({ className, variant = 'default', children, ...props }: BadgeProps) => {
    const variants = {
        default: 'bg-white/10 text-white',
        success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
        error: 'bg-red-500/10 text-red-400 border border-red-500/20',
        outline: 'bg-transparent border border-white/20 text-gray-400',
    };

    return (
        <span
            className={twMerge(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};
