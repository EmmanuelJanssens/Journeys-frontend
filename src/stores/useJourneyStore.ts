import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
export const useJourneyStore = defineStore("journey", () => {
    const journeyRef = ref<Poi[]>();
    const userJourneysRef = ref<Journey[]>();

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

    function fetchJourneysFromUser(userName: string) {
        console.log("Fetch Journeys from" + userName);
        axios.get("/api/users/" + userName + "/journeys").then((response) => {
            userJourneysRef.value = response.data.journeys as Journey[];
            console.log(userJourneysRef.value);
        });
    }
    return {
        journeyRef,
        userJourneysRef,
        addToJourney,
        removeFromJourney,
        saveJourney,
        alreadyExists,
        fetchJourneysFromUser
    };
});
