import { defineConfig, preview } from "vite";
import vue from "@vitejs/plugin-vue";
import path, { dirname } from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            utils: path.resolve(__dirname, "./src/utils"),
            stores: path.resolve(__dirname, "./src/stores"),
            views: path.resolve(__dirname, "./src/views"),
            types: path.resolve(__dirname, "./src/types"),
            components: path.resolve(__dirname, "./src/components"),
            composables: path.resolve(__dirname, "./src/composables"),
            router: path.resolve(__dirname, "./src/router"),
            assets: path.resolve(__dirname, "./src/assets"),
            google: path.resolve(__dirname, "./src/google"),
            map: path.resolve(__dirname, "./src/map"),
            animation: path.resolve(__dirname, "./src/animation"),
            fontawsome: path.resolve(__dirname, "./src/fontawsome"),
            "@": path.resolve(__dirname, "./src")
        }
    },
    server: {
        port: 3000,
        proxy: {
            "/api": {
                changeOrigin: true,
                target: "http://localhost:4000/api",
                rewrite: (path) => path.replace(/^\/api/, "")
            }
        }
    },
    preview: {
        port: 3000,
        proxy: {
            "/api": {
                changeOrigin: true,
                target: `${process.env.VITE_JOURNEYS_API_HOST}:4000/api`,
                rewrite: (path) => path.replace(/^\/api/, "")
            }
        }
    }
});
