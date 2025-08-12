import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './components/themes/default/**/*.{ts,tsx}',
  ],
  prefix: "",
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
        border: "hsl(var(--default-border))",
        input: "hsl(var(--default-input))",
        ring: "hsl(var(--default-ring))",
        background: "hsl(var(--default-background))",
        foreground: "hsl(var(--default-foreground))",
        primary: {
          DEFAULT: "hsl(var(--default-primary))",
          foreground: "hsl(var(--default-primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--default-secondary))",
          foreground: "hsl(var(--default-secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--default-destructive))",
          foreground: "hsl(var(--default-destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--default-muted))",
          foreground: "hsl(var(--default-muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--default-accent))",
          foreground: "hsl(var(--default-accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--default-popover))",
          foreground: "hsl(var(--default-popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--default-card))",
          foreground: "hsl(var(--default-card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--default-radius)",
        md: "calc(var(--default-radius) - 2px)",
        sm: "calc(var(--default-radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Inter", "sans-serif"],
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