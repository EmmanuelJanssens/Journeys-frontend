<template>
    <div>
        <section
            id="Map"
            style="
                 {
                    width: 100%;
                    height: 100%;
                }
            "></section>
        <slot></slot>
    </div>
</template>
<script lang="ts" setup>
import { onActivated, onMounted, watch } from "vue";
import mapboxgl, { LngLat, MapMouseEvent } from "mapbox-gl";
import GeoJSON from "geojson";
import { ExperienceDto, PoiDto } from "types/dtos";
import { useJourneyStore } from "stores/useJourneyStore";
import { usePoiStore } from "stores/usePoiStore";
import { useUserStore } from "stores/useUserStore";
import { getMidPoint } from "utils/utils";
import { alertController } from "@ionic/core";
import axios from "axios";
import { mapInstance, mapLayers } from "map/JourneysMap";
import "maplibre-gl/dist/maplibre-gl.css";
import { onBeforeRouteUpdate } from "vue-router";
import { onAuthStateChanged } from "@firebase/auth";
import { authApp } from "google/firebase";
import { POSITION, useToast } from "vue-toastification";
import router from "router/router";
import { getLocalityAndCountry, reverseGeocode } from "google/googleGeocoder";

onBeforeRouteUpdate((from) => {
    if (from.name == "view") {
        drawJourney();
    } else if (from.name == "main") {
        drawMyJourneys();
    } else if (from.name == "edit") {
        console.log(poiStore.poisBetween);
        drawPoisBetween();
        //
    }
    console.log(from.name);
});

authApp.onAuthStateChanged((user) => {
    if (!user) {
        mapInstance.clearMap();
    }
});
const props = defineProps<{
    mode: string;
}>();

const emit = defineEmits<{
    (e: "loaded"): void;
    (e: "ready"): void;
    (e: "modeSwitch", mode: string): void;
    (e: "markerDragged", pos: mapboxgl.LngLat, marker: string): void;
    (
        e: "poiClicked",
        poi: PoiDto,
        evt: mapboxgl.MapMouseEvent & {
            features?: mapboxgl.MapboxGeoJSONFeature[] | undefined;
        } & mapboxgl.EventData
    ): void;
}>();

const journeyStore = useJourneyStore();
const poiStore = usePoiStore();
const userStore = useUserStore();
const toast = useToast();

var map: mapboxgl.Map;
async function getCountryLoc() {
    const loc = await axios.get(`https://api.ipregistry.co/?key=${import.meta.env.VITE_IP_REGESTRY_KEY}`);
    return new LngLat(loc.data.location.longitude, loc.data.location.latitude);
}

onActivated(async () => {
    if (router.currentRoute.value.name == "view") {
        drawJourney();
    } else if (router.currentRoute.value.name == "main") {
        drawMyJourneys();
    } else if (router.currentRoute.value.name == "edit") {
        console.log("ddd");

        await poiStore.poiDidLoad();
        drawPoisBetween();
        //
    }
});
onMounted(async () => {
    const center = await getCountryLoc();
    mapInstance.loadMap(
        "pk.eyJ1IjoiaGV5bWFudWVsIiwiYSI6ImNsOXR1Zm5tbDFlYm8zdXRmaDRwY21qYXoifQ.3A8osuJSSk3nzULihiAOPg",
        "Map",
        center,
        "mapbox://styles/heymanuel/clawunauz000814nsgx6d2fjx"
    );
    map = mapInstance.getMap()!;
    map.on("load", async () => {
        try {
            const logged = await userStore.didLogin();
            if (logged) drawMyJourneys();
        } catch (e) {
            toast.info("if you want to enjoy the full content consider creating an account", {
                position: POSITION.BOTTOM_CENTER
            });
        }
    });
    map.on("style.load", () => {
        map.setFog({});
        map.resize();
        emit("ready");
    });
    map.on(
        "click",
        mapLayers.poi_list + "_unclustered",
        (
            e: mapboxgl.MapMouseEvent & {
                features?: mapboxgl.MapboxGeoJSONFeature[] | undefined;
            } & mapboxgl.EventData
        ) => {
            emit("poiClicked", e.features![0].properties as PoiDto, e);
        }
    );
    map.on("click", mapLayers.poi_list + "_cluster", (e) => {
        onClusterClick(e);
    });
    map.on("contextmenu", async (e: MapMouseEvent) => {
        if (props.mode == "editJourney" || props.mode == "edition") {
            const alert = await alertController.create({
                header: "Confirm poi details",
                inputs: [
                    {
                        label: "Poi Name",
                        name: "poiName",
                        placeholder: "Enter name"
                    }
                ],
                buttons: [
                    "Cancel",
                    {
                        text: "OK",
                        handler: (data) => {
                            alertController.dismiss(data.poiName, "ok");
                        }
                    }
                ]
            });
            await alert.present();
            const { data, role } = await alert.onDidDismiss();
            if (role == "ok" && data?.length! > 0) {
                const poi: PoiDto = {
                    name: data,
                    location: {
                        latitude: e.lngLat.lat,
                        longitude: e.lngLat.lng
                    }
                };
                if (poi.thumbnail != undefined) delete poi.thumbnail;
                const added = await poiStore.addPoi(poi);
                const experience: ExperienceDto = {
                    title: "",
                    date: new Date().toISOString(),
                    description: "",
                    images: [],
                    order: journeyStore.editJourney.journey!.experiencesConnection?.edges?.length!,
                    node: added!
                };
                journeyStore.addToJourney(experience);
            }
        }
    });
});

