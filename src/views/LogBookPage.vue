<!-- eslint-disable vue/valid-v-for -->
<template>
    <ion-page id="main-content">
        <!--<ion-loading v-if="isLoading" />-->
        <ion-content>
            <ion-grid class="full-page">
                <ion-row class="full-page">
                    <ion-col v-bind:class="{ side: true, 'ion-hide-md-down': true }" ref="statisticsCol">
                        <ion-content>
                            <ion-row>
                                <ion-header>
                                    <ion-toolbar color="secondary">
                                        <ion-buttons slot="start">
                                            <ion-button @click="fetchJourneys()">
                                                <ion-icon
                                                    src="/src/assets/icon/return-up-back-outline.svg"
                                                    slot="icon-only">
                                                </ion-icon>
                                            </ion-button>
                                        </ion-buttons>
                                        <ion-title> Points of interest </ion-title>
                                        <ion-buttons slot="end">
                                            <ion-button>
                                                <ion-icon src="/src/assets/icon/filter-outline.svg" slot="icon-only">
                                                </ion-icon>
                                            </ion-button>
                                        </ion-buttons>
                                    </ion-toolbar>
                                    <ion-toolbar>
                                        <ion-searchbar> </ion-searchbar>
                                    </ion-toolbar>
                                </ion-header>
                            </ion-row>
                            <ion-row class="experience-list">
                                <ion-col>
                                    <DynamicScroller
                                        :items="usePoi.poiRef.features"
                                        :min-item-size="54"
                                        style="height: 100%">
                                        <template v-slot="{ item, index, active }">
                                            <DynamicScrollerItem :item="item" :active="active" :data-index="index">
                                                <ion-item
                                                    button
                                                    style="
                                                         {
                                                            width: 100%;
                                                        }
                                                    ">
                                                    <ion-thumbnail slot="start">
                                                        <ion-img :src="item.properties.thumbnail"> </ion-img>
                                                    </ion-thumbnail>
                                                    <ion-label>{{ item.properties.name }}</ion-label>
                                                </ion-item>
                                            </DynamicScrollerItem>
                                        </template>
                                    </DynamicScroller>
                                </ion-col>
                            </ion-row>
                        </ion-content>
                    </ion-col>
                    <ion-col ref="mapCol">
                        <JourneyMap
                            :mode="mode"
                            :stop-points="stopPoints"
                            :journeys="useUser.myJourneys"
                            :pois="usePoi.poiRef"
                            :journey-experiences="journeyExperiences!"
                            @loaded="fetchJourneys"
                            @create-new="fetchPois" />
                        <section v-if="mode == modes.logbook || mode == modes.viewJourney" class="journeys-slides">
                            <swiper
                                :slides-per-view="slidesPerView"
                                :initial-slide="useUser.myJourneys?.length"
                                :pagination="{ clickable: true }"
                                lazy
                                :modules="modules"
                                class="journeys"
                                ref="slides">
                                <swiper-slide v-for="item in useUser.myJourneys">
                                    <JourneyCard
                                        :journey="item"
                                        class="journey-card ion-margin"
                                        @header-clicked="showExperiences(item.id!)" />
                                </swiper-slide>
                            </swiper>
                        </section>
                    </ion-col>
                    <ion-col v-bind:class="{ side: true, 'ion-hide-sm-down': true }" ref="experiencesCol">
                        <ion-content>
                            <ion-row>
                                <ion-toolbar color="secondary">
                                    <ion-buttons slot="start">
                                        <ion-button @click="fetchJourneys()">
                                            <ion-icon
                                                src="/src/assets/icon/return-up-back-outline.svg"
                                                slot="icon-only">
                                            </ion-icon>
                                        </ion-button>
                                    </ion-buttons>
                                    <ion-title> Experiences </ion-title>
                                    <ion-buttons slot="end">
                                        <ion-button>
                                            <ion-icon src="/src/assets/icon/filter-outline.svg" slot="icon-only">
                                            </ion-icon>
                                        </ion-button>
                                    </ion-buttons>
                                </ion-toolbar>
                            </ion-row>
                            <ion-row class="experience-list">
                                <ion-col
                                    v-if="
                                        mode == modes.viewJourney &&
                                        useJourney.viewJourney &&
                                        useJourney.viewJourney.experiences &&
                                        useJourney.viewJourney.experiences.length > 0
                                    ">
                                    <DynamicScroller
                                        v-if="useJourney.viewJourney.experiences.length > 0"
                                        :items="useJourney.viewJourney.experiences"
                                        :min-item-size="54"
                                        style="height: 100%">
                                        <template v-slot="{ item, index, active }">
                                            <DynamicScrollerItem
                                                :item="item as ExperienceDto"
                                                :active="active"
                                                :data-index="index">
                                                <ExperienceCard
                                                    :experience="item"
                                                    :journey="useJourney.viewJourney.id"
                                                    @updated="showExperiences(useJourney.viewJourney.id!)" />
                                            </DynamicScrollerItem>
                                        </template>
                                    </DynamicScroller>
                                </ion-col>
                                <ion-col v-else-if="mode === modes.edition">
                                    <MapJourneySidebar
                                        v-if="mode === modes.edition"
                                        :start="useJourney.editJourney.start"
                                        :end="useJourney.editJourney.end"
                                        mode="edit"
                                /></ion-col>
                            </ion-row>
                        </ion-content>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-page>
