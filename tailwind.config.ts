import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canada: { red: '#D80621', dark: '#A00018' },
        nb: { blue: '#1E3A5F' },
      },
      fontFamily: {
        serif: ['Source Serif 4', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
