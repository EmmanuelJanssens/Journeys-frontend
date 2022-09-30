<template>
    <ion-header>
        <ion-toolbar>
            <ion-buttons slot="end">
                <ion-button color="secondary" router-link="/home"
                    >Home</ion-button
                >
                <ion-button
                    color="primary"
                    id="open-login-modal"
                    v-if="userStore.IsLoggedIn() == false"
                    >Login</ion-button
                >
                <ion-button
                    color="primary"
                    id="open-register-modal"
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
    menuController
} from "@ionic/vue";

import { useUserStore } from "../stores/useUserStore";

const userStore = useUserStore();

function toggleProfile() {
    menuController.toggle("profileMenu").then(() => {
        menuController.isOpen("profileMenu").then((b) => console.log(b));
    });
}
</script>
