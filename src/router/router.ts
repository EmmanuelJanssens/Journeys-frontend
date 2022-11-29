import { defineAsyncComponent } from "vue";
import { RouteRecordRaw, createRouter, createWebHistory } from "vue-router";
// import HomePage from "views/HomePage.vue";
// import LogBookPage from "views/LogBookPage.vue";
const HomePage = () => import("views/HomePage.vue");
const LogBookPage = () => import("views/LogBookPage.vue");
const ProfilePage = () => import("views/ProfilePage.vue");

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        redirect: "/template"
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
    },
    {
        path: "/template",
        name: "template",
        component: defineAsyncComponent(() => import("views/TemplatePage.vue"))
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