</template>
<script lang="ts" setup>
import {
    IonHeader,
    IonLoading,
    IonIcon,
    IonPage,
    IonContent,
    IonGrid,
    IonCol,
    IonRow,
    IonButton,
    IonToolbar,
    IonButtons,
    modalController,
    onIonViewDidLeave,
    IonSearchbar,
    IonTitle,
    onIonViewWillEnter,
    onIonViewWillLeave,
    IonFabButton,
    IonImg,
    IonThumbnail,
    IonItem,
    IonFabList,
    IonLabel,
    IonFab,
    popoverController,
    onIonViewDidEnter
} from "@ionic/vue";
// Import Swiper and modules
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import JourneyCard from "components/Cards/JourneyCard.vue";
import PoiCard from "components/Cards/PoiCard.vue";
import ExperienceCard from "components/Cards/ExperienceCard.vue";
import CreateJourneyModal from "components/Modals/CreateJourneyModal.vue";

import { ref } from "vue";

import { useUserStore } from "stores/useUserStore";
import { usePoiStore } from "stores/usePoiStore";
import { useJourneyStore } from "stores/useJourneyStore";

import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Navigation, Lazy } from "swiper";

import { ExperienceDto, PoiDto } from "types/dtos";
import GeoJSON from "geojson";

import { GeocodedData } from "types/journeys";
import JourneyMap from "components/JourneyMap.vue";
import mapboxgl, { MapMouseEvent, NavigationControl } from "mapbox-gl";
import haversine from "haversine";
import { reverseGeocode, getLocalityAndCountry } from "google/googleGeocoder";
import MapJourneySidebar from "components/MapJourneySidebar.vue";
import { Properties } from "maplibre-gl";

const modes = {
    logbook: "logbook",
    exploration: "exploration",
    edition: "edition",
    viewJourney: "viewJourney"
};
const mapLayer = {
    journey_route: "journey_route",
    journey_list: "journey_list",
    journey_list_route: "journey_list_route",
    journey_experiences: "journey_experiences",
    journey_cluster: "journey_clusters",
    poi_list: "poi_list",
    poi_cluster: "poi_cluster"
};

const useUser = useUserStore();
const useJourney = useJourneyStore();
const usePoi = usePoiStore();

const mode = ref(modes.logbook);

const isLoading = ref(true);

const slidesPerView = ref(3);
const modules = ref([Pagination, Navigation, Lazy]);
const slides = ref();

let statisticsCol = ref<typeof IonCol>();
let experiencesCol = ref();
let mapCol = ref();

const stopPoints = ref<number[][]>();
const journeyExperiences = ref<GeoJSON.FeatureCollection>();

