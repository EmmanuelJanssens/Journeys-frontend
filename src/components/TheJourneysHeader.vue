<template>
    <ion-toolbar color="dark">
        <ion-buttons slot="end">
            <ion-button router-link="/home"> HOME </ion-button>
            <ion-button router-link="/about"> ABOUT </ion-button>
            <ion-button router-link="/logbook"> LOGBOOK </ion-button>
            <ion-button @click="openModal(LoginModal)" v-if="userStore.IsLoggedIn() == false">Login</ion-button>
            <ion-button @click="openModal(RegisterModal)" v-if="userStore.IsLoggedIn() == false">Register</ion-button>
            <ion-button v-if="userStore.IsLoggedIn() == true">
                PROFILE <ion-icon slot="end" :src="caretDownOutline"> </ion-icon
            ></ion-button>
        </ion-buttons>
    </ion-toolbar>
</template>

<script lang="ts" setup>
import { IonToolbar, IonButtons, IonButton, modalController, IonIcon, menuController } from "@ionic/vue";

import { useUserStore } from "stores/useUserStore";
import LoginModal from "components/Modals/LoginModal.vue";
import RegisterModal from "components/Modals/RegisterModal.vue";
import { caretDownOutline } from "ionicons/icons";

const userStore = useUserStore();

async function toggleProfile() {
    await menuController.toggle("right-side-menu");
    await menuController.isOpen("right-side-menu");
}

async function openModal(component: any) {
    let modal = await modalController.create({
        component: component,
        keyboardClose: false,
        backdropDismiss: false
    });
    await modal.present();
}
</script>

<style scoped>
ion-toolbar {
    --background: black;
    --opacity: 100%;
}
</style>
