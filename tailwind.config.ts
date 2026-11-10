import type { Config } from "tailwindcss"

const config = {
  darkMode: "class",
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        eskom: {
          // Refined, premium SaaS color shifts
          blue: '#0F62FE',      // A deep, modern tech blue
          green: '#24A148',     // A clean, accessible UI green
          slate: '#475569',     // Standard cool slate
          orange: '#FF832B',    // A softer, more balanced accent orange
          background: '#FBFDFF',// An ultra-crisp, cool white background
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(15, 98, 254, 0.05)',
        'soft': '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config