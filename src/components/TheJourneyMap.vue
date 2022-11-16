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
import { PoiDto } from "types/dtos";
import { useJourneyStore } from "stores/useJourneyStore";
import { usePoiStore } from "stores/usePoiStore";
import { useUserStore } from "stores/useUserStore";
import { getMidPoint } from "utils/utils";

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
const poiStore = usePoiStore();
const userStore = useUserStore();

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
    async (newVal) => {
        if (props.mode == "viewJourney" && newVal != undefined) {
            let featureCollection: GeoJSON.FeatureCollection = {
                type: "FeatureCollection",
                features: []
            };

            journeyStore.viewJourney.experiencesConnection?.edges?.forEach((experience) => {
                featureCollection.features.push({
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [experience.node.location.longitude, experience.node.location.latitude]
                    },
                    properties: experience,
                    id: experience.node.id
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
            await JourneyMapCapacitor.addJourneysExperiencesLayer(featureCollection);

            emit("ready");
        }
    }
);

watch(
    () => userStore.myJourneys,
    async (newValue) => {
        if (newValue != undefined) {
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
            await JourneyMapCapacitor.addJourneyListLayer(geoJSONJourney);
        } else {
            await JourneyMapCapacitor.clearMap(false);
        }

        emit("ready");
    },
    { deep: true }
);

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
                coordinates: [poi.location.longitude, poi.location.latitude]
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
    journeyStore.editJourney.journey?.experiencesConnection?.edges?.forEach((element) => {
        coords.push([element.node.location.longitude, element.node.location.latitude]);
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

watch(
    () => poiStore.poisBetween,
    async (newVal) => {
        if (newVal?.length! > 0) {
            const data = buildPoiGeoData(newVal!);
            if (data?.features.length! > 0) {
                await JourneyMapCapacitor.addPoiListLayer(data!);
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
            }
        }
        emit("ready");
    }
);
watch(
    () => journeyStore.editJourney.journey?.experiencesConnection?.edges!,
    (newVal) => {
        const array: Array<number[]> = new Array();

        array.push([
            journeyStore.editJourney.journey?.start?.longitude!,
            journeyStore.editJourney.journey?.start?.latitude!
        ]);
        newVal?.forEach((exp) => {
            array.push([exp.node.location.longitude, exp.node.location.latitude]);
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

watch(
    () => props.mode,
    async () => {
        const m = await JourneyMapCapacitor.getMap();
        m?.resize();
    }
);
</script>
<style></style>
