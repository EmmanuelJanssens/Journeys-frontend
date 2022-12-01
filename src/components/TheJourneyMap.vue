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
import { PoiDto } from "types/dtos";
import axios from "axios";
import { mapInstance, mapLayers } from "map/JourneysMap";
import { onMounted, ref } from "vue";

import "mapbox-gl/dist/mapbox-gl.css";

const poiOpened = ref<PoiDto | undefined>();
const pos = ref({
    x: 0,
    y: 0
});

async function getCountryLoc() {
    const loc = await axios.get(`https://api.ipregistry.co/?key=${import.meta.env.VITE_IP_REGESTRY_KEY}`);
    return new LngLat(loc.data.location.longitude, loc.data.location.latitude);
}

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
