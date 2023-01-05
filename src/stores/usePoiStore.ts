import axios from "axios";
import { authApp } from "google/firebase";
import { defineStore } from "pinia";
import { PointOfInterest } from "types/poi/point-of-interest";
import { ref } from "vue";

export const usePoiStore = defineStore("poi", () => {
    const poisBetween = ref<PointOfInterest[]>([]);
    const tagList = ref<{ type: string }[]>([]);

    const state = ref({
        poisAreLoading: false,
        poiIsLoading: false
    });

    async function getPoisBetween(lat: number, lng: number, radius: number) {
        const query = JSON.stringify({
            location: {
                longitude: lng,
                latitude: lat
            },
            radius
        });
        const url = encodeURI(query);

        state.value.poisAreLoading = true;
        const response = await axios.get(`/api/poi/search/${url}`);
        poisBetween.value = response.data;
        state.value.poisAreLoading = false;
        poisBetween.value = response.data;

        return response.data;
    }

    function clear() {
        poisBetween.value = [];
        tagList.value = [];
    }
    return {
        state,
        poisBetween,
        getPoisBetween,
        clear
    };
});
