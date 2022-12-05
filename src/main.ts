import router from "./router/router";

import { createPinia } from "pinia";
import { createApp } from "vue";
import { MotionPlugin } from "@vueuse/motion";
import VueLazyLoad from "vue3-lazyload";

import axios from "axios";
import VueAxios from "vue-axios";
import App from "./App.vue";

import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
//map

import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import "@vuepic/vue-datepicker/dist/main.css";

import { RecycleScroller, DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller";
import DatePicker from "@vuepic/vue-datepicker";

const pinia = createPinia();
const app = createApp(App);

app.component("DatePicker", DatePicker);
app.component("RecycleScroller", RecycleScroller);
app.component("DynamicScroller", DynamicScroller);
app.component("DynamicScrollerItem", DynamicScrollerItem);

app.use(pinia);
app.use(VueAxios, axios);
app.use(VueLazyLoad);
app.use(MotionPlugin);
app.use(Toast);
app.use(router);

router.isReady().then(() => {
    app.mount("#app");
});
