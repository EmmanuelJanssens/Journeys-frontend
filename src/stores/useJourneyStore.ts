import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { LngLat } from "maplibre-gl";
import { Journey, Experience } from "types/journeys";
export const useJourneyStore = defineStore("journey", () => {
    const editJourney = ref<Journey>({
        title: "wolol",
        experiences: [],
        start: {
            latitude: -1,
            longitude: -1
        },
        end: {
            latitude: -1,
            longitude: -1
        }
    });

    function addToJourney(experience: Experience): void {
        console.log(editJourney);
        if (!alreadyInJourney(experience)) {
            editJourney.value?.experiences?.push(experience);
        }
    }

    function removeFromJourney(id: string): void {
        editJourney.value!.experiences = editJourney.value?.experiences?.filter(
            (item) => item.poi.id !== id
        );
    }

    function alreadyInJourney(experience: Experience): boolean {
        return (
            editJourney.value?.experiences!.find(
                (item) => item.poi.id === experience.poi.id
            ) !== undefined
        );
    }

    function saveJourney(name: string): void {
        const token = JSON.parse(localStorage.getItem("user")!).token;
        editJourney.value!.title = name;
        axios
            .post("/api/journeys/", editJourney.value, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                console.log(response);
            });
    }

    function setJourneyStartEnd(start: LngLat, end: LngLat) {
        editJourney.value!.start = {
            latitude: start.lat,
            longitude: start.lng
        };
        editJourney.value!.end = {
            latitude: end.lat,
            longitude: end.lng
        };
    }

    function clearMapView() {
        editJourney.value!.start = {
            latitude: -1,
            longitude: -1
        };
        editJourney.value!.end = {
            latitude: -1,
            longitude: -1
        };
        editJourney.value = {
            experiences: []
        };
    }
    return {
        journeyRef: editJourney,
        addToJourney,
        removeFromJourney,
        saveJourney,
        alreadyExists: alreadyInJourney,
        setJourneyStartEnd,
        clearMapView
    };
});
