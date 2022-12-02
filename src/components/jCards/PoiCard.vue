<template>
    <Teleport to="#poipopup">
        <div ref="poiEl" />
        <JourneyCard class="absolute" :pos="pos">
            <template #header>
                {{ poi?.name }}
            </template>
            <template #subtitle> Title </template>
            <template #body>
                <div>
                    <swiper
                        v-if="poi?.experiences?.length! > 0"
                        :slides-per-view="1"
                        :initial-slide="0"
                        :lazy="{
                            enabled: true
                        }"
                        :pagination="{
                            clickable: true
                        }"
                        :loop="true">
                        <swiper-slide v-for="experience in poi?.experiences" :key="experience.date">
                            <div class="p-4">
                                <img
                                    v-lazy="{
                                        src: experience.images?.at(0),
                                        loading: '/assets/placeholder.png',
                                        error: '/assets/placeholder.png'
                                    }"
                                    class="object-cover w-full h-40 rounded-xl" />
                                <div class="bottom-0 p-4 w-full rounded-xl opacity-70 max-h-36 overflow-auto">
                                    <p class="text-center text-primary-darker">
                                        {{ experience.description }}
                                    </p>
                                </div>
                            </div>
                        </swiper-slide>
                    </swiper>
                    <div v-else class="overflow-auto">
                        <div class="p-4 overflow-auto">
                            <img class="object-cover w-full h-40 rounded-xl" src="/assets/placeholder.png" />
                            <div class="bottom-0 p-4 w-full rounded-xl opacity-70 max-h-36">
                                <p class="text-center text-primary-darker">Be the first here</p>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <template #footer>
                <JourneyButton fill="contrast" type="secondary" @click="add">
                    <FontAwesomeIcon :icon="faAdd" /> Add
                </JourneyButton>
            </template>
        </JourneyCard>
    </Teleport>
</template>

<script setup lang="ts">
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import JourneyButton from "components/UI/Button/JourneyButton.vue";
import JourneyCard from "components/UI/Card/JourneyCard.vue";
import { usePoiStore } from "stores/usePoiStore";
import { Swiper, SwiperSlide } from "swiper/vue";
import { onMounted, ref } from "vue";
import { onClickOutside, rand } from "@vueuse/core";
import { useJourneyStore } from "stores/useJourneyStore";
import { drawExperiences } from "map/drawOnMap";
import { Experience, PointOfInterest } from "types/JourneyDtos";

const props = defineProps<{
    poi?: PointOfInterest;
    pos: {
        x: number;
        y: number;
    };
}>();
const poi = ref<PointOfInterest>();
const poiEl = ref();
const poiStore = usePoiStore();
const journeyStore = useJourneyStore();

const emit = defineEmits<{
    (e: "close"): void;
    (e: "add"): void;
}>();

function add() {
    const experience: Experience = {
        description: "",
        images: [],
        date: new Date().toISOString(),
        title: ""
    };
    journeyStore.addToJourney(experience, props.poi!);
    drawExperiences();
}
onClickOutside(poiEl, () => {
    emit("close");
});

onMounted(async () => {
    poi.value = await poiStore.getPoiExperiences(props.poi!);
});

rand(0, 1000);
</script>
