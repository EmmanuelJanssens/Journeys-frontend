<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <ion-item button @click="popoverController.dismiss('profile')">
        <ion-label>Profile</ion-label>
        <ion-icon :icon="personOutline" slot="start"></ion-icon>
    </ion-item>
    <ion-item button @click="popoverController.dismiss('logout')">
        <ion-label>Logout</ion-label>
        <ion-icon :icon="exitOutline" slot="start"></ion-icon>
    </ion-item>
</template>
<script lang="ts" setup>
import { IonIcon, IonItem, IonLabel, popoverController } from "@ionic/vue";
import { exitOutline, personOutline } from "ionicons/icons";

const emits = defineEmits<{
    (e: "logout"): void;
    (e: "profile"): void;
}>();
</script>
