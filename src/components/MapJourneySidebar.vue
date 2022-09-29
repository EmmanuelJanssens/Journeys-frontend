<template>
    <ion-content>
        <ion-item-sliding>
            <ion-item lines="full">
                <ion-icon
                    slot="start"
                    size="large"
                    src="/src/assets/icon/pin-svgrepo-com.svg"></ion-icon>
                <ion-label>{{ props.start.text }}</ion-label>
            </ion-item>
            <ion-item-options>
                <ion-item-option color="tertiary">
                    <ion-icon
                        size="large"
                        src="/src/assets/icon/pencil-outline.svg"></ion-icon>
                </ion-item-option>
            </ion-item-options>
        </ion-item-sliding>

        <IonReorderGroup @ionItemReorder="reordered($event)" disabled="false">
            <ion-item-sliding
                v-for="poi in useJourney.journeyRef"
                v-bind:key="poi">
                <ion-item>
                    <ion-icon
                        slot="start"
                        size="large"
                        src="/src/assets/icon/trail-sign-outline.svg"></ion-icon>
                    <ion-label>{{ poi.name }}</ion-label>
                    <ion-reorder slot="end"></ion-reorder>
                </ion-item>
                <ion-item-options>
                    <ion-item-option color="danger" @click="remove(poi)">
                        <ion-icon
                            size="large"
                            src="/src/assets/icon/trash-bin-outline.svg"></ion-icon>
                    </ion-item-option>
                </ion-item-options>
            </ion-item-sliding>
        </IonReorderGroup>
        <ion-item-sliding>
            <ion-item lines="full">
                <ion-icon
                    slot="start"
                    size="large"
                    src="/src/assets/icon/pin-svgrepo-com.svg"></ion-icon>
                <ion-label>{{ props.end.text }}</ion-label>
            </ion-item>
            <ion-item-options>
                <ion-item-option color="tertiary">
                    <ion-icon
                        size="large"
                        src="/src/assets/icon/pencil-outline.svg"></ion-icon>
                </ion-item-option>
            </ion-item-options>
        </ion-item-sliding>
    </ion-content>
</template>
<script lang="ts" setup>
import type { ItemReorderCustomEvent } from "@ionic/vue";
import {
    IonContent,
    IonItemOptions,
    IonItemOption,
    IonItem,
    IonItemSliding,
    IonLabel,
    IonIcon,
    IonReorder,
    IonReorderGroup
} from "@ionic/vue";
import { defineProps } from "vue";

import { useJourneyStore } from "../stores/useJourneyStore";

const props = defineProps(["start", "end"]);

const useJourney = useJourneyStore();
function remove(poi: Poi) {
    useJourney.removeFromJourney(poi);
}
function reordered(evt: ItemReorderCustomEvent) {
    console.log("dsad");
    evt.detail.complete();
}
</script>
