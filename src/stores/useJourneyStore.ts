import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { GeocodedData } from "types/journeys";
import { ExperienceDto, JourneyDto, UpdateJourneyDto } from "types/dtos";
export const useJourneyStore = defineStore("journey", () => {
    const editJourney = ref<UpdateJourneyDto>({
        journey: {
            title: "",
            experiences: [],
            description: "",
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
        },
        updated: [],
        deleted: { poi_ids: [] },
        connected: { poi_ids: [] }
    });

    const viewJourney = ref<JourneyDto>({
        title: "",
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
            editJourney.value?.journey?.experiences?.push(experience);
            editJourney.value.connected?.poi_ids.push(experience.poi.id);
        }
    }

    function removeFromJourney(id: string) {
        const removed = editJourney.value.journey?.experiences?.find((p) => p.poi.id == id);
        editJourney.value!.journey!.experiences = editJourney.value?.journey?.experiences?.filter(
            (item) => item.poi.id !== id
        );
        editJourney.value.connected!.poi_ids = editJourney.value.connected?.poi_ids.filter((item) => item !== id)!;
        editJourney.value.deleted?.poi_ids.push(id);
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
        console.log(data);
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
        return editJourney.value?.journey?.experiences!.find((item) => item.poi.id === expDto.poi.id) !== undefined;
    }

    function saveJourney(name: string): Promise<string> {
        const token = JSON.parse(localStorage.getItem("user")!).token;
        editJourney.value!.journey!.title = name;

        const dto: JourneyDto = editJourney.value.journey!;
        console.log(dto);
        return axios.post("/api/journey/", dto, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
    function updateJourney(journey: UpdateJourneyDto): Promise<string> {
        const token = JSON.parse(localStorage.getItem("user")!).token;
        console.log(journey);
        return axios.put("/api/journey/", journey, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
    function setJourneyStartEnd(start: GeocodedData, end: GeocodedData) {
        editJourney.value!.journey!.start = {
            address: start.address,
            latitude: start.coordinates.lat,
            longitude: start.coordinates.lng
        };
        editJourney.value!.journey!.end = {
            address: end.address,
            latitude: end.coordinates.lat,
            longitude: end.coordinates.lng
        };
    }

    function clearData() {
        editJourney.value.deleted = { poi_ids: [] };
        editJourney.value.connected = { poi_ids: [] };
        editJourney.value.updated = [];
    }
    function clearMapView() {
        editJourney.value!.journey!.start = {
            address: "",
            latitude: -1,
            longitude: -1
        };
        editJourney.value!.journey!.end = {
            address: "",
            latitude: -1,
            longitude: -1
        };
        editJourney.value.journey! = {
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
        getJourney,
        clearData
    };
});
