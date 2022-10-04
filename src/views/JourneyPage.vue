<template>
    <ion-page>
        <ion-content>
            <ion-grid style="height: 100%">
                <ion-row style="height: 100%">
                    <ion-col>
                        <ion-content class="map-wrap">
                            <section class="map" ref="mapContainer"></section>
                        </ion-content>
                    </ion-col>
                    <ion-col class="sidebar">
                        <map-journey-sidebar
                            :start="journey?.start!"
                            :end="journey?.end!" />
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-page>
</template>
<script lang="ts" setup>
import {
    IonPage,
    IonGrid,
    IonRow,
    IonCol,
    IonContent,
    onIonViewWillEnter
} from "@ionic/vue";
import { LngLat, Map, Marker, NavigationControl } from "maplibre-gl";
import router from "router/router";
import { useJourneyStore } from "stores/useJourneyStore";
import { PoiGeoJsonData } from "types/journeys";
import { ref } from "vue";
import MapJourneySidebar from "components/MapJourneySidebar.vue";
import { JourneyDto } from "types/dtos";
const journey = ref<JourneyDto>();
const useJourney = useJourneyStore();

const start = ref("");
const end = ref("");
onIonViewWillEnter(() => {
    const id: string = router.currentRoute.value.params.id as string;
    start.value = router.currentRoute.value.params.start as string;
    end.value = router.currentRoute.value.params.end as string;
    load(id);
});

var map = ref<Map>();
var mapContainer = ref();
async function load(id: string) {
    await useJourney.getJourney(id).then((response) => {
        journey.value = response;
        useJourney.journeyRef.experiences = journey.value.experiences;
        console.log(journey.value);
    });
    const start = new LngLat(
        journey.value?.start?.longitude!,
        journey.value?.start?.latitude!
    );
    const end = new LngLat(
        journey.value?.end?.longitude!,
        journey.value?.end?.latitude!
    );

    const mid = getMidPoint(start, end);
    const midPoint = {
        lng: mid.lng,
        lat: mid.lat,
        zoom: 10
    };

    const apiKey = import.meta.env.VITE_MAPTILER_API_KEY;
    map.value = new Map({
        container: mapContainer.value,
        style: `https://api.maptiler.com/maps/voyager/style.json?key=${apiKey}`,
        center: mid,
        zoom: midPoint.zoom
    });

    map.value?.once("render", () => {
        map.value?.resize();
    });

    map.value.once("load", () => {
        new Marker().setLngLat(start).addTo(map.value!);
        new Marker().setLngLat([end.lng, end.lat]).addTo(map.value!);

        const poisCollection: PoiGeoJsonData = {
            crs: {
                properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" },
                type: "name"
            },
            features: [],
            type: "FeatureCollection"
        };

        journey.value?.experiences!.forEach((element) => {
            poisCollection.features.push({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [
                        element.poi.location!.longitude,
                        element.poi.location!.latitude
                    ]
                },
                properties: element.poi,
                id: element.poi.id
            });
        });
        map.value?.addSource("pois", {
            type: "geojson",
            data: poisCollection
        });
        console.log(poisCollection);
        map.value?.addLayer({
            id: "journey-pois",
            type: "circle",
            source: "pois",
            paint: {
                "circle-color": "#11b4da",
                "circle-radius": 6,
                "circle-stroke-width": 1,
                "circle-stroke-color": " #fff"
            }
        });

        const coords = Array<number[]>();
        coords.push(start.toArray() as Array<number>);
        poisCollection.features.forEach((element) => {
            coords.push(element.geometry.coordinates);
        });
        coords.push(end.toArray());

        console.log(coords);
        map.value?.addSource("route", {
            type: "geojson",
            data: {
                type: "Feature",
                propreties: {},
                geometry: {
                    type: "LineString",
                    coordinates: coords
                }
            }
        });
        map.value?.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: {
                "line-join": "round",
                "line-cap": "round"
            },
            paint: {
                "line-color": "#555",
                "line-width": 2
            }
        });
    });
    map.value?.addControl(new NavigationControl({}), "bottom-right");
}

function getMidPoint(start: maplibregl.LngLat, end: maplibregl.LngLat) {
    const lat1 = (start.lat * Math.PI) / 180;
    const lon1 = (start.lng * Math.PI) / 180;
    const X1 = Math.cos(lat1) * Math.cos(lon1);
    const Y1 = Math.cos(lat1) * Math.sin(lon1);
    const Z1 = Math.sin(lat1);

    const lat2 = (end.lat * Math.PI) / 180;
    const lon2 = (end.lng * Math.PI) / 180;
    const X2 = Math.cos(lat2) * Math.cos(lon2);
    const Y2 = Math.cos(lat2) * Math.sin(lon2);
    const Z2 = Math.sin(lat2);

    const x = (X1 + X2) / 2;
    const y = (Y1 + Y2) / 2;
    const z = (Z1 + Z2) / 2;

    var lon = Math.atan2(y, x);
    var hyp = Math.sqrt(x * x + y * y);
    var lat = Math.atan2(z, hyp);
    lat = (lat * 180) / Math.PI;
    lon = (lon * 180) / Math.PI;

    return {
        lat: lat,
        lng: lon
    };
}
</script>

<style>
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
.sidebar {
    max-width: 300px;
    min-width: 200px;
}
</style>
