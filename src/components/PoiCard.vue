<template>
    <ion-card>
      <ion-card-header>
        <ion-card-title>{{(data.poi as Poi).name}}</ion-card-title>
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
            <ion-col>
              description
            </ion-col>
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
} from '@ionic/vue';
import { onMounted } from 'vue';
import axios, { AxiosError } from 'axios';
import { useJourneyStore } from '../stores/useJourneyStore';
const data = defineProps(['poi'])

const useJourney = useJourneyStore()

function addToJourney(poi: Poi)
{
  useJourney.addToJourney(poi)
  popoverController.dismiss()
}
onMounted(() => {
  console.log(data)
  const poi = data.poi as Poi
  axios.get(`/api/pois/${poi.id}/experiences`)
    .then((response) =>  {
      console.log(response)
    })
})
</script>
