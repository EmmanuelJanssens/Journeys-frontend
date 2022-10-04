<template>
    <ion-page id="main-content">
        <ion-content :fullscreen="true">
            <ion-grid :fixed="true" class="ion-no-padding">
                <ion-row
                    class="ion-align-items-center ion-justify-content-center ion-hide-sm-down journey">
                    <ion-col size="3" class="ion-margin">
                        <GautoCompletePredictionList
                            placeholder="Start"
                            :input="startData.address"
                            @prediction-chosen="
                                setStartPredictionText($event)
                            " />
                    </ion-col>
                    <ion-col size="3" class="ion-margin">
                        <GautoCompletePredictionList
                            placeholder="Destination"
                            :input="endData.address"
                            @prediction-chosen="setEndPredictionText($event)" />
                    </ion-col>
                    <ion-col size="3" class="ion-margin">
                        <ion-button color="primary" @click="gotoJourneyMap()"
                            >Start
                        </ion-button>
                    </ion-col>
                </ion-row>
                <ion-row class="ion-align-items-center" id="row">
                    <ion-col size="7">
                        <ion-label class="ion-text-wrap">
                            <h1>Find your next adventure</h1>
                            <p class="ion-text-justify">
                                Plan places you want to visit be it local,
                                cantonal or national, plan as you go and
                                visualize your trip. Choose from many of our
                                Points Of Interest, shared by other members Save
                                your journey and come back to it anytime to edit
                                your story Inspire Others by sharing your
                                experiences within the community
                            </p>
                        </ion-label>
                    </ion-col>
                    <ion-col size="5">
                        <img src="src/assets/map_carte.png" />
                    </ion-col>
                </ion-row>
                <ion-row class="ion-align-items-center" id="row">
                    <ion-col size="5">
                        <img src="src/assets/featureImg2.png" />
                    </ion-col>
                    <ion-col size="7">
                        <ion-label class="ion-text-wrap ion-text-justify">
                            <h1>share your story</h1>
                            <p class="ion-text-justif">
                                Have you been to a place that no one else has
                                seen ? Share them on our site and show the world
                                your experiences. Create an account to add your
                                new points of interest Look for the place you
                                want to add on our interactive map Upload your
                                pictures, and write your experience
                            </p>
                        </ion-label>
                    </ion-col>
                </ion-row>
                <ion-row size="2" class="ion-align-items-center" id="row">
                    <ion-col size="7">
                        <ion-label class="ion-text-wrap">
                            <h1>Journayl your trip</h1>
                            <p class="ion-text-justify">
                                Complete your dashboard with various adventures,
                                save your memories to keep them forever. Thanks
                                to our user friendly dashboard you will be able
                                to edit your cards on the go or after you have
                                completed your trip.
                            </p>
                        </ion-label>
                    </ion-col>
                    <ion-col size="5">
                        <img src="src/assets/featureImg3.png" />
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
        <ion-footer>
            <ion-title>footer</ion-title>
        </ion-footer>
    </ion-page>
</template>

<script lang="ts" setup>
import {
    IonContent,
    IonPage,
    IonTitle,
    IonFooter,
    IonButton,
    IonLabel,
    IonGrid,
    IonCol,
    IonRow,
    onIonViewWillEnter
} from "@ionic/vue";
import { LngLat } from "maplibre-gl";
import { ref } from "vue";

import router from "router/router";
import GautoCompletePredictionList from "components/GautoCompletePredictionList.vue";
import { getGeocodedData } from "google/googleGeocoder";
import { JourneyLocation } from "types/journeys";

const startData = ref<JourneyLocation>({
    address: "",
    coordinates: new LngLat(-1, -1),
    isOk: false
});

const endData = ref<JourneyLocation>({
    address: "",
    coordinates: new LngLat(-1, -1),
    isOk: false
});

function setStartPredictionText(prediction: string) {
    startData.value.address = prediction;
    startData.value.isOk = true;
}
function setEndPredictionText(prediction: string) {
    endData.value.address = prediction;
    endData.value.isOk = true;
}

onIonViewWillEnter(() => {
    startData.value = {
        address: "",
        coordinates: new LngLat(-1, -1),
        isOk: false
    };
    endData.value = {
        address: "",
        coordinates: new LngLat(-1, -1),
        isOk: false
    };
});

async function gotoJourneyMap() {
    if (startData.value.isOk && endData.value.isOk) {
        const geocodedStart = await getGeocodedData(startData.value.address);
        const geocodedEnd = await getGeocodedData(endData.value.address);

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
    }
}
</script>

<style>
.journey {
    height: 300px;
    background-image: url(assets/hero-bg.jpg);
    background-repeat: no-repeat;
    background-size: cover;
}
</style>
