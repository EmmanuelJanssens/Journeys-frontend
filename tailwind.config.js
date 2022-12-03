/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{ts,js,vue,jsx,tsx}"],
    daisyui: {
        themes: [
            {
                journeys: {
                    primary: "#a6cabd",

                    secondary: "#e2b4a5",

                    accent: "#d56b48",

                    neutral: "#3D4451",

                    "base-100": "#f0e4d8",

                    info: "#3ABFF8",

                    success: "#36D399",

                    warning: "#FBBD23",

                    error: "#F87272",
                    bg: "#f0e4d8"
                }
            }
        ]
    },
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
                },
                pop: {
                    "0%": {
                        transform: "scale(0)",
                        opacity: 0
                    },
                    "70%": {
                        transform: "scale(110%,110%)",
                        opacity: 1
                    },
                    "100%": {
                        transform: "scale(100%,100%)"
                    }
                }
            },
            animation: {
                appear: "appear 0.3s ease-in",
                disappear: "disappear 0.3s ease-in",
                pop: "pop 0.2s ease-in"
            },
            backgroundImage: {
                feature: "url('/assets/images/features/featureImg1.png')",
                header: "url('/assets/images/banner/mountains.jpg')"
            }
        }
    },
    plugins: [require("daisyui")]
};
