import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
        
      colors: {
        primary: {
          DEFAULT: '#2c2c6c',
          50: '#f4f6f4',
          100: '#e8ede9',
          200: '#c6d4c8',
          300: '#a4bba7',
          400: '#608965',
          500: '#2c2c6c',
          600: '#233425',
          700: '#1d2b1e',
          800: '#172218',
          900: '#131c14',
        },
        secondary: {
          DEFAULT: '#F5F5F5',
          50: '#fefefe',
          100: '#fdfdfd',
          200: '#fafafa',
          300: '#f7f7f7',
          400: '#f6f6f6',
          500: '#F5F5F5',
          600: '#dddddd',
          700: '#b8b8b8',
          800: '#939393',
          900: '#787878',
        },
        accent: {
          DEFAULT: '#46bdec',
          50: '#fdf9f5',
          100: '#fbf3eb',
          200: '#f5dfcd',
          300: '#efcbaf',
          400: '#e5a373',
          500: '#46bdec',
          600: '#cb9663',
          700: '#aa7e52',
          800: '#886542',
          900: '#6f5236',
        },
        text: {
          DEFAULT: '#757575',
          light: '#9E9E9E',
          dark: '#424242',
        },
        divider: {
          DEFAULT: '#2c2c6c1A',
          dark: '#FFFFFF1A',
        },
        error: '#E65757',
        background: '#FFFFFF',
        white: '#FFFFFF',
      },
       fontFamily: {
        sans: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Lora", "serif"],
        default: ["Plus Jakarta Sans", "sans-serif"],
        accent: ["Lora", "serif"],
      },
      fontSize: {
        'xs': '0.75rem',     // 12px
        'sm': '0.875rem',    // 14px
        'base': '1rem',      // 16px
        'lg': '1.125rem',    // 18px
        'xl': '1.25rem',     // 20px
        '2xl': '1.5rem',     // 24px
        '3xl': '1.875rem',   // 30px
        '4xl': '2.25rem',    // 36px
        '5xl': '3rem',       // 48px
        '6xl': '3.75rem',    // 60px
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
        '42': '10.5rem',
        '46': '11.5rem',
        '50': '12.5rem',
        '54': '13.5rem',
        '58': '14.5rem',
        '62': '15.5rem',
        '66': '16.5rem',
        '70': '17.5rem',
        '74': '18.5rem',
        '78': '19.5rem',
        '82': '20.5rem',
        '86': '21.5rem',
        '90': '22.5rem',
        '94': '23.5rem',
        '98': '24.5rem',
        '100': '25rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0px 0px 10px 0px #0B10300D',
        'service': '0px 4px 14px 0px #0000000D',
        'mega-menu': '0 10px 40px rgba(0, 0, 0, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(180deg, rgba(38, 80, 94, 0) 13.1%, rgba(39, 58, 41, 0.9) 55.8%)',
        'how-it-work-overlay': 'linear-gradient(180deg, rgba(38, 80, 94, 0) 1.1%, rgba(39, 58, 41, 0.9) 30.8%)',
      },
      animation: {
        'infinite-rotate': 'infiniterotate 20s infinite linear',
        'border-zooming': 'border-zooming 1.2s infinite linear',
        'fadeInUp': 'fadeInUp 0.6s ease-out',
        'fadeInDown': 'fadeInDown 0.6s ease-out',
        'fadeInLeft': 'fadeInLeft 0.6s ease-out',
        'fadeInRight': 'fadeInRight 0.6s ease-out',
        'zoomIn': 'zoomIn 0.6s ease-out',
        'slideInUp': 'slideInUp 0.6s ease-out',
      },
      keyframes: {
        infiniterotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'border-zooming': {
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
        slideInUp: {
          '0%': { transform: 'translate3d(0, 100%, 0)', visibility: 'visible' },
          '100%': { transform: 'translate3d(0, 0, 0)' },
        },
      },
      aspectRatio: {
        'hero': '1 / 1.065',
        'service': '1 / 0.72',
        'fact': '1 / 0.74',
        'team': '1 / 1.153',
        'gallery': '1 / 0.829',
        'video': '1 / 0.591',
        'approach': '1 / 1.303',
        'care': '1 / 1.63',
        'trust': '1 / 1.05',
        'page-header': '1 / 0.598',
        'blog-single': '1 / 0.50',
        'case-study': '1 / 0.745',
      },
      zIndex: {
        '100': '100',
        '999': '999',
        '1000': '1000',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'colors': 'color, background-color, border-color, text-decoration-color, fill, stroke',
      },
      screens: {
        'xs': '480px',
        '3xl': '1600px',
        '4xl': '1920px',
      },
      container: {
        center: true,
        padding: '15px',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1300px',
        },
      },
    },
  },
  plugins: [],
};

export default config;
