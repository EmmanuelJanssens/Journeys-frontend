<template>
    <section>
        <ion-searchbar
            id="end-point"
            class="ion-no-padding"
            :placeholder="props.placeholder"
            debounce="500"
            :value="props.input"
            @ionClear="clearInput"
            @ionChange="startAutocomplete($event)" />
        <ion-content class="search" v-if="predictions.length">
            <ion-list>
                <ion-item
                    v-for="prediction in predictions"
                    button
                    v-bind:key="prediction"
                    @click="setPredictionText(prediction.description)">
                    <ion-label>
                        {{ prediction.description }}
                    </ion-label>
                </ion-item>
            </ion-list>
            <ion-item>
                <ion-label>
                    <ion-icon src="/src/assets/icon/logo-google.svg"></ion-icon>
                    <ion-text class="google" color="medium">
                        Powered by google</ion-text
                    >
                </ion-label>
            </ion-item>
        </ion-content>
    </section>
</template>

<script lang="ts" setup>
import googleLoader from "google/googleLoader";

import {
    IonText,
    IonIcon,
    IonContent,
    IonItem,
    IonLabel,
    IonList,
    IonSearchbar,
    SearchbarCustomEvent
} from "@ionic/vue";
import { onMounted, ref } from "vue";

const predictions = ref<google.maps.places.AutocompletePrediction[]>([]);
const props = defineProps(["placeholder", "input"]);

var service: google.maps.places.AutocompleteService;

const emit = defineEmits(["predictionChosen"]);

onMounted(() => {
    googleLoader.load().then((google) => {
        service = new google.maps.places.AutocompleteService();
    });
});

function startAutocomplete(event: SearchbarCustomEvent) {
    const searchContent = event.detail.value!;
    if (searchContent.length > 3 && event.target.value !== props.input) {
        const request: google.maps.places.AutocompletionRequest = {
            input: searchContent,
            types: ["locality"],
            componentRestrictions: { country: "ch" }
        };
        service.getPlacePredictions(request).then((response) => {
            predictions.value = response.predictions;
        });
    } else if (searchContent.length === 0) {
        //clear if no text in textinput
        predictions.value = [];
    }
}

function setPredictionText(value: string) {
    predictions.value = [];
    emit("predictionChosen", value);
}

function clearInput() {
    predictions.value = [];
}
</script>

<style scoped>
modal-content {
    height: 300px;
}
.search {
    position: absolute;
    z-index: 999;
    height: 200px;
    width: 100%;
    min-width: 200px;
    max-width: 1280px;
}

ion-icon {
    font-size: 10px;
}

.google {
    font-size: 10px;
}
</style>
