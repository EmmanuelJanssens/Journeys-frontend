import type { AxiosError } from "axios";
import axios from "axios";
import { authApp } from "google/firebase";
import { defineStore } from "pinia";
import { PointOfInterest } from "types/JourneyDtos";
import { ref } from "vue";

export const usePoiStore = defineStore("poi", () => {
    const poisBetween = ref<PointOfInterest[]>([]);
    const tagList = ref<{ type: string }[]>();
    async function getThumbnail(poi: PointOfInterest) {
        return await axios.post("/api/poi/thumbnail", poi).then((r) => {
            return r;
        });
    }

    function waitForPoi(time: number, resolve?: (data: any) => void, reject?: (data: any) => void) {
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
            if (resolve) resolve(true);
        }
    }
    async function getTags() {
        const result = await axios.get(`/api/tag`);
        tagList;
        return result.data as { type: string }[];
    }

    async function poiDidLoad() {
        const promise = new Promise<any>((resolve, reject) => {
            waitForPoi(0, resolve, reject);
        });
        return promise;
    }

    async function poiCountBetween(lat: number, lng: number, radius: number): Promise<number> {
        try {
            const query = JSON.stringify({
                location: {
                    longitude: lng,
                    latitude: lat
                },
                radius
            });

            const url = encodeURI(query);

            const res = await axios.get(`/api/poi/search/${url}/count`);
            return res.data;
        } catch (e) {
            return 0;
        }
    }
    async function searchBetween(lat: number, lng: number, radius: number): Promise<boolean> {
        try {
            const query = JSON.stringify({
                location: {
                    longitude: lng,
                    latitude: lat
                },
                radius
            });
            const url = encodeURI(query);

            const res = await axios.get(`/api/poi/search/${url}`);
            if (poisBetween.value?.length! > 0) {
                poisBetween.value = [];
            }
            poisBetween.value = res.data;
            return true;
        } catch (e) {
            return false;
        }
    }
    async function getPoiExperiences(poi: PointOfInterest) {
        return await (
            await axios.get("/api/poi/" + poi.id)
        ).data;
    }

    async function addPoi(poi: PointOfInterest) {
        const token = await authApp.currentUser?.getIdToken(true);
        const result = await axios.post("/api/poi/", poi, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return result.data as PointOfInterest;
    }
    function clear() {
        poisBetween.value = [];
    }
    return {
        poiCountBetween,
        searchBetween,
        getThumbnail,
        clear,
        poisBetween,
        getPoiExperiences,
        addPoi,
        poiDidLoad,
        getTags,
        tagList
    };
});
