/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        current: 'currentColor',
        transparent: 'transparent',
        white: '#FFFFFF',
        black: '#1C2434',
        brand: {
          25:  '#faf5ff',
          50:  '#f3e8ff',
          100: '#e9d5ff',
          200: '#d8b4fe',
          300: '#c084fc',
          400: '#a855f7',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#2e1065',
        },
        boxdark: '#0a0618',
        boxdark2: '#06030f',
        bodydark: '#9d8fd4',
        bodydark1: '#c084fc',
        bodydark2: '#7c6fa8',
        strokedark: 'rgba(124,58,237,0.2)',
        stroke: 'rgba(124,58,237,0.15)',
        graydark: '#1a0f35',
        meta: {
          1: '#DC3545',
          2: '#EFF2F7',
          3: '#10B981',
          4: '#313D4A',
          5: '#7c3aed',
          6: '#a855f7',
          7: '#FF6766',
          8: '#F0950C',
          9: '#E5E7EB',
          10: '#c084fc',
        },
        purple: {
          950: "#06030f",
          900: "#0d0820",
          800: "#110c25",
        },
      },
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
      },
      animation: {
        "float": "float 5s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite reverse",
        "twinkle": "twinkle 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};
