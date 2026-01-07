import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

        const variants = {
            primary: 'bg-white text-black hover:bg-gray-200 focus:ring-white/50 border border-transparent shadow-[0_0_15px_rgba(255,255,255,0.1)]',
            secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-sm',
            ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5',
            danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-xs',
            md: 'px-4 py-2 text-sm',
            lg: 'px-6 py-3 text-base',
        };

        return (
            <button
                ref={ref}
                className={twMerge(baseStyles, variants[variant], sizes[size], className)}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? (
                    <span className="mr-2 animate-spin rounded-full h-4 w-4 border-b-2 border-current"></span>
                ) : null}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
