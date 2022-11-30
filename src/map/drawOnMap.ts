import { useUserStore } from "stores/useUserStore";
import { useJourneyStore } from "stores/useJourneyStore";
import { usePoiStore } from "stores/usePoiStore";

import { mapInstance } from "./JourneysMap";
import { LngLat } from "mapbox-gl";
import { JourneyDto, PoiDto } from "types/dtos";
import { getMidPoint } from "utils/utils";

const userStore = useUserStore();
const poiStore = usePoiStore();
const journeyStore = useJourneyStore();

export function drawMyJourneys() {
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
    mapInstance.addJourneyListLayer(geoJSONJourney);
}

export function drawJourney(journey: JourneyDto) {
    const featureCollection: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: []
    };

    journey.experiencesConnection?.edges?.forEach((exp) => {
        const n = exp.node as PoiDto;
        featureCollection.features.push({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [n.location!.longitude, n.location!.latitude]
            },
            properties: exp,
            id: exp.node.id
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

    array.push([journeyStore.editJourney.start?.longitude!, journeyStore.editJourney.start?.latitude!]);
    journeyStore.editJourney.experiencesConnection?.edges!?.forEach((exp) => {
        const n = exp.node as PoiDto;
        array.push([n.location!.longitude, n.location!.latitude]);
    });
    array.push([journeyStore.editJourney.end?.longitude!, journeyStore.editJourney.end?.latitude!]);

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

export async function drawPoisBetween() {
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

    coords.push([journeyStore.editJourney.start?.longitude!, journeyStore.editJourney.start?.latitude!]);
    journeyStore.editJourney.experiencesConnection?.edges?.forEach((exp) => {
        const n = exp.node as PoiDto;
        coords.push([n.location!.longitude, n.location!.latitude]);
    });
    coords.push([journeyStore.editJourney.end?.longitude!, journeyStore.editJourney.end?.latitude!]);

    geoJsonData.features.push({
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates: coords
        },
        properties: {
            start: journeyStore.editJourney.start,
            end: journeyStore.editJourney.end
        },
        id: "editJourney"
    });
    mapInstance.addPoiListLayer(geoJsonData);
}
