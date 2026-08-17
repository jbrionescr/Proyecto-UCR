/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
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
      fontFamily: {
        display: ["'Outfit'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      colors: {
        // FundacionU — paleta de marca (prefijo fu-)
        fu: {
          white: "#FFFFFF",
          orange: "#F37021",
          gold: "#FDB912",
          amber: "#F99D1C",
          "pink-light": "#E9C3E1",
          tan: "#E5B365",
          "yellow-bright": "#FFDD00",
          green: "#6DC067",
          "blue-dark": "#005DA4",
          "blue-sky": "#00C0F3",
          "yellow-light": "#FFE06A",
          "gray-light": "#B7BE11",
          "blue-pale": "#8ED8F8",
          // Tokens semánticos (leen las CSS vars → cambian con el tema)
          bg: "var(--fu-bg)",
          surface: "var(--fu-surface)",
          "surface-2": "var(--fu-surface-2)",
          "surface-3": "var(--fu-surface-3)",
          text: "var(--fu-text)",
          "text-2": "var(--fu-text-2)",
          muted: "var(--fu-muted)",
          "fu-border": "var(--fu-border)",
        },
        // FWD Costa Rica brand colors (logo)
        fwd: {
          cyan:   "#00AEEF",  // Azul FWD
          purple: "#6B2D8B",  // Morado FWD
          yellow: "#F5C400",  // Amarillo FWD
          green:  "#00A651",  // Verde FWD
        },
        ucr: {
          // Colores oficiales de la web de la Fundación
          esmeralda: "#004C63",      // Color corporativo oscuro / azul profundo
          celeste: "#4BA5D9",        // Celeste/Azul cielo oficial del banner principal
          "celeste-oficial": "#4BA5D9",
          amarillo: "#FF9B18",       // Amarillo de acentos
          naranja: "#F34B26",        // Naranja-rojo de acción de la web
          "naranja-oficial": "#F34B26",
          blanco: "#FFFFFF",
          negro: "#141414",
          "gris-fondo": "#F8F8F8",   // Fondo de sección oficial
          "footer-bg": "#272829",    // Fondo gris oscuro del footer de la web
          "texto-oscuro": "#1A1A2E",  // Texto oscuro para secciones claras

          // Tints oficiales al 20%
          turquesa: "#004C63",
          "celeste-medium": "#006AD3",
          "turquesa-tint": "#CCDBE0",
          "celeste-tint": "#CCE1F6",
          "beige-tint": "#FFEBD1",
          "rosa-tint": "#FDDBCF",

          // Compatibilidad heredada mapeada a los colores oficiales
          azul1: "#004C63",
          "azul-1": "#004C63",
          azul2: "#004C63",
          "azul-2": "#004C63",
          gris1: "#F8F8F8",
          "gris-1": "#F8F8F8",
          gris2: "#666666",
          "gris-2": "#666666",
          gris3: "#232323",
          "gris-3": "#232323",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        fu: "var(--fu-shadow)",
        "fu-lg": "0 8px 40px rgba(19,36,48,0.10), 0 2px 8px rgba(19,36,48,0.06)",
        "fu-glow": "0 0 0 1px var(--fu-border), 0 12px 40px -12px rgba(0,93,164,0.35)",
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
        "fu-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "fu-fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fu-gradient": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "fu-blob": {
          "0%, 100%": { borderRadius: "42% 58% 63% 37% / 42% 42% 58% 58%" },
          "50%": { borderRadius: "58% 42% 37% 63% / 58% 58% 42% 42%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fu-float": "fu-float 6s ease-in-out infinite",
        "fu-fade-up": "fu-fade-up 0.6s cubic-bezier(0.25,1,0.5,1) both",
        "fu-gradient": "fu-gradient 8s ease infinite",
        "fu-blob": "fu-blob 12s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
