<template>
    <section
        id="Map"
        style="
             {
                width: 100%;
                height: 100%;
                z-index: 99;
            }
        "></section>
</template>
<script lang="ts" setup>
import { IonIcon, IonFab, IonFabButton, IonContent } from "@ionic/vue";
import { onMounted, watch } from "vue";
import mapboxgl from "mapbox-gl";
import { JourneyMapCapacitor } from "journeys-capacitor-mapbox";
import GeoJSON from "geojson";
import { ExperienceDto, PoiDto } from "types/dtos";
import { useJourneyStore } from "stores/useJourneyStore";

const mapLayer = {
    journey_route: "journey_route",
    journey_list: "journey_list",
    journey_list_route: "journey_list_route",
    journey_experiences: "journey_experiences",
    journey_cluster: "journey_clusters",
    poi_list: "poi_list",
    poi_cluster: "poi_cluster"
};

const props = defineProps<{
    mode: string;
    pois?: GeoJSON.FeatureCollection;
    journeyExperiences?: GeoJSON.FeatureCollection;
    journeys?: GeoJSON.FeatureCollection;
    stopPoints?: ExperienceDto[] | undefined;
}>();

//const emit = defineEmits(["loaded", "createNew", "markerDragged", "poiClicked"]);
const emit = defineEmits<{
    (e: "loaded"): void;
    (e: "ready"): void;
    (e: "markerDragged", pos: mapboxgl.LngLat, marker: string): void;
    (
        e: "poiClicked",
        poi: PoiDto,
        evt: mapboxgl.MapMouseEvent & {
            features?: mapboxgl.MapboxGeoJSONFeature[] | undefined;
        } & mapboxgl.EventData
    ): void;
    (e: "createPressed"): void;
}>();

const useJourney = useJourneyStore();
var map: mapboxgl.Map;
onMounted(async () => {
    await JourneyMapCapacitor.loadMap(
        "pk.eyJ1IjoiaGV5bWFudWVsIiwiYSI6ImNsOXR1Zm5tbDFlYm8zdXRmaDRwY21qYXoifQ.3A8osuJSSk3nzULihiAOPg",
        import.meta.env.VITE_MAPTILER_API_KEY,
        "Map"
    );
    map = await JourneyMapCapacitor.getMap()!;
    map.on("load", () => {
        emit("loaded");
        emit("ready");
    });

    map.on("style.load", () => {
        map.setFog({});
        map.resize();
    });

    map.on(
        "click",
        mapLayer.poi_list + "_unclustered",
        (
            e: mapboxgl.MapMouseEvent & {
                features?: mapboxgl.MapboxGeoJSONFeature[] | undefined;
            } & mapboxgl.EventData
        ) => {
            e.features![0].properties!.location = JSON.parse(e.features![0].properties!.location);
            emit("poiClicked", e.features![0].properties as PoiDto, e);
        }
    );
});

watch(
    () => props.journeyExperiences,
    async (newVal) => {
        if (props.mode == "viewJourney" && newVal != undefined) {
            map.resize();

            await JourneyMapCapacitor.addJourneysExperiencesLayer(newVal);
            emit("ready");
        }
    }
);

watch(
    () => props.journeys,
    async (newValue) => {
        map.resize();
        if (newValue != undefined) {
            await JourneyMapCapacitor.addJourneyListLayer(newValue!);
        } else {
            await JourneyMapCapacitor.clearMap(false);
        }

        emit("ready");
    },
    { deep: true }
);

watch(
    () => props.pois,
    async (newVal, oldValue) => {
        if (newVal?.features.length! > 0) {
            map.resize();

            await JourneyMapCapacitor.addPoiListLayer(newVal!);
            const start = await JourneyMapCapacitor.getmarkerbyId("journey_start")!;
            if (props.mode != "editJourney") {
                start.setDraggable(true);
                start.on("dragend", () => {
                    console.log("changed");
                    emit("markerDragged", start.getLngLat(), "journey_start");
                });
                const end = await JourneyMapCapacitor.getmarkerbyId("journey_end")!;
                end.setDraggable(true);
                end.on("dragend", () => {
                    emit("markerDragged", end.getLngLat(), "journey_end");
                });
            }

            emit("ready");
        }
    }
);
watch(
    () => props.stopPoints,
    (newVal) => {
        const array: Array<number[]> = new Array();

        array.push([useJourney.editJourney.start?.longitude!, useJourney.editJourney.start?.latitude!]);
        newVal?.forEach((exp) => {
            array.push([exp.poi.location.longitude, exp.poi.location.latitude]);
        });
        array.push([useJourney.editJourney.end?.longitude!, useJourney.editJourney.end?.latitude!]);

        const feature: GeoJSON.Feature = {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: array
            },
            properties: {}
        };
        JourneyMapCapacitor.addStopPoint(feature);
    },
    { deep: true }
);
</script>
<style></style>
