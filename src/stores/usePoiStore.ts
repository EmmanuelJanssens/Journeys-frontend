import type { AxiosError } from "axios";
import axios from "axios";
import { defineStore } from "pinia";
import { PoiDto } from "types/dtos";
import { PoiGeoJsonData, ApiError } from "types/journeys";
import { ref } from "vue";

export const usePoiStore = defineStore("poi", () => {
    const poiRef = ref<PoiGeoJsonData>({
        crs: {
            properties: {
                name: ""
            },
            type: ""
        },
        features: [],
        type: ""
    });

    async function searchBetween(
        lat: number,
        lng: number,
        radius: number
    ): Promise<boolean> {
        return await axios
            .get(`api/poi?lat=${lat}&lng=${lng}&radius=${radius}`)
            .then((response) => {
                if (poiRef.value?.features?.length > 0) {
                    poiRef.value.features = [];
                }

                poiRef.value = {
                    type: "FeatrureCollection",
                    crs: {
                        type: "name",
                        properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" }
                    },
                    features: []
                };
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                (response.data.data as PoiDto[]).forEach((poi) => {
                    poiRef.value.features.push({
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: [
                                poi.location!.longitude,
                                poi.location!.latitude
                            ]
                        },
                        properties: poi,
                        id: poi.id
                    });
                });
                return true;
            })
            .catch((error: AxiosError) => {
                return false;
            });
    }

    return { poiRef, searchBetween };
});
