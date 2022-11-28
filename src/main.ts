// import { IonicVue } from "@ionic/vue";
import { createPinia } from "pinia";
import { createApp, defineAsyncComponent } from "vue";
import { RecycleScroller, DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller";
import { MotionPlugin } from "@vueuse/motion";

import axios from "axios";
import VueAxios from "vue-axios";
import App from "./App.vue";
import router from "./router/router";

import Toast, { PluginOptions } from "vue-toastification";
import "vue-toastification/dist/index.css";
//map
import "maplibre-gl/dist/maplibre-gl.css";

import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

const pinia = createPinia();
const app = createApp(App);
// app.use(IonicVue);
app.use(router);
app.use(pinia);
app.use(VueAxios, axios);
app.component("RecycleScroller", RecycleScroller);
app.component("DynamicScroller", DynamicScroller);
app.component("DynamicScrollerItem", DynamicScrollerItem);
app.use(MotionPlugin);
app.use(Toast);
router.isReady().then(() => {
    app.mount("#app");
});
