import { createRouter, createWebHistory } from "@ionic/vue-router";
import type { RouteRecordRaw } from "vue-router";
//import HomePage from "../views/HomePage.vue";
import MapExplorePage from "../views/MapExplorePage.vue";
import LogBook from "../views/LogBook.vue";

const HomePage = async () => import("../views/HomePage.vue");
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
    },
    {
        path: "/logbook",
        name: "logbook",
        component: LogBook
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

export default router;
