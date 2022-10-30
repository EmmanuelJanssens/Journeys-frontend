import mapboxgl, { GeoJSONSource } from "mapbox-gl";
import GeoJSON from "geojson";
import { ExperienceDto, JourneyDto } from "types/dtos";
import { url } from "inspector";

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

    export let JourneysMap: mapboxgl.Map;
    export let JourneysExperienceMarker: mapboxgl.Marker[] = [];
    export function loadMap(container: string) {
        const apiKey = import.meta.env.VITE_MAPTILER_API_KEY;
        mapboxgl.accessToken =
            "pk.eyJ1IjoiaGV5bWFudWVsIiwiYSI6ImNsOXR1Zm5tbDFlYm8zdXRmaDRwY21qYXoifQ.3A8osuJSSk3nzULihiAOPg";
        if (!JourneysMap) {
            JourneysMap = new mapboxgl.Map({
                container: container,
                style: `https://api.maptiler.com/maps/voyager/style.json?key=${apiKey}`,
                zoom: 3,
                center: [30, 50],
                projection: {
                    name: "globe"
                }
            });
        }
    }

    export function clear_map(resetZoom: boolean) {
        if (JourneysMap) {
            clear_source(MapLayer.journey_experiences);
            clear_source(MapLayer.journey_list);
            clear_source(MapLayer.journey_route);
            if (resetZoom) JourneysMap.setZoom(3);
        }
    }

    export function load_once(f: (ev: mapboxgl.EventData & mapboxgl.MapboxEvent<undefined>) => void) {
        JourneysMap.on("load", f);
    }

    export function getSource(id: string): GeoJSONSource {
        return JourneysMap.getSource(id) as GeoJSONSource;
    }
    export function createMarker(imageUrl: string, lng: number, lat: number) {
        const marker = document.createElement("div");
        const style = {
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundPosition: "center center"
        };
        marker.style.backgroundImage = style.backgroundImage;
        marker.style.width = style.width;
        marker.style.height = style.height;
        marker.style.backgroundRepeat = style.backgroundRepeat;
        marker.style.borderRadius = style.borderRadius;
        marker.style.backgroundPosition = style.backgroundPosition;
        return new mapboxgl.Marker(marker).setLngLat(new mapboxgl.LngLat(lng, lat)).addTo(JourneysMap);
    }
    export function addSource(id: string, data?: GeoJSON.FeatureCollection | GeoJSON.Feature, journey?: JourneyDto) {
        if (JourneysMap) {
            let collection: GeoJSON.FeatureCollection;
            switch (id) {
                case MapLayer.journey_experiences:
                    if (journey) {
                        JourneysExperienceMarker.push(
                            createMarker(
                                "src/assets/icon/flag-start.svg",
                                journey.start?.longitude!,
                                journey.start?.latitude!
                            )
                        );
                        JourneysExperienceMarker.push(
                            createMarker(
                                "src/assets/icon/flag-end.svg",
                                journey.end?.longitude!,
                                journey.end?.latitude!
                            )
                        );
                    }
                    collection = data as GeoJSON.FeatureCollection;
                    console.log(data);
                    if (collection) {
                        collection.features.forEach((exp) => {
                            const el = document.createElement("div");
                            el.className = "marker";
                            if (exp.properties!.images.length > 0)
                                el.style.backgroundImage = `url(${exp.properties!.images[0]})`;
                            else
                                el.style.backgroundImage =
                                    "url(https://firebasestorage.googleapis.com/v0/b/journeys-v2/o/images%2Fplaceholder.png?alt=media&token=c921b603-8028-42d4-a7a3-7b186f427c98)";
                            el.style.backgroundSize = "100%";
                            el.style.backgroundColor = "black";
                            el.style.width = "30px";
                            el.style.height = "30px";
                            JourneysExperienceMarker.push(
                                new mapboxgl.Marker(el)
                                    .setLngLat(
                                        new mapboxgl.LngLat(
                                            (exp.geometry as GeoJSON.Point).coordinates[0],
                                            (exp.geometry as GeoJSON.Point).coordinates[1]
                                        )
                                    )
                                    .addTo(JourneysMap)
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
                            "text-translate": [0, -20]
                        }
                    });

                    break;
            }
        }
    }

    export function clear_source(id: string) {
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
                    JourneysMap.removeSource(MapLayer.journey_experiences); */

                break;
            case MapLayer.journey_list:
                if (getSource(MapLayer.journey_list)) {
                    clear_layer(MapLayer.journey_list);
                    clear_layer(MapLayer.journey_list + "_cluster");
                    clear_layer(MapLayer.journey_list + "_cluster_count");
                    clear_layer(MapLayer.journey_list + "_unclustered");
                    JourneysMap.removeSource(MapLayer.journey_list);
                }
                break;
            case MapLayer.journey_route:
                if (getSource(MapLayer.journey_route)) {
                    clear_layer(MapLayer.journey_route);
                    clear_layer(MapLayer.journey_route + "_symbol");

                    JourneysMap.removeSource(MapLayer.journey_route);
                }
                break;
        }
    }

    export function clear_layer(id: string) {
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
}
