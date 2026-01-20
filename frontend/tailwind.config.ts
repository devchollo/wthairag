import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: {
                    light: '#ffffff',
                    dark: '#0f1115',
                },
                surface: {
                    light: '#f6f7f9',
                    dark: '#181b21',
                },
                border: {
                    light: '#e4e6eb',
                    dark: '#2a2e37',
                },
                primary: {
                    DEFAULT: '#2563eb',
                    hover: '#1d4ed8',
                },
                text: {
                    primary: '#111827',
                    secondary: '#6b7280',
                    muted: '#9ca3af',
                    dark: '#e5e7eb',
                },
            },
            spacing: {
                '8': '8px',
            },
            borderRadius: {
                'xl': '12px',
                '2xl': '16px',
            },
            lineHeight: {
                'relaxed': '1.5',
                'loose': '1.7',
            },
        },
    },
    plugins: [],
};
export default config;
