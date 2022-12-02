<template>
    <div>
        <component
            :is="PoiCard"
            v-if="poiOpened"
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
            " />
        <slot />
    </div>
</template>
<script lang="ts" setup>
import PoiCard from "components/jCards/PoiCard.vue";

import mapboxgl, { LngLat, MapMouseEvent } from "mapbox-gl";
import axios from "axios";
import { mapInstance, mapLayers } from "map/JourneysMap";
import { onMounted, ref } from "vue";

import "mapbox-gl/dist/mapbox-gl.css";
import { PointOfInterest } from "types/JourneyDtos";
import { useDark } from "@vueuse/core";

const style = ref("mapbox://styles/heymanuel/clawunauz000814nsgx6d2fjx");
const isDark = useDark();
const poiOpened = ref<PointOfInterest | undefined>();
const pos = ref({
    x: 0,
    y: 0
});

async function getCountryLoc() {
    const loc = await axios.get(`https://api.ipregistry.co/?key=${import.meta.env.VITE_IP_REGESTRY_KEY}`);
    return new LngLat(loc.data.location.longitude, loc.data.location.latitude);
}

async function loadMap() {
    const center = await getCountryLoc();
    mapInstance.loadMap(
        "pk.eyJ1IjoiaGV5bWFudWVsIiwiYSI6ImNsOXR1Zm5tbDFlYm8zdXRmaDRwY21qYXoifQ.3A8osuJSSk3nzULihiAOPg",
        "Map",
        center,
        style.value
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
            const poi: PointOfInterest = {
                location: JSON.parse(e.features![0].properties!.location),
                name: e.features![0].properties!.name,
                id: e.features![0].properties!.id
            };
            poiOpened.value = poi;

            pos.value = {
                x: e.originalEvent.x,
                y: e.originalEvent.y
            };
        }
    );
    map.on("click", mapLayers.poi_list + "_cluster", (e) => {
        onClusterClick(e);
    });
}
onMounted(async () => {
    if (!isDark.value) {
        style.value = "mapbox://styles/heymanuel/clawunauz000814nsgx6d2fjx";
    } else {
        style.value = "mapbox://styles/heymanuel/clb6telhc003w15qeoepfpd8c";
    }
    loadMap();
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
</script>
<style></style>
