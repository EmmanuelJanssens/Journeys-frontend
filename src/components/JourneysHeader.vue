<template>
    <ion-header>
        <ion-toolbar color="tertiary">
            <ion-buttons slot="end">
                <ion-button color="secondary" router-link="/home">Home</ion-button>
                <ion-button color="primary" @click="openModal(LoginModal)" v-if="userStore.IsLoggedIn() == false"
                    >Login</ion-button
                >
                <ion-button color="primary" @click="openModal(RegisterModal)" v-if="userStore.IsLoggedIn() == false"
                    >Register</ion-button
                >
                <ion-button color="secondary" v-if="userStore.IsLoggedIn() == true" router-link="/logbook"
                    >Journeys</ion-button
                >
                <ion-button color="secondary" v-if="userStore.IsLoggedIn() == true" @click="toggleProfile()">{{
                    userStore.userRef.username
                }}</ion-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>
</template>

<script lang="ts" setup>
import { IonContent, IonHeader, IonToolbar, IonButtons, IonButton, modalController, menuController } from "@ionic/vue";

import { useUserStore } from "stores/useUserStore";
import LoginModal from "components/Modals/LoginModal.vue";
import RegisterModal from "components/Modals/RegisterModal.vue";
const userStore = useUserStore();

function toggleProfile() {
    menuController.toggle("profileMenu").then((e) => {
        menuController.isOpen("profileMenu").then((b) => {});
    });
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

<style scoped></style>
