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
            :breakpoints="{
                576: {
                    slidesPerView: 1
                },
                600: { slidesPerView: 2 },
                1200: { slidesPerView: 3 },
                1536: { slidesPerView: 4 }
            }"
            @slides-length-change="goToLast">
            <swiper-slide v-for="experience in journeyStore.journey.experiences" :key="experience.poi.id">
                <ExperienceCard
                    :experience="experience.data"
                    :poi="experience.poi"
                    :mode="'edit'"
                    :journey="journeyStore.journey.id!"
                    class="max-w-[400px] h-full"
                    @updated="emit('updated', journeyStore.journey.id!)" />
            </swiper-slide>
        </swiper>
    </section>
</template>
<script lang="ts" setup>
import { useUserStore } from "stores/useUserStore";

import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Navigation, Lazy, A11y } from "swiper";

import { onMounted, ref } from "vue";
import ExperienceCard from "components/jCards/ExperienceCard.vue";
import { useJourneyStore } from "stores/useJourneyStore";
import { usePoiStore } from "stores/usePoiStore";
import { onBeforeRouteLeave } from "vue-router";
import { drawPoisBetween } from "map/drawOnMap";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { mapInstance } from "map/JourneysMap";
import { getLocalityAndCountry, reverseGeocode } from "google/googleGeocoder";
import router from "router/router";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";
import { LngLat } from "mapbox-gl";
const modules = ref([Pagination, Navigation, Lazy, A11y]);

const userStore = useUserStore();
const journeyStore = useJourneyStore();
const poiStore = usePoiStore();

const emit = defineEmits<{
    (e: "updated", journeyId: string): void;
}>();

//return false to cancel
onBeforeRouteLeave(async () => {
    let leave = true;
    if (journeyStore.isDirty) {
        journeyModalController.open("alert", {
            props: {
                title: "Warning",
                message: "You have unsaved changes in your journey, do you want to save them?",
                buttons: [
                    {
                        text: "YES",
                        handler: async () => {
                            journeyModalController.close("alert", { data: false });
                        }
                    },
                    {
                        text: "NO",
                        handler: async () => {
                            journeyModalController.close("alert", {
                                data: true
                            });
                        }
                    }
                ]
            }
        });

        const response = await journeyModalController.didClose("alert");
        leave = response.data;
        if (!leave) {
            journeyModalController.open("saveJourney");
            const didSave = await journeyModalController.didClose("saveJourney");
            if (!didSave) leave = false;
            else leave = true;
        }
    }
    if (leave) {
        poiStore.clear();
        journeyStore.clear();
    }

    return leave;
});

function goToLast(swiper: any) {
    swiper.slideTo(journeyStore.journey.experiences!.length!);
}

onMounted(async () => {
    journeyStore.init();
    const query = router.currentRoute.value.query;
    try {
        if (userStore.isLoggedIn) {
            if (query.id) {
                const mid = journeyStore.getJourneyMidPoint(journeyStore.journey);
                await poiStore.searchBetween(mid.center.lat, mid.center.lng, mid.radius);
            } else {
                const mid = journeyStore.getJourneyMidPoint(journeyStore.journey);
                await poiStore.searchBetween(mid.center.lat, mid.center.lng, mid.radius);
            }
        } else {
            const mid = journeyStore.getJourneyMidPoint(journeyStore.journey);
            await poiStore.searchBetween(mid.center.lat, mid.center.lng, mid.radius);
        }

        await mapInstance.getMap();
        await drawPoisBetween();
        if (router.currentRoute.value.query.mode == "new") {
            enableDrag();
        }
    } catch (e) {
        //
    }
});

function enableDrag() {
    const start = mapInstance.getmarkerbyId("journey_start")!;
    start.setDraggable(true);
    start.on("dragend", () => {
        onMarkerDragend(start.getLngLat(), "journey_start");
    });
    const end = mapInstance.getmarkerbyId("journey_end")!;
    end.setDraggable(true);
    end.on("dragend", () => {
        onMarkerDragend(end.getLngLat(), "journey_end");
    });
}

async function onMarkerDragend(pos: LngLat, marker: string) {
    const response = await reverseGeocode(pos.lat, pos.lng);
    const result = getLocalityAndCountry(response!);
    if (result.country != undefined && result.locality != undefined) {
        if (marker == "journey_start") {
            journeyStore.journey.start = {
                latitude: pos.lat,
                longitude: pos.lng
            };
        } else if (marker == "journey_end") {
            journeyStore.journey.end = {
                latitude: pos.lat,
                longitude: pos.lng
            };
        }
    }
    const mid = journeyStore.getJourneyMidPoint(journeyStore.journey);
    await poiStore.searchBetween(mid.center.lat, mid.center.lng, mid.radius);
    await drawPoisBetween();
    await mapInstance.getMap();

    const start = mapInstance.getmarkerbyId("journey_start")!;
    start.setDraggable(true);
    start.on("dragend", () => {
        onMarkerDragend(start.getLngLat(), "journey_start");
    });
    const end = mapInstance.getmarkerbyId("journey_end")!;
    end.setDraggable(true);
    end.on("dragend", () => {
        onMarkerDragend(end.getLngLat(), "journey_end");
    });
}
</script>
<style lang="less" scoped></style>
