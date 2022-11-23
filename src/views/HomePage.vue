<template>
    <ion-page>
        <ion-header class="ion-no-border">
            <TheJourneysHeader class="" />
        </ion-header>
        <div class="relative min-h-[250px] max-h-[400px]" id="banner">
            <div class="absolute z-50 h-full w-full">
                <div class="h-full w-full p-4">
                    <div class="flex flex-col text-center m-0 text-white">
                        <div class="flex flex-col justify-items-center">
                            <ion-text><h1 class="text-4xl md:text-8xl">JOURNEYS</h1></ion-text>
                            <ion-text><p class="text-sm sm:text-lg">IT'S NOT ALWAYS ABOUT THE DESTINATION</p></ion-text>
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

                    <!-- <div class="absolute bottom-0 invisible sm:visible w-full">
                        <div class="flex flex-row justify-center space-x-2">
                            <ion-button
                                class="transition transform hover:-translate-y-1"
                                color="tertiary"
                                @click="toggle(tabs.exploring)"
                                ref="exploringTab"
                                >EXPLORING</ion-button
                            >

                            <span class=""></span>
                            <ion-button
                                class="transition transform hover:-translate-y-1"
                                color="light"
                                @click="toggle(tabs.sharing)"
                                ref="sharingTab"
                                >SHARING</ion-button
                            >
                            <span class=""></span>
                            <ion-button
                                class="transition transform hover:-translate-y-1"
                                color="light"
                                @click="toggle(tabs.journaling)"
                                ref="journalingTab"
                                >JOURNALING</ion-button
                            >
                        </div>
                    </div> -->
                </div>
            </div>
            <swiper
                class="h-full w-full"
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
        <div class="overflow-auto">
            <div class="relative min-h-[400]">
                <p class="text-2xl p-4 sm:text-5xl text-center">Journaling</p>
                <div class="p-4 sm:flex sm:flex-col sm:items-center">
                    <p class="p-4 max-w-4xl">
                        Complete your dashboard with various adventures, save your memories to keep them forever. Thanks
                        to our user friendly dashboard you will be able to edit your cards on the go or after you have
                        completed your trip.
                    </p>
                    <div class="max-w-4xl transition transform hover:scale-150">
                        <ion-img class="object-contain" src="assets/images/features/featureImg3_2.png" />
                    </div>
                </div>
            </div>

            <div class="relative min-h-[540]">
                <p class="text-2xl p-4 sm:text-5xl text-center">Exploring</p>
                <div class="p-4 sm:flex sm:flex-col sm:items-center">
                    <p class="p-4 max-w-4xl">
                        Plan places you want to visit be it local, cantonal or national, plan as you go and visualize
                        your trip. Choose from many of our Points Of Interest, shared by other members Save your journey
                        and come back to it anytime to edit your story Inspire Others by sharing your experiences within
                        the community
                    </p>
                    <div class="max-w-4xl transition transform hover:scale-150">
                        <ion-img class="object-contain" src="assets/images/features/featureImg3_6.png" />
                    </div>
                </div>
            </div>

            <div class="relativemin-h-[540]">
                <div class="h-full">
                    <p class="text-2xl p-4 sm:text-5xl text-center">Sharing</p>
                    <div class="p-4 sm:flex sm:flex-col sm:items-center">
                        <p class="p-4 max-w-4xl">
                            Have you been to a place that no one else has seen ? Share them on our site and show the
                            world your experiences. Create an account to add your new points of interest Look for the
                            place you want to add on our interactive map Upload your pictures, and write your experience
                        </p>
                        <div class="max-w-4xl transition transform hover:scale-150">
                            <ion-img class="object-contain" src="assets/images/features/featureImg3_5.png" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </ion-page>
</template>

<script lang="ts" setup>
import { IonText, IonContent, IonPage, IonImg, IonButton, IonHeader, onIonViewDidEnter } from "@ionic/vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay } from "swiper";
import "swiper/less";
import TheJourneysHeader from "components/TheJourneysHeader.vue";
import { onMounted, ref, watch } from "vue";

const journalingElement = ref();
const sharingElement = ref();
const exploringElement = ref();

const enum tabs {
    exploring = "exploring",
    sharing = "sharing",
    journaling = "journaling"
}

const currentTab = ref<tabs>(tabs.exploring);
const exploringTab = ref();
const sharingTab = ref();
const journalingTab = ref();

const modules = ref([Autoplay]);

type JourneysFeature = {
    title: string;
    description: string;
    image: string;
};

function setActive(element: any) {
    (element.$el.classList as DOMTokenList).add("ion-color-tertiary");
    (element.$el.classList as DOMTokenList).remove("ion-color-light");
}
function setInactive(element: any) {
    (element.$el.classList as DOMTokenList).remove("ion-color-tertiary");
    (element.$el.classList as DOMTokenList).add("ion-color-light");
}
watch(
    () => currentTab.value,
    (newValue, oldValue) => {
        switch (newValue) {
            case tabs.exploring:
                setActive(exploringTab.value);

                if (oldValue == tabs.sharing) setInactive(sharingTab.value);
                if (oldValue == tabs.journaling) setInactive(journalingTab.value);
                break;
            case tabs.sharing:
                setActive(sharingTab.value);

                if (oldValue == tabs.exploring) setInactive(exploringTab.value);
                if (oldValue == tabs.journaling) setInactive(journalingTab.value);
                break;
            case tabs.journaling:
                setActive(journalingTab.value);

                if (oldValue == tabs.exploring) setInactive(exploringTab.value);
                if (oldValue == tabs.sharing) setInactive(sharingTab.value);
                break;
        }
    }
);

async function toggle(tab: tabs) {
    switch (tab) {
        case tabs.exploring:
            currentTab.value = tabs.exploring;
            break;
        case tabs.sharing:
            currentTab.value = tabs.sharing;
            break;
        case tabs.journaling:
            currentTab.value = tabs.journaling;
            break;
    }
}

onIonViewDidEnter(() => {});
onMounted(() => {});
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
    z-index: 9999;
}
</style>
