/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{ts,js,vue,jsx,tsx}"],
    theme: {
        screens: {
            sm: "576px",
            md: "768px",
            lg: "992px",
            xl: "1200px",
            "2xl": "1536px"
        },
        extend: {
            screens: {
                xs: "400px"
            }
        }
    },
    plugins: []
};
