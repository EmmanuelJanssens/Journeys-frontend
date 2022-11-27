import { RouteRecordRaw, createRouter, createWebHistory } from "vue-router";
// import HomePage from "views/HomePage.vue";
// import LogBookPage from "views/LogBookPage.vue";
const HomePage = async () => await import("views/HomePage.vue");
const LogBookPage = async () => await import("views/LogBookPage.vue");
const ProfilePage = async () => await import("views/ProfilePage.vue");
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
    history: createWebHistory(),
    routes
});

export default router;
