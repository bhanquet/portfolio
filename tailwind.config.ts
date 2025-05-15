import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background2: "#f7f7f7",
        background: "#fff7ef",
        strongcolor: "#0e7ebd",
        maintext: "#060c12",
        secondarytext: "#4e4946",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
