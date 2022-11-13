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
            v-for="experience in journeyStore.editJourney?.journey?.experiences"
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
import { AddressDto, ExperienceDto } from "types/dtos";

const props = defineProps<{
    start: AddressDto;
    end: AddressDto;
    mode: string;
}>();

const emit = defineEmits<{
    (e: "reordered"): void;
}>();

const journeyStore = useJourneyStore();

function remove(id: string) {
    journeyStore.removeFromJourney(id);
    journeyStore.editJourney.journey?.experiences!.forEach((item, idx) => {
        item.experience.order = idx;
    });
    emit("reordered");
}

function reordered(evt: ItemReorderCustomEvent) {
    const res = evt.detail.complete(journeyStore.editJourney.journey?.experiences) as ExperienceDto[];
    res.forEach((exp, idx) => {
        exp.experience.order = idx;
    });
    journeyStore.editJourney.journey!.experiences = res;
    emit("reordered");
}
</script>
