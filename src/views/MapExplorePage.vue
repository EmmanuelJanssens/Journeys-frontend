<template>
    <ion-page id="main-content">
        <ion-loading v-if="isLoading" />
        <ion-content>
            <ion-grid style="height: 100%">
                <ion-row style="height: 100%">
                    <ion-col :hidden="false" class="sidebar-items-list ion-hide-xl-down">
                        <DynamicScroller :items="usePoi.poiRef.features" :min-item-size="54" style="height: 100%">
                            <template v-slot="{ item, index, active }">
                                <DynamicScrollerItem :item="item" :active="active" :data-index="index">
                                    <ion-item button @click="panTo(item.geometry.coordinates)">
                                        <ion-thumbnail slot="start">
                                            <ion-img :src="item.properties.thumbnail"> </ion-img>
                                        </ion-thumbnail>
                                        <ion-label>{{ item.properties.name }}</ion-label>
                                    </ion-item>
                                </DynamicScrollerItem>
                            </template>
                        </DynamicScroller>

                        <!--<RecycleScroller
                            v-if="!isLoading"
                            style="height: 100%"
                            :items="usePoi.poiRef.features"
                            :item-size="50">
                            <template #default="{ item }">
                                <ion-item
                                    button
                                    @click="panTo(item.geometry.coordinates)">
                                    <ion-thumbnail slot="start">
                                        <ion-img
                                            src="src/assets/placeholder.png">
                                        </ion-img>
                                    </ion-thumbnail>
                                    <ion-label>{{
                                        item.properties.name
                                    }}</ion-label>
                                </ion-item>
                            </template>
                        </RecycleScroller>-->
                    </ion-col>
                    <ion-col class="map-col">
                        <ion-searchbar class="floating search"></ion-searchbar>
                        <ion-button size="small" class="ion-margin-start ion-margin-top floating icon-button">
                            <ion-icon
                                class="icon-button"
                                slot="icon-only"
                                src="/src/assets/icon/filter-outline.svg"></ion-icon>
                        </ion-button>

                        <ion-content class="map-wrap">
                            <ion-fab v-if="!isLoading" vertical="top" horizontal="end" slot="fixed">
                                <ion-fab-button>
                                    <ion-icon size="large" src="/src/assets/icon/chevron-down-outline.svg"></ion-icon>
                                </ion-fab-button>
                                <ion-fab-list>
                                    <ion-fab-button @click="openModal(SaveJourneyModal)">
                                        <ion-icon size="large" src="/src/assets/icon/save-outline.svg"></ion-icon>
                                    </ion-fab-button>
                                    <ion-fab-button>
                                        <ion-icon size="large" src="/src/assets/icon/trash-bin-outline.svg"></ion-icon>
                                    </ion-fab-button>
                                </ion-fab-list>
                            </ion-fab>

                            <section class="map" ref="mapContainer"></section>
                        </ion-content>
                    </ion-col>
                    <ion-col v-if="!isLoading" class="journeys-items ion-hide-md-down">
                        <map-journey-sidebar
                            v-if="!isLoading"
                            :start="startPoint"
                            :end="endPoint"
                            mode="edit"
                            @reordered="addStopPointToMapp" />
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-page>
</template>

<script lang="ts" setup>
import {
    IonThumbnail,
    IonImg,
    IonPage,
    IonContent,
    IonButton,
    popoverController,
    onIonViewWillEnter,
    IonGrid,
    IonCol,
    IonRow,
    IonItem,
    IonIcon,
    IonLabel,
    IonLoading,
    onIonViewDidLeave,
    IonFab,
    IonFabButton,
    IonFabList,
    IonSearchbar,
    modalController,
    alertController
} from "@ionic/vue";
import haversine from "haversine";

import mapboxgl from "mapbox-gl";
import { Map, Marker, NavigationControl, MapMouseEvent, GeoJSONSource, LngLat } from "mapbox-gl";
import { ref } from "vue";

import SaveJourneyModal from "components/Modals/SaveJourneyModal.vue";
import MapJourneySidebar from "components/MapJourneySidebar.vue";
import PoiCard from "components/Cards/PoiCard.vue";
import { useJourneyStore } from "stores/useJourneyStore";
import { usePoiStore } from "stores/usePoiStore";
import { GeocodedData } from "types/journeys";
import router from "router/router";
import { PoiDto } from "types/dtos";
import { reverseGeocode, getLocalityAndCountry } from "google/googleGeocoder";
import { FeatureCollection } from "geojson";
import { onBeforeRouteLeave } from "vue-router";
import CreateJourneyModal from "components/Modals/CreateJourneyModal.vue";
const usePoi = usePoiStore();
const useJourney = useJourneyStore();

