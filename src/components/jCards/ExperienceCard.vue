<template>
    <div class="flex flex-col space-y-4 bg-secondary-light dark:bg-secondary-dark rounded-xl drop-shadow-xl">
        <div class="top-0 p-3 bg-primary-main dark:primar w-full rounded-t-xl">
            <div class="flex space-x-4 justify-between">
                <p class="text-center text-white">
                    {{ (props.experience.node as PoiDto).name }}: {{ props.experience.title }}
                </p>
                <div class="flex space-x-4">
                    <button class="text-white transform hover:scale-110" @click="onEdit">
                        <font-awesome-icon :icon="faPencil" class="text-white" />
                    </button>

                    <button class="text-white transform hover:scale-110" @click="onDelete">
                        <font-awesome-icon :icon="faTrash" class="text-white" />
                    </button>
                </div>
            </div>
        </div>

        <div class="px-4">
            <div class="text-opacity-80 text-gray-600">
                <p>{{ new Date(props.experience.date).toDateString() }}</p>
            </div>
        </div>

        <div>
            <swiper
                v-if="props.experience.editing"
                :slides-per-view="1"
                :initial-slide="0"
                :lazy="{
                    enabled: true
                }"
                :pagination="{
                    clickable: true
                }"
                :loop="true"
                :modules="modules">
                <swiper-slide v-if="props.experience.imagesEditing?.length == 0">
                    <div class="p-4">
                        <img
                            class="object-cover h-52 w-full rounded-xl"
                            v-lazy="{
                                src: '/assets/placeholder.png',
                                loading: '/assets/placeholder.png',
                                error: '/assets/placeholder.png'
                            }" />
                    </div>
                </swiper-slide>
                <swiper-slide v-else v-for="image in props.experience.imagesEditing" v-bind:key="image">
                    <div class="p-4">
                        <img
                            class="object-cover h-52 w-full rounded-xl"
                            v-lazy="{
                                src: image.url,
                                loading: '/assets/placeholder.png',
                                error: '/assets/placeholder.png'
                            }" />
                    </div>
                </swiper-slide>
            </swiper>
            <swiper
                v-else
                :slides-per-view="1"
                :initial-slide="0"
                :lazy="{
                    enabled: true
                }"
                :pagination="{
                    clickable: true
                }"
                :loop="true"
                :modules="modules">
                <swiper-slide v-for="image in props.experience.images" v-bind:key="image">
                    <div class="p-4">
                        <img
                            class="object-cover h-52 w-full rounded-xl"
                            v-lazy="{
                                src: image,
                                loading: '/assets/placeholder.png',
                                error: '/assets/placeholder.png'
                            }" />
                    </div>
                </swiper-slide>
            </swiper>
        </div>
        <div class="bottom-0 p-4 w-full rounded-xl opacity-70 max-h-36 overflow-auto">
            <p class="text-center text-primary-darker">{{ props.experience.description }}</p>
        </div>
    </div>

    <!-- </ion-card> -->
</template>

<script lang="ts" setup>
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import { Swiper, SwiperSlide, useSwiper } from "swiper/vue";
import { Navigation, Lazy, Pagination, Autoplay } from "swiper";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import { onMounted, ref } from "vue";
import { ExperienceDto, PoiDto } from "types/dtos";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";
const t = useSwiper();

const props = defineProps<{
    experience: ExperienceDto;
    journey: string;
}>();

const emit = defineEmits<{
    (e: "updated"): void;
}>();

const modules = ref([Navigation, Lazy, Pagination, Autoplay]);

async function onEdit() {
    journeyModalController.open("editExperience", {
        props: {
            experience: props.experience
        }
    });

    const res = await journeyModalController.didClose("editExperience");

    if (res) {
        emit("updated");
    }
}

async function onDelete() {}
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
