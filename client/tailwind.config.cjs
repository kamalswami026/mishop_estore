/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        josefin: ["Josefin Sans", "sans-serif"],
      },
    },
    colors: {
      pink: "#FB2E86",
      offnavyblue: "#3F509E",
      navyblue: "#151875",
      purple: "#7E33E0",
      offpurple: "#9F63B5",
      pantonepurple: "#E0D3F5",
      skyblue: "#00C1FE",
      blue: "#2F1AC4",
      red: "#FB2448",
    },
  },
  plugins: [],
};
