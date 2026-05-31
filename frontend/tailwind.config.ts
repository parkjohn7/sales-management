import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172026",
        line: "#d9e0e7",
        mint: "#0f9f8f",
        coral: "#d85c4a",
        gold: "#c88a13"
      }
    }
  },
  plugins: []
} satisfies Config;
