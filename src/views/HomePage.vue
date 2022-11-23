<template>
    <ion-page>
        <ion-header class="ion-no-border">
            <TheJourneysHeader class="" />
        </ion-header>
        <div class="relative h-1/5 md:h-1/4" id="banner">
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

                    <div class="absolute bottom-0 invisible sm:visible w-full">
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
                    </div>
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
        <ion-content>
            <!-- <div class="h-full">
                <WebFeature
                    v-for="featureTab in featureTabs"
                    v-bind:key="featureTab.tabTitle"
                    v-motion
                    :initial="{
                        opacity: 0
                    }"
                    :enter="{
                        opacity: 1
                    }"
                    :features="featureTab.features"
                    class="h-full"
                    :mobile="false"
                    ref="featureComponents" />
            </div> -->
            <div class="relative h-full bg-blue-600">
                <p>Exploring</p>
                <div class="absolute w-4 h-2/3 left-4 top-8 bg-green-600"></div>
                <ion-img class="h-2/3" src="assets/images/features/featureImg1.png"></ion-img>
            </div>
            <div class="h-full bg-red-600">
                <p>some random shit</p>
                <ion-img class="h-2/3" src="assets/images/features/featureImg1.png"></ion-img>
            </div>
            <div class="h-full bg-green-600"></div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts" setup>
import { IonText, IonContent, IonPage, IonImg, IonButton, IonHeader } from "@ionic/vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay } from "swiper";
import { useElementVisibility } from "@vueuse/core";
import "swiper/less";
import TheJourneysHeader from "components/TheJourneysHeader.vue";
import { onMounted, ref, watch } from "vue";

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

const exploringFeatures: JourneysFeature[] = [
    {
        title: "Start your research",
        description: `Even if a journey is not always about a destination there will always at some point be a moment where you'll have to finish. Begin by entering your start location and desired destination`,
        image: `assets/images/features/featureImg1.png`
    },
    {
        title: "Find your desired activities",
        description: `Choose one from many activities that are shown to you, read about what user  say for that activity or be the first to leave an impression`,
        image: `assets/images/features/featureImg1.png`
    }
];

const sharingFeatures: JourneysFeature[] = [
    {
        title: "1",
        description: `Have you been to a place that no one else has seen ? Share them on our site and show the world
                        your experiences. Create an account to add your new points of interest Look for the place you
                        want to add on our interactive map Upload your pictures, and write your experience`,
        image: "assets/images/features/featureImg2.png"
    }
];

const journalingFeatures: JourneysFeature[] = [
    {
        title: "1",
        description: `Complete your dashboard with various adventures, save your memories to keep them forever. Thanks
                        to our user friendly dashboard you will be able to edit your cards on the go or after you have
                        completed your trip.`,
        image: "assets/images/features/featureImg3.png"
    }
];

const featureTabs = [
    {
        tabTitle: "exploring",
        features: exploringFeatures
    },
    {
        tabTitle: "sharing",
        features: sharingFeatures
    },
    {
        tabTitle: "journaling",
        features: journalingFeatures
    }
];

const featureComponents = ref();

let exploringVisible = ref<Boolean>(false);

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

onMounted(() => {
    exploringVisible.value = useElementVisibility(featureComponents.value[0]).value;
    console.log(exploringVisible.value);
});
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
