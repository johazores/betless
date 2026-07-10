import type { Config } from 'tailwindcss';

const withOpacity = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './pages/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: withOpacity('--brand-50'),
          100: withOpacity('--brand-100'),
          200: withOpacity('--brand-200'),
          300: withOpacity('--brand-300'),
          400: withOpacity('--brand-400'),
          500: withOpacity('--brand-500'),
          600: withOpacity('--brand-600'),
          700: withOpacity('--brand-700'),
          800: withOpacity('--brand-800'),
          900: withOpacity('--brand-900'),
        },
        surface: {
          DEFAULT: withOpacity('--surface'),
          muted: withOpacity('--surface-muted'),
          sunken: withOpacity('--surface-sunken'),
        },
        line: {
          DEFAULT: withOpacity('--border'),
          strong: withOpacity('--border-strong'),
        },
        ink: {
          DEFAULT: withOpacity('--foreground'),
          muted: withOpacity('--muted-foreground'),
        },
        success: {
          DEFAULT: withOpacity('--success'),
          surface: withOpacity('--success-surface'),
        },
        info: {
          DEFAULT: withOpacity('--info'),
          surface: withOpacity('--info-surface'),
        },
        danger: {
          DEFAULT: withOpacity('--danger'),
          surface: withOpacity('--danger-surface'),
        },
        warning: {
          DEFAULT: withOpacity('--warning'),
          surface: withOpacity('--warning-surface'),
        },
        chain: {
          DEFAULT: withOpacity('--chain'),
          surface: withOpacity('--chain-surface'),
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 24px 70px rgba(15, 23, 42, 0.10)',
        card: '0 18px 45px rgba(15, 23, 42, 0.08)',
        elevated: '0 30px 80px rgba(15, 23, 42, 0.14)',
      },
      borderRadius: {
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
};

export default config;
