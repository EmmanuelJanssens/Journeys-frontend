import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { GeocodedData } from "types/journeys";
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
    const viewJourney = ref<JourneyDto>({
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

    function journeyToGeojson(journey: JourneyDto): GeoJSON.Feature[] {
        const obj: GeoJSON.Feature[] = [
            {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [journey.start?.longitude!, journey.start?.latitude!]
                },
                properties: journey,
                id: journey.id
            },
            {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [journey.end?.longitude!, journey.end?.latitude!]
                },
                properties: journey,
                id: journey.id
            }
        ];
        return obj;
    }
    function getJourney(id: string): Promise<JourneyDto> {
        return axios.get("api/journey/" + id).then((response) => {
            const journey = response.data as JourneyDto;
            return journey;
        });
    }

    function addToJourney(experience: ExperienceDto): void {
        if (!alreadyInJourney(experience)) {
            editJourney.value?.experiences?.push(experience);
        }
    }

    function removeFromJourney(id: string) {
        const removed = editJourney.value.experiences?.find((p) => p.poi.id == id);
        editJourney.value!.experiences = editJourney.value?.experiences?.filter((item) => item.poi.id !== id);
        return removed;
    }

    function removeExperience(expDto: ExperienceDto) {
        const token = JSON.parse(localStorage.getItem("user")!).token;
        return axios
            .patch("api/journey/experience", expDto, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                const journey = response.data as JourneyDto;
                return journey;
            });
    }
    function updateExperience(experience: ExperienceDto) {
        const token = JSON.parse(localStorage.getItem("user")!).token;
        const data = experience;
        return axios
            .put("api/journey/experience", data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                const journey = response.data as JourneyDto;
                return journey;
            });
    }
    function alreadyInJourney(expDto: ExperienceDto): boolean {
        return editJourney.value?.experiences!.find((item) => item.poi.id === expDto.poi.id) !== undefined;
    }

    function saveJourney(name: string): Promise<string> {
        const token = JSON.parse(localStorage.getItem("user")!).token;
        editJourney.value!.title = name;

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
        return axios.post("/api/journey/", dto, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
    function updateJourney(journey: JourneyDto) {
        const token = JSON.parse(localStorage.getItem("user")!).token;
        return axios.put("/api/journey/", journey, {
            headers: {
                Authorization: `Bearer ${token}`
            }
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
        viewJourney.value!.start = {
            address: "",
            latitude: -1,
            longitude: -1
        };
        viewJourney.value!.end = {
            address: "",
            latitude: -1,
            longitude: -1
        };
        viewJourney.value = {
            experiences: []
        };
    }
    function removeJourney(id: string): Promise<Boolean> {
        const token = JSON.parse(localStorage.getItem("user")!).token;

        return axios
            .delete("api/journey/" + id, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((resp) => {
                if (resp.data.nodesDeleted > 0) {
                    return true;
                } else {
                    return false;
                }
            });
    }
    return {
        editJourney,
        viewJourney,
        addToJourney,
        journeyToGeojson,
        updateExperience,
        removeExperience,
        removeFromJourney,
        removeJourney,
        saveJourney,
        updateJourney,
        alreadyExists: alreadyInJourney,
        setJourneyStartEnd,
        clearMapView,
        getJourney
    };
});
