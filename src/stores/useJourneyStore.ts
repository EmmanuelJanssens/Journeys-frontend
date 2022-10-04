import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { LngLat } from "maplibre-gl";
import { Journey, Experience, GeocodedData } from "types/journeys";
import { ExperienceDto, JourneyDto } from "types/dtos";
export const useJourneyStore = defineStore("journey", () => {
    const editJourney = ref<JourneyDto>({
        title: "wolol",
        experiences: [],
        start: {
            address: "",
            latitude: -1,
            longitude: -1
        },
        end: {
            address: "",
            latitude: -1,
            longitude: -1
        }
    });

    function getJourney(id: string): Promise<JourneyDto> {
        return axios.get("api/journey/" + id).then((response) => {
            const journey = response.data as JourneyDto;
            return journey;
        });
    }

    function addToJourney(experience: ExperienceDto): void {
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

    function alreadyInJourney(experience: ExperienceDto): boolean {
        return (
            editJourney.value?.experiences!.find(
                (item) => item.poi.id === experience.poi.id
            ) !== undefined
        );
    }

    function saveJourney(name: string): void {
        const token = JSON.parse(localStorage.getItem("user")!).token;
        editJourney.value!.title = name;
        console.log(editJourney.value);

        const dto: JourneyDto = {
            title: editJourney.value.title,
            start: {
                address: editJourney.value.start?.address!,
                latitude: editJourney.value.start?.latitude!,
                longitude: editJourney.value.start?.longitude!
            },
            end: {
                address: editJourney.value.end?.address!,
                latitude: editJourney.value.end?.latitude!,
                longitude: editJourney.value.end?.longitude!
            },
            experiences: editJourney.value.experiences!
        };
        axios
            .post("/api/journey/", dto, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                console.log(response);
            });
    }

    function setJourneyStartEnd(start: GeocodedData, end: GeocodedData) {
        editJourney.value!.start = {
            address: start.address,
            latitude: start.coordinates.lat,
            longitude: start.coordinates.lng
        };
        editJourney.value!.end = {
            address: end.address,
            latitude: end.coordinates.lat,
            longitude: end.coordinates.lng
        };
    }

    function clearMapView() {
        editJourney.value!.start = {
            address: "",
            latitude: -1,
            longitude: -1
        };
        editJourney.value!.end = {
            address: "",
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
        clearMapView,
        getJourney
    };
});