var mapContainer = ref();
var map = ref<Map>();

var startMarker = ref<Marker>();
var endMarker = ref<Marker>();

var startPoint = ref<GeocodedData>({
    address: "",
    coordinates: new LngLat(-1, -1)
});
var endPoint = ref<GeocodedData>({
    address: "",
    coordinates: new LngLat(-1, -1)
});

var radius = ref(-1);
var hideSidebar = ref(true);
var isLoading = ref(false);
var isSaved = ref(false);
var isValid = ref(false);

function getRadius(start: LngLat, end: LngLat): number {
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
function onMarkerDrag(marker: Marker, pos: string) {
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
                usePoi.searchBetween(mid.lat, mid.lng, radius.value).then((resp) => {
                    if (resp == true) {
                        addStopPointToMapp();
                        (map.value?.getSource("poi") as GeoJSONSource).setData({
                            type: "FeatureCollection",
                            features: usePoi.poiRef.features
                        } as FeatureCollection);
                    }
                    isLoading.value = false;
                });
            }
        });
    });
}

onBeforeRouteLeave(async () => {
    if (
        isSaved.value === false &&
        useJourney.editJourney.experiences != undefined &&
        useJourney.editJourney.experiences.length > 0
    ) {
        let leave = false;
        const alert = await alertController.create({
            header: "Alert",
            subHeader: "Save Journey",
            message: "You did not save your journey Proceed?",
            buttons: [
                {
                    text: "Proceed",
                    role: "proceed",
                    handler: () => {
                        leave = true;
                    }
                },
                {
                    text: "Save",
                    role: "Save",
                    handler: () => {
                        leave = false;
                        openModal(SaveJourneyModal);
                    }
                }
            ]
        });

        await alert.present();

        const { role } = await alert.onDidDismiss();
        leave = role == "proceed";
        return leave;
    }
});

onIonViewWillEnter(() => {
    const params = router.currentRoute.value.params;

    useJourney.editJourney.experiences = [];
    if (params.start != undefined && params.end != undefined) {
        startPoint.value = JSON.parse(params.start as string) as GeocodedData;
        endPoint.value = JSON.parse(params.end as string) as GeocodedData;
        useJourney.setJourneyStartEnd(startPoint.value, endPoint.value);

        startMarker.value = new Marker();
        endMarker.value = new Marker();
        startMarker.value.setDraggable(true).setLngLat(startPoint.value.coordinates);

        endMarker.value.setDraggable(true).setLngLat(endPoint.value.coordinates);

        onMarkerDrag(startMarker.value, "start");
        onMarkerDrag(endMarker.value, "end");

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
    } else {
        isValid.value = false;
        isLoading.value = false;
        openModal(CreateJourneyModal);
    }
});

onIonViewDidLeave(() => {
    usePoi.poiRef.features = [];
    isValid.value = false;
    isLoading.value = false;
    isSaved.value = false;
    useJourney.clearMapView();
    map.value?.remove();
});

async function openModal(component: any) {
    let modal = await modalController.create({
        component: component,
        keyboardClose: false
    });
    await modal.present();

    const { data, role } = await modal.onDidDismiss();
    isSaved.value = role == "view" || role == "stay";
    if (role == "view") {
        const route = {
            name: "logbook",
            params: {
                id: data.data
            }
        };
        router.push(route);
    }
}

function panTo(coordinates: number[]) {
    map.value?.easeTo({
        center: [coordinates[0], coordinates[1]],
        zoom: 16
    });
}

function addStopPointToMapp() {
    var stopPoints: number[][] = [];

    stopPoints.push([startPoint.value.coordinates.lng, startPoint.value.coordinates.lat]);
    useJourney.editJourney.experiences?.forEach((exp) => {
        stopPoints.push([exp.poi.location.longitude!, exp.poi.location.latitude!]);
    });
    stopPoints.push([endPoint.value.coordinates.lng, endPoint.value.coordinates.lat]);

    if (map.value?.getSource("route")) {
        (map.value?.getSource("route") as GeoJSONSource).setData({
            type: "Feature",
            properties: {},
            geometry: {
                type: "LineString",
                coordinates: stopPoints
            }
        });
    }
    isSaved.value = false;
}

