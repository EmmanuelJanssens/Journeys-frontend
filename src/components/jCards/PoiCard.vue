<template>
    <Teleport to="#poipopup">
        <JourneyCard class="absolute z-50" :pos="pos">
            <template v-slot:header> {{ poi?.name }} </template>
            <template v-slot:subtitle> Title</template>
            <template v-slot:body>
                <div ref="poiEl">
                    <swiper
                        v-if="poi?.journeysConnection?.edges?.length! > 0"
                        :slides-per-view="1"
                        :initial-slide="0"
                        :lazy="{
                            enabled: true
                        }"
                        :pagination="{
                            clickable: true
                        }"
                        :loop="true">
                        <swiper-slide v-for="p in poi?.journeysConnection?.edges" v-bind:key="p?.order">
                            <div class="p-4">
                                <img
                                    class="object-cover w-full h-40 rounded-xl"
                                    v-lazy="{
                                        src: p.images[0],
                                        loading: '/assets/placeholder.png',
                                        error: '/assets/placeholder.png'
                                    }" />
                                <div class="bottom-0 p-4 w-full rounded-xl opacity-70 max-h-36 overflow-auto">
                                    <p class="text-center text-primary-darker">
                                        {{ p.description }}
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
            <template v-slot:footer>
                <JourneyButton fill="contrast" type="secondary"><FontAwesomeIcon :icon="faAdd" /> Add </JourneyButton>
            </template>
        </JourneyCard>
    </Teleport>
</template>

<script setup lang="ts">
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed } from "@vue/reactivity";
import JourneyButton from "components/UI/Button/JourneyButton.vue";
import JourneyCard from "components/UI/Card/JourneyCard.vue";
import { usePoiStore } from "stores/usePoiStore";
import { Swiper, SwiperSlide } from "swiper/vue";
import { PoiDto } from "types/dtos";
import { onMounted, ref } from "vue";
import { onClickOutside, rand } from "@vueuse/core";

const props = defineProps<{
    poi?: PoiDto;
    pos: {
        x: number;
        y: number;
    };
}>();
const poi = ref<PoiDto>();
const poiEl = ref();
const poiStore = usePoiStore();
const emit = defineEmits<{
    (e: "close"): void;
    (e: "add"): void;
}>();
const active = ref();

onClickOutside(poiEl, () => {
    emit("close");
});

onMounted(async () => {
    poi.value = await poiStore.getPoiExperiences(props.poi!);
});

rand(0, 1000);
</script>
