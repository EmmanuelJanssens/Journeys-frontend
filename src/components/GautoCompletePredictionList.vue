<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <span>
        <ion-searchbar
            id="end-point"
            :placeholder="props.placeholder"
            :debounce="500"
            :value="props.input"
            @ionClear="clearInput"
            @ionChange="startAutocomplete"
            @ionFocus="toggleFocus(true)"
            @ionBlur="toggleFocus(false)"
            v-on:keydown="selectFirst($event)" />

        <div class="search ion-no-padding" v-if="predictions.length">
            <ion-list>
                <ion-item
                    v-for="prediction in predictions"
                    button
                    v-bind:key="prediction.description"
                    @click="setPredictionText(prediction.description)">
                    <ion-label>
                        {{ prediction.description }}
                    </ion-label>
                </ion-item>
            </ion-list>
            <ion-item>
                <ion-label>
                    <ion-icon src="/src/assets/icon/logo-google.svg"></ion-icon>
                    <ion-text class="google" color="medium"> Powered by google</ion-text>
                </ion-label>
            </ion-item>
        </div>
    </span>
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
const props = defineProps<{
    placeholder: string;
    input: string;
}>();

var service: google.maps.places.AutocompleteService;

const emit = defineEmits<{
    (e: "predictionChosen", value: string): void;
}>();
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

const hasFocus = ref(false);
function toggleFocus(focus: boolean) {
    hasFocus.value = focus;
}
function selectFirst(event: KeyboardEvent) {
    if (hasFocus.value == true && predictions.value.length > 0) {
        if (event.key == "Enter" || event.key == "Tab") {
            setPredictionText(predictions.value[0].description);
        }
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
.search {
    overflow-y: auto;
    position: absolute;
    max-height: 300px;
    z-index: 999;
    width: 100%;
}
.google {
    font-size: 10px;
}
</style>
