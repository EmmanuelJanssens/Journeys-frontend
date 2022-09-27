<template>
  <ion-content ref="popover">
    <section v-if="suggestions != null">
      <ion-list v-for="suggestion in (suggestions.predictions as Array<google.maps.places.AutocompletePrediction>)">
        <ion-item button @click="close(suggestion.description)">
          <ion-label>
            {{suggestion.description}}
          </ion-label>
        </ion-item>
      </ion-list>

    </section>

  </ion-content>
</template>

<script lang="ts" setup>
import {
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  popoverController
} from '@ionic/vue'
import { LngLat } from 'maplibre-gl';

const suggestions = defineProps(['predictions'])

function close(label: string){

  //const latlng  = new LngLat(longitude,latitude)
  popoverController.dismiss(label)
}
</script>
