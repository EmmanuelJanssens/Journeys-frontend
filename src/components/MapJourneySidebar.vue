<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <ion-item-sliding :disabled="props.mode == 'view'">
        <ion-item lines="full">
            <ion-icon slot="start" size="large" src="/src/assets/icon/pin-svgrepo-com.svg"></ion-icon>
            <ion-label>{{ props.start?.address }}</ion-label>
        </ion-item>
        <ion-item-options>
            <ion-item-option color="tertiary">
                <ion-icon size="large" src="/src/assets/icon/pencil-outline.svg"></ion-icon>
            </ion-item-option>
        </ion-item-options>
    </ion-item-sliding>

    <IonReorderGroup @ionItemReorder="reordered($event)" :disabled="false">
        <ion-item-sliding
            v-for="experience in useJourney.editJourney?.journey?.experiences"
            v-bind:key="experience.poi.id"
            :disabled="props.mode == 'view'">
            <ion-item>
                <ion-icon slot="start" size="large" src="/src/assets/icon/trail-sign-outline.svg"></ion-icon>
                <ion-label>{{ experience.poi.name }}</ion-label>
                <ion-reorder v-if="props.mode == 'edit'" slot="end"></ion-reorder>
            </ion-item>
            <ion-item-options>
                <ion-item-option color="danger" @click="remove(experience.poi.id!)">
                    <ion-icon size="large" src="/src/assets/icon/trash-bin-outline.svg"></ion-icon>
                </ion-item-option>
            </ion-item-options>
        </ion-item-sliding>
    </IonReorderGroup>
    <ion-item-sliding :disabled="props.mode == 'view'">
        <ion-item lines="full">
            <ion-icon slot="start" size="large" src="/src/assets/icon/pin-svgrepo-com.svg"></ion-icon>
            <ion-label>{{ props.end?.address }}</ion-label>
        </ion-item>
        <ion-item-options>
            <ion-item-option color="tertiary">
                <ion-icon size="large" src="/src/assets/icon/pencil-outline.svg"></ion-icon>
            </ion-item-option>
        </ion-item-options>
    </ion-item-sliding>
</template>
<script lang="ts" setup>
import { ItemReorderCustomEvent } from "@ionic/vue";
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

import { useJourneyStore } from "stores/useJourneyStore";

const props = defineProps(["start", "end", "mode"]);

const emit = defineEmits(["reordered"]);
const useJourney = useJourneyStore();
function remove(id: string) {
    const removed = useJourney.removeFromJourney(id);

    useJourney.editJourney.journey?.experiences!.forEach((item: { experience: { order: number } }) => {
        if (item.experience.order > removed!.experience.order) item.experience.order--;
    });
    emit("reordered");
}
function reordered(evt: ItemReorderCustomEvent) {
    if (evt.detail.from < evt.detail.to) {
        useJourney.editJourney.journey?.experiences!.forEach((item: { experience: { order: number } }) => {
            if (item.experience.order == evt.detail.from) {
                item.experience.order = evt.detail.to;
            } else if (item.experience.order <= evt.detail.to && item.experience.order >= evt.detail.from) {
                item.experience.order--;
            }
        });
    } else {
        useJourney.editJourney.journey?.experiences!.forEach((item: { experience: { order: number } }) => {
            if (item.experience.order == evt.detail.from) {
                item.experience.order = evt.detail.to;
            } else if (item.experience.order >= evt.detail.to && item.experience.order <= evt.detail.from) {
                item.experience.order++;
            }
        });
    }
    useJourney.editJourney.journey?.experiences!.sort((a, b) => a.experience.order - b.experience.order);
    evt.detail.complete();
    emit("reordered");
}
</script>
