<template>
    <ion-page id="main-content">
        <journeys-header />
        <ion-content :fullscreen="true">
            <ion-grid :fixed="true" class="ion-no-padding">
                <ion-row
                    class="ion-align-items-center ion-justify-content-center ion-hide-sm-down journey">
                    <ion-col size="3" class="ion-margin">
                        <GautoCompletePredictionList
                            placeholder="Start"
                            :input="startData.locationText"
                            @prediction-chosen="
                                setStartPredictionText($event)
                            " />
                    </ion-col>
                    <ion-col size="3" class="ion-margin">
                        <GautoCompletePredictionList
                            placeholder="Destination"
                            :input="endData.locationText"
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
                        <img src="../assets/map_carte.png" />
                    </ion-col>
                </ion-row>
                <ion-row class="ion-align-items-center" id="row">
                    <ion-col size="5">
                        <img src="../assets/featureImg2.png" />
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
                        <img src="../assets/featureImg3.png" />
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
import { onMounted, ref } from "vue";

import JourneysHeader from "../components/JourneysHeader.vue";
import router from "../router";
import GautoCompletePredictionList from "../components/GautoCompletePredictionList.vue";
import googleLoader from "../googleLoader";

var geocoder: google.maps.Geocoder;

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

onMounted(() => {
    googleLoader.load().then((google) => {
        geocoder = new google.maps.Geocoder();
    });
});

onIonViewWillEnter(() => {
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

function setStartPredictionText(prediction: string) {
    startData.value.locationText = prediction;
    startData.value.isOk = true;
}
function setEndPredictionText(prediction: string) {
    endData.value.locationText = prediction;
    endData.value.isOk = true;
}

function geocodeStartDest(point: string) {
    const geo =
        point === "start"
            ? startData.value.locationText
            : endData.value.locationText;
    const request: google.maps.GeocoderRequest = {
        address: geo,
        componentRestrictions: { country: "ch" }
    };
    return geocoder.geocode(request).then((response) => {
        const coords = new LngLat(
            response.results[0].geometry.location.lng(),
            response.results[0].geometry.location.lat()
        );
        if (point === "start") {
            startData.value.coordinates = coords;
        } else {
            endData.value.coordinates = coords;
        }
    });
}
async function gotoJourneyMap() {
    if (startData.value.isOk && endData.value.isOk) {
        await geocodeStartDest("start");
        await geocodeStartDest("end");
        if (
            startData.value.coordinates.lat > 0 &&
            endData.value.coordinates.lat > 0
        ) {
            const route = {
                name: "map",
                params: {
                    start: JSON.stringify({
                        text: startData.value.locationText,
                        coordinates: startData.value.coordinates
                    }),
                    end: JSON.stringify({
                        text: endData.value.locationText,
                        coordinates: endData.value.coordinates
                    })
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
    background-image: url(../assets/hero-bg.jpg);
    background-repeat: no-repeat;
    background-size: cover;
}
</style>
