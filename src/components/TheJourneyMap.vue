<template>
    <div class="relative">
        <section
            id="Map"
            style="
                 {
                    width: 100%;
                    height: 100%;
                }
            "></section>
        <slot name="fab"></slot>
    </div>
</template>
<script lang="ts" setup>
// import { onMounted, watch } from "vue";
// import mapboxgl, { LngLat, MapMouseEvent } from "mapbox-gl";
// import GeoJSON from "geojson";
// import { ExperienceDto, PoiDto } from "types/dtos";
// import { useJourneyStore } from "stores/useJourneyStore";
// import { usePoiStore } from "stores/usePoiStore";
// import { useUserStore } from "stores/useUserStore";
// import { getMidPoint } from "utils/utils";
// import { alertController } from "@ionic/core";
// import axios from "axios";
// import { mapInstance, mapLayers } from "map/JourneysMap";
//import "maplibre-gl/dist/maplibre-gl.css";

// const props = defineProps<{
//     mode: string;
// }>();

// const emit = defineEmits<{
//     (e: "loaded"): void;
//     (e: "ready"): void;
//     (e: "modeSwitch", mode: string): void;
//     (e: "markerDragged", pos: mapboxgl.LngLat, marker: string): void;
//     (
//         e: "poiClicked",
//         poi: PoiDto,
//         evt: mapboxgl.MapMouseEvent & {
//             features?: mapboxgl.MapboxGeoJSONFeature[] | undefined;
//         } & mapboxgl.EventData
//     ): void;
// }>();

// const journeyStore = useJourneyStore();
// const poiStore = usePoiStore();
// const userStore = useUserStore();

// var map: mapboxgl.Map;
// async function getCountryLoc() {
//     const loc = await axios.get(`https://api.ipregistry.co/?key=${import.meta.env.VITE_IP_REGESTRY_KEY}`);
//     return new LngLat(loc.data.location.longitude, loc.data.location.latitude);
// }
// onMounted(async () => {
//     const center = await getCountryLoc();
//     mapInstance.loadMap(
//         "pk.eyJ1IjoiaGV5bWFudWVsIiwiYSI6ImNsOXR1Zm5tbDFlYm8zdXRmaDRwY21qYXoifQ.3A8osuJSSk3nzULihiAOPg",
//         "Map",
//         center,
//         "mapbox://styles/heymanuel/clawunauz000814nsgx6d2fjx"
//     );
//     map = mapInstance.getMap()!;
//     map.on("load", () => {
//         emit("loaded");
//         emit("ready");
//     });
//     map.on("style.load", () => {
//         map.setFog({});
//         map.resize();
//     });
//     map.on(
//         "click",
//         mapLayers.poi_list + "_unclustered",
//         (
//             e: mapboxgl.MapMouseEvent & {
//                 features?: mapboxgl.MapboxGeoJSONFeature[] | undefined;
//             } & mapboxgl.EventData
//         ) => {
//             emit("poiClicked", e.features![0].properties as PoiDto, e);
//         }
//     );
//     map.on("click", mapLayers.poi_list + "_cluster", (e) => {
//         onClusterClick(e);
//     });
//     map.on("contextmenu", async (e: MapMouseEvent) => {
//         if (props.mode == "editJourney" || props.mode == "edition") {
//             const alert = await alertController.create({
//                 header: "Confirm poi details",
//                 inputs: [
//                     {
//                         label: "Poi Name",
//                         name: "poiName",
//                         placeholder: "Enter name"
//                     }
//                 ],
//                 buttons: [
//                     "Cancel",
//                     {
//                         text: "OK",
//                         handler: (data) => {
//                             alertController.dismiss(data.poiName, "ok");
//                         }
//                     }
//                 ]
//             });
//             await alert.present();
//             const { data, role } = await alert.onDidDismiss();
//             if (role == "ok" && data?.length! > 0) {
//                 const poi: PoiDto = {
//                     name: data,
//                     location: {
//                         latitude: e.lngLat.lat,
//                         longitude: e.lngLat.lng
//                     }
//                 };
//                 if (poi.thumbnail != undefined) delete poi.thumbnail;
//                 const added = await poiStore.addPoi(poi);
//                 const experience: ExperienceDto = {
//                     title: "",
//                     date: new Date().toISOString(),
//                     description: "",
//                     images: [],
//                     order: journeyStore.editJourney.journey!.experiencesConnection?.edges?.length!,
//                     node: added!
//                 };
//                 journeyStore.addToJourney(experience);
//             }
//         }
//     });
// });
// function onClusterClick(e: MapMouseEvent) {
//     const features = map.queryRenderedFeatures(e.point, {
//         layers: [mapLayers.poi_list + "_cluster"]
//     });

