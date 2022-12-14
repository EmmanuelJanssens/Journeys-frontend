<template>
    <section>
        <swiper
            :center-insufficient-slides="true"
            :pagination="{ clickable: true }"
            :space-between="40"
            :lazy="{
                enabled: true
            }"
            :modules="modules"
            class="h-full"
            :breakpoints="{
                576: {
                    slidesPerView: 1
                },
                600: { slidesPerView: 2 },
                1200: { slidesPerView: 3 },
                1536: { slidesPerView: 4 }
            }">
            <swiper-slide v-for="item in userStore.myJourneys" :key="item.id">
                <JourneyCard
                    :journey="item"
                    class="max-w-[400px] h-full"
                    @header-clicked="emit('header-clicked', item.id!), item.id!" />
            </swiper-slide>
        </swiper>
    </section>
</template>
<script lang="ts" setup>
import { useUserStore, UserDidNotLogIn } from "stores/useUserStore";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import JourneyCard from "components/jCards/JourneyCard.vue";

import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Navigation, Lazy } from "swiper";

import { onMounted, ref } from "vue";
import { mapInstance } from "map/JourneysMap";
import { drawMyJourneys } from "map/drawOnMap";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";
import { POSITION, useToast } from "vue-toastification";
import { authApp } from "google/firebase";
import { onAuthStateChanged } from "@firebase/auth";

const modules = ref([Pagination, Navigation, Lazy]);

const userStore = useUserStore();

const emit = defineEmits<{
    (e: "header-clicked", journeyId: string): void;
}>();

const toast = useToast();

onMounted(async () => {
    try {
        mapInstance.clearMap();
        await mapInstance.getMap();
        await userStore.didLogin();
        await userStore.fetchMyJourneys();
        drawMyJourneys();
    } catch (e) {
        mapInstance.clearMap();
        if (e instanceof UserDidNotLogIn) {
            //
            // toast.info("Consider creating a new account to enjoy the app to the fullest", {
            //     position: POSITION.BOTTOM_RIGHT
            // });
        } else {
            journeyModalController.open("alert", {
                props: {
                    title: "Error",
                    message: "An Error Occured ",
                    buttons: [
                        {
                            text: "OK",
                            handler: async () => {
                                journeyModalController.close("alert");
                            }
                        }
                    ]
                }
            });
        }
        //
    }
});
</script>
<style lang="less" scoped>
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease-out;
}
</style>
