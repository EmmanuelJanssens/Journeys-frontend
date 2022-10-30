import { IonicVue } from "@ionic/vue";
import axios from "axios";
import { createPinia } from "pinia";
import { createApp } from "vue";
import Vue from "vue";
import VueAxios from "vue-axios";
import { RecycleScroller, DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller";

import App from "./App.vue";
import router from "./router/router";

/* Core CSS required for Ionic components to work properly */
import "@ionic/vue/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/vue/css/padding.css";
import "@ionic/vue/css/float-elements.css";
import "@ionic/vue/css/text-alignment.css";
import "@ionic/vue/css/text-transformation.css";
import "@ionic/vue/css/flex-utils.css";
import "@ionic/vue/css/display.css";

/* Theme variables */
import "./theme/variables.css";

//map
import "maplibre-gl/dist/maplibre-gl.css";

import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

const pinia = createPinia();
const app = createApp(App);
app.use(IonicVue);
app.use(router);
app.use(pinia);
app.use(VueAxios, axios);
app.component("RecycleScroller", RecycleScroller);
app.component("DynamicScroller", DynamicScroller);
app.component("DynamicScrollerItem", DynamicScrollerItem);
router.isReady().then(() => {
    app.mount("#app");
});
