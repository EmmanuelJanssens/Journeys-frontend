import { useUserStore } from "stores/useUserStore";
import { useJourneyStore } from "stores/useJourneyStore";
import { usePoiStore } from "stores/usePoiStore";

import { mapInstance } from "./JourneysMap";
import { LngLat } from "mapbox-gl";
import { getMidPoint } from "utils/utils";

import { Journey } from "types/journey/journey";
import { Experience } from "types/experience/experience";
const userStore = useUserStore();
const poiStore = usePoiStore();
const journeyStore = useJourneyStore();

export function drawMyJourneys() {
    const geoJSONJourney: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: []
    };
    userStore.myJourneys.forEach((journey) => {
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
    mapInstance.addJourneyListLayer(geoJSONJourney);
}

export function drawJourney(journey: Journey) {
    const featureCollection: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: []
    };
    journey.experiences?.forEach((experience: Experience) => {
        featureCollection.features.push({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [experience.poi.location.longitude, experience.poi.location.latitude]
            },
            properties: experience,
            id: experience.id
        });
    });
    const coords = Array<number[]>();
    coords.push([journey.start?.longitude!, journey.start?.latitude!]);
    featureCollection.features.forEach((element) => {
        coords.push((element.geometry as GeoJSON.Point).coordinates);
    });
    coords.push([journey.end?.longitude!, journey.end?.latitude!]);
    const center = getMidPoint(
        new LngLat(journey.start?.longitude!, journey.start?.latitude!),
        new LngLat(journey.end?.longitude!, journey.end?.latitude!)
    );
    featureCollection.features.push({
        type: "Feature",
        properties: {
            start: journey.start,
            end: journey.end,
            center: center
        },
        geometry: {
            type: "LineString",
            coordinates: coords
        },
        id: journey.id
    });
    mapInstance.addJourneysExperiencesLayer(featureCollection);
}

export function drawExperiences() {
    const coords: Array<number[]> = new Array();
    coords.push([
        journeyStore.journeyToEdit!.journey.start?.longitude!,
        journeyStore.journeyToEdit!.journey.start?.latitude!
    ]);
    journeyStore.journeyToEdit!.experiences.connected?.forEach((experience) => {
        coords.push([experience.poi.location.longitude, experience.poi.location.latitude]);
    });
    journeyStore.journeyToEdit!.experiences.updated?.forEach((experience) => {
        coords.push([experience.poi!.location.longitude, experience.poi!.location.latitude]);
    });
    coords.push([
        journeyStore.journeyToEdit!.journey.end?.longitude!,
        journeyStore.journeyToEdit!.journey.end?.latitude!
    ]);
    const feature: GeoJSON.Feature = {
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates: coords
        },
        properties: {}
    };
    mapInstance.addStopPoint(feature);
}

export async function drawPoisBetween(zoom?: boolean) {
    const geoJsonData: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: []
    };
    const pois = poiStore.poisBetween;
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
        journeyStore.journeyToEdit!.journey.start.longitude!,
        journeyStore.journeyToEdit!.journey.start.latitude!
    ]);
    journeyStore.journeyToEdit!.experiences.connected?.forEach((experience) => {
        coords.push([experience.poi.location.longitude, experience.poi.location.latitude]);
    });
    journeyStore.journeyToEdit!.experiences.updated?.forEach((experience) => {
        coords.push([experience.poi!.location.longitude, experience.poi!.location.latitude]);
    });
    coords.push([
        journeyStore.journeyToEdit!.journey.end?.longitude!,
        journeyStore.journeyToEdit!.journey.end?.latitude!
    ]);

    geoJsonData.features.push({
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates: coords
        },
        properties: {
            start: journeyStore.journeyToEdit!.journey.start,
            end: journeyStore.journeyToEdit!.journey.end
        },
        id: "journey"
    });
    mapInstance.addPoiListLayer(geoJsonData, zoom);
}
