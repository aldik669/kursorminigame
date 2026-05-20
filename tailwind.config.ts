import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.08), 0 12px 40px rgba(0,0,0,0.25)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" }
        },
        pop: {
          "0%": { transform: "scale(0.98)", opacity: "0.5" },
          "100%": { transform: "scale(1)", opacity: "1" }
        }
      },
      animation: {
        float: "float 3.5s ease-in-out infinite",
        pop: "pop 220ms ease-out"
      }
    }
  },
  plugins: []
} satisfies Config;

