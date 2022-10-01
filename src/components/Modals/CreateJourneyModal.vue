<template>
    <ion-page>
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
        <ion-content>
            <ion-grid class="fullpage ion-align-items-center">
                <ion-row>
                    <ion-col>
                        <GautoCompletePredictionList
                            placeholder="Start"
                            :input="startData.locationText"
                            @prediction-chosen="
                                setStartPredictionText($event)
                            " />
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <GautoCompletePredictionList
                            placeholder="End"
                            :input="endData.locationText"
                            @prediction-chosen="setEndPredictionText($event)" />
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <ion-button @click="gotoJourneyMap">
                            Create
                        </ion-button>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-page>
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
    IonRow,
    IonCol,
    IonPage,
    onIonViewDidLeave
} from "@ionic/vue";

import { ref } from "vue";
import { LngLat } from "maplibre-gl";

import GautoCompletePredictionList from "../GautoCompletePredictionList.vue";
import { getGeocodedData } from "../..//googleGeocoder";
import router from "../..//router";
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
