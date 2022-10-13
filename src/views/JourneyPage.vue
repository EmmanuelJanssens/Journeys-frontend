<template>
    <ion-page>
        <ion-content>
            <ion-grid style="height: 100%">
                <ion-row style="height: 100%">
                    <ion-col>
                        <ion-content class="map-wrap">
                            <section class="map" ref="mapContainer"></section>
                        </ion-content>
                        <section class="experiences">
                            <swiper
                                :slides-per-view="3"
                                :space-between="50"
                                :initial-slide="0"
                                navigation
                                lazy
                                :modules="modules">
                                <swiper-slide
                                    v-for="exp in journey?.experiences"
                                    v-bind:key="exp.poi.id">
                                    <experience-card
                                        :title="exp.poi.name"
                                        :description="
                                            exp.experience.description
                                        "
                                        :date="exp.experience.date" />
                                </swiper-slide>
                            </swiper>
                        </section>
                    </ion-col>
                    <ion-col class="sidebar">
                        <map-journey-sidebar
                            :start="journey?.start!"
                            :end="journey?.end!"
                            mode="view" />
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

import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { Navigation, Lazy } from "swiper";
import ExperienceCard from "components/Cards/ExperienceCard.vue";
const journey = ref<JourneyDto>();
const useJourney = useJourneyStore();

//swiper modules
const modules = ref([Navigation, Lazy]);
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

.experiences {
    position: absolute;
    bottom: 100px;
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    width: 70%;
    height: 40%;
}

.swiper {
    width: 100%;
    height: 100%;
}

.swiper-slide {
    text-align: center;
    font-size: 18px;

    /* Center slide text vertically */
    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    -webkit-align-items: center;
    align-items: center;
}
</style>
