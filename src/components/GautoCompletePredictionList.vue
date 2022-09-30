<template>
    <ion-content
        ref="popover"
        class="search"
        v-if="props.predictions.length > 0">
        <ion-list>
            <ion-item
                v-for="prediction in (props.predictions as Array<google.maps.places.AutocompletePrediction>)"
                button
                v-bind:key="prediction"
                @click="$emit('predictionChosen', prediction.description)">
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
</template>

<script lang="ts" setup>
import {
    IonText,
    IonIcon,
    IonContent,
    IonItem,
    IonLabel,
    IonList
} from "@ionic/vue";

const props = defineProps(["predictions"]);
</script>

<style>
.search {
    position: absolute;
    z-index: 999;
    height: 200px;
    width: 100%;
    min-width: 200px;
}
.search-item {
    width: 100%;
}
ion-icon {
    font-size: 10px;
}
.google {
    font-size: 10px;
}
</style>
