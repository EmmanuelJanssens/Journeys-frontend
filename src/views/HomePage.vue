<template>
    <ion-page>
        <ion-header class="absolute ion-no-border z-50">
            <TheJourneysHeader />
        </ion-header>
        <div class="relative min-h-[200px] max-h-[250px] sm:min-h-[300px] sm:max-h-[400px]">
            <div class="h-full w-full">
                <div class="absolute z-30 h-full w-full">
                    <div class="h-full w-full p-6">
                        <div class="flex flex-col text-center m-0 text-white h-full justify-between">
                            <div class="flex flex-col justify-items-center">
                                <ion-text><h1 class="text-4xl md:text-8xl">JOURNEYS</h1></ion-text>
                                <ion-text
                                    ><p class="text-sm sm:text-lg">IT'S NOT ALWAYS ABOUT THE DESTINATION</p></ion-text
                                >
                            </div>
                            <div>
                                <ion-button
                                    class="transition transform hover:scale-110"
                                    color="tertiary"
                                    router-link="/logbook"
                                    >START YOUR ADVENTURE</ion-button
                                >
                            </div>
                        </div>
                    </div>
                </div>
                <swiper
                    class="h-full w-full absolute"
                    :modules="modules"
                    :autoplay="{
                        delay: 10000
                    }">
                    <span class="overlay"></span>
                    <swiper-slide>
                        <ion-img src="assets/images/banner/mountains.jpg" class="banner-img" />
                    </swiper-slide>
                    <swiper-slide>
                        <ion-img src="assets/images/banner/mountains2.jpg" class="banner-img" />
                    </swiper-slide>
                </swiper>
            </div>
        </div>
        <div class="overflow-auto h-full">
            <MainFeature
                class="container mx-auto"
                title="Journaling"
                description=" Complete your dashboard with various adventures, save your memories to keep them forever. Thanks to our
                user friendly dashboard you will be able to edit your cards on the go or after you have completed your
                trip."
                image="assets/images/features/featureImg3_2.png" />

            <MainFeature
                class="container mx-auto"
                title="Exploring"
                description="Plan places you want to visit be it local, cantonal or national, plan as you go and visualize
                        your trip. Choose from many of our Points Of Interest, shared by other members Save your journey
                        and come back to it anytime to edit your story Inspire Others by sharing your experiences within
                        the community"
                image="assets/images/features/featureImg3_6.png" />
            <MainFeature
                class="container mx-auto"
                title="Sharing"
                description="Have you been to a place that no one else has seen ?
            Share them on our site and show the world your experiences. Create an account to add your new points of
            interest Look for the place you want to add on our interactive map Upload your pictures, and write your
            experience"
                image="assets/images/features/featureImg3_5.png" />
        </div>
    </ion-page>
</template>

<script lang="ts" setup>
import { IonText, IonPage, IonImg, IonButton, IonHeader } from "@ionic/vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay } from "swiper";
import "swiper/less";
import TheJourneysHeader from "components/TheJourneysHeader.vue";

import { ref } from "vue";

import "animation/basics.less";
import MainFeature from "components/HomePage/MainFeature.vue";

const modules = ref([Autoplay]);
</script>

<style scoped lang="less">
.banner-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.overlay {
    pointer-events: none;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: black;
    opacity: 30%;
    z-index: 20;
}
</style>
