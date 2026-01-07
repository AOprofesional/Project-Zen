import { HTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    noPadding?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, noPadding = false, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={twMerge(
                    'glass-panel rounded-xl',
                    !noPadding && 'p-6',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';
