import type { AxiosError } from "axios";
import axios from "axios";
import { authApp } from "google/firebase";
import { defineStore } from "pinia";
import { PoiDto } from "types/dtos";
import { ref } from "vue";

export const usePoiStore = defineStore("poi", () => {
    const poisBetween = ref<PoiDto[]>();

    async function getThumbnail(poi: PoiDto) {
        return await axios.post("api/poi/thumbnail", poi).then((r) => {
            return r;
        });
    }
    async function searchBetween(lat: number, lng: number, radius: number): Promise<boolean> {
        return await axios
            .get(`api/poi?lat=${lat}&lng=${lng}&radius=${radius}`)
            .then((response) => {
                if (poisBetween.value?.length! > 0) {
                    poisBetween.value = [];
                }
                poisBetween.value = response.data.data;
                return true;
            })
            .catch((error: AxiosError) => {
                return false;
            });
    }
    async function getPoiExperiences(poi: PoiDto) {
        return await (
            await axios.get("api/poi/" + poi.id)
        ).data;
    }

    async function addPoi(poi: PoiDto) {
        try {
            const token = await authApp.currentUser?.getIdToken(true);
            const result = await axios.post("api/poi/", poi, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            poisBetween.value?.push(result.data);
            return result.data as PoiDto;
        } catch (e) {
            return undefined;
        }
    }
    function clear() {
        poisBetween.value = [];
    }
    return { searchBetween, getThumbnail, clear, poisBetween, getPoiExperiences, addPoi };
});
