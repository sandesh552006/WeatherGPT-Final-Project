/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          800: "#0e1e38",
          900: "#0b192c",
          950: "#081323",
        },
        cardnavy: {
          start: "#0d2144",
          end: "#08162e",
        },
        brand: {
          blue: "#1d68f5",
          lightblue: "#38bdf8",
          darkblue: "#0d2144",
        },
      },
    },
  },
  plugins: [],
};
