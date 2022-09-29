import { defineStore } from "pinia";
import { ref } from "vue";

export const useJourneyStore = defineStore("journey", () => {
    const journeyRef = ref<Poi[]>();

    function addToJourney(poi: Poi): void {
        if (!alreadyExists(poi)) {
            journeyRef.value?.push(poi);
        }
    }

    function removeFromJourney(poi: Poi): void {
        journeyRef.value = journeyRef.value?.filter(
            (item) => item.id !== poi.id
        );
    }

    function alreadyExists(poi: Poi): boolean {
        return (
            journeyRef.value?.find((item) => item.id === poi.id) !== undefined
        );
    }

    function saveJourney(name: string): void {
        console.log(name);
    }
    return {
        journeyRef,
        addToJourney,
        removeFromJourney,
        saveJourney,
        alreadyExists
    };
});
