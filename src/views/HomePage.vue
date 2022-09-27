<template>
  <ion-page id="main-content">
    <journeys-header />
    <ion-content :fullscreen="true">
      <ion-grid :fixed="true">
        <ion-row class="ion-align-items-center ion-justify-content-center ion-hide-sm-down journey">
          <ion-col size="3">
            <ion-row>
              <ion-searchbar placeholder="Starting point" debounce="500" id="start-point" :value="start.text"
                @ionChange="onPopOver($event,'start')" @ionClear="start.text=''" />
            </ion-row>
          </ion-col>
          <ion-col size="3">
            <ion-searchbar placeholder="Destination" debounce="500" id="end-point" :value="end.text"
              @ionClear="end.text=''" @ionChange="onPopOver($event,'end')" />
          </ion-col>
          <ion-col size="3">
            <ion-button color="primary" @click="gotoJourneyMap()">Start
            </ion-button>
          </ion-col>
        </ion-row>
        <ion-row class="ion-align-items-center" id="row">
          <ion-col size="7">
            <ion-label class="ion-text-wrap">
              <h1>Find your next adventure</h1>
              <p class="ion-text-justify">
                Plan places you want to visit be it local, cantonal or national,
                plan as you go and visualize your trip. Choose from many of our Points Of Interest,
                shared by other members Save your journey and come back to it anytime to edit your story
                Inspire Others by sharing your experiences within the community
              </p>
            </ion-label>
          </ion-col>
          <ion-col size="5">
            <img src="../assets/map_carte.png" />
          </ion-col>
        </ion-row>
        <ion-row class="ion-align-items-center" id="row">
          <ion-col size="5">
            <img src="../assets/featureImg2.png" />
          </ion-col>
          <ion-col size="7">
            <ion-label class="ion-text-wrap ion-text-justify">
              <h1>share your story</h1>
              <p class=" ion-text-justif">
                Have you been to a place that no one else has seen ?
                Share them on our site and show the world your experiences.
                Create an account to add your new points of interest Look
                for the place you want to add on our interactive map Upload your pictures,
                and write your experience
              </p>
            </ion-label>
          </ion-col>
        </ion-row>
        <ion-row size="2" class="ion-align-items-center" id="row">
          <ion-col size="7">
            <ion-label class="ion-text-wrap">
              <h1>Journayl your trip</h1>
              <p class="ion-text-justify">
                Complete your dashboard with various adventures, save your memories to keep them forever.
                Thanks to our user friendly dashboard you will be able to edit your cards on the go or
                after you have completed your trip.
              </p>
            </ion-label>
          </ion-col>
          <ion-col size="5">
            <img src="../assets/featureImg3.png" />
          </ion-col>
        </ion-row>
      </ion-grid>
      <login-modal />
    </ion-content>
    <ion-footer>
      <ion-title>footer</ion-title>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  IonContent,
  IonPage,
  IonTitle,
  IonFooter,
  IonSearchbar,
  IonButton,
  IonLabel,
  IonGrid,
  IonCol,
  IonRow,
  popoverController,
  SearchbarCustomEvent,
  onIonViewWillEnter
} from '@ionic/vue'

import { onMounted, ref } from 'vue';
import { Loader } from '@googlemaps/js-api-loader'
import { LngLat } from 'maplibre-gl';

import LoginModal from '../components/LoginModal.vue'
import JourneysHeader from '../components/JourneysHeader.vue';
import GeocodingSuggestion from '../components/GeocodingSuggestion.vue';
import router from '../router';



const loader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['places', 'geometry']
})

var popoverIsOpen = false;
var predictionsList = ref<Array<google.maps.places.Autocomplete>>()
var start = ref({ text: "", coordinates: new LngLat(-1, -1) })
var end = ref({ text: "", coordinates: new LngLat(-1, -1) })

var service: google.maps.places.AutocompleteService
var geocoder: google.maps.Geocoder

onMounted(() => {
  loader.load().then((google) => {
    service = new google.maps.places.AutocompleteService()
    geocoder = new  google.maps.Geocoder()
  })
})

onIonViewWillEnter(() => {
  predictionsList.value = []
  start.value = { text: "", coordinates: new LngLat(-1, -1) }
  end.value = { text: "", coordinates: new LngLat(-1, -1) }
})

function gotoJourneyMap() {
  if (start.value.coordinates.lat > 0 && end.value.coordinates.lat > 0) {
    const route =
    {
      name: 'map',
      params: {
        start: start.value.coordinates.toArray(),
        end: end.value.coordinates.toArray()
      }
    }
    router.push(route)
  }
}

async function showPopOver(ev: Event, collection: Array<google.maps.places.AutocompletePrediction>, point: string) {

  const popover = await popoverController.create({
    component: GeocodingSuggestion,
    componentProps: { predictions: collection },
    animated: false,
    event: ev,
    size: 'auto',
    side: 'bottom',
    alignment: 'center',
    showBackdrop: false,
    keyboardClose: false,
    dismissOnSelect: true,
    id: 'suggestionPopover'
  })
  await popover.present();
  popoverIsOpen = true;
  const { data, role } = await popover.onDidDismiss();
  const label = data as string
  if (label.length > 0 && (label !== 'dismissPrevious' || role !== 'backdrop')) {
    const request : google.maps.GeocoderRequest = {
        address: label,
        componentRestrictions: {country: 'ch'}
    }
    geocoder.geocode(request)
      .then(response => {
        const coords = new LngLat(response.results[0].geometry.location.lng(),response.results[0].geometry.location.lat())
        if (point == 'start') {
          start.value = {
            text: label,
            coordinates: coords
          }
        }
        else if (point == 'end') {
          end.value = {
            text: label,
            coordinates: coords
          }
        }
        popoverIsOpen = false
      })
  }
}

function onPopOver(ev: SearchbarCustomEvent, point: string) {
  if (popoverIsOpen) {
    popoverController.dismiss('dismissPrevious')
  }
  if (ev.detail.value?.length! >= 3) {
    if ((point === 'start' && (ev.target.value !== start.value.text)) || (point === 'end' && (ev.target.value !== end.value.text))) {
      const request: google.maps.places.AutocompletionRequest = {
        input: ev.detail.value!,
        types: ["locality"],
        componentRestrictions: { country: 'ch' }
      }
      service.getPlacePredictions(request).then((resp) => {
        showPopOver(ev, resp.predictions, point)
      }).catch((e) => {
        //Do something
      })
    }
  }
}
</script>

<style>
.journey {
  height: 300px;
  background-image: url(../assets/hero-bg.jpg);
  background-repeat: no-repeat;
  background-size: cover;
}

ion-grid {
  --ion-grid-padding: 0px;
}

ion-toolbar {
  --background: #DCCABF;
  --padding-start: 10px;
}

ion-chip {
  --background: var(--ion-color-primary)
}
</style>
