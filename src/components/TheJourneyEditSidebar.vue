<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <ion-item-sliding :disabled="props.mode == 'view'">
        <ion-item lines="full">
            <ion-icon slot="start" size="large" :icon="locationOutline"></ion-icon>
            <ion-label>{{ props.start?.address }}</ion-label>
        </ion-item>
        <ion-item-options>
            <ion-item-option color="tertiary">
                <ion-icon size="large" :icon="pencilOutline"></ion-icon>
            </ion-item-option>
        </ion-item-options>
    </ion-item-sliding>

    <IonReorderGroup @ionItemReorder="reordered($event)" :disabled="false">
        <ion-item-sliding
            v-for="experience in journeyStore.editJourney?.journey?.experiencesConnection?.edges"
            v-bind:key="experience.node.id"
            :disabled="props.mode == 'view'">
            <ion-item>
                <ion-icon slot="start" size="large" :icon="trailSignOutline"></ion-icon>
                <ion-label>{{ (experience.node as PoiDto).name }}</ion-label>
                <ion-reorder v-if="props.mode == 'edit'" slot="end"></ion-reorder>
            </ion-item>
            <ion-item-options>
                <ion-item-option color="danger" @click="remove(experience.node.id!)">
                    <ion-icon size="large" :icon="trashBinOutline"></ion-icon>
                </ion-item-option>
            </ion-item-options>
        </ion-item-sliding>
    </IonReorderGroup>
    <ion-item-sliding :disabled="props.mode == 'view'">
        <ion-item lines="full">
            <ion-icon slot="start" size="large" :icon="locationOutline"></ion-icon>
            <ion-label>{{ props.end?.address }}</ion-label>
        </ion-item>
        <ion-item-options>
            <ion-item-option color="tertiary">
                <ion-icon size="large" :icon="pencilOutline"></ion-icon>
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
import { locationOutline, pencilOutline, trailSignOutline, trashBinOutline } from "ionicons/icons";

import { useJourneyStore } from "stores/useJourneyStore";
import { AddressDto, ExperienceDto, PoiDto } from "types/dtos";

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
    journeyStore.editJourney.journey?.experiencesConnection?.edges?.forEach((item, idx) => {
        item.order = idx;
    });
    emit("reordered");
}

function reordered(evt: ItemReorderCustomEvent) {
    const res = evt.detail.complete(journeyStore.editJourney.journey?.experiencesConnection?.edges) as ExperienceDto[];
    res.forEach((exp, idx) => {
        exp.order = idx;
    });
    journeyStore.editJourney.journey!.experiencesConnection!.edges = res;
    emit("reordered");
}
</script>
