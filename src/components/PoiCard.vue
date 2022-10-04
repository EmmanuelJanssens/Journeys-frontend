<template>
    <ion-card>
        <ion-card-header>
            <ion-card-title>{{ (data.poi as Poi).name }}</ion-card-title>
            <ion-card-subtitle>Subtitle</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
            <ion-grid>
                <ion-row>
                    <ion-col>
                        <ion-img src="/src/assets/featureImg3.png"></ion-img>
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col> description </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <ion-button @click="addToJourney(data.poi)">
                            Add
                        </ion-button>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts" setup>
import { Poi, Experience } from "types/journeys";
import {
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonImg,
    popoverController
} from "@ionic/vue";
import axios from "axios";
import { onMounted } from "vue";

import { useJourneyStore } from "stores/useJourneyStore";
import { ExperienceDto } from "types/dtos";

const data = defineProps(["poi"]);

const useJourney = useJourneyStore();

function addToJourney(poi: Poi) {
    const experience: ExperienceDto = {
        poi: poi,
        experience: {
            date: new Date(),
            description: "",
            images: [""],
            order: useJourney.journeyRef.experiences!.length
        }
    };
    useJourney.addToJourney(experience);
    console.log(useJourney.journeyRef.experiences);
    popoverController.dismiss();
}
onMounted(() => {
    console.log(data);
    const poi = data.poi as Poi;
    axios.get(`/api/poi/${poi.id}/experiences`).then((response: any) => {
        console.log(response);
    });
});
</script>
