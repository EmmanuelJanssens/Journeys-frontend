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
import { mapInstance } from "map/JourneysMap";
import { drawMyJourneys } from "map/drawOnMap";

const modules = ref([Pagination, Navigation, Lazy]);

const userStore = useUserStore();

const emit = defineEmits<{
    (e: "header-clicked", journeyId: string): void;
}>();

onMounted(async () => {
    try {
        await mapInstance.getMap();
        await userStore.didLogin();
        await userStore.fetchMyJourneys();
        drawMyJourneys();
    } catch (e) {
        console.log("error ");
        console.log(e);
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