//     const clusterId = features![0].properties!.cluster_id;
//     const source: mapboxgl.GeoJSONSource = map.getSource(mapLayers.poi_list) as mapboxgl.GeoJSONSource;
//     source.getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
//         if (err) return;
//         if (features![0].geometry.type === "Point") {
//             map.easeTo({
//                 center: [features![0].geometry.coordinates[0], features![0].geometry.coordinates[1]],
//                 zoom: zoom
//             });
//         }
//     });
// }
// watch(
//     () => journeyStore.viewJourney,
//     async (newVal) => {
//         if (props.mode == "viewJourney" && newVal != undefined) {
//             let featureCollection: GeoJSON.FeatureCollection = {
//                 type: "FeatureCollection",
//                 features: []
//             };

//             journeyStore.viewJourney.experiencesConnection?.edges?.forEach((exp) => {
//                 const n = exp.node as PoiDto;
//                 featureCollection.features.push({
//                     type: "Feature",
//                     geometry: {
//                         type: "Point",
//                         coordinates: [n.location!.longitude, n.location!.latitude]
//                     },
//                     properties: exp,
//                     id: exp.node.id
//                 });
//             });

//             const coords = Array<number[]>();

//             coords.push([journeyStore.viewJourney.start?.longitude!, journeyStore.viewJourney.start?.latitude!]);
//             featureCollection.features.forEach((element) => {
//                 coords.push((element.geometry as GeoJSON.Point).coordinates);
//             });
//             coords.push([journeyStore.viewJourney.end?.longitude!, journeyStore.viewJourney.end?.latitude!]);
//             const center = getMidPoint(
//                 new mapboxgl.LngLat(
//                     journeyStore.viewJourney.start?.longitude!,
//                     journeyStore.viewJourney.start?.latitude!
//                 ),
//                 new mapboxgl.LngLat(journeyStore.viewJourney.end?.longitude!, journeyStore.viewJourney.end?.latitude!)
//             );
//             featureCollection.features.push({
//                 type: "Feature",
//                 properties: {
//                     start: journeyStore.viewJourney.start,
//                     end: journeyStore.viewJourney.end,
//                     center: center
//                 },
//                 geometry: {
//                     type: "LineString",
//                     coordinates: coords
//                 },
//                 id: journeyStore.viewJourney.id
//             });
//             await mapInstance.addJourneysExperiencesLayer(featureCollection);

//             emit("ready");
//         }
//     }
// );

// watch(
//     () => userStore.myJourneys,
//     async (newValue) => {
//         if (newValue != undefined) {
//             const geoJSONJourney: GeoJSON.FeatureCollection = {
//                 type: "FeatureCollection",
//                 features: []
//             };

