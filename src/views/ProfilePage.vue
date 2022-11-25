<template>
    <ion-page>
        <ion-header class="ion-no-border">
            <TheJourneysHeader />
        </ion-header>
        <div class="relative min-h-[200px] max-h-[250px] sm:min-h-[300px] sm:max-h-[400px]">
            <div class="absolute z-50 h-full w-full">
                <div class="h-full w-full p-2">
                    <div class="flex flex-col text-center m-0 text-white h-full justify-between">
                        <div class="flex flex-col justify-items-center">
                            <ion-text
                                ><h1 class="text-4xl md:text-8xl">
                                    {{ userStore.currentUser?.additional?.username }}
                                </h1></ion-text
                            >
                            <ion-text
                                ><p class="text-sm sm:text-lg">
                                    {{ userStore.currentUser?.additional?.citation }}
                                </p></ion-text
                            >
                        </div>
                        <div>
                            <ion-button @click="openEditModal" color="tertiary">Edit your profile</ion-button>
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

        <div class="overflow-auto h-full">
            <div class=" ">
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
            </div>
        </div>
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
    InputCustomEvent,
    modalController
} from "@ionic/vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay } from "swiper";

import "swiper/less";
import TheJourneysHeader from "components/TheJourneysHeader.vue";
import { ref } from "vue";
import { useUserStore } from "stores/useUserStore";
import { chevronForwardOutline } from "ionicons/icons";
import { authApp } from "google/firebase";
import EditProfileModal from "components/Modals/EditProfileModal.vue";

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

async function openEditModal() {
    console.log("wowo");
    const modal = await modalController.create({
        component: EditProfileModal
    });
    await modal.present();
}
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
