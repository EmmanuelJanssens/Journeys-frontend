<template>
    <ion-page>
        <ion-header class="ion-no-border">
            <TheJourneysHeader class="toolbar" />
            <div class="banner-content center">
                <div id="info">
                    <p></p>
                    <span>
                        <h1 class="title">JOURNEYS</h1>
                        <p>IT'S NOT ALWAYS ABOUT WHERE YOU GO</p>
                    </span>
                    <ion-button color="tertiary" router-link="/logbook">START YOUR ADVENTURE</ion-button>
                </div>

                <div class="tabs center">
                    <div id="tab-buttons">
                        <ion-button color="tertiary" @click="toggle(tabs.exploring)" ref="exploring"
                            >EXPLORING</ion-button
                        >
                        <span class="rectangle"></span>
                        <ion-button color="light" @click="toggle(tabs.sharing)" ref="sharing">SHARING</ion-button>
                        <span class="rectangle"></span>
                        <ion-button color="light" @click="toggle(tabs.journaling)" ref="journaling"
                            >JOURNALING</ion-button
                        >
                    </div>
                </div>
            </div>
            <swiper class="image-carrousel">
                <span class="overlay"></span>
                <swiper-slide>
                    <img src="/src/assets/mountains.jpg" class="banner-img" />
                </swiper-slide>
                <swiper-slide>
                    <img src="/src/assets/mountains2.jpg" class="banner-img" />
                </swiper-slide>
            </swiper>
        </ion-header>
        <ion-content class="main-body">
            <div class="center w1000">
                <div v-if="currentTab == tabs.exploring" class="body">
                    <p class="w400">
                        Plan places you want to visit be it local, cantonal or national, plan as you go and visualize
                        your trip. Choose from many of our Points Of Interest, shared by other members Save your journey
                        and come back to it anytime to edit your story Inspire Others by sharing your experiences within
                        the community
                    </p>
                    <span class="w400">
                        <ion-img src="/src/assets/map_carte.png"></ion-img>
                    </span>
                </div>
                <div v-else-if="currentTab == tabs.sharing" class="body">
                    <p class="w400">
                        Have you been to a place that no one else has seen ? Share them on our site and show the world
                        your experiences. Create an account to add your new points of interest Look for the place you
                        want to add on our interactive map Upload your pictures, and write your experience
                    </p>
                    <span class="w400">
                        <ion-img src="/src/assets/train.jpg"></ion-img>
                    </span>
                </div>
                <div v-if="currentTab == tabs.journaling" class="body">
                    <p class="w400">
                        Complete your dashboard with various adventures, save your memories to keep them forever. Thanks
                        to our user friendly dashboard you will be able to edit your cards on the go or after you have
                        completed your trip.
                    </p>
                    <span class="w400">
                        <ion-img src="/src/assets/featureImg3.png"></ion-img>
                    </span>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts" setup>
import { IonContent, IonImg, IonPage, IonFooter, IonButton, IonHeader } from "@ionic/vue";
import { Swiper, SwiperSlide } from "swiper/vue";

import "swiper/less";
import "swiper/less/navigation";
import "swiper/less/pagination";
import TheJourneysHeader from "components/TheJourneysHeader.vue";
import { ref, watch } from "vue";

const enum tabs {
    exploring = "exploring",
    sharing = "sharing",
    journaling = "journaling"
}

const currentTab = ref<tabs>(tabs.exploring);
const exploring = ref();
const sharing = ref();
const journaling = ref();

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
                setActive(exploring.value);

                if (oldValue == tabs.sharing) setInactive(sharing.value);
                if (oldValue == tabs.journaling) setInactive(journaling.value);
                break;
            case tabs.sharing:
                setActive(sharing.value);

                if (oldValue == tabs.exploring) setInactive(exploring.value);
                if (oldValue == tabs.journaling) setInactive(journaling.value);
                break;
            case tabs.journaling:
                setActive(journaling.value);

                if (oldValue == tabs.exploring) setInactive(exploring.value);
                if (oldValue == tabs.sharing) setInactive(sharing.value);
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
</script>

<style scoped lang="less">
.toolbar {
    position: absolute;
}
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
.active {
    background-color: red;
}
.rectangle {
    height: 2px;
    width: 120px;
    background-color: white;
}

.body {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 100%;
}
ion-header {
    height: 600px;
}
.title {
    font-size: 5em;
}
.w1000 {
    width: 1000px;
}
.w800 {
    width: 800px;
}
.w300 {
    width: 300px;
}
.w400 {
    width: 400px;
}
.w500 {
    width: 500px;
}
.center {
    position: absolute;

    left: 0px;
    right: 0px;

    margin-left: auto;
    margin-right: auto;
}
.banner-content {
    width: 600px;
    height: 100%;

    z-index: 2;

    #info {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        height: 80%;

        span {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-around;
        }
    }

    .tabs {
        bottom: 40px;
        #tab-buttons {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
        }
    }
}
.image-carrousel {
    z-index: 1;
    //position: absolute;
    width: 100%;
    height: 540px;
}
</style>
