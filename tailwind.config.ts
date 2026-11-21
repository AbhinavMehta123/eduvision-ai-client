import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        chatgpt: {
          main: "#212121",
          sidebar: "#171717",
          hover: "#2f2f2f",
          border: "#303030",
          input: "#2f2f2f",
          userBubble: "#2f2f2f",
          assistantBubble: "#212121"
        }
      }
    },
  },
  plugins: [],
};
export default config;
