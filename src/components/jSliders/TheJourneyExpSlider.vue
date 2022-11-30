<template>
    <section>
        <swiper
            v-if="journey"
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
            <swiper-slide v-for="item in journey.experiencesConnection?.edges" v-bind:key="item.order">
                <ExperienceCard
                    :experience="item"
                    :journey="journey.id!"
                    class="max-w-[400px] h-full"
                    @updated="emit('updated', journey.id!)" />
            </swiper-slide>
        </swiper>
    </section>
</template>
<script lang="ts" setup>
import { useJourneyStore } from "stores/useJourneyStore";

import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Navigation, Lazy } from "swiper";

import { onMounted, ref, toRaw } from "vue";
import ExperienceCard from "components/jCards/ExperienceCard.vue";
import { drawJourney } from "map/drawOnMap";
import router from "router/router";

const modules = ref([Pagination, Navigation, Lazy]);

const journeyStore = useJourneyStore();

const emit = defineEmits<{
    (e: "updated", journeyId: string): void;
}>();
const journey = ref();

onMounted(async () => {
    const id = router.currentRoute.value.params.id as string;
    journey.value = await journeyStore.getJourney(id);
    journeyStore.viewJourney = toRaw(journey.value);
    drawJourney(journey.value!);
});
</script>
<style lang="less" scoped></style>
