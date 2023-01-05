<template>
    <section>
        <swiper
            v-if="journeyStore.journeyToView"
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
            <swiper-slide
                v-for="experience in journeyStore.journeyToView!.experiences"
                :key="(experience.poi as PointOfInterest).id">
                <ExperienceCard
                    :experience="(experience as any)"
                    :poi="(experience.poi as PointOfInterest)"
                    :mode="'view'"
                    :journey=" journeyStore.journeyToView!.id"
                    class="max-w-[400px] h-full"
                    @updated="emit('updated', journeyStore.journeyToView!.id)" />
            </swiper-slide>
        </swiper>
    </section>
</template>
<script lang="ts" setup>
import { useJourneyStore } from "stores/useJourneyStore";

import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Navigation, Lazy } from "swiper";

import { onMounted, ref } from "vue";
import ExperienceCard from "components/jCards/ExperienceCard.vue";
import { drawJourney } from "map/drawOnMap";
import router from "router/router";
import { PointOfInterest } from "types/poi/point-of-interest";
import { Journey } from "types/journey/journey";

const modules = ref([Pagination, Navigation, Lazy]);

const journeyStore = useJourneyStore();

const emit = defineEmits<{
    (e: "updated", journeyId: string): void;
}>();

onMounted(async () => {
    const id = router.currentRoute.value.params.id as string;
    const journey = await journeyStore.fetchJourney(id);
    journeyStore.journeyToView = journey!;
    drawJourney(journeyStore.journeyToView as Journey);
});
</script>
<style lang="less" scoped></style>
