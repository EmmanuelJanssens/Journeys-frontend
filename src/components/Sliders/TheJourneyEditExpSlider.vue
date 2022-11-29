<template>
    <section>
        <swiper
            :center-insufficient-slides="true"
            :pagination="{ clickable: true }"
            :space-between="10"
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
            <swiper-slide
                v-for="item in journeyStore.editJourney.journey?.experiencesConnection?.edges"
                v-bind:key="item.node.id">
                <ExperienceCard
                    :experience="item"
                    :journey="journeyStore.editJourney.journey?.id!"
                    class="max-w-[400px] h-full"
                    @updated="emit('updated', journeyStore.editJourney.journey?.id!)" />
            </swiper-slide>
        </swiper>
    </section>
</template>
<script lang="ts" setup>
import { useUserStore } from "stores/useUserStore";

import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Navigation, Lazy } from "swiper";

import { onMounted, ref } from "vue";
import ExperienceCard from "components/Cards/ExperienceCard.vue";
import router from "router/router";
import { useJourneyStore } from "stores/useJourneyStore";
import { usePoiStore } from "stores/usePoiStore";
import { onBeforeRouteLeave } from "vue-router";

const modules = ref([Pagination, Navigation, Lazy]);

const userStore = useUserStore();
const journeyStore = useJourneyStore();
const poiStore = usePoiStore();

const emit = defineEmits<{
    (e: "updated", journeyId: string): void;
}>();

//return false to cancel
onBeforeRouteLeave(() => {
    poiStore.clear();
});
onMounted(async () => {
    const query = router.currentRoute.value.query;
    if (userStore.isLoggedIn) {
        if (query.id) {
            journeyStore.editJourney.journey = journeyStore.viewJourney;
            const mid = journeyStore.getJourneyMidPoint(journeyStore.editJourney.journey);
            await poiStore.searchBetween(mid.center.lat, mid.center.lng, mid.radius);
        } else {
            console.log(journeyStore.editJourney.journey);
            const mid = journeyStore.getJourneyMidPoint(journeyStore.editJourney.journey!);
            await poiStore.searchBetween(mid.center.lat, mid.center.lng, mid.radius);
        }
    } else {
        console.log(journeyStore.editJourney.journey);
        const mid = journeyStore.getJourneyMidPoint(journeyStore.editJourney.journey!);
        await poiStore.searchBetween(mid.center.lat, mid.center.lng, mid.radius);
    }
});
</script>
<style lang="less" scoped></style>
