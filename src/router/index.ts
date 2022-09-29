import { createRouter, createWebHistory } from "@ionic/vue-router";
import type { RouteRecordRaw } from "vue-router";
const HomePage = async () => await import("../views/HomePage.vue");
const MapExplorePage = async () => await import("../views/MapExplorePage.vue");

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        redirect: "/home"
    },
    {
        path: "/home",
        name: "Home",
        component: HomePage
    },
    {
        path: "/map",
        name: "map",
        component: MapExplorePage
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

export default router;
