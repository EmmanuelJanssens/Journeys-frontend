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
      <ion-item>
          <ion-label>
            <ion-icon src="/src/assets/icon/logo-google.svg"></ion-icon>
            <ion-text class="google" color="medium"> Powered by google</ion-text>
          </ion-label>
        </ion-item>
    </section>
  </ion-content>
</template>

<script lang="ts" setup>
import {
  IonText,
  IonIcon,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  popoverController,
onIonViewDidEnter
} from '@ionic/vue'
import { onMounted } from 'vue';

const suggestions = defineProps(['predictions'])
function close(label: string){
  popoverController.dismiss(label)
}

</script>

<style>
ion-icon{
  font-size: 10px;
}
.google{
  font-size: 10px;
}
</style>
