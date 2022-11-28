<template>
    <ion-page>
        <ion-header class="absolute ion-no-border z-50">
            <TheJourneysHeader />
        </ion-header>
        <div class="relative min-h-[200px] max-h-[250px] sm:min-h-[300px] sm:max-h-[400px]">
            <div class="h-full w-full">
                <div class="absolute z-30 h-full w-full">
                    <div class="h-full w-full p-6">
                        <div class="flex flex-col text-center m-0 text-white h-full justify-between items-center">
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

                            <div class="flex flex-col items-center">
                                <ion-button @click="verifyEmail" color="primary" button v-if="!verified"
                                    ><ion-icon slot="start" :icon="mailUnreadOutline"></ion-icon>
                                    <ion-label class="">Verify email</ion-label>
                                    <ion-spinner name="dots" v-if="mailSending"></ion-spinner
                                ></ion-button>
                                <ion-button @click="openEditModal" color="tertiary" button
                                    ><ion-icon slot="start" :icon="pencilOutline"></ion-icon>Edit your
                                    profile</ion-button
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
        </div>

        <div class="overflow-auto h-full">
            <h1 class="p-4">A quick overview</h1>

            <div class="p-4">More info comming in the future!</div>
        </div>
    </ion-page>
</template>

<script lang="ts" setup>
import {
    IonSpinner,
    IonIcon,
    IonText,
    IonPage,
    IonImg,
    IonButton,
    IonHeader,
    IonLabel,
    onIonViewDidEnter,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    modalController
} from "@ionic/vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay } from "swiper";

import "swiper/less";
import TheJourneysHeader from "components/TheJourneysHeader.vue";
import { ref } from "vue";
import { useUserStore } from "stores/useUserStore";
import { chevronForwardOutline, mailUnreadOutline, pencilOutline } from "ionicons/icons";
import { authApp } from "google/firebase";
import EditProfileModal from "components/Modals/EditProfileModal.vue";
import TheJourneysSlider from "components/Sliders/TheJourneysSlider.vue";
import { onAuthStateChanged, sendEmailVerification } from "@firebase/auth";
import { showToast } from "utils/utils";
const modules = ref([Autoplay]);
const userStore = useUserStore();
const nJourneys = ref(0);
const nExperiences = ref(0);
const mailSending = ref(false);
const verified = ref(true);

onIonViewDidEnter(async () => {
    onAuthStateChanged(authApp, async (user) => {
        if (user) {
            verified.value = user.emailVerified;
            await userStore.fetchMyProfile();
        }
    });
});

async function verifyEmail() {
    mailSending.value = true;
    const user = authApp.currentUser;
    try {
        await sendEmailVerification(user!);
        showToast("An email has been sent check your inbox", "success");
    } catch (e) {
        showToast("Failed to send an email", "danger");
    }
    mailSending.value = false;
}
async function openEditModal() {
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
    z-index: 30;
}
</style>