function load() {
    isLoading.value = true;
    isValid.value = true;
    const midPoint = {
        lng: getMidPoint(startPoint.value.coordinates, endPoint.value.coordinates).lng,
        lat: getMidPoint(startPoint.value.coordinates, endPoint.value.coordinates).lat,
        zoom: 10
    };

    mapboxgl.accessToken =
        "pk.eyJ1IjoiaGV5bWFudWVsIiwiYSI6ImNsOXR1Zm5tbDFlYm8zdXRmaDRwY21qYXoifQ.3A8osuJSSk3nzULihiAOPg";

    const apiKey = import.meta.env.VITE_MAPTILER_API_KEY;

    map.value = new Map({
        container: mapContainer.value,
        style: `https://api.maptiler.com/maps/voyager/style.json?key=${apiKey}`,
        center: [midPoint.lng, midPoint.lat],
        zoom: midPoint.zoom,
        projection: {
            name: "globe"
        }
    });

    map.value?.once("render", () => {
        map.value?.resize();
    });

    map.value?.once("load", () => {
        startMarker.value?.addTo(map.value!);
        endMarker.value?.addTo(map.value!);

        usePoi.searchBetween(midPoint.lat, midPoint.lng, radius.value / 2).then((response) => {
            hideSidebar.value = usePoi.poiRef.features.length == 0;

            if (hideSidebar.value != true && response) {
                map.value?.addSource("poi", {
                    type: "geojson",
                    data: usePoi.poiRef,
                    cluster: true,
                    clusterMaxZoom: 14,
                    clusterRadius: 50
                });

                map.value?.addLayer({
                    id: "clusters",
                    type: "circle",
                    source: "poi",
                    filter: ["has", "point_count"],
                    paint: {
                        "circle-color": ["step", ["get", "point_count"], "#51bbd6", 100, "#f1f075", 750, "#f28cb1"],
                        "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40]
                    }
                });

                map.value?.addLayer({
                    id: "cluster-count",
                    type: "symbol",
                    source: "poi",
                    filter: ["has", "point_count"],
                    layout: {
                        "text-field": "{point_count_abbreviated}",
                        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                        "text-size": 12
                    }
                });

                map.value?.addLayer({
                    id: "unclustered-point",
                    type: "circle",
                    source: "poi",
                    filter: ["!", ["has", "point_count"]],
                    paint: {
                        "circle-color": "#11b4da",
                        "circle-radius": 6,
                        "circle-stroke-width": 1,
                        "circle-stroke-color": "#fff"
                    }
                });
                var stopPoints: number[][] = [];

                stopPoints.push([startPoint.value.coordinates.lng, startPoint.value.coordinates.lat]);
                stopPoints.push([endPoint.value.coordinates.lng, endPoint.value.coordinates.lat]);
                map.value?.addSource("route", {
                    type: "geojson",
                    data: {
                        type: "Feature",
                        properties: {},
                        geometry: {
                            type: "LineString",
                            coordinates: stopPoints
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
            }
            //finish loading
            isLoading.value = false;
        });

        map.value?.setFog({});
    });

    map.value?.on("click", "clusters", (e) => {
        onClusterClick(e);
    });

    map.value?.on("click", "unclustered-point", (e) => {
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
        addStopPointToMapp();
    }
}

function onClusterClick(e: MapMouseEvent) {
    const features = map.value?.queryRenderedFeatures(e.point, {
        layers: ["clusters"]
    });
    const clusterId = features![0].properties!.cluster_id;
    const source: maplibregl.GeoJSONSource = map.value?.getSource("poi") as maplibregl.GeoJSONSource;
    source.getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
        if (err) return;
        if (features![0].geometry.type === "Point") {
            map.value?.easeTo({
                center: [features![0].geometry.coordinates[0], features![0].geometry.coordinates[1]],
                zoom: zoom
            });
        }
    });
}

function getMidPoint(start: LngLat, end: LngLat) {
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

.journeys-items,
.sidebar-items-list {
    height: 100%;
    min-width: 200px;
    max-width: 400px;
}

.poi-list {
    min-width: 150px;
    height: 100%;
}

.scrollable-item {
    height: 100%;
}

.layout {
    height: 100%;
    flex-wrap: nowrap;
    min-width: 300px;
}

.scroller {
    height: 100%;
}

.map-col {
    background-color: red;
}

.floating {
    position: absolute;
    z-index: 999;
}

.icon-button {
    padding: 0;
}
.search {
    position: absolute;
    left: 0;
    right: 0;
    width: 40%;
    min-width: 300px;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
}
</style>