async function fetchJourneys() {
    mode.value = modes.logbook;
    await useUser.fetchMyJourneys();
    updateView();
}
async function fetchPois(data: any) {
    console.log(data);
    const radius = getRadius(data.start.coordinates, data.end.coordinates);
    const mid = getMidPoint(data.start.coordinates, data.end.coordinates);
    useJourney.setJourneyStartEnd(data.start, data.end);
    await usePoi.searchBetween(mid.lat, mid.lng, radius);
    mode.value = modes.edition;
}
function getMidPoint(start: mapboxgl.LngLat, end: mapboxgl.LngLat) {
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

    let lon = Math.atan2(y, x);
    const hyp = Math.sqrt(x * x + y * y);
    let lat = Math.atan2(z, hyp);
    lat = (lat * 180) / Math.PI;
    lon = (lon * 180) / Math.PI;

    return {
        lat: lat,
        lng: lon
    };
}
function getRadius(start: mapboxgl.LngLat, end: mapboxgl.LngLat): number {
    const r = haversine(
        {
            latitude: start.lat,
            longitude: start.lng
        },
        {
            latitude: end.lat,
            longitude: end.lng
        },
        { unit: "meter" }
    );
    return r / 2;
}

async function showExperiences(id: string) {
    if (useJourney.viewJourney.id !== id) useJourney.viewJourney = await useJourney.getJourney(id);
    mode.value = modes.viewJourney;
    const featureCollection: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: []
    };
    useJourney.viewJourney.experiences?.forEach((exp) => {
        featureCollection.features.push({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [exp.poi.location.longitude, exp.poi.location.latitude]
            },
            properties: exp.experience,
            id: exp.poi.id
        });
    });

    const coords = Array<number[]>();

    coords.push([useJourney.viewJourney.start?.longitude!, useJourney.viewJourney.start?.latitude!]);
    featureCollection.features.forEach((element) => {
        coords.push((element.geometry as GeoJSON.Point).coordinates);
    });
    coords.push([useJourney.viewJourney.end?.longitude!, useJourney.viewJourney.end?.latitude!]);

    const center = getMidPoint(
        new mapboxgl.LngLat(useJourney.viewJourney.start?.longitude!, useJourney.viewJourney.start?.latitude!),
        new mapboxgl.LngLat(useJourney.viewJourney.end?.longitude!, useJourney.viewJourney.end?.latitude!)
    );

    featureCollection.features.push({
        type: "Feature",
        properties: {
            start: useJourney.viewJourney.start,
            end: useJourney.viewJourney.end,
            center: center
        },
        geometry: {
            type: "LineString",
            coordinates: coords
        },
        id: useJourney.viewJourney.id
    });

    journeyExperiences.value = featureCollection;
}

function updateView() {
    if (slides.value != null) {
        const width = slides.value.$el.clientWidth;
        console.log(width);
        if (width < 800) {
            slidesPerView.value = 1;
        } else if (width < 1100) {
            slidesPerView.value = 2;
        } else if (width < 1500) {
            slidesPerView.value = 3;
        } else {
            if (useUser.myJourneys?.length! < 4) {
                slidesPerView.value = useUser.myJourneys?.length!;
            } else {
                slidesPerView.value = Math.floor(width / 300);
            }
        }
    }
    console.log(slidesPerView.value);
}

