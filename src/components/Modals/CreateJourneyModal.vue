<template>
    <section class="fullpage">
        <ion-header>
            <ion-toolbar>
                <ion-title>Create new journey</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="modalController.dismiss()">
                        <ion-icon
                            size="large"
                            src="/src/assets/icon/close-outline.svg"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-text-center ion-padding">
            <GautoCompletePredictionList
                class="ion-padding"
                placeholder="Start"
                :input="startData.locationText"
                @prediction-chosen="setStartPredictionText($event)" />

            <GautoCompletePredictionList
                class="ion-padding"
                placeholder="End"
                :input="endData.locationText"
                @prediction-chosen="setEndPredictionText($event)" />

            <ion-button class="ion-padding" @click="gotoJourneyMap">
                Create
            </ion-button>
        </ion-content>
    </section>
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
    onIonViewDidLeave
} from "@ionic/vue";

import { ref } from "vue";
import { LngLat } from "maplibre-gl";

import GautoCompletePredictionList from "components/GautoCompletePredictionList.vue";
import { getGeocodedData } from "google/googleGeocoder";
import router from "router/router";
import { modalController } from "@ionic/core";

onIonViewDidLeave(() => {
    startData.value = {
        locationText: "",
        coordinates: new LngLat(-1, -1),
        isOk: false
    };
    endData.value = {
        locationText: "",
        coordinates: new LngLat(-1, -1),
        isOk: false
    };
});

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
        const geocodedStart = await getGeocodedData(
            startData.value.locationText
        );
        const geocodedEnd = await getGeocodedData(endData.value.locationText);

        if (
            geocodedStart.error === undefined &&
            geocodedEnd.error === undefined
        ) {
            const route = {
                name: "map",
                params: {
                    start: JSON.stringify(geocodedStart),
                    end: JSON.stringify(geocodedEnd)
                }
            };
            router.push(route);
        }
        modalController.dismiss();
    }
}
</script>

<style scoped>
.fullpage {
    height: 100%;
}
</style>
