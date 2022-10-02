<template>
    <ion-header>
        <ion-toolbar color="tertiary">
            <ion-buttons slot="end">
                <ion-button color="secondary" router-link="/home"
                    >Home</ion-button
                >
                <ion-button
                    color="primary"
                    @click="openModal(LoginModal)"
                    v-if="userStore.IsLoggedIn() == false"
                    >Login</ion-button
                >
                <ion-button
                    color="primary"
                    @click="openModal(RegisterModal)"
                    v-if="userStore.IsLoggedIn() == false"
                    >Register</ion-button
                >
                <ion-button
                    color="secondary"
                    v-if="userStore.IsLoggedIn() == true"
                    router-link="/logbook"
                    >Journeys</ion-button
                >
                <ion-button
                    color="secondary"
                    v-if="userStore.IsLoggedIn() == true"
                    @click="toggleProfile()"
                    >{{ userStore.userRef.userName }}</ion-button
                >
            </ion-buttons>
        </ion-toolbar>
    </ion-header>
</template>

<script lang="ts" setup>
import {
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    modalController,
    menuController
} from "@ionic/vue";

import { useUserStore } from "stores/useUserStore";
import LoginModal from "./Modals/LoginModal.vue";
import RegisterModal from "./Modals/RegisterModal.vue";
const userStore = useUserStore();

function toggleProfile() {
    menuController.open("profileMenu").then(() => {
        menuController.isOpen("profileMenu").then((b) => console.log(b));
    });
}

async function openModal(component: any) {
    let modal = await modalController.create({
        component: component,
        keyboardClose: false
    });
    modal.present();
}
</script>

<style scoped></style>
