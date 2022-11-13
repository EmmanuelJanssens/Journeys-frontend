<template>
    <section v-if="userStore.myJourneys" class="journeys-slides">
        <swiper
            :slides-per-view="slidesPerView"
            :initial-slide="userStore.myJourneys?.length"
            :pagination="{ clickable: true }"
            :space-between="10"
            lazy
            :modules="modules"
            class="journeys"
            :center-insufficient-slides="true"
            ref="slides">
            <swiper-slide v-for="item in userStore.myJourneys" v-bind:key="item.id">
                <JourneyCard
                    :journey="item"
                    class="journey-card ion-margin"
                    @header-clicked="emit('headerClicked', item.id!), item.id!" />
            </swiper-slide>
        </swiper>
    </section>
</template>
<script lang="ts" setup>
import { useUserStore } from "stores/useUserStore";

import JourneyCard from "components/Cards/JourneyCard.vue";

import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Navigation, Lazy } from "swiper";

import { onMounted, onUnmounted, ref } from "vue";

const modules = ref([Pagination, Navigation, Lazy]);
const slidesPerView = ref(3);

const userStore = useUserStore();
const slides = ref();

const emit = defineEmits<{
    (e: "headerClicked", journeyId: string): void;
}>();

onMounted(() => {
    window.addEventListener("resize", updateView);
});
onUnmounted(() => {
    window.removeEventListener("resize", updateView);
});
function updateView() {
    if (slides.value != null) {
        const width = slides.value.$el.clientWidth;
        if (width < 800) {
            slidesPerView.value = 1;
        } else if (width < 1100) {
            slidesPerView.value = 2;
        } else if (width < 1500) {
            slidesPerView.value = 3;
        } else {
            if (userStore.myJourneys?.length! < 4) {
                slidesPerView.value = userStore.myJourneys?.length!;
            } else {
                slidesPerView.value = Math.floor(width / 300);
            }
        }
        console.log(slidesPerView.value);
    }
}
</script>
<style lang="less" scoped>
.journeys-slides {
    position: absolute;
    bottom: 20px;
    height: 35%;
    max-height: 450px;
    min-height: 400px;
    width: 100%;
    z-index: 999;
}

.journey-card {
    min-width: 300px;
    max-width: 350px;

    min-height: 400px;
    max-height: 450px;

    height: 90%;
    width: 100%;
}

swiper-slide {
    text-align: left;
    font-size: 18px;
    /* Center slide text vertically */
    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    -webkit-align-items: center;
    align-items: center;
}

.journeys {
    min-height: 300px;
    height: 100%;
    width: 100%;
}
</style>
