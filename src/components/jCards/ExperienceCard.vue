<template>
    <div class="card bg-base-100 shadow-xl">
        <div class="top-0 p-3 bg-primary-main dark:bg-primary-dark w-full rounded-t-xl">
            <div class="flex space-x-4 justify-between">
                <p class="text-center text-white truncate">
                    {{ props.experience.title }}
                </p>
                <div class="flex space-x-4" v-if="props.mode != 'preview'">
                    <button class="text-white transform hover:scale-110" @click="onEdit">
                        <font-awesome-icon :icon="faPencil" class="text-white" />
                    </button>

                    <button class="text-white transform hover:scale-110" @click="onDelete">
                        <font-awesome-icon :icon="faTrash" class="text-white" />
                    </button>
                </div>
            </div>
        </div>
        <div class="card-body">
            <div class="px-4">
                <div class="text-opacity-80 text-gray-600">
                    <p>{{ new Date(props.experience.date!).toDateString() }}</p>
                </div>
            </div>

            <div>
                <swiper
                    :slides-per-view="1"
                    :space-between="10"
                    :initial-slide="0"
                    :lazy="{
                        enabled: true
                    }"
                    :pagination="{
                        clickable: true
                    }"
                    :loop="true"
                    :modules="modules">
                    <swiper-slide v-if="displayImages.length == 0">
                        <div class="p-4">
                            <img
                                v-lazy="{
                                    src: '/assets/placeholder.png',
                                    loading: '/assets/placeholder.png',
                                    error: '/assets/placeholder.png'
                                }"
                                alt="thumbnail"
                                class="object-cover h-52 w-full rounded-xl shadow-md" />
                        </div>
                    </swiper-slide>
                    <swiper-slide v-for="image in displayImages" :key="image.id">
                        <div class="p-4">
                            <img
                                v-lazy="{
                                    src: (image as JourneyImage).thumbnail,
                                    loading: '/assets/placeholder.png',
                                    error: '/assets/placeholder.png'
                                }"
                                alt="thumbnail"
                                class="object-cover h-52 w-full rounded-xl shadow-md" />
                        </div>
                    </swiper-slide>
                </swiper>
            </div>
            <div class="bottom-0 p-4 w-full rounded-xl opacity-70 max-h-36 overflow-auto">
                <p class="text-center text-primary-darker">
                    {{ props.experience.description }}
                </p>
            </div>
        </div>
    </div>

    <!-- </ion-card> -->
</template>

<script lang="ts" setup>
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Lazy, Pagination, Autoplay } from "swiper";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import { ref } from "vue";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";
import { useJourneyStore } from "stores/useJourneyStore";
import { POSITION, useToast } from "vue-toastification";
import { drawJourney, drawPoisBetween } from "map/drawOnMap";
import router from "router/router";
import { computed, onMounted } from "vue";
import { CreateExperience, Experience, UpdateExperience } from "types/experience/experience";
import { JourneyImage } from "types/image/image";
const props = defineProps<{
    experience: Experience | CreateExperience | UpdateExperience;
    mode: "edit" | "view" | "preview";
}>();

const modules = ref([Navigation, Lazy, Pagination, Autoplay]);

const journeyStore = useJourneyStore();
const toast = useToast();
async function onEdit() {
    journeyModalController.open("editExperience", {
        props: {
            experience: props.experience,
            mode: props.mode
        }
    });

    await journeyModalController.didClose("editExperience");
}

const route = computed(() => ({
    name: router.currentRoute.value.name,
    mode: router.currentRoute.value.query.mode
}));

const displayImages = computed(() => [
    ...((props.experience as Experience).images ? (props.experience as Experience).images : []),
    ...((props.experience as CreateExperience).addedImages
        ? (props.experience as CreateExperience).addedImages.map((added) => {
              return {
                  id: added,
                  thumbnail: added,
                  url: added
              } as JourneyImage;
          })
        : [])
]);
onMounted(() => {});
async function onDelete() {
    if (route.value.name == "edit") {
        journeyStore.journeyToEdit.experiences.removeConnected(props.experience.id!);
        drawPoisBetween();
        return;
    }
    journeyModalController.open("alert", {
        props: {
            title: "Warning",
            message: "This action is irreversible",
            buttons: [
                {
                    text: "OK",
                    handler: async () => {
                        const newJ = await journeyStore.deleteExperience(props.experience.id!);
                        if (!newJ) {
                            toast.error("Could not delete your experience", {
                                position: POSITION.BOTTOM_RIGHT
                            });
                        } else {
                            journeyModalController.close("alert");
                            toast.success("Experience deleted!", {
                                position: POSITION.BOTTOM_RIGHT
                            });
                            drawJourney(journeyStore.journeyToView!);
                        }
                    }
                },
                {
                    text: "CANCEL",
                    handler: async () => {
                        journeyModalController.close("alert");
                    }
                }
            ]
        }
    });
}
</script>

<style scoped>
ion-img {
    width: 90%;
    height: 300px;
}
.content {
    height: 100%;
    max-height: 200px;
    overflow-y: auto;
}
</style>
