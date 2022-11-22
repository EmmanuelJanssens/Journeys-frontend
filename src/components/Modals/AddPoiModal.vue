<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <ion-header>Add a poi</ion-header>
    <ion-content>
        <ion-list>
            <ion-item>
                <ion-label>Poi name</ion-label>
                <ion-input placeholder="Poi name"></ion-input>
            </ion-item>
            <ion-item>
                <ion-label>Address</ion-label>
                <ion-input placeholder="address"></ion-input>
            </ion-item>
        </ion-list>
    </ion-content>
    <ion-footer>
        <ion-toolbar>
            <ion-buttons>
                <ion-button color="secondary"> cancel </ion-button>
                <ion-button> save </ion-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-footer>
</template>
<script lang="ts" setup>
import {
    IonHeader,
    IonFooter,
    IonList,
    IonItem,
    IonLabel,
    IonButtons,
    IonButton,
    IonInput,
    IonGrid,
    IonRow,
    IonCol,
    modalController,
    alertController
} from "@ionic/vue";
</script>
<style></style>
