import { createRouter, createWebHistory } from "@ionic/vue-router";
import type { RouteRecordRaw } from "vue-router";

const HomePage = async () => import("views/HomePage.vue");
const LogBookPage = async () => import("views/LogBookPage.vue");
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
        path: "/logbook",
        name: "logbook",
        component: LogBookPage
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

export default router;
