import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F6F1",
        ink: "#0F1512",
        muted: "#5B6A61",
        line: "#E3DFD4",
        leaf: "#0E6B3D",
        clean: "#0E7C3A",
        limit: "#B26A00",
        avoid: "#B42318",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Noto Sans",
          "Noto Sans Devanagari",
          "Noto Sans Kannada",
          "Noto Sans Telugu",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,21,18,0.06), 0 8px 24px -16px rgba(15,21,18,0.35)",
      },
      keyframes: {
        rise: { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      animation: { rise: "rise .35s ease-out both" },
    },
  },
  plugins: [],
};

export default config;
