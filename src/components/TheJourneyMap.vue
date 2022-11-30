<template>
    <div>
        <component
            v-if="poiOpened"
            :is="PoiCard"
            :poi="poiOpened"
            :pos="pos"
            @close="
                () => {
                    poiOpened = undefined;
                }
            " />
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
import PoiCard from "components/jCards/PoiCard.vue";

import mapboxgl, { LngLat, MapMouseEvent } from "mapbox-gl";
import { ExperienceDto, PoiDto } from "types/dtos";
import { useJourneyStore } from "stores/useJourneyStore";
import { usePoiStore } from "stores/usePoiStore";
import { alertController } from "@ionic/core";
import axios from "axios";
import { mapInstance, mapLayers } from "map/JourneysMap";
import "maplibre-gl/dist/maplibre-gl.css";
import { onMounted, ref } from "vue";
import { getLocalityAndCountry, reverseGeocode } from "google/googleGeocoder";
import router from "router/router";

const emit = defineEmits<{
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
const poiOpened = ref<PoiDto | undefined>();
const pos = ref({
    x: 0,
    y: 0
});

async function getCountryLoc() {
    const loc = await axios.get(`https://api.ipregistry.co/?key=${import.meta.env.VITE_IP_REGESTRY_KEY}`);
    return new LngLat(loc.data.location.longitude, loc.data.location.latitude);
}

const poiBase = "absolute z-50";
const poiadd = ref("");
const posClass = ref(poiBase + poiadd.value);
const poitest = ref();
onMounted(async () => {
    const center = await getCountryLoc();
    mapInstance.loadMap(
        "pk.eyJ1IjoiaGV5bWFudWVsIiwiYSI6ImNsOXR1Zm5tbDFlYm8zdXRmaDRwY21qYXoifQ.3A8osuJSSk3nzULihiAOPg",
        "Map",
        center,
        "mapbox://styles/heymanuel/clawunauz000814nsgx6d2fjx"
    );
    const map = await mapInstance.getMap()!;
    map.on("style.load", () => {
        map.setFog({});
        map.resize();
    });
    map.on(
        "click",
        mapLayers.poi_list + "_unclustered",
        (
            e: mapboxgl.MapMouseEvent & {
                features?: mapboxgl.MapboxGeoJSONFeature[] | undefined;
            } & mapboxgl.EventData
        ) => {
            poiOpened.value = e.features![0].properties as PoiDto;
            pos.value = {
                x: e.point.x,
                y: e.point.y
            };
        }
    );
    map.on("click", mapLayers.poi_list + "_cluster", (e) => {
        onClusterClick(e);
    });
    map.on("contextmenu", async (e: MapMouseEvent) => {
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
                order: journeyStore.editJourney.experiencesConnection?.edges?.length!,
                node: added!
            };
            journeyStore.addToJourney(experience);
        }
    });
});

async function onClusterClick(e: MapMouseEvent) {
    const map = await mapInstance.getMap();
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

function enableDrag() {
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

async function onMarkerDragend(pos: LngLat, marker: string) {
    const response = await reverseGeocode(pos.lat, pos.lng);
    const result = getLocalityAndCountry(response!);
    if (result.country != undefined && result.locality != undefined) {
        if (marker == "journey_start") {
            journeyStore.editJourney.start = {
                placeId: result.placeId,
                address: result.locality + ", " + result.country,
                latitude: pos.lat,
                longitude: pos.lng
            };
        } else if (marker == "journey_end") {
            journeyStore.editJourney.end = {
                placeId: result.placeId,
                address: result.locality + ", " + result.country,
                latitude: pos.lat,
                longitude: pos.lng
            };
        }
    }
    const mid = journeyStore.getJourneyMidPoint(journeyStore.editJourney);
    await poiStore.searchBetween(mid.center.lat, mid.center.lng, mid.radius);
}
</script>
<style></style>
