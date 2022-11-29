import type { AxiosError } from "axios";
import axios from "axios";
import { authApp } from "google/firebase";
import { defineStore } from "pinia";
import { PoiDto } from "types/dtos";
import { ref } from "vue";

export const usePoiStore = defineStore("poi", () => {
    const poisBetween = ref<PoiDto[]>([]);

    async function getThumbnail(poi: PoiDto) {
        return await axios.post("api/poi/thumbnail", poi).then((r) => {
            return r;
        });
    }

    function waitForPoi(time: number, resolve?: (data: any) => void, reject?: (data: any) => void) {
        console.log("no pois");

        if (!poisBetween.value?.length && poisBetween.value?.length! <= 0) {
            if (time > 4) {
                if (reject) reject(false);
                return;
            } else {
                setTimeout(() => {
                    waitForPoi(time + 1, resolve, reject);
                }, 500);
            }
        } else {
            console.log(" pois");

            if (resolve) resolve(true);
        }
    }

    async function poiDidLoad() {
        const promise = new Promise<any>((resolve, reject) => {
            waitForPoi(0, resolve, reject);
        });
        return promise;
    }

    async function poiCountBetween(lat: number, lng: number, radius: number): Promise<number> {
        try {
            const res = await axios.get(`api/poi/count?lat=${lat}&lng=${lng}&radius=${radius}`);
            return res.data;
        } catch (e) {
            return 0;
        }
    }
    async function searchBetween(lat: number, lng: number, radius: number): Promise<boolean> {
        try {
            const response = await axios.get(`api/poi?lat=${lat}&lng=${lng}&radius=${radius}`);
            if (poisBetween.value?.length! > 0) {
                poisBetween.value = [];
            }
            poisBetween.value = response.data.data;
            return true;
        } catch (e) {
            return false;
        }
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
    return { poiCountBetween, searchBetween, getThumbnail, clear, poisBetween, getPoiExperiences, addPoi, poiDidLoad };
});
