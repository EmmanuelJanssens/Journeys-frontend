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
import { IonIcon, IonFab, IonFabButton, IonContent, modalController, onIonViewWillEnter } from "@ionic/vue";
import { onMounted, ref, watch } from "vue";
import mapboxgl, { Marker } from "mapbox-gl";
import CreateJourneyModal from "components/Modals/CreateJourneyModal.vue";
import { GeocodedData } from "types/journeys";
import { JourneysMap } from "journeys-capacitor-mapbox";
import GeoJSON from "geojson";
import { JourneyDto } from "types/dtos";
import { useJourneyStore } from "stores/useJourneyStore";
import { start } from "repl";
import { Journeys } from "map/JourneysMap";

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
    pois: GeoJSON.FeatureCollection | undefined;
    journeyExperiences: GeoJSON.FeatureCollection;
    journeys: JourneyDto[] | undefined;
    stopPoints: number[][] | undefined;
}>();

const emit = defineEmits(["loaded", "createNew"]);
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
});
watch(
    () => props.journeyExperiences,
    async (newVal, oldVal) => {
        if (props.mode == "viewJourney") {
            const map = await JourneysMap.getMap();
            JourneysMap.addJourneysExperiencesLayer(props.journeyExperiences);
            //JourneysMap.addSource(mapLayer.journey_experiences, props.journeyExperiences, useJourney.viewJourney);
        }
    }
);
watch(
    () => props.journeys,
    async (newValue, oldvalue) => {
        const geoJSONJourney: GeoJSON.FeatureCollection = {
            type: "FeatureCollection",
            features: []
        };

        newValue!.forEach((journey) => {
            geoJSONJourney.features.push(useJourney.journeyToGeojson(journey)[0]);
            geoJSONJourney.features.push(useJourney.journeyToGeojson(journey)[1]);
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
        JourneysMap.addJourneyListLayer(geoJSONJourney);
    },
    { deep: true }
);
watch(
    () => props.mode,
    async (newval, oldVal) => {
        if (newval == "edition") {
            console.log(useJourney.editJourney);
            const map = await JourneysMap.getMap();
            JourneysMap.clearSource(mapLayer.journey_list);
            JourneysMap.clearSource(mapLayer.journey_route);
            JourneysMap.addSource(mapLayer.poi_list, props.pois, useJourney.editJourney);
        }
    }
);
watch(
    () => props.stopPoints,
    (newVal, oldVal) => {
        JourneysMap.addStopPoint(newVal!);
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
