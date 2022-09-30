<template>
    <ion-page id="main-content">
        <journeys-header />
        <ion-content :fullscreen="true">
            <ion-grid :fixed="true" class="ion-no-padding">
                <ion-row
                    class="ion-align-items-center ion-justify-content-center ion-hide-sm-down journey">
                    <ion-col size="3" class="ion-margin">
                        <ion-searchbar
                            id="start-point"
                            class="ion-no-padding"
                            placeholder="Starting point"
                            debounce="500"
                            :value="startData.locationText"
                            @ionChange="onPopOver($event, 'start')"
                            @ionClear="startData.locationText = ''">
                        </ion-searchbar>
                        <GautoCompletePredictionList
                            :predictions="startData.predictions"
                            @prediction-chosen="
                                setPredictionText($event, 'start')
                            " />
                    </ion-col>
                    <ion-col size="3" class="ion-margin">
                        <ion-searchbar
                            id="end-point"
                            class="ion-no-padding"
                            placeholder="Destination"
                            debounce="500"
                            :value="endData.locationText"
                            @ionClear="endData.locationText = ''"
                            @ionChange="onPopOver($event, 'end')">
                        </ion-searchbar>
                        <GautoCompletePredictionList
                            :predictions="endData.predictions"
                            @prediction-chosen="
                                setPredictionText($event, 'end')
                            " />
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
            <login-modal />
            <RegisterModal />
        </ion-content>
        <ion-footer>
            <ion-title>footer</ion-title>
        </ion-footer>
    </ion-page>
</template>

<script lang="ts" setup>
import { Loader } from "@googlemaps/js-api-loader";
import { SearchbarCustomEvent } from "@ionic/vue";
import {
    IonContent,
    IonPage,
    IonTitle,
    IonFooter,
    IonSearchbar,
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
import LoginModal from "../components/Modals/LoginModal.vue";
import router from "../router";
import RegisterModal from "../components/Modals/RegisterModal.vue";
import GautoCompletePredictionList from "../components/GautoCompletePredictionList.vue";

var service: google.maps.places.AutocompleteService;
var geocoder: google.maps.Geocoder;

const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    version: "weekly",
    libraries: ["places", "geometry"]
});

const startData = ref({
    locationText: "",
    coordinates: new LngLat(-1, -1),
    isOk: false,
    predictions: new Array<google.maps.places.AutocompletePrediction>()
});
const endData = ref({
    locationText: "",
    coordinates: new LngLat(-1, -1),
    isOk: false,
    predictions: new Array<google.maps.places.AutocompletePrediction>()
});

onMounted(() => {
    loader.load().then((google) => {
        service = new google.maps.places.AutocompleteService();
        geocoder = new google.maps.Geocoder();
    });
});

onIonViewWillEnter(() => {
    startData.value = {
        locationText: "",
        coordinates: new LngLat(-1, -1),
        isOk: false,
        predictions: []
    };
    endData.value = {
        locationText: "",
        coordinates: new LngLat(-1, -1),
        isOk: false,
        predictions: []
    };
});

function setPredictionText(predictionText: string, point: string) {
    if (point === "start") {
        startData.value.locationText = predictionText;
        startData.value.isOk = true;
        startData.value.predictions = [];
    } else {
        endData.value.locationText = predictionText;
        endData.value.isOk = true;
        endData.value.predictions = [];
    }
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
    console.log(startData);
    console.log(endData);

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

function onPopOver(ev: SearchbarCustomEvent, point: string) {
    if (ev.detail.value?.length! >= 3) {
        if (
            (point === "start" &&
                ev.target.value !== startData.value.locationText) ||
            (point === "end" && ev.target.value !== endData.value.locationText)
        ) {
            const request: google.maps.places.AutocompletionRequest = {
                input: ev.detail.value!,
                types: ["locality"],
                componentRestrictions: { country: "ch" }
            };
            service
                .getPlacePredictions(request)
                .then((resp) => {
                    if (point === "start") {
                        startData.value.predictions = resp.predictions;
                    } else if (point === "end") {
                        endData.value.predictions = resp.predictions;
                    }
                })
                .catch(() => {
                    //Do something
                });
        }
    } else if (ev.detail.value?.length! === 0) {
        if (point === "start") {
            startData.value.isOk = false;
            startData.value.predictions = [];
        } else {
            endData.value.isOk = false;
            endData.value.predictions = [];
        }
    }
}
</script>

<style>
.search {
    position: absolute;
    z-index: 999;
    width: 100%;
    min-width: 200px;
}
.search-item {
    width: 100%;
}
.journey {
    height: 300px;
    background-image: url(../assets/hero-bg.jpg);
    background-repeat: no-repeat;
    background-size: cover;
}

ion-toolbar {
    --background: #dccabf;
    --padding-start: 10px;
}

ion-chip {
    --background: var(--ion-color-primary);
}
</style>
