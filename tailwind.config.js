/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.jsx",
    "./resources/**/*.ts",
    "./resources/**/*.tsx",
    "./resources/**/*.vue",
    "./storage/framework/views/*.php",
    "./app/View/Components/**/*.php",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}