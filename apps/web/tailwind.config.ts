import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

// Convenção de tokens compatível com shadcn/ui (variáveis HSL em globals.css).
// Tema padrão: dark mode, identidade "Órbita" — gradiente índigo→ciano como
// cor de destaque (primary). Ver docs/identidade-visual.md.
const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      // Espaçamento nomeado usado pelo shell (header/sidebar) — mantém a
      // largura da sidebar como um único valor reutilizável em vez de
      // repetir "16rem"/"4.5rem" em cada componente que precisa alinhar.
      spacing: {
        sidebar: "16rem",
        "sidebar-collapsed": "4.5rem",
        header: "3.75rem",
      },
      fontFamily: {
        // --font-inter e --font-display vêm do next/font/google em app/layout.tsx.
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        // Space Grotesk — títulos e números grandes de KPI (aplicado
        // globalmente a h1/h2/h3 em globals.css; a classe `font-display`
        // fica disponível pra aplicar em elementos que não são heading,
        // ex. o valor grande de um KpiCard).
        display: ["var(--font-display)", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Formato "hsl(var(--x) / <alpha-value>)" — necessário para que
        // modificadores de opacidade do Tailwind (ex: bg-primary/15) funcionem
        // com cores definidas via CSS variable.
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        success: {
          DEFAULT: "hsl(var(--success) / <alpha-value>)",
          foreground: "hsl(var(--success-foreground) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "hsl(var(--warning) / <alpha-value>)",
          foreground: "hsl(var(--warning-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
        },
        chart: {
          1: "hsl(var(--chart-1) / <alpha-value>)",
          2: "hsl(var(--chart-2) / <alpha-value>)",
          3: "hsl(var(--chart-3) / <alpha-value>)",
          4: "hsl(var(--chart-4) / <alpha-value>)",
          5: "hsl(var(--chart-5) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        // Uso pontual — hero de login/registro, CTA primário em destaque.
        // Nunca em texto/gráfico (identidade-visual.md § 3: gradiente é
        // decorativo, não substitui os tokens sólidos --primary/--chart-*).
        "brand-gradient": "linear-gradient(135deg, hsl(245 100% 67%) 0%, hsl(188 91% 34%) 100%)",
      },
      boxShadow: {
        brand: "0 6px 20px hsl(245 100% 67% / 0.35)",
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
};

export default config;
