<template>
    <section v-if="userStore.myJourneys">
        <swiper
            :center-insufficient-slides="true"
            :pagination="{ clickable: true }"
            :space-between="10"
            :lazy="{
                enabled: true
            }"
            :modules="modules"
            class="journeys"
            :breakpoints="{
                576: {
                    slidesPerView: 1
                },
                600: { slidesPerView: 2 },
                1200: { slidesPerView: 3 },
                1536: { slidesPerView: 4 }
            }">
            <swiper-slide v-for="item in userStore.myJourneys" v-bind:key="item.id">
                <JourneyCard
                    :journey="item"
                    class="journey-card"
                    @header-clicked="emit('header-clicked', item.id!), item.id!" />
            </swiper-slide>
        </swiper>
    </section>
</template>
<script lang="ts" setup>
import { useUserStore } from "stores/useUserStore";

import JourneyCard from "components/Cards/JourneyCard.vue";

import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Navigation, Lazy } from "swiper";

import { ref } from "vue";

const modules = ref([Pagination, Navigation, Lazy]);

const userStore = useUserStore();

const emit = defineEmits<{
    (e: "header-clicked", journeyId: string): void;
}>();
</script>
<style lang="less" scoped>
.journey-card {
    max-width: 350px;
    max-height: 450px;
    min-height: 450px;
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
