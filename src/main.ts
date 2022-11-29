// import { IonicVue } from "@ionic/vue";
import { createPinia } from "pinia";
import { createApp } from "vue";
import { RecycleScroller, DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller";
import { MotionPlugin } from "@vueuse/motion";
import VueLazyLoad from "vue3-lazyload";

import axios from "axios";
import VueAxios from "vue-axios";
import App from "./App.vue";
import router from "./router/router";

import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
//map

import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

import DatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

const pinia = createPinia();
const app = createApp(App);
// app.use(IonicVue);
app.use(router);
app.use(pinia);
app.use(VueAxios, axios);
app.use(VueLazyLoad);
app.component("DatePicker", DatePicker);
app.component("RecycleScroller", RecycleScroller);
app.component("DynamicScroller", DynamicScroller);
app.component("DynamicScrollerItem", DynamicScrollerItem);
app.use(MotionPlugin);
app.use(Toast);
router.isReady().then(() => {
    app.mount("#app");
});
