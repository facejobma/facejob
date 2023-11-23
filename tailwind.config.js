/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "poppins": ['Poppins', 'sans-serif'],
        "default": ['Plus Jakarta Sans', 'sans-serif'],
        // "volkhof": ['volkhof', 'sans-serif']
      },
      backgroundImage: {
        'hero': "url('/images/decore.png')",
        'pink-circle': "url('/images/pink-circle.png')"
      },
      colors: {
        primary: "#60894B",
        secondary: "#424242",
        third: "#909090",
        optional1: "#F1F6f9",
        optional2: "#E3EAF6",
        optional3: "#F9F9F9",
        'primary-light': "#d3f9d8"
      },
      dropShadow: {
        'primary-button': "0 15px 60px rgb(223, 105, 81, 30)",
        'secondary-button': "0 20px 70px rgb(241, 165, 1, 15)",
        'card': "0 21.85px 26.3px rgb(0,0,0, 10)",
      }
    },
  },
  plugins: [],
};
