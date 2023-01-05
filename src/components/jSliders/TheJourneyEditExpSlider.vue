<template>
    <section class="pointer-events-none">
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
            <swiper-slide
                v-for="experience in displayExperiences"
                :key="experience.id"
                class="h-full pointer-events-auto">
                <ExperienceCard
                    :experience="experience"
                    :poi="experience.poi!"
                    :mode="'edit'"
                    :journey="journeyStore.journeyToEdit?.journey.id!"
                    class="max-w-[400px] h-full"
                    @updated="emit('updated', journeyStore.journeyToEdit?.journey.id!)" />
            </swiper-slide>
        </swiper>
    </section>
</template>
<script lang="ts" setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Navigation, Lazy, A11y } from "swiper";

import { computed, onMounted, ref } from "vue";
import ExperienceCard from "components/jCards/ExperienceCard.vue";
import { useJourneyStore } from "stores/useJourneyStore";
import { usePoiStore } from "stores/usePoiStore";
import { onBeforeRouteLeave } from "vue-router";
import { drawJourney, drawPoisBetween } from "map/drawOnMap";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { mapInstance } from "map/JourneysMap";
import { getLocalityAndCountry, reverseGeocode } from "google/googleGeocoder";
import router from "router/router";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";
import { LngLat } from "mapbox-gl";
import { BatchExperience } from "types/experience/batch-experience.dto";
import { getMidPoint, getRadius } from "utils/utils";
const modules = ref([Pagination, Navigation, Lazy, A11y]);

const journeyStore = useJourneyStore();
const poiStore = usePoiStore();

const emit = defineEmits<{
    (e: "updated", journeyId: string): void;
}>();

//return false to cancel
onBeforeRouteLeave(async () => {
    let leave = true;
    if (journeyStore.state.journeyIsEditing) {
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
        if (response != undefined) {
            leave = response.data;
            if (!leave) {
                journeyModalController.open("saveJourney");
                const didSave = await journeyModalController.didClose("saveJourney");
                if (!didSave) leave = false;
                else leave = true;
            }
        } else leave = false;
    }
    if (leave) {
        poiStore.clear();
        journeyStore.state.journeyIsEditing = false;
    }

    return leave;
});

function goToLast(swiper: any) {
    // if (journeyStore.journey.experiences) swiper.slideTo(journeyStore.journey.experiences.length!);
}

// const displayExperiences = ref<(Experience | CreateExperience)[]>([]);
const displayExperiences = computed(() => [
    ...journeyStore.journeyToEdit.experiences.updated,
    ...journeyStore.journeyToEdit.experiences.connected
]);

function getJourneyMidPoint() {
    const center = getMidPoint(
        new LngLat(
            journeyStore.journeyToEdit.journey.start.longitude,
            journeyStore.journeyToEdit.journey.start.latitude
        ),
        new LngLat(journeyStore.journeyToEdit.journey.end.longitude, journeyStore.journeyToEdit.journey.end.latitude)
    );

    const radius = getRadius(
        new LngLat(
            journeyStore.journeyToEdit.journey.start.longitude,
            journeyStore.journeyToEdit.journey.start.latitude
        ),
        new LngLat(journeyStore.journeyToEdit.journey.end.longitude, journeyStore.journeyToEdit.journey.end.latitude)
    );

    return {
        center,
        radius
    };
}
onMounted(async () => {
    const query = router.currentRoute.value.query;
    try {
        if (query.mode == "new") {
            journeyStore.journeyToEdit = {
                journey: {
                    id: crypto.randomUUID(),
                    title: query.title as string,
                    description: query.description as string,
                    visibility: "public",
                    start: JSON.parse(query.startLoc as string),
                    end: JSON.parse(query.endLoc as string)
                },

                experiences: new BatchExperience([])
            };
        } else if (query.mode == "existing") {
            const existing = journeyStore.journeyToView!.experiences.map((e) => {
                return {
                    id: e.id,
                    title: e.title,
                    description: e.description,
                    date: e.date,
                    poi: e.poi,
                    images: e.images,
                    addedImages: [],
                    removedImages: []
                };
            });

            journeyStore.journeyToEdit = {
                journey: {
                    id: journeyStore.journeyToView!.id,
                    title: journeyStore.journeyToView!.title,
                    description: journeyStore.journeyToView!.description,
                    visibility: journeyStore.journeyToView!.visibility,
                    start: journeyStore.journeyToView!.start,
                    end: journeyStore.journeyToView!.end
                },
                experiences: new BatchExperience(existing)
            };
            console.log(journeyStore.journeyToEdit);
        }
        const journeyMid = getJourneyMidPoint();
        await poiStore.getPoisBetween(journeyMid.center.lat, journeyMid.center.lng, journeyMid.radius);
        //wait for map
        await mapInstance.getMap();
        // //draw pois

        await drawPoisBetween();

        // await drawJourney(journeyStore.journeyToView!);
        //after everything is loaded ensure that we can drag markers only if the journey is newly created
        if (query.mode == "new") enableDrag();
    } catch (e: any) {
        console.log(e);
        //handle errors
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
            journeyStore.journeyToEdit.journey.start = {
                latitude: pos.lat,
                longitude: pos.lng
            };
        } else if (marker == "journey_end") {
            journeyStore.journeyToEdit.journey.end = {
                latitude: pos.lat,
                longitude: pos.lng
            };
        }
    }
    const journeyMid = getJourneyMidPoint();
    await poiStore.getPoisBetween(journeyMid.center.lat, journeyMid.center.lng, journeyMid.radius);

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
