import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Premium Palette
                background: "#09090b", // Deep Zinc (Almost Black)
                surface: "#18181b",    // Slightly lighter Zinc
                primary: "#fafafa",    // High contrast White
                secondary: "#a1a1aa",  // Muted Zinc
                accent: "#3b82f6",     // Subtle Blue for actions (can be changed to gold/orange)
                success: "#10b981",
                warning: "#f59e0b",
                error: "#ef4444",
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'glass': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
            },
        },
    },
    plugins: [],
};
export default config;
