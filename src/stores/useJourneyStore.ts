import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { LngLat } from "maplibre-gl";
export const useJourneyStore = defineStore("journey", () => {
    const poisInJourneyEdit = ref<Poi[]>();

    const journeyStartEnd = ref({
        start: new LngLat(-1, -1),
        end: new LngLat(-1, -1)
    });

    const userJourneysRef = ref<Journey[]>();

    function addToJourney(poi: Poi): void {
        if (!alreadyExists(poi)) {
            poisInJourneyEdit.value?.push(poi);
        }
    }

    function removeFromJourney(poi: Poi): void {
        poisInJourneyEdit.value = poisInJourneyEdit.value?.filter(
            (item) => item.id !== poi.id
        );
    }

    function alreadyExists(poi: Poi): boolean {
        return (
            poisInJourneyEdit.value?.find((item) => item.id === poi.id) !==
            undefined
        );
    }

    function saveJourney(name: string): void {
        const date = new Date();
        const experiences: {
            poi: { poi_id: string };
            experience: {
                description: string;
                date: Date;
                images: never[];
                order: number;
            };
        }[] = [];
        let id = 0;
        poisInJourneyEdit.value?.forEach((element) => {
            experiences.push({
                poi: { poi_id: element.id },
                experience: {
                    description: "description",
                    date: date,
                    images: [],
                    order: id
                }
            });
            id++;
        });
        const save = {
            title: name,
            start: {
                longitude: journeyStartEnd.value.start.lng,
                latitude: journeyStartEnd.value.start.lat
            },
            end: {
                longitude: journeyStartEnd.value.end.lng,
                latitude: journeyStartEnd.value.end.lat
            },
            experiences: experiences
        };
        const token = JSON.parse(localStorage.getItem("user")!).token;

        axios
            .post("/api/journeys/", save, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                console.log(response);
            });
        console.log(name);
    }

    function fetchJourneysFromUser(userName: string) {
        console.log("Fetch Journeys from" + userName);
        axios.get("/api/users/" + userName + "/journeys").then((response) => {
            userJourneysRef.value = response.data.journeys as Journey[];
            console.log(userJourneysRef.value);
        });
    }

    function setJourneyStartEnd(start: LngLat, end: LngLat) {
        journeyStartEnd.value = {
            start: start,
            end: end
        };
    }

    function clearMapView() {
        journeyStartEnd.value = {
            start: new LngLat(-1, -1),
            end: new LngLat(-1, -1)
        };
        poisInJourneyEdit.value = [];
    }
    return {
        journeyRef: poisInJourneyEdit,
        userJourneysRef,
        addToJourney,
        removeFromJourney,
        saveJourney,
        alreadyExists,
        fetchJourneysFromUser,
        setJourneyStartEnd,
        clearMapView
    };
});
