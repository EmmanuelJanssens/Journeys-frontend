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
import { onMounted, watch } from "vue";
import mapboxgl from "mapbox-gl";
import { JourneyMapCapacitor } from "journeys-capacitor-mapbox";
import GeoJSON from "geojson";
import { ExperienceDto, PoiDto } from "types/dtos";
import { useJourneyStore } from "stores/useJourneyStore";
import exp from "constants";

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
}>();

const journeyStore = useJourneyStore();
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
    () => journeyStore.viewJourney,
    async (newVal, oldValue) => {
        console.log(newVal);
        console.log(props.mode);
        if (props.mode == "viewJourney" && newVal != undefined) {
            map.resize();

            let featureCollection: GeoJSON.FeatureCollection = {
                type: "FeatureCollection",
                features: []
            };

            journeyStore.viewJourney.experiences?.forEach((experience) => {
                featureCollection.features.push({
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [experience.poi.location.longitude, experience.poi.location.latitude]
                    },
                    properties: experience.experience,
                    id: experience.poi.id
                });
            });

            const coords = Array<number[]>();

            coords.push([journeyStore.viewJourney.start?.longitude!, journeyStore.viewJourney.start?.latitude!]);
            featureCollection.features.forEach((element) => {
                coords.push((element.geometry as GeoJSON.Point).coordinates);
            });
            coords.push([journeyStore.viewJourney.end?.longitude!, journeyStore.viewJourney.end?.latitude!]);
            const center = getMidPoint(
                new mapboxgl.LngLat(
                    journeyStore.viewJourney.start?.longitude!,
                    journeyStore.viewJourney.start?.latitude!
                ),
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
            console.log(featureCollection);
            await JourneyMapCapacitor.addJourneysExperiencesLayer(featureCollection);
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

        array.push([
            journeyStore.editJourney.journey?.start?.longitude!,
            journeyStore.editJourney.journey?.start?.latitude!
        ]);
        newVal?.forEach((exp) => {
            array.push([exp.poi.location.longitude, exp.poi.location.latitude]);
        });
        array.push([
            journeyStore.editJourney.journey?.end?.longitude!,
            journeyStore.editJourney.journey?.end?.latitude!
        ]);

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
</script>
<style></style>
