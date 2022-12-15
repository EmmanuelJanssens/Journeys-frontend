import axios from "axios";
import { authApp } from "google/firebase";
import { defineStore } from "pinia";
import { PointOfInterest } from "types/JourneyDtos";
import { ref } from "vue";

export const usePoiStore = defineStore("poi", () => {
    const poisBetween = ref<PointOfInterest[]>([]);
    const tagList = ref<{ type: string }[]>([]);

    const state = ref({
        poisAreLoading: false,
        poiIsLoading: false
    });

    //
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

    async function poiDidLoad() {
        const promise = new Promise<any>((resolve, reject) => {
            waitForPoi(0, resolve, reject);
        });
        return promise;
    }

    //all available tags
    async function getTags() {
        // const result = await axios.get(`/api/tag`);
        // return result.data as { type: string }[];
    }

    async function poiCountBetween(lat: number, lng: number, radius: number): Promise<number> {
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
    }

    async function searchBetween(lat: number, lng: number, radius: number): Promise<boolean> {
        state.value.poisAreLoading = true;
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
        state.value.poisAreLoading = false;
        return true;
    }

    async function getPoiExperiences(poi: PointOfInterest) {
        state.value.poiIsLoading = true;
        const result = await axios.get("/api/poi/" + poi.id);
        state.value.poiIsLoading = false;
        return result.data.experiences;
    }

    async function addPoi(poi: PointOfInterest) {
        state.value.poiIsLoading = true;
        const token = await authApp.currentUser?.getIdToken(true);
        const result = await axios.post("/api/poi/", poi, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        state.value.poiIsLoading = false;
        return result.data as PointOfInterest;
    }

    function clear() {
        poisBetween.value = [];
        tagList.value = [];
    }
    return {
        poiCountBetween,
        searchBetween,
        clear,
        poisBetween,
        getPoiExperiences,
        addPoi,
        poiDidLoad,
        getTags,
        tagList,
        state
    };
});
