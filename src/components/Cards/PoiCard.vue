<template>
    <ion-card>
        <ion-card-header>
            <ion-card-title>{{ (props.poi as PoiDto).name }}</ion-card-title>
            <ion-card-subtitle>Subtitle</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
            <ion-grid>
                <ion-row>
                    <ion-col>
                        <ion-img :src="props.poi.thumbnail"></ion-img>
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col> description </ion-col>
                </ion-row>
            </ion-grid>
            <ion-item>
                <ion-button @click="addToJourney(props.poi)" fill="clear" slot="end" size="default">
                    <ion-icon src="src/assets/icon/add-outline.svg"> </ion-icon>
                </ion-button>
            </ion-item>
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts" setup>
import {
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonButton,
    IonImg,
    popoverController
} from "@ionic/vue";
import axios from "axios";
import { onMounted } from "vue";

import { useJourneyStore } from "stores/useJourneyStore";
import { ExperienceDto, PoiDto } from "types/dtos";

const props = defineProps<{
    poi: PoiDto;
}>();

const useJourney = useJourneyStore();

onMounted(() => {
    console.log(props.poi);
});
function addToJourney(poi: PoiDto) {
    if (poi.thumbnail != undefined) delete poi.thumbnail;
    const experience: ExperienceDto = {
        title: "",
        date: new Date(),
        description: "",
        images: [],
        order: useJourney.editJourney.journey!.experiencesConnection?.edges?.length!,
        node: poi
    };
    useJourney.addToJourney(experience);
    popoverController.dismiss({ poi });
}
onMounted(async () => {
    await axios.get(`/api/poi/${props.poi.id}/experiences`);
});
</script>
