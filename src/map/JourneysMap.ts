import mapboxgl, { GeoJSONSource } from "mapbox-gl";
import GeoJSON from "geojson";
import { JourneyDto } from "types/dtos";
import { JourneysMap } from "journeys-capacitor-mapbox";
/*
export namespace Journeys {
    export const MapLayer = {
        journey_route: "journey_route",
        journey_list: "journey_list",
        journey_list_route: "journey_list_route",
        journey_experiences: "journey_experiences",
        journey_cluster: "journey_clusters",
        poi_list: "poi_list",
        poi_cluster: "poi_cluster"
    };

    export let map: mapboxgl.Map;
    export let JourneysExperienceMarker: mapboxgl.Marker[] = [];
    export function loadMap(container: string) {
        const apiKey = import.meta.env.VITE_MAPTILER_API_KEY;
        JourneysMap.createMap(
            {
                container: container,
                style: `https://api.maptiler.com/maps/voyager/style.json?key=${apiKey}`,
                zoom: 3,
                center: [30, 50],
                projection: {
                    name: "globe"
                }
            },
            "pk.eyJ1IjoiaGV5bWFudWVsIiwiYSI6ImNsOXR1Zm5tbDFlYm8zdXRmaDRwY21qYXoifQ.3A8osuJSSk3nzULihiAOPg"
        );
    }

    export function clearMap(resetZoom: boolean) {
        JourneysMap.clearSource(MapLayer.journey_experiences);
        JourneysMap.clearSource(MapLayer.journey_list);
        JourneysMap.clearSource(MapLayer.journey_route);
        if (resetZoom) JourneysMap.setZoom(3);
    }

    export function getSource(id: string): GeoJSONSource {
        return JourneysMap.getSource(id) as GeoJSONSource;
    }
    export function createMarker(imageUrl: string, lng: number, lat: number, bgSize: string, size: string) {
        const marker = document.createElement("div");
        marker.className = "marker";

        marker.style.backgroundImage = `url(${imageUrl})`;
        marker.style.width = size;
        marker.style.height = size;
        marker.style.backgroundRepeat = "no-repeat";
        marker.style.borderRadius = "50%";
        marker.style.backgroundPosition = "center center";
        marker.style.backgroundSize = bgSize;
        marker.style.display = "block";
        return JourneysMap.addMarker(new mapboxgl.Marker(marker).setLngLat(new mapboxgl.LngLat(lng, lat)));
    }
    export function addSource(id: string, data?: GeoJSON.FeatureCollection | GeoJSON.Feature, journey?: JourneyDto) {
        let collection: GeoJSON.FeatureCollection;
        switch (id) {
            case MapLayer.journey_experiences:
                if (journey) {
                    JourneysExperienceMarker.push(
                        createMarker(
                            "src/assets/icon/flag-start.svg",
                            journey.start?.longitude!,
                            journey.start?.latitude!,
                            "cover",
                            "20px"
                        )
                    );
                    JourneysExperienceMarker.push(
                        createMarker(
                            "src/assets/icon/flag-end.svg",
                            journey.end?.longitude!,
                            journey.end?.latitude!,
                            "cover",
                            "20px"
                        )
                    );
                }
                collection = data as GeoJSON.FeatureCollection;
                if (collection) {
                    collection.features.forEach((exp) => {
                        JourneysExperienceMarker.push(
                            createMarker(
                                exp.properties!.images.length > 0
                                    ? exp.properties!.images[0]
                                    : "https://firebasestorage.googleapis.com/v0/b/journeys-v2/o/images%2Fplaceholder.png?alt=media&token=c921b603-8028-42d4-a7a3-7b186f427c98",
                                (exp.geometry as GeoJSON.Point).coordinates[0],
                                (exp.geometry as GeoJSON.Point).coordinates[1],
                                "100%",
                                "30px"
                            )
                        );
                    });
                }
                break;
            case MapLayer.journey_list:
                JourneysMap.addSource(id, {
                    type: "geojson",
                    data: data
                });

                JourneysMap.addLayer({
                    id: id,
                    type: "circle",
                    source: id,
                    paint: {
                        "circle-color": "#FFBA93",
                        "circle-radius": 6,
                        "circle-stroke-width": 1,
                        "circle-stroke-color": "#fff"
                    }
                });

                break;
            case MapLayer.journey_route:
                JourneysMap.addSource(MapLayer.journey_route, {
                    type: "geojson",
                    data: data
                });
                JourneysMap.addLayer({
                    id: MapLayer.journey_route,
                    type: "line",
                    source: MapLayer.journey_route,
                    layout: {
                        "line-join": "round",
                        "line-cap": "round"
                    },
                    paint: {
                        "line-color": "#555",
                        "line-width": 2
                    }
                });
                JourneysMap.addLayer({
                    id: MapLayer.journey_route + "_symbol",
                    type: "symbol",
                    source: MapLayer.journey_route,
                    layout: {
                        "text-justify": "center",
                        "symbol-placement": "line-center",
                        "text-font": ["Open Sans Regular"],
                        "text-field": "{title}",
                        "text-size": 16
                    },
                    paint: {
                        "text-translate": [0, -10]
                    }
                });

                break;
        }
    }

    export function clearSource(id: string) {
        switch (id) {
            case MapLayer.journey_experiences:
                if (JourneysExperienceMarker && JourneysExperienceMarker.length > 0) {
                    JourneysExperienceMarker.forEach((marker) => marker.remove());
                    JourneysExperienceMarker = [];
                }
                /*clear_layer(MapLayer.journey_experiences);
                    clear_layer(MapLayer.journey_experiences + "_cluster");
                    clear_layer(MapLayer.journey_experiences + "_cluster_count");
                    clear_layer(MapLayer.journey_experiences + "_unclustered");
                    JourneysMap.removeSource(MapLayer.journey_experiences);

                break;
            case MapLayer.journey_list:
                if (getSource(MapLayer.journey_list)) {
                    clearLayer(MapLayer.journey_list);
                    clearLayer(MapLayer.journey_list + "_cluster");
                    clearLayer(MapLayer.journey_list + "_cluster_count");
                    clearLayer(MapLayer.journey_list + "_unclustered");
                    JourneysMap.removeSource(MapLayer.journey_list);
                }
                break;
            case MapLayer.journey_route:
                if (getSource(MapLayer.journey_route)) {
                    clearLayer(MapLayer.journey_route);
                    clearLayer(MapLayer.journey_route + "_symbol");

                    JourneysMap.removeSource(MapLayer.journey_route);
                }
                break;
        }
    }

    export function clearLayer(id: string) {
        if (JourneysMap.getLayer(id)) JourneysMap.removeLayer(id);
    }
    export function getMidPoint(start: mapboxgl.LngLat, end: mapboxgl.LngLat) {
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
}*/
