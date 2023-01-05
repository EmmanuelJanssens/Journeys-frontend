<template>
    <Teleport to="#poipopup">
        <div class="card absolute bg-base-100 w-80 z-50 shadow" ref="card">
            <div class="top-0 p-3 bg-primary-main dark:primar w-full rounded-t-xl">
                <div class="flex space-x-4 justify-between">
                    <p class="text-center text-white">
                        {{ poi?.name }}
                    </p>
                </div>
            </div>
            <div class="card-body">
                <div class="px-4">
                    <div class="text-opacity-80 text-gray-600">{{ title }}</div>
                </div>
                <div class="flex flex-row space-x-2">
                    <div class="badge badge-primary rounded-lg" v-for="tag in poi?.tags" v-bind:key="tag">
                        {{ tag }}
                    </div>
                </div>
                <swiper
                    v-if="experiences?.length! > 0"
                    :slides-per-view="1"
                    :space-between="10"
                    :initial-slide="0"
                    class="w-full"
                    :lazy="{
                        enabled: true
                    }"
                    :pagination="{
                        clickable: true
                    }"
                    :loop="true"
                    @slide-change="setTitle">
                    <swiper-slide v-for="experience in experiences" :key="experience.poi.id">
                        <div class="flex flex-col space-y-4">
                            <img
                                v-lazy="{
                                    src: experience.images?.at(0),
                                    loading: '/assets/placeholder.png',
                                    error: '/assets/placeholder.png'
                                }"
                                alt="thumbnail"
                                class="object-cover w-full h-40 rounded-xl shadow-md" />
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
                        <img
                            class="object-cover w-full h-40 rounded-xl shadow-md"
                            src="/assets/placeholder.png"
                            alt="thumbnail" />
                        <div class="bottom-0 p-4 w-full rounded-xl opacity-70 max-h-36">
                            <p class="text-center text-primary-darker">Be the first here</p>
                        </div>
                    </div>
                </div>

                <div class="card-actions justify-end">
                    <button class="btn btn-secondary" @click="add"><FontAwesomeIcon :icon="faAdd" /> Add</button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { usePoiStore } from "stores/usePoiStore";
import { Swiper, SwiperSlide } from "swiper/vue";
import { onMounted, ref, Teleport } from "vue";
import { onClickOutside, rand } from "@vueuse/core";
import { useJourneyStore } from "stores/useJourneyStore";
import { drawExperiences } from "map/drawOnMap";
import { PointOfInterest } from "types/poi/point-of-interest";
import { CreateExperience, Experience } from "types/experience/experience";
import swiper from "swiper";

const props = defineProps<{
    poi?: PointOfInterest;
    pos: {
        x: number;
        y: number;
    };
}>();
const card = ref();
const poiStore = usePoiStore();
const journeyStore = useJourneyStore();
const title = ref("");
const emit = defineEmits<{
    (e: "close"): void;
    (e: "add"): void;
}>();

function setTitle(value: any) {
    // const titleAt = props.poi?.experiences?.at(value.activeIndex - 1)?.title;
    // if (titleAt && titleAt?.length! > 0) {
    //     title.value = titleAt!;
    // } else {
    //     title.value = "No title";
    // }
}
function add() {
    const experience: CreateExperience = {
        id: crypto.randomUUID(),
        poi: props.poi!,
        title: "Untitled",
        description: "No description",
        date: new Date().toDateString(),
        addedImages: []
    };

    journeyStore.journeyToEdit.experiences.connect(experience);
    journeyStore.state.journeyIsEditing = true;
    drawExperiences();
    emit("close");
}
onClickOutside(card, () => {
    emit("close");
});

const experiences = ref<Experience[]>([]);
onMounted(async () => {
    if (props.pos) {
        const el = card.value as HTMLDivElement;
        el.classList.add("animate-pop");
        el.style.left = props.pos!.x - el.getBoundingClientRect().x + "px";
        el.style.top = props.pos!.y - el.getBoundingClientRect().y + "px";
    }

    //poi.value = await poiStore.getPoiExperiences(props.poi!);
    //experiences.value = await poiStore.getPoiExperiences(props.poi!);
});

rand(0, 1000);
</script>
