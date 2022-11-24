<template>
    <ion-page>
        <ion-header class="ion-no-border ion-no-margin">
            <TheJourneysHeader class="toolbar" />
            <div class="banner-content center">
                <div id="info">
                    <p></p>
                    <span>
                        <ion-text
                            ><h1 class="title white">{{ authApp.currentUser?.displayName }}</h1></ion-text
                        >
                        <ion-text><p class="white"></p></ion-text>
                    </span>
                    <ion-button color="tertiary">Edit your profile</ion-button>
                </div>
            </div>
            <swiper
                class="image-carrousel"
                :modules="modules"
                :autoplay="{
                    delay: 5000,
                    disableOnInteraction: true
                }">
                <span class="overlay"></span>
                <swiper-slide>
                    <ion-img src="assets/images/banner/mountains.jpg" class="banner-img" />
                </swiper-slide>
                <swiper-slide>
                    <ion-img src="assets/images/banner/mountains2.jpg" class="banner-img" />
                </swiper-slide>
            </swiper>
        </ion-header>
        <ion-content class="main-body">
            <div class="center w1000">
                <ion-grid>
                    <ion-row>
                        <ion-col size="2"> </ion-col>
                        <ion-col></ion-col>
                    </ion-row>
                    <ion-row>
                        <ion-col size="3">
                            <ion-list>
                                <ion-item button>
                                    <ion-label>Statistics</ion-label>
                                    <ion-icon :icon="chevronForwardOutline"></ion-icon>
                                </ion-item>
                            </ion-list>
                        </ion-col>
                        <ion-col v-if="currentContent == 'statitsics'">
                            <ion-card>
                                <ion-card-header>
                                    <ion-card-title>Here are your statistics</ion-card-title>
                                </ion-card-header>
                                <ion-card-content>
                                    <p>Total number of journeys {{ nJourneys }}</p>
                                    <p>Total number of experiences {{ nExperiences }}</p>
                                </ion-card-content>
                            </ion-card>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts" setup>
import {
    IonNote,
    IonInput,
    IonToggle,
    IonIcon,
    IonText,
    IonContent,
    IonPage,
    IonImg,
    IonButton,
    IonHeader,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonLabel,
    IonList,
    onIonViewDidEnter,
    IonCard,
    IonCardContent,
    IonCardHeader,
    alertController,
    IonCardSubtitle,
    IonCardTitle,
    IonButtons,
    ToggleCustomEvent,
    InputCustomEvent
} from "@ionic/vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay } from "swiper";

import "swiper/less";
import TheJourneysHeader from "components/TheJourneysHeader.vue";
import { ref } from "vue";
import { useUserStore } from "stores/useUserStore";
import { chevronForwardOutline } from "ionicons/icons";
import { authApp } from "google/firebase";

const modules = ref([Autoplay]);
const userStore = useUserStore();
const nJourneys = ref(0);
const nExperiences = ref(0);
const currentContent = ref("statitsics");

const state = ref({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
});

onIonViewDidEnter(async () => {
    await userStore.fetchMyProfile();
});
</script>

<style scoped lang="less">
ion-content {
    --padding-top: 64px;
}

.white {
    color: white;
}

.toolbar {
    //position: absolute;
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
    height: 540;
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
