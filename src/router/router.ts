import { useUserStore } from "stores/useUserStore";
import { RouteRecordRaw, createRouter, createWebHistory } from "vue-router";

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        redirect: "/home"
    },
    {
        path: "/home",
        name: "home",
        component: async () => import("views/HomePage.vue")
    },
    {
        path: "/logbook",
        name: "",
        component: async () => import("views/LogBookPage.vue"),
        children: [
            { path: "", name: "logbook", component: async () => import("components/jSliders/TheJourneysSlider.vue") },
            {
                path: "journey/:id",
                name: "view",
                component: () => import("components/jSliders/TheJourneyExpSlider.vue")
            },
            {
                path: "/edit",
                name: "edit",
                component: async () => import("components/jSliders/TheJourneyEditExpSlider.vue"),
                props: (route) => ({ query: route.query })
            }
        ]
    },
    {
        path: "/template",
        name: "template",
        component: async () => import("views/TemplatePage.vue")
    },
    {
        path: "/dashboard",
        name: "dashboard",

        component: async () => import("views/DashboardPage.vue")
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