//             userStore.myJourneys!.forEach((journey) => {
//                 geoJSONJourney.features.push(journeyStore.journeyToGeojson(journey)[0]);
//                 geoJSONJourney.features.push(journeyStore.journeyToGeojson(journey)[1]);
//                 geoJSONJourney.features.push({
//                     type: "Feature",
//                     geometry: {
//                         type: "LineString",
//                         coordinates: [
//                             [journey.start?.longitude!, journey.start?.latitude!],
//                             [journey.end?.longitude!, journey.end?.latitude!]
//                         ]
//                     },
//                     properties: {
//                         title: journey.title
//                     },
//                     id: journey.id
//                 });
//             });
//             await mapInstance.addJourneyListLayer(geoJSONJourney);
//         } else {
//             await mapInstance.clearMap();
//         }

//         emit("ready");
//     },
//     { deep: true }
// );

// function buildPoiGeoData(pois: PoiDto[]) {
//     const geoJsonData: GeoJSON.FeatureCollection = {
//         type: "FeatureCollection",
//         features: []
//     };
//     pois.forEach((poi) => {
//         geoJsonData.features.push({
//             type: "Feature",
//             geometry: {
//                 type: "Point",
//                 coordinates: [poi.location!.longitude, poi.location!.latitude]
//             },
//             properties: poi,
//             id: poi.id
//         });
//     });

//     const coords = Array<number[]>();

//     coords.push([
//         journeyStore.editJourney.journey?.start?.longitude!,
//         journeyStore.editJourney.journey?.start?.latitude!
//     ]);
//     journeyStore.editJourney.journey?.experiencesConnection?.edges?.forEach((exp) => {
//         const n = exp.node as PoiDto;
//         coords.push([n.location!.longitude, n.location!.latitude]);
//     });
//     coords.push([journeyStore.editJourney.journey?.end?.longitude!, journeyStore.editJourney.journey?.end?.latitude!]);

//     geoJsonData.features.push({
//         type: "Feature",
//         geometry: {
//             type: "LineString",
//             coordinates: coords
//         },
//         properties: {
//             start: journeyStore.editJourney.journey?.start,
//             end: journeyStore.editJourney.journey?.end
//         },
//         id: "editJourney"
//     });
//     return geoJsonData;
// }

// watch(
//     () => poiStore.poisBetween,
//     async (newVal) => {
//         if (newVal?.length! > 0) {
//             const data = buildPoiGeoData(newVal!);
//             if (data?.features.length! > 0) {
//                 await mapInstance.addPoiListLayer(data!);
//                 const start = await mapInstance.getmarkerbyId("journey_start")!;
//                 if (props.mode != "editJourney") {
//                     start.setDraggable(true);
//                     start.on("dragend", () => {
//                         emit("markerDragged", start.getLngLat(), "journey_start");
//                     });
//                     const end = await mapInstance.getmarkerbyId("journey_end")!;
//                     end.setDraggable(true);
//                     end.on("dragend", () => {
//                         emit("markerDragged", end.getLngLat(), "journey_end");
//                     });
//                 }
//             }
//         } else {
//             mapInstance.clearMap();
//         }
//         emit("ready");
//     },
//     { deep: true }
// );
// watch(
//     () => journeyStore.editJourney.journey?.experiencesConnection?.edges!,
//     (newVal) => {
//         const array: Array<number[]> = new Array();

//         array.push([
//             journeyStore.editJourney.journey?.start?.longitude!,
//             journeyStore.editJourney.journey?.start?.latitude!
//         ]);
//         newVal?.forEach((exp) => {
//             const n = exp.node as PoiDto;
//             array.push([n.location!.longitude, n.location!.latitude]);
//         });
//         array.push([
//             journeyStore.editJourney.journey?.end?.longitude!,
//             journeyStore.editJourney.journey?.end?.latitude!
//         ]);

//         const feature: GeoJSON.Feature = {
//             type: "Feature",
//             geometry: {
//                 type: "LineString",
//                 coordinates: array
//             },
//             properties: {}
//         };
//         mapInstance.addStopPoint(feature);
//     },
//     { deep: true }
// );

// watch(
//     () => props.mode,
//     async () => {
//         const m = await mapInstance.getMap();
//         m?.resize();
//     }
// );
</script>
<style></style>
