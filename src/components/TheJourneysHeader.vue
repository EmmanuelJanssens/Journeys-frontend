<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <ion-toolbar>
        <ion-buttons slot="end">
            <ion-button router-link="/home" color="primary"> HOME </ion-button>
            <!-- <ion-button router-link="/about"> ABOUT </ion-button> -->
            <ion-button router-link="/logbook" color="light"> LOGBOOK </ion-button>
            <ion-button @click="openModal(LoginModal)" v-if="userStore.isLoggedIn == false" color="light"
                >LOGIN</ion-button
            >
            <ion-button @click="openModal(RegisterModal)" v-if="userStore.isLoggedIn == false" color="light"
                >REGISTER</ion-button
            >
            <ion-button v-if="userStore.isLoggedIn == true" @click="onPopOver" color="light">
                PROFILE <ion-icon slot="end" :src="caretDownOutline"> </ion-icon
            ></ion-button>
        </ion-buttons>
    </ion-toolbar>
</template>

<script lang="ts" setup>
import {
    IonToolbar,
    IonButtons,
    IonButton,
    modalController,
    IonIcon,
    IonPopover,
    IonItem,
    IonLabel,
    popoverController,
    menuController
} from "@ionic/vue";

import { useUserStore } from "stores/useUserStore";
import LoginModal from "components/Modals/LoginModal.vue";
import RegisterModal from "components/Modals/RegisterModal.vue";
import { caretDownOutline } from "ionicons/icons";
import ProfilePopover from "./ProfilePopover.vue";
import { showToast } from "utils/utils";
import router from "router/router";

const userStore = useUserStore();

async function onPopOver(e: Event) {
    const popover = await popoverController.create({
        component: ProfilePopover,
        alignment: "start",
        event: e,
        reference: "trigger",
        size: "auto"
    });
    await popover.present();

    const data = await popover.onDidDismiss();
    if (data.data == "logout") {
        await userStore.logout();
        router.push("home");
        showToast("goodbye", "success");
    }
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
    --background: transparent;
}
</style>
