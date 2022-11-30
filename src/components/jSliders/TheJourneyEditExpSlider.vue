<template>
    <section>
        <swiper
            :center-insufficient-slides="true"
            :pagination="{ clickable: true }"
            :space-between="10"
            :lazy="{
                enabled: true
            }"
            navigation
            :modules="modules"
            class="h-full"
            @slides-length-change="goToLast"
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
import { Pagination, Navigation, Lazy, A11y } from "swiper";

import { onMounted, ref, toRaw } from "vue";
import ExperienceCard from "components/jCards/ExperienceCard.vue";
import router from "router/router";
import { useJourneyStore } from "stores/useJourneyStore";
import { usePoiStore } from "stores/usePoiStore";
import { onBeforeRouteLeave } from "vue-router";
import { drawPoisBetween } from "map/drawOnMap";
import { ExperienceDto } from "types/dtos";
import { useSwiper } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
const modules = ref([Pagination, Navigation, Lazy, A11y]);

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

function goToLast(swiper: any) {
    console.log("HAHA");
    swiper.slideTo(journeyStore.editJourney.journey?.experiencesConnection?.edges?.length!);
}

onMounted(async () => {
    const query = router.currentRoute.value.query;
    try {
        if (userStore.isLoggedIn) {
            if (query.id) {
                journeyStore.editJourney.journey = journeyStore.viewJourney;
                const mid = journeyStore.getJourneyMidPoint(journeyStore.editJourney.journey!);
                await poiStore.searchBetween(mid.center.lat, mid.center.lng, mid.radius);
                journeyStore.editJourney.journey.experiencesConnection?.edges?.forEach((exp) => {
                    if (exp.editing) {
                        exp.images.forEach((img) => {
                            exp.imagesEditing?.push({
                                file: undefined,
                                url: img
                            });
                        });
                    }
                });
            } else {
                const mid = journeyStore.getJourneyMidPoint(journeyStore.editJourney.journey!);
                await poiStore.searchBetween(mid.center.lat, mid.center.lng, mid.radius);
            }
        } else {
            const mid = journeyStore.getJourneyMidPoint(journeyStore.editJourney.journey!);
            await poiStore.searchBetween(mid.center.lat, mid.center.lng, mid.radius);
        }
        drawPoisBetween();
    } catch (e) {
        console.log(e);
        //
    }
});
</script>
<style lang="less" scoped></style>
