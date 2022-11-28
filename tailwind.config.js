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
                "primary-darker": "#385046",
                "primary-contrast-text": "#687a6e",

                "secondary-light": "#f0e4d8",
                "secondary-main": "#e2b4a5",
                "secondary-dark": "#df8e73",
                "secondary-darker": "#975F4D",
                "secondary-contrast-text": "#664e4a",

                "btn-light": "#a6cabd",
                "btn-main": "#6c9d89",
                "btn-dark": "#527a6a",
                "btn-darker": "#355045",
                "btn-contrast-text": "#fff",

                "secondary-btn-light": "#e2b4a5",
                "secondary-btn-main": "#df8e73",
                "secondary-btn-dark": "#d56b48",
                "secondary-btn-contrast-text": "#fff",

                "high-contrast-text": "#fff"
            },
            keyframes: {
                appear: {
                    "0%": { transform: "translate(-100%)", opacity: 0, visibility: "hidden" },
                    "30%": { transform: "translate(0)", opacity: 0.4 },
                    "70%": { transform: "translate(20px)", opacity: 0.8 },
                    "100%": { transform: "translate(0)", opacity: 1, visibility: "visible" }
                },
                disappear: {
                    "0%": { transform: "translate(0)", opacity: 1, visibility: "visible" },
                    "70%": { transform: "translate(20px)", opacity: 0.4 },
                    "100%": { transform: "translate(-100%)", opacity: 0, visibility: "hidden" }
                }
            },
            animation: {
                appear: "appear 0.3s ease-in",
                disappear: "disappear 0.3s ease-in"
            }
        }
    },
    plugins: []
};
