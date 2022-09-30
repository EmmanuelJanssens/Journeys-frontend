<template>
    <ion-page>
        <JourneysHeader />
        <ion-loading v-if="isLoading" />
        <ion-content>
            <ion-grid style="height: 100%">
                <ion-row style="height: 100%">
                    <ion-col
                        v-if="!isLoading"
                        :hidden="false"
                        class="sidebar-items-list ion-hide-xl-down">
                        <RecycleScroller
                            style="height: 100%"
                            :items="usePoi.poiRef.features"
                            :item-size="50">
                            <template #default="{ item }">
                                <ion-item
                                    button
                                    @click="panTo(item.geometry.coordinates)">
                                    <ion-icon
                                        slot="start"
                                        size="large"
                                        src="/src/assets/icon/trail-sign-outline.svg"></ion-icon>
                                    <ion-label>{{
                                        item.properties.name
                                    }}</ion-label>
                                </ion-item>
                            </template>
                        </RecycleScroller>
                    </ion-col>
                    <ion-col class="map-col">
                        <ion-searchbar class="floating search"></ion-searchbar>
                        <ion-button
                            size="small"
                            class="ion-margin-start ion-margin-top floating icon-button">
                            <ion-icon
                                class="icon-button"
                                slot="icon-only"
                                src="/src/assets/icon/filter-outline.svg"></ion-icon>
                        </ion-button>

                        <ion-content class="map-wrap">
                            <ion-fab
                                v-if="!isLoading"
                                vertical="top"
                                horizontal="end"
                                slot="fixed">
                                <ion-fab-button>
                                    <ion-icon
                                        size="large"
                                        src="/src/assets/icon/chevron-down-outline.svg"></ion-icon>
                                </ion-fab-button>
                                <ion-fab-list>
                                    <ion-fab-button
                                        id="open-save-journey-modal">
                                        <ion-icon
                                            size="large"
                                            src="/src/assets/icon/save-outline.svg"></ion-icon>
                                    </ion-fab-button>
                                    <ion-fab-button
                                        id="open-save-journey-modal">
                                        <ion-icon
                                            size="large"
                                            src="/src/assets/icon/trash-bin-outline.svg"></ion-icon>
                                    </ion-fab-button>
                                </ion-fab-list>
                            </ion-fab>

                            <section class="map" ref="mapContainer"></section>
                        </ion-content>
                    </ion-col>
                    <ion-col
                        v-if="!isLoading"
                        class="journeys-items ion-hide-md-down">
                        <map-journey-sidebar
                            :start="startPoint"
                            :end="endPoint" />
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
        <SaveJourneyModal />
    </ion-page>
</template>

<script lang="ts" setup>
import router from "../router";
import {
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
    IonSearchbar
} from "@ionic/vue";
import haversine from "haversine";
import { Map, MapMouseEvent, Marker, NavigationControl } from "maplibre-gl";
import { LngLat } from "maplibre-gl";
import { ref } from "vue";

import SaveJourneyModal from "../components/Modals/SaveJourneyModal.vue";
import JourneysHeader from "../components/JourneysHeader.vue";
import MapJourneySidebar from "../components/MapJourneySidebar.vue";
import PoiCard from "../components/PoiCard.vue";
import { useJourneyStore } from "../stores/useJourneyStore";
import { usePoiStore } from "../stores/usePoiStore";

const usePoi = usePoiStore();
const useJourney = useJourneyStore();

var mapContainer = ref();
var map = ref<Map>();
var startPoint = ref({ text: "", coordinates: new LngLat(-1, -1) });
var endPoint = ref({ text: "", coordinates: new LngLat(-1, -1) });
var hideSidebar = ref(true);
var isLoading = ref(false);

onIonViewWillEnter(() => {
    const params = router.currentRoute.value.params;
    useJourney.journeyRef = [];
    if (params.start != undefined && params.end != undefined) {
        startPoint.value = JSON.parse(params.start as string) as {
            text: string;
            coordinates: LngLat;
        };
        endPoint.value = JSON.parse(params.end as string) as {
            text: string;
            coordinates: LngLat;
        };
        load();
    }

    /*     const dev = {
        start: '{"text":"Lausanne, Switzerland","coordinates":{"lng":6.6322734,"lat":46.5196535}}',
        end: '{"text":"Vevey, Switzerland","coordinates":{"lng":6.8419192,"lat":46.4628333}}'
    };
    useJourney.journeyRef = [];
    if (dev.start != undefined && dev.end != undefined) {
        startPoint.value = JSON.parse(dev.start as string) as {
            text: string;
            coordinates: LngLat;
        };
        endPoint.value = JSON.parse(dev.end as string) as {
            text: string;
            coordinates: LngLat;
        };
        useJourney.setJourneyStartEnd(
            startPoint.value.coordinates,
            endPoint.value.coordinates
        );
        load();
    } */
});