onIonViewWillLeave(() => {
    window.removeEventListener("resize", updateView);
});
onIonViewDidEnter(async () => {
    window.addEventListener("resize", updateView);
    //updateView();
    /*await JourneysMap.loadMap(
        "pk.eyJ1IjoiaGV5bWFudWVsIiwiYSI6ImNsOXR1Zm5tbDFlYm8zdXRmaDRwY21qYXoifQ.3A8osuJSSk3nzULihiAOPg",
        import.meta.env.VITE_MAPTILER_API_KEY,
        "Map"
    );
    map.value = await JourneysMap.getMap()!;
    if (map.value?.isStyleLoaded()) {
        setData();
    }
    map.value?.on("sourcedata", (e: any) => {
        if (e.isSourceLoaded && e.sourceId === mapLayer.journey_list && e.sourceDataType == "metadata")
            isLoading.value = false;
        else if (e.isSourceLoaded && e.sourceId === mapLayer.journey_route) isLoading.value = false;
    });
    map.value?.once("load", () => {
        setData();
        map.value?.resize();
    });

    map.value?.once("style.load", () => {
        map.value?.setFog({});
    });*/
});
/*
onIonViewWillLeave(() => {
    window.removeEventListener("resize", updateView);
});
onIonViewDidLeave(() => {
    JourneysMap.clearMap(true);
});

function setData() {
    useJourney.viewJourney = {};
    JourneysMap.clearMap(false);
    startMarker.value?.remove();
    endMarker.value?.remove();
    stopPoints.value = [];
    const geoJSONJourney: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: []
    };
    const connections: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: []
    };
    useUser.myJourneys?.forEach((journey) => {
        geoJSONJourney.features.push(useJourney.journeyToGeojson(journey)[0]);
        geoJSONJourney.features.push(useJourney.journeyToGeojson(journey)[1]);
        connections.features.push({
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [journey.start?.longitude!, journey.start?.latitude!],
                    [journey.end?.longitude!, journey.end?.latitude!]
                ]
            },
            properties: {
                title: journey.title
            }
        });
    });

    JourneysMap.addSource(mapLayer.journey_list, geoJSONJourney);
    JourneysMap.addSource(mapLayer.journey_route, connections);
    usePoi.clear();
    mode.value = modes.logbook;
}
function updateView() {
    if (slides.value != null) {
        const width = slides.value.$el.clientWidth;
        if (width < 800) {
            slidesPerView.value = 1;
        } else if (width < 1100) {
            slidesPerView.value = 2;
        } else if (width < 1500) {
            slidesPerView.value = 3;
        } else {
            if (useUser.myJourneys?.length! < 4) {
                slidesPerView.value = useUser.myJourneys?.length!;
            } else {
                slidesPerView.value = Math.floor(width / 300);
            }
        }
    }
}

async function showExperiences(id: string) {
    if (useJourney.viewJourney.id !== id) useJourney.viewJourney = await useJourney.getJourney(id);
    const map = await JourneysMap.getMap();
    JourneysMap.clearSource(mapLayer.journey_experiences);
    JourneysMap.clearSource(mapLayer.journey_route);
    JourneysMap.clearSource(mapLayer.journey_list);
    const experiences: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: []
    };
    useJourney.viewJourney.experiences?.forEach((exp) => {
        experiences.features.push({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [exp.poi.location.longitude, exp.poi.location.latitude]
            },
            properties: exp.experience,
            id: exp.poi.id
        });
    });
    JourneysMap.addSource(mapLayer.journey_experiences, experiences, useJourney.viewJourney);

    const coords = Array<number[]>();

    coords.push([useJourney.viewJourney.start?.longitude!, useJourney.viewJourney.start?.latitude!]);
    experiences.features.forEach((element) => {
        coords.push((element.geometry as GeoJSON.Point).coordinates);
    });
    coords.push([useJourney.viewJourney.end?.longitude!, useJourney.viewJourney.end?.latitude!]);

    const route: GeoJSON.Feature = {
        type: "Feature",
        properties: {},
        geometry: {
            type: "LineString",
            coordinates: coords
        }
    };
    JourneysMap.addSource(mapLayer.journey_route, route);

    const center = getMidPoint(
        new mapboxgl.LngLat(useJourney.viewJourney.start?.longitude!, useJourney.viewJourney.start?.latitude!),
        new mapboxgl.LngLat(useJourney.viewJourney.end?.longitude!, useJourney.viewJourney.end?.latitude!)
    );
    map!.easeTo({
        animate: true,
        duration: 3000,
        center: [center.lng, center.lat],
        zoom: 10
    });
}

function getRadius(start: mapboxgl.LngLat, end: mapboxgl.LngLat): number {
    const r = haversine(
        {
            latitude: start.lat,
            longitude: start.lng
        },
        {
            latitude: end.lat,
            longitude: end.lng
        },
        { unit: "meter" }
    );
    return r / 2;
}

function getMidPoint(start: mapboxgl.LngLat, end: mapboxgl.LngLat) {
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

    let lon = Math.atan2(y, x);
    const hyp = Math.sqrt(x * x + y * y);
    let lat = Math.atan2(z, hyp);
    lat = (lat * 180) / Math.PI;
    lon = (lon * 180) / Math.PI;

    return {
        lat: lat,
        lng: lon
    };
}

var startPoint = ref<GeocodedData>({
    address: "",
    coordinates: new mapboxgl.LngLat(-1, -1)
});
var endPoint = ref<GeocodedData>({
    address: "",
    coordinates: new mapboxgl.LngLat(-1, -1)
});

var radius = ref(-1);
var hideSidebar = ref(true);
var isSaved = ref(false);
var isValid = ref(false);

var startMarker = ref<mapboxgl.Marker>();
var endMarker = ref<mapboxgl.Marker>();
const stopPoints = ref<number[][]>([]);

async function openJourneyCreationModal() {
    const modal = await modalController.create({
        component: CreateJourneyModal
    });
    modal.present();

    const result = await modal.onDidDismiss();
    if (result.role == "create") {
        console.log(result);
        startPoint.value = result.data.start;
        endPoint.value = result.data.end;
        await prepare();
    }
}

function panTo(coordinates: number[]) {
    map.value?.easeTo({
        center: [coordinates[0], coordinates[1]],
        zoom: 16
    });
}

function reorderedSteps() {
    var steps: number[][] = [];
    steps.push([startPoint.value.coordinates.lng, startPoint.value.coordinates.lat]);
    useJourney.editJourney.experiences?.forEach((exp) => {
        steps.push([exp.poi.location.longitude!, exp.poi.location.latitude!]);
    });
    steps.push([endPoint.value.coordinates.lng, endPoint.value.coordinates.lat]);
    stopPoints.value = steps;
    isSaved.value = false;
}
function addStep(coord: number[]) {
    console.log(coord);
    stopPoints.value.splice(stopPoints.value.length - 1, 0, coord);
    JourneysMap.addStopPoint(stopPoints.value);
}

async function prepare() {
    JourneysMap.clearMap(false);
    useJourney.editJourney.experiences = [];

    useJourney.setJourneyStartEnd(startPoint.value, endPoint.value);

    radius.value = haversine(
        {
            latitude: startPoint.value.coordinates.lat,
            longitude: startPoint.value.coordinates.lng
        },
        {
            latitude: endPoint.value.coordinates.lat,
            longitude: endPoint.value.coordinates.lng
        },
        { unit: "meter" }
    );
    load();
}
function onMarkerDrag(marker: mapboxgl.Marker, pos: string) {
    marker.on("dragend", () => {
        isLoading.value = true;
        reverseGeocode(marker.getLngLat().lat, marker.getLngLat().lng).then((resp) => {
            const result = getLocalityAndCountry(resp!);
            if (result.country != undefined && result.locality != undefined) {
                useJourney.editJourney.experiences = [];
                if (pos === "start") {
                    startPoint.value.address = result.locality + ", " + result.country;
                    startPoint.value.coordinates = marker.getLngLat();
                    useJourney.editJourney.start = {
                        address: startPoint.value.address,
                        latitude: startPoint.value.coordinates.lat,
                        longitude: startPoint.value.coordinates.lng
                    };
                } else if (pos === "end") {
                    endPoint.value.address = result.locality + ", " + result.country;
                    endPoint.value.coordinates = marker.getLngLat();
                    useJourney.editJourney.end = {
                        address: endPoint.value.address,
                        latitude: endPoint.value.coordinates.lat,
                        longitude: endPoint.value.coordinates.lng
                    };
                }
                radius.value = getRadius(startPoint.value.coordinates, endPoint.value.coordinates);
                const mid = getMidPoint(startPoint.value.coordinates, endPoint.value.coordinates);
                usePoi.searchBetween(mid.lat, mid.lng, radius.value).then(async (resp) => {
                    if (resp == true) {
                        stopPoints.value = [];
                        addStep([startPoint.value.coordinates.lng, startPoint.value.coordinates.lat]);
                        addStep([endPoint.value.coordinates.lng, endPoint.value.coordinates.lat]);
                        JourneysMap.clearSource(mapLayer.poi_list);
                        JourneysMap.addSource(mapLayer.poi_list, usePoi.poiRef, useJourney.editJourney);
                    }
                    isLoading.value = false;
                });
            }
        });
    });
}
async function load() {
    isLoading.value = true;
    isValid.value = true;
    mode.value = modes.edition;
    const midPoint = {
        lng: getMidPoint(startPoint.value.coordinates, endPoint.value.coordinates).lng,
        lat: getMidPoint(startPoint.value.coordinates, endPoint.value.coordinates).lat,
        zoom: 10
    };

    usePoi.searchBetween(midPoint.lat, midPoint.lng, radius.value / 2).then(async (response) => {
        hideSidebar.value = usePoi.poiRef.features.length == 0;
        if (response) {
            JourneysMap.addSource(mapLayer.poi_list, usePoi.poiRef, useJourney.editJourney);
            addStep([startPoint.value.coordinates.lng, startPoint.value.coordinates.lat]);
            addStep([endPoint.value.coordinates.lng, endPoint.value.coordinates.lat]);
            JourneysMap.addStopPoint(stopPoints.value);
            startMarker.value = await JourneysMap.createMarker(
                "src/assets/icon/flag-start.svg",
                useJourney.editJourney.start?.longitude!,
                useJourney.editJourney.start?.latitude!,
                "cover",
                "20px"
            );
            endMarker.value = await JourneysMap.createMarker(
                "src/assets/icon/flag-end.svg",
                useJourney.editJourney.end?.longitude!,
                useJourney.editJourney.end?.latitude!,
                "cover",
                "20px"
            );
            startMarker.value.setDraggable(true);
            endMarker.value.setDraggable(true);
            onMarkerDrag(startMarker.value, "start");
            onMarkerDrag(endMarker.value, "end");
        }
        //finish loading
        isLoading.value = false;
    });

    map.value?.on("click", mapLayer.poi_cluster, (e) => {
        onClusterClick(e);
    });

    map.value?.on("click", mapLayer.poi_cluster + "_unclustered", (e) => {
        e.features![0].properties!.location = JSON.parse(e.features![0].properties!.location);
        onPopOver(e.features![0].properties as PoiDto, e);
    });

    map.value?.addControl(new NavigationControl({}), "bottom-right");
}

async function onPopOver(data: PoiDto, e: MapMouseEvent) {
    const popover = await popoverController.create({
        component: PoiCard,
        componentProps: { poi: data },
        event: e.originalEvent,
        size: "auto",
        reference: "event",
        side: "top",
        alignment: "center"
    });
    await popover.present();

    const didDissmiss = await popover.onDidDismiss();
    if (didDissmiss.data != undefined) {
        addStep([data.location.longitude, data.location.latitude]);
    }
}

function onClusterClick(e: MapMouseEvent) {
    const features = map.value?.queryRenderedFeatures(e.point, {
        layers: [mapLayer.poi_cluster]
    });
    const clusterId = features![0].properties!.cluster_id;
    const source: maplibregl.GeoJSONSource = map.value?.getSource(mapLayer.poi_list) as maplibregl.GeoJSONSource;
    source.getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
        if (err) return;
        if (features![0].geometry.type === "Point") {
            map.value?.easeTo({
                center: [features![0].geometry.coordinates[0], features![0].geometry.coordinates[1]],
                zoom: zoom
            });
        }
    });
}*/
</script>
<style lang="scss">
.side {
    min-width: 200px;
    max-width: 400px;
}
.full-page {
    height: 100%;
    width: 100%;
}

.map-section {
    height: 95%;
}
.mid-page {
    height: 45%;
    overflow-y: auto;
}

.swiper-slide {
    text-align: left;
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

.experience-list {
    overflow-y: auto;
}

.journey-card {
    min-width: 300px;
    max-width: 350px;

    min-height: 400px;
    max-height: 450px;

    height: 90%;
    width: 100%;
}

.journeys {
    min-height: 300px;
    height: 100%;
    width: 100%;
}

.journeys-slides {
    position: absolute;
    bottom: 20px;
    height: 35%;
    max-height: 450px;
    min-height: 400px;
    width: 100%;
    z-index: 999;
}
</style>
