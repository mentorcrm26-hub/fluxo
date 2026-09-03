import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/componentes/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-tema="escuro"]'],
  theme: {
    extend: {
      colors: {
        fundo: 'var(--fundo)',
        superficie: {
          DEFAULT: 'var(--superficie)',
          2: 'var(--superficie-2)',
          3: 'var(--superficie-3)',
        },
        borda: {
          DEFAULT: 'var(--borda)',
          forte: 'var(--borda-forte)',
        },
        texto: {
          DEFAULT: 'var(--texto)',
          2: 'var(--texto-2)',
          3: 'var(--texto-3)',
        },
        acento: {
          DEFAULT: 'var(--acento)',
          claro: 'var(--acento-claro)',
          suave: 'var(--acento-suave)',
        },
        sucesso: {
          DEFAULT: 'var(--sucesso)',
          suave: 'var(--sucesso-suave)',
        },
        alerta: {
          DEFAULT: 'var(--alerta)',
          suave: 'var(--alerta-suave)',
        },
        perigo: {
          DEFAULT: 'var(--perigo)',
          suave: 'var(--perigo-suave)',
        },
        info: 'var(--info)',
      },
      borderRadius: {
        p: 'var(--raio-p)',
        m: 'var(--raio-m)',
        g: 'var(--raio-g)',
        xg: 'var(--raio-xg)',
      },
      boxShadow: {
        1: 'var(--sombra-1)',
        2: 'var(--sombra-2)',
        3: 'var(--sombra-3)',
      },
      fontFamily: {
        display: ['var(--fonte-display)', 'sans-serif'],
        sans: ['var(--fonte-sans)', 'sans-serif'],
        mono: ['var(--fonte-mono)', 'monospace'],
      },
      spacing: {
        4: '4px',
        8: '8px',
        12: '12px',
        16: '16px',
        20: '20px',
        24: '24px',
        32: '32px',
        40: '40px',
        56: '56px',
        72: '72px',
        96: '96px',
      },
      transitionTimingFunction: {
        padrao: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      transitionDuration: {
        120: '120ms',
        200: '200ms',
        320: '320ms',
      },
    },
  },
  plugins: [],
};

export default config;