async function onMarkerDragend(pos: LngLat, marker: string) {
    const response = await reverseGeocode(pos.lat, pos.lng);
    const result = getLocalityAndCountry(response!);
    if (result.country != undefined && result.locality != undefined) {
        if (marker == "journey_start") {
            journeyStore.editJourney.journey!.start = {
                placeId: result.placeId,
                address: result.locality + ", " + result.country,
                latitude: pos.lat,
                longitude: pos.lng
            };
        } else if (marker == "journey_end") {
            journeyStore.editJourney.journey!.end = {
                placeId: result.placeId,
                address: result.locality + ", " + result.country,
                latitude: pos.lat,
                longitude: pos.lng
            };
        }
    }
    const mid = journeyStore.getJourneyMidPoint(journeyStore.editJourney.journey!);
    await poiStore.searchBetween(mid.center.lat, mid.center.lng, mid.radius);
    drawPoisBetween();
}

function onClusterClick(e: MapMouseEvent) {
    const features = map.queryRenderedFeatures(e.point, {
        layers: [mapLayers.poi_list + "_cluster"]
    });

    const clusterId = features![0].properties!.cluster_id;
    const source: mapboxgl.GeoJSONSource = map.getSource(mapLayers.poi_list) as mapboxgl.GeoJSONSource;
    source.getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
        if (err) return;
        if (features![0].geometry.type === "Point") {
            map.easeTo({
                center: [features![0].geometry.coordinates[0], features![0].geometry.coordinates[1]],
                zoom: zoom
            });
        }
    });
}

async function drawJourney() {
    let featureCollection: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: []
    };

    journeyStore.viewJourney.experiencesConnection?.edges?.forEach((exp) => {
        const n = exp.node as PoiDto;
        featureCollection.features.push({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [n.location!.longitude, n.location!.latitude]
            },
            properties: exp,
            id: exp.node.id
        });
    });

    const coords = Array<number[]>();

    coords.push([journeyStore.viewJourney.start?.longitude!, journeyStore.viewJourney.start?.latitude!]);
    featureCollection.features.forEach((element) => {
        coords.push((element.geometry as GeoJSON.Point).coordinates);
    });
    coords.push([journeyStore.viewJourney.end?.longitude!, journeyStore.viewJourney.end?.latitude!]);
    const center = getMidPoint(
        new mapboxgl.LngLat(journeyStore.viewJourney.start?.longitude!, journeyStore.viewJourney.start?.latitude!),
        new mapboxgl.LngLat(journeyStore.viewJourney.end?.longitude!, journeyStore.viewJourney.end?.latitude!)
    );
    featureCollection.features.push({
        type: "Feature",
        properties: {
            start: journeyStore.viewJourney.start,
            end: journeyStore.viewJourney.end,
            center: center
        },
        geometry: {
            type: "LineString",
            coordinates: coords
        },
        id: journeyStore.viewJourney.id
    });
    await mapInstance.addJourneysExperiencesLayer(featureCollection);

    emit("ready");
}

async function drawMyJourneys() {
    const geoJSONJourney: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: []
    };

    userStore.myJourneys!.forEach((journey) => {
        geoJSONJourney.features.push(journeyStore.journeyToGeojson(journey)[0]);
        geoJSONJourney.features.push(journeyStore.journeyToGeojson(journey)[1]);
        geoJSONJourney.features.push({
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
            },
            id: journey.id
        });
    });
    await mapInstance.addJourneyListLayer(geoJSONJourney);
}

async function drawPoisBetween() {
    await poiStore.poiDidLoad();
    const data = buildPoiGeoData(poiStore.poisBetween!);
    if (data?.features.length! > 0) {
        mapInstance.addPoiListLayer(data!);
        if (!router.currentRoute.value.query.id) {
            const start = mapInstance.getmarkerbyId("journey_start")!;
            start.setDraggable(true);
            start.on("dragend", () => {
                onMarkerDragend(start.getLngLat(), "journey_start");
            });
            const end = mapInstance.getmarkerbyId("journey_end")!;
            end.setDraggable(true);
            end.on("dragend", () => {
                onMarkerDragend(end.getLngLat(), "journey_end");
            });
        }
    }
}

function buildPoiGeoData(pois: PoiDto[]) {
    const geoJsonData: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: []
    };
    pois.forEach((poi) => {
        geoJsonData.features.push({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [poi.location!.longitude, poi.location!.latitude]
            },
            properties: poi,
            id: poi.id
        });
    });

    const coords = Array<number[]>();

    coords.push([
        journeyStore.editJourney.journey?.start?.longitude!,
        journeyStore.editJourney.journey?.start?.latitude!
    ]);
    journeyStore.editJourney.journey?.experiencesConnection?.edges?.forEach((exp) => {
        const n = exp.node as PoiDto;
        coords.push([n.location!.longitude, n.location!.latitude]);
    });
    coords.push([journeyStore.editJourney.journey?.end?.longitude!, journeyStore.editJourney.journey?.end?.latitude!]);

    geoJsonData.features.push({
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates: coords
        },
        properties: {
            start: journeyStore.editJourney.journey?.start,
            end: journeyStore.editJourney.journey?.end
        },
        id: "editJourney"
    });
    return geoJsonData;
}

async function drawExperiences() {
    const array: Array<number[]> = new Array();

    array.push([
        journeyStore.editJourney.journey?.start?.longitude!,
        journeyStore.editJourney.journey?.start?.latitude!
    ]);
    journeyStore.editJourney.journey?.experiencesConnection?.edges!?.forEach((exp) => {
        const n = exp.node as PoiDto;
        array.push([n.location!.longitude, n.location!.latitude]);
    });
    array.push([journeyStore.editJourney.journey?.end?.longitude!, journeyStore.editJourney.journey?.end?.latitude!]);

    const feature: GeoJSON.Feature = {
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates: array
        },
        properties: {}
    };
    mapInstance.addStopPoint(feature);
}
</script>
<style></style>
