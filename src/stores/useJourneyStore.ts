import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { AddressDto, ExperienceDto, JourneyDto, UpdateJourneyDto } from "types/dtos";
export const useJourneyStore = defineStore("journey", () => {
    const editJourney = ref<UpdateJourneyDto>({});
    const viewJourney = ref<JourneyDto>({});

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
    async function getJourney(id: string): Promise<boolean> {
        viewJourney.value = await (await axios.get("api/journey/" + id)).data;
        return true;
    }

    function addToJourney(experience: ExperienceDto): void {
        if (!alreadyInJourney(experience)) {
            editJourney.value?.journey?.experiencesConnection?.edges?.push(experience);
        }
    }

    function removeFromJourney(id: string) {
        console.log(editJourney.value.journey);

        const removed = editJourney.value!.journey?.experiencesConnection?.edges?.find((p) => p.node.id == id);
        editJourney.value!.journey!.experiencesConnection!.edges =
            editJourney.value?.journey?.experiencesConnection?.edges?.filter((item) => item.node.id !== id);
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
        return (
            editJourney.value?.journey?.experiencesConnection?.edges?.find(
                (item) => item.node.id === expDto.node.id
            ) !== undefined
        );
    }

    function saveJourney(name: string) {
        const token = JSON.parse(localStorage.getItem("user")!).token;
        editJourney.value!.journey!.title = name;

        const dto: JourneyDto = editJourney.value!.journey!;
        return axios.post("/api/journey/", dto, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return "";
    }
    function findExp(poi_id: string, expList: ExperienceDto[]) {
        return expList.find((exp) => exp.node.id === poi_id);
    }
    function filterDeleted() {
        const deleted: string[] = [];
        viewJourney.value!.experiencesConnection?.edges?.forEach((exp) => {
            if (!findExp(exp.node.id, editJourney.value!.journey?.experiencesConnection?.edges!)) {
                deleted.push(exp.node.id);
            }
        });
        return deleted;
    }
    function updateJourney(mode: string): Promise<string> {
        const token = JSON.parse(localStorage.getItem("user")!).token;
        if (mode == "deep") {
            editJourney.value!.connected = [];
            editJourney.value!.deleted = { poi_ids: [] };
            editJourney.value!.updated = [];
            editJourney.value!.journey?.experiencesConnection?.edges?.forEach((exp) => {
                if (!findExp(exp.node.id, viewJourney.value!.experiencesConnection!.edges!)) {
                    editJourney.value!.connected?.push(exp);
                } else {
                    //TODO add only differences
                    editJourney.value!.updated?.push(exp);
                }
            });
            editJourney.value!.deleted!.poi_ids = filterDeleted();
        }

        return axios.put("/api/journey/", editJourney.value, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
    function setJourneyStartEnd(start: AddressDto, end: AddressDto) {
        editJourney.value!.journey!.start = {
            placeId: start.placeId,
            address: start.address,
            latitude: start.latitude,
            longitude: start.longitude
        };
        editJourney.value!.journey!.end = {
            placeId: end.placeId,
            address: end.address,
            latitude: end.latitude,
            longitude: end.longitude
        };
    }
    function clear() {
        editJourney.value = {};
        viewJourney.value = {};
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
        getJourney,
        clear
    };
});
