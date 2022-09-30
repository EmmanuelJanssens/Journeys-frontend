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
                v-for="experience in useJourney.journeyRef?.experiences"
                v-bind:key="experience">
                <ion-item>
                    <ion-icon
                        slot="start"
                        size="large"
                        src="/src/assets/icon/trail-sign-outline.svg"></ion-icon>
                    <ion-label>{{ experience.poi.name }}</ion-label>
                    <ion-reorder slot="end"></ion-reorder>
                </ion-item>
                <ion-item-options>
                    <ion-item-option
                        color="danger"
                        @click="remove(experience.poi.poi_id)">
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
import { ItemReorderCustomEvent, useKeyboard } from "@ionic/vue";
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

import { useJourneyStore } from "../stores/useJourneyStore";

const props = defineProps(["start", "end"]);

const useJourney = useJourneyStore();
function remove(id: string) {
    useJourney.removeFromJourney(id);
}
function reordered(evt: ItemReorderCustomEvent) {
    if (evt.detail.from < evt.detail.to) {
        useJourney.journeyRef.experiences.forEach((item) => {
            if (item.experience.order == evt.detail.from) {
                item.experience.order = evt.detail.to;
            } else if (
                item.experience.order <= evt.detail.to &&
                item.experience.order >= evt.detail.from
            ) {
                item.experience.order--;
            }
        });
    } else {
        useJourney.journeyRef.experiences.forEach((item) => {
            if (item.experience.order == evt.detail.from) {
                item.experience.order = evt.detail.to;
            } else if (
                item.experience.order >= evt.detail.to &&
                item.experience.order <= evt.detail.from
            ) {
                item.experience.order++;
            }
        });
    }
    evt.detail.complete();
}
</script>
