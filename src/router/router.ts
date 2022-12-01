import { RouteRecordRaw, createRouter, createWebHistory } from "vue-router";

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        redirect: "/home"
    },
    {
        path: "/home",
        name: "home",
        component: () => import("views/HomePage.vue")
    },
    {
        path: "/logbook",
        name: "",
        component: () => import("views/LogBookPage.vue"),
        children: [
            { path: "", name: "logbook", component: () => import("components/JSliders/TheJourneysSlider.vue") },
            {
                path: "journey/:id",
                name: "view",
                component: () => import("components/JSliders/TheJourneyExpSlider.vue")
            },
            {
                path: "/edit",
                name: "edit",
                component: () => import("components/JSliders/TheJourneyEditExpSlider.vue"),
                props: (route) => ({ query: route.query })
            }
        ]
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
