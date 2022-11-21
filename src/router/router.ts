import { createRouter, createWebHistory } from "@ionic/vue-router";
import type { RouteRecordRaw } from "vue-router";
// import HomePage from "views/HomePage.vue";
// import LogBookPage from "views/LogBookPage.vue";
const HomePage = () => import("views/HomePage.vue");
const LogBookPage = () => import("views/LogBookPage.vue");
const ProfilePage = () => import("views/ProfilePage.vue");
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
    },
    {
        path: "/profile",
        name: "profile",
        component: ProfilePage
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

export default router;
