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
            },
            colors: {
                "primary-light": "#dae1db",
                "primary-main": "#a6cabd",
                "primary-dark": "#6c9d89",
                "primary-contrast-text": "#687a6e",

                "secondary-light": "#f0e4d8",
                "secondary-main": "#e2b4a5",
                "secondary-dark": "#df8e73",
                "secondary-contrast-text": "#664e4a",

                "btn-light": "#a6cabd",
                "btn-main": "#6c9d89",
                "btn-dark": "#527a6a",
                "btn-contrast-text": "#fff",

                "secondary-btn-light": "#e2b4a5",
                "secondary-btn-main": "#df8e73",
                "secondary-btn-dark": "#d56b48",
                "secondary-btn-contrast-text": "#fff",

                "high-contrast-text": "#fff"
            }
        }
    },
    plugins: []
};