onIonViewDidLeave(() => {
    usePoi.poiRef.features = [];
    useJourney.clearMapView();
    map.value?.remove();
});

function panTo(coordinates: number[]) {
    map.value?.easeTo({
        center: [coordinates[0], coordinates[1]],
        zoom: 16
    });
}

function load() {
    getMidPoint(startPoint.value.coordinates, endPoint.value.coordinates);
    const midPoint = {
        lng: getMidPoint(
            startPoint.value.coordinates,
            endPoint.value.coordinates
        ).lng,
        lat: getMidPoint(
            startPoint.value.coordinates,
            endPoint.value.coordinates
        ).lat,
        zoom: 10
    };

    const apiKey = import.meta.env.VITE_MAPTILER_API_KEY;

    map.value = new Map({
        container: mapContainer.value,
        style: `https://api.maptiler.com/maps/voyager/style.json?key=${apiKey}`,
        center: [midPoint.lng, midPoint.lat],
        zoom: midPoint.zoom
    });

    map.value?.once("render", () => {
        map.value?.resize();
    });

    map.value?.once("load", () => {
        new Marker()
            .setLngLat([
                startPoint.value.coordinates.lng,
                startPoint.value.coordinates.lat
            ])
            .addTo(map.value!);
        new Marker()
            .setLngLat([
                endPoint.value.coordinates.lng,
                endPoint.value.coordinates.lat
            ])
            .addTo(map.value!);

        const dist = haversine(
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

        usePoi
            .searchBetween(midPoint.lat, midPoint.lng, dist / 2)
            .then((response) => {
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
                            "circle-color": [
                                "step",
                                ["get", "point_count"],
                                "#51bbd6",
                                100,
                                "#f1f075",
                                750,
                                "#f28cb1"
                            ],
                            "circle-radius": [
                                "step",
                                ["get", "point_count"],
                                20,
                                100,
                                30,
                                750,
                                40
                            ]
                        }
                    });

                    map.value?.addLayer({
                        id: "cluster-count",
                        type: "symbol",
                        source: "poi",
                        filter: ["has", "point_count"],
                        layout: {
                            "text-field": "{point_count_abbreviated}",
                            "text-font": [
                                "DIN Offc Pro Medium",
                                "Arial Unicode MS Bold"
                            ],
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

                    map.value?.addSource("route", {
                        type: "geojson",
                        data: {
                            type: "Feature",
                            properties: {},
                            geometry: {
                                type: "LineString",
                                coordinates: [
                                    [
                                        startPoint.value.coordinates.lng,
                                        startPoint.value.coordinates.lat
                                    ],
                                    [
                                        endPoint.value.coordinates.lng,
                                        endPoint.value.coordinates.lat
                                    ]
                                ]
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
    });

    map.value?.on("click", "clusters", (e) => {
        onClusterClick(e);
    });

    map.value?.on("click", "unclustered-point", (e) => {
        onPopOver(e.features![0].properties as Poi, e);
    });

    map.value?.addControl(new NavigationControl({}), "bottom-right");
}

async function onPopOver(data: Poi, e: MapMouseEvent) {
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
}

function onClusterClick(e: MapMouseEvent) {
    const features = map.value?.queryRenderedFeatures(e.point, {
        layers: ["clusters"]
    });
    const clusterId = features![0].properties.cluster_id;
    const source: maplibregl.GeoJSONSource = map.value?.getSource(
        "poi"
    ) as maplibregl.GeoJSONSource;
    source.getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
        if (err) return;
        if (features![0].geometry.type === "Point") {
            map.value?.easeTo({
                center: [
                    features![0].geometry.coordinates[0],
                    features![0].geometry.coordinates[1]
                ],
                zoom: zoom
            });
        }
    });
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

ion-grid {
    --ion-grid-padding: 0px;
    --ion-grid-margin: 0px;
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
