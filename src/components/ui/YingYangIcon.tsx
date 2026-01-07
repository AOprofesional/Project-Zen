import React from 'react';

export function YingYangIcon({ size = 24, className = "" }: { size?: number, className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM12 4C14.209 4 16 5.791 16 8C16 10.209 14.209 12 12 12C9.791 12 8 13.791 8 16C8 18.209 9.791 20 12 20C7.582 20 4 16.418 4 12C4 7.582 7.582 4 12 4ZM12 4C16.418 4 20 7.582 20 12C20 16.418 16.418 20 12 20C14.209 20 16 18.209 16 16C16 13.791 14.209 12 12 12C9.791 12 8 10.209 8 8C8 5.791 9.791 4 12 4Z"
                fill="currentColor"
            />
            <circle cx="12" cy="8" r="1.5" fill="currentColor" />
            <circle cx="12" cy="16" r="1.5" fill="currentColor" fillOpacity="0.3" />
        </svg>
    );
}
