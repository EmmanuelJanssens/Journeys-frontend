<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <ion-header>
        <ion-toolbar>
            <ion-title color="primary">Create new journey</ion-title>
            <ion-buttons slot="end">
                <ion-button @click="modalController.dismiss()">
                    <ion-icon size="large" src="/src/assets/icon/close-outline.svg"></ion-icon>
                </ion-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>
    <ion-content class="ion-text-center">
        <ion-grid>
            <ion-row>
                <ion-col>
                    <GautoCompletePredictionList
                        placeholder="Start"
                        :input="startData.locationText"
                        @prediction-chosen="setStartPredictionText($event)" />
                </ion-col>
            </ion-row>
            <ion-row>
                <ion-col>
                    <GautoCompletePredictionList
                        placeholder="End"
                        :input="endData.locationText"
                        @prediction-chosen="setEndPredictionText($event)"
                /></ion-col>
            </ion-row>
            <ion-row>
                <ion-col> </ion-col>
                <ion-col> </ion-col>
            </ion-row>
        </ion-grid>
    </ion-content>
    <ion-footer>
        <ion-toolbar>
            <ion-buttons slot="end">
                <ion-button @click="modalController.dismiss()" color="secondary"> Cancel </ion-button>
                <ion-button @click="gotoJourneyMap" color="primary"> Create </ion-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-footer>
</template>

<script lang="ts" setup>
import {
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonGrid,
    IonCol,
    IonRow,
    IonFooter
} from "@ionic/vue";

import { ref } from "vue";
import { LngLat } from "maplibre-gl";

import GautoCompletePredictionList from "components/GautoCompletePredictionList.vue";
import { getGeocodedData } from "google/googleGeocoder";
import { modalController } from "@ionic/core";

const startData = ref({
    locationText: "",
    coordinates: new LngLat(-1, -1),
    isOk: false
});

const endData = ref({
    locationText: "",
    coordinates: new LngLat(-1, -1),
    isOk: false
});

function setStartPredictionText(prediction: string) {
    startData.value.locationText = prediction;
    startData.value.isOk = true;
}
function setEndPredictionText(prediction: string) {
    endData.value.locationText = prediction;
    endData.value.isOk = true;
}

async function gotoJourneyMap() {
    if (startData.value.isOk && endData.value.isOk) {
        const geocodedStart = await getGeocodedData(startData.value.locationText);
        const geocodedEnd = await getGeocodedData(endData.value.locationText);

        if (geocodedStart.error === undefined && geocodedEnd.error === undefined) {
            modalController.dismiss(
                {
                    start: geocodedStart,
                    end: geocodedEnd
                },
                "create"
            );
        }
    }
}
</script>

<style scoped>
ion-button {
    z-index: 999;
}
</style>
