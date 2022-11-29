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
            <swiper-slide v-for="item in userStore.myJourneys" v-bind:key="item.id">
                <JourneyCard
                    :journey="item"
                    class="max-w-[400px] h-full"
                    @header-clicked="emit('header-clicked', item.id!), item.id!" />
            </swiper-slide>
        </swiper>
    </section>
</template>
<script lang="ts" setup>
import { useUserStore } from "stores/useUserStore";

import JourneyCard from "components/Cards/JourneyCard.vue";

import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Navigation, Lazy } from "swiper";

import { onMounted, ref } from "vue";
import { authApp } from "google/firebase";

const modules = ref([Pagination, Navigation, Lazy]);

const userStore = useUserStore();

const emit = defineEmits<{
    (e: "header-clicked", journeyId: string): void;
}>();

authApp.onAuthStateChanged(async (user) => {
    if (user) {
        await userStore.fetchMyJourneys();
    }
});
onMounted(async () => {
    if (userStore.isLoggedIn) await userStore.fetchMyJourneys();
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
