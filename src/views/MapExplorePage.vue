<template>
  <ion-page>

    <ion-split-pane when="md" content-id="main">

      <ion-menu menu-id="journey-steps" content-id="main">
        <ion-toolbar>
          <ion-title>Journey</ion-title>
        </ion-toolbar>
        <ion-content>
          <ion-button>
            this is a button
          </ion-button>
          <ion-button>
            this is a button
          </ion-button>
          <ion-button>
            this is a button
          </ion-button>
        </ion-content>
      </ion-menu>
      <div id="main">
        <journeys-header />
        <ion-content class="map-wrap">
          <section class="map" ref="mapContainer"></section>
        </ion-content>
      </div>
    </ion-split-pane>
  </ion-page>

</template>

<script lang="ts" setup>
import {
  IonPage,
  IonContent,
  IonSplitPane,
  IonMenu,
  IonToolbar,
  IonTitle,
  IonButton,
  popoverController,
  onIonViewWillEnter
} from '@ionic/vue'

import JourneysHeader from '../components/JourneysHeader.vue';
import PoiCard from '../components/PoiCard.vue';
import { usePoiStore } from '../stores/usePoiStore'
import { Map, NavigationControl, Marker, LngLat, MapMouseEvent } from 'maplibre-gl'
import {  ref, onUnmounted, onActivated } from 'vue';

import haversine from 'haversine';
import router from '../router'

var mapContainer = ref()
var map = ref<Map>()
const usePoi = usePoiStore();
var start = ref()
var end = ref()

async function onPopOver(data: Poi, e: MapMouseEvent) {

  const popover = await popoverController.create({
    component: PoiCard,
    componentProps: { poi: data },
    event: e.originalEvent,
    size: 'auto',
    reference: 'event',
    side: 'top',
    alignment: 'center'
  })
  await popover.present();
}

onIonViewWillEnter(() => {
  const p = router.currentRoute.value.params
  if (p.start != undefined && p.end != undefined) {
    start.value = { longitude: p.start[0], latitude: p.start[1] }
    end.value = { longitude: p.end[0], latitude: p.end[1] }
    load();
  }
})

function  load()
{
  const apiKey = import.meta.env.VITE_MAPTILER_API_KEY
  const initialState = { lng: 6.5914, lat: 46.5338, zoom: 10 };


  map.value = new Map({
    container: mapContainer.value,
    style: `https://api.maptiler.com/maps/voyager/style.json?key=${apiKey}`,
    center: [initialState.lng, initialState.lat],
    zoom: initialState.zoom
  })
  map.value.once('render', () => {
    map.value?.resize();
  });

  map.value.once('load', () => {

    const midPoint = getMidPoint(
      new LngLat(start.value.longitude, start.value.latitude),
      new LngLat(end.value.longitude, end.value.latitude)
    )

    new Marker()
      .setLngLat([start.value.longitude, start.value.latitude])
      .addTo(map.value!)
    new Marker()
      .setLngLat([end.value.longitude, end.value.latitude])
      .addTo(map.value!)
    const dist = haversine(start.value, end.value, { unit: 'meter' })
    usePoi.searchBetween(midPoint.lat, midPoint.lng, dist / 2)
      .then(
        (response) => {
          map.value?.addSource('poi', {
            type: 'geojson',
            data: usePoi.poiRef,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50
          })

          map.value?.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'poi',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',
                100,
                '#f1f075',
                750,
                '#f28cb1'
              ],
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                100,
                30,
                750,
                40
              ]
            }
          })
          map.value?.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'poi',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 12
            }
          })
          map.value?.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'poi',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': '#11b4da',
              'circle-radius': 6,
              'circle-stroke-width': 1,
              'circle-stroke-color': '#fff'
            }
          });
          map.value?.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [start.value.longitude, start.value.latitude],
                  [end.value.longitude, end.value.latitude]
                ]
              }
            }
          })
          map.value?.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              "line-color": '#555',
              "line-width": 2
            }
          })
        })
  })

  map.value.on('click', 'clusters', (e) => {
    const features = map.value?.queryRenderedFeatures(e.point, {
      layers: ['clusters']
    })
    const clusterId = features![0].properties.cluster_id
    const source: maplibregl.GeoJSONSource = map.value?.getSource('poi') as maplibregl.GeoJSONSource
    source.getClusterExpansionZoom(
      clusterId,
      (err: any, zoom: any) => {
        if (err) return;
        if (features![0].geometry.type === 'Point') {
          map.value?.easeTo({
            center: [features![0].geometry.coordinates[0], features![0].geometry.coordinates[1]],
            zoom: zoom
          })
        }
      }
    )
  })

  map.value.on('click', 'unclustered-point', (e) => {
    const data = e.features![0].properties;
    onPopOver(data as Poi, e)
  })

  map.value?.addControl(new NavigationControl({}), 'top-right');
}
function getMidPoint(start: maplibregl.LngLat, end: maplibregl.LngLat) {
  const lat1 = start.lat * Math.PI / 180
  const lon1 = start.lng * Math.PI / 180
  const X1 = Math.cos(lat1) * Math.cos(lon1)
  const Y1 = Math.cos(lat1) * Math.sin(lon1)
  const Z1 = Math.sin(lat1)

  const lat2 = end.lat * Math.PI / 180
  const lon2 = end.lng * Math.PI / 180
  const X2 = Math.cos(lat2) * Math.cos(lon2)
  const Y2 = Math.cos(lat2) * Math.sin(lon2)
  const Z2 = Math.sin(lat2)

  const x = (X1 + X2) / 2
  const y = (Y1 + Y2) / 2
  const z = (Z1 + Z2) / 2

  var lon = Math.atan2(y, x)
  var hyp = Math.sqrt(x * x + y * y)
  var lat = Math.atan2(z, hyp)
  lat = lat * 180 / Math.PI
  lon = lon * 180 / Math.PI

  return {
    lat: lat,
    lng: lon
  }
}

onUnmounted(() => {
  map.value?.remove();
})
</script>

<style>
ion-split-pane {
  --side-min-width: 300px;
  --side-max-width: 300px;
}

.map-wrap {
  position: relative;
  width: 100%;
  height: 100%;
}

.map {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
