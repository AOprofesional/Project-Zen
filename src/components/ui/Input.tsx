import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, icon, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-focus-within:text-white transition-colors">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={twMerge(
                            'glass-input w-full text-sm placeholder:text-gray-600 transition-all duration-200',
                            icon && 'pl-10', // Add padding if icon exists
                            error && 'border-red-500/50 focus:ring-red-500/20',
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1 text-xs text-red-400 ml-1">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
