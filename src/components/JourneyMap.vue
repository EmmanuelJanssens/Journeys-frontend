<template>
    <ion-content>
        <section
            id="Map"
            style="
                 {
                    width: 100%;
                    height: 100%;
                    z-index: 999;
                }
            "></section>
        <ion-fab vertical="top" horizontal="end" slot="fixed">
            <ion-fab-button @click="openJourneyCreationModal">
                <ion-icon size="large" src="/src/assets/icon/add-outline.svg"></ion-icon>
            </ion-fab-button>
        </ion-fab>
    </ion-content>
</template>
<script lang="ts" setup>
import { IonIcon, IonFab, IonFabButton, IonContent, modalController } from "@ionic/vue";
import { onMounted, ref, watch } from "vue";
import mapboxgl from "mapbox-gl";
import CreateJourneyModal from "components/Modals/CreateJourneyModal.vue";
import { GeocodedData } from "types/journeys";
import { JourneysMap } from "journeys-capacitor-mapbox";
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
    pois: GeoJSON.FeatureCollection;
    journeyExperiences: GeoJSON.FeatureCollection;
    journeys: GeoJSON.FeatureCollection;
    stopPoints: ExperienceDto[] | undefined;
}>();

const emit = defineEmits<{
    (e: "loaded"): void;
    (e: "createNew", data: { start: GeocodedData; end: GeocodedData }): void;
    (e: "markerDragged", pos: mapboxgl.LngLat, marker: string): void;
    (
        e: "poiClicked",
        poi: PoiDto,
        evt: mapboxgl.MapMouseEvent & {
            features?: mapboxgl.MapboxGeoJSONFeature[] | undefined;
        } & mapboxgl.EventData
    ): void;
}>();
const map = ref<mapboxgl.Map>();

const useJourney = useJourneyStore();
onMounted(async () => {
    await JourneysMap.loadMap(
        "pk.eyJ1IjoiaGV5bWFudWVsIiwiYSI6ImNsOXR1Zm5tbDFlYm8zdXRmaDRwY21qYXoifQ.3A8osuJSSk3nzULihiAOPg",
        import.meta.env.VITE_MAPTILER_API_KEY,
        "Map"
    );
    map.value = await JourneysMap.getMap()!;

    map.value?.on("load", () => {
        map.value?.resize();
        map.value?.setFog({});
        emit("loaded");
    });

    map.value.on(
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
        if (props.mode == "viewJourney") {
            JourneysMap.addJourneysExperiencesLayer(newVal!);
        }
    }
);

watch(
    () => props.journeys,
    async (newValue) => {
        JourneysMap.addJourneyListLayer(newValue);
    },
    { deep: true }
);

watch(
    () => props.pois,
    async (newVal) => {
        if (newVal.features.length > 0) {
            JourneysMap.addPoiListLayer(newVal!);
            const start = await JourneysMap.getmarkerbyId("journey_start")!;
            start.setDraggable(true);
            start.on("dragend", () => {
                console.log("changed");
                emit("markerDragged", start.getLngLat(), "journey_start");
            });
            const end = await JourneysMap.getmarkerbyId("journey_end")!;
            end.setDraggable(true);
            end.on("dragend", () => {
                emit("markerDragged", end.getLngLat(), "journey_end");
            });
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
        JourneysMap.addStopPoint(feature);
    },
    { deep: true }
);
const startPoint = ref<GeocodedData>({
    address: "",
    coordinates: new mapboxgl.LngLat(-1, -1)
});
const endPoint = ref<GeocodedData>({
    address: "",
    coordinates: new mapboxgl.LngLat(-1, -1)
});

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
        emit("createNew", {
            start: startPoint.value,
            end: endPoint.value
        });
    }
}
</script>
<style></style>
