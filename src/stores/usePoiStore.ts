import type { AxiosError } from "axios";
import axios from "axios";
import { defineStore } from "pinia";
import { PoiDto } from "types/dtos";
import { ref } from "vue";

export const usePoiStore = defineStore("poi", () => {
    const poiRef = ref<GeoJSON.FeatureCollection>({
        features: [],
        type: "FeatureCollection"
    });

    async function getThumbnail(poi: PoiDto) {
        return await axios.post("api/poi/thumbnail", poi).then((r) => {
            return r;
        });
    }
    async function searchBetween(lat: number, lng: number, radius: number): Promise<boolean> {
        return await axios
            .get(`api/poi?lat=${lat}&lng=${lng}&radius=${radius}`)
            .then((response) => {
                if (poiRef.value?.features?.length > 0) {
                    poiRef.value.features = [];
                }

                poiRef.value = {
                    type: "FeatureCollection",
                    features: []
                };
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                (response.data.data as PoiDto[]).forEach((poi) => {
                    poiRef.value.features.push({
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: [poi.location!.longitude, poi.location!.latitude]
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

    return { poiRef, searchBetween, getThumbnail };
});
