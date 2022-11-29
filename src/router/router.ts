import TheJourneyEditSidebarVue from "components/TheJourneyEditSidebar.vue";
import { defineAsyncComponent } from "vue";
import { RouteRecordRaw, createRouter, createWebHistory } from "vue-router";
// import HomePage from "views/HomePage.vue";
// import LogBookPage from "views/LogBookPage.vue";
const HomePage = async () => await import("views/HomePage.vue");
const LogBookPage = async () => await import("views/LogBookPage.vue");
const ProfilePage = async () => await import("views/ProfilePage.vue");
const TheJourneysSlider = async () => await import("components/Sliders/TheJourneysSlider.vue");
const TheJourneyExpSlider = async () => await import("components/Sliders/TheJourneyExpSlider.vue");
const TheJourneyEditExpSlider = async () => await import("components/Sliders/TheJourneyEditExpSlider.vue");

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        redirect: "/home"
    },
    {
        path: "/home",
        name: "home",
        component: HomePage
    },
    {
        path: "/logbook",
        name: "logbook",
        component: LogBookPage,
        children: [
            { path: "", name: "main", component: () => import("components/Sliders/TheJourneysSlider.vue") },
            {
                path: "journey/:id",
                name: "view",
                component: () => import("components/Sliders/TheJourneyExpSlider.vue")
            },
            {
                path: "/edit",
                name: "edit",
                component: () => import("components/Sliders/TheJourneyEditExpSlider.vue"),
                props: (route) => ({ query: route.query })
            }
        ]
    },
    {
        path: "/profile",
        name: "profile",
        component: ProfilePage
    },
    {
        path: "/template",
        name: "template",
        component: () => import("views/TemplatePage.vue")
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
