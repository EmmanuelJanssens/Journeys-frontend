import { useUserStore } from "stores/useUserStore";
import { useJourneyStore } from "stores/useJourneyStore";
import { usePoiStore } from "stores/usePoiStore";

import { mapInstance } from "./JourneysMap";
import { LngLat } from "mapbox-gl";
import { getMidPoint } from "utils/utils";
import { Journey } from "types/JourneyDtos";

const userStore = useUserStore();
const poiStore = usePoiStore();
const journeyStore = useJourneyStore();

export function drawMyJourneys() {
    const geoJSONJourney: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: []
    };
    userStore.myJourneys.journeys.forEach((journey) => {
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

    journey.experiences?.forEach((experience) => {
        featureCollection.features.push({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [experience.poi.location.longitude, experience.poi.location.latitude]
            },
            properties: experience.data,
            id: experience.poi.id
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
    const array: Array<number[]> = new Array();

    array.push([journeyStore.journey.start?.longitude!, journeyStore.journey.start?.latitude!]);
    journeyStore.journey.experiences?.forEach((experience) => {
        array.push([experience.poi.location.longitude, experience.poi.location.latitude]);
    });
    array.push([journeyStore.journey.end?.longitude!, journeyStore.journey.end?.latitude!]);

    const feature: GeoJSON.Feature = {
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates: array
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

    coords.push([journeyStore.journey.start?.longitude!, journeyStore.journey.start?.latitude!]);
    journeyStore.journey.experiences?.forEach((experience) => {
        coords.push([experience.poi.location.longitude, experience.poi.location.latitude]);
    });
    coords.push([journeyStore.journey.end?.longitude!, journeyStore.journey.end?.latitude!]);

    geoJsonData.features.push({
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates: coords
        },
        properties: {
            start: journeyStore.journey.start,
            end: journeyStore.journey.end
        },
        id: "journey"
    });
    mapInstance.addPoiListLayer(geoJsonData, zoom);
}
