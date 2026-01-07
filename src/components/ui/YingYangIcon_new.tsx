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
            {/* Base Circle with subtle border */}
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />

            {/* Main Yin Yang shape */}
            <path
                d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22V12C12 9.23858 14.2386 7 17 7C19.7614 7 22 9.23858 22 12C22 6.47715 17.5228 2 12 2Z"
                fill="currentColor"
            />
            <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 14.7614 19.7614 17 17 17C14.2386 17 12 14.7614 12 12V22Z"
                fill="currentColor"
                fillOpacity="0.4"
            />

            {/* Small circles (eyes) */}
            <circle cx="12" cy="17" r="1.5" fill="white" fillOpacity="0.8" />
            <circle cx="12" cy="7" r="1.5" fill="black" fillOpacity="0.6" />
        </svg>
    );
}
