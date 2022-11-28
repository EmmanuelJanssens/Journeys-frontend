import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { AddressDto, ExperienceDto, JourneyDto, PoiDto, UpdateJourneyDto } from "types/dtos";
import { authApp } from "google/firebase";

export const useJourneyStore = defineStore("journey", () => {
    const editJourney = ref<UpdateJourneyDto>({});
    const viewJourney = ref<JourneyDto>({});
    const initial = ref<{
        start: string;
        end: string;
    }>();

    function getInitial():
        | {
              start: string;
              end: string;
          }
        | undefined {
        return initial.value;
    }
    function setInitial(start: string, end: string) {
        initial.value = {
            start: start,
            end: end
        };
    }
    async function getJourney(id: string): Promise<boolean> {
        viewJourney.value = await (await axios.get("api/journey/" + id)).data;
        return true;
    }

    async function removeExperience(expDto: ExperienceDto): Promise<JourneyDto | undefined> {
        try {
            const token = await authApp.currentUser?.getIdToken(false);
            const delExp = {
                poi: {
                    id: expDto.node.id
                },
                journey: {
                    id: viewJourney.value.id
                }
            };
            const response = await axios.patch("api/journey/experience", delExp, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return (await response.data) as JourneyDto;
        } catch (e) {
            return undefined;
        }
    }

    async function updateExperience(experience: ExperienceDto): Promise<JourneyDto | undefined> {
        try {
            const token = await authApp.currentUser?.getIdToken(false);
            const response = await axios.put("api/journey/experience", experience, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data as JourneyDto;
        } catch (e) {
            return undefined;
        }
    }

    async function updateJourney(mode: string): Promise<JourneyDto | undefined> {
        try {
            const token = await authApp.currentUser?.getIdToken(false);
            if (mode == "deep") {
                editJourney.value!.connected = [];
                editJourney.value!.deleted = { poi_ids: [] };
                editJourney.value!.updated = [];
                editJourney.value!.journey?.experiencesConnection?.edges?.forEach((exp) => {
                    const node = exp.node as PoiDto;
                    if (!findExp(node.id!, viewJourney.value!.experiencesConnection!.edges!)) {
                        editJourney.value!.connected?.push(exp);
                    } else {
                        //TODO add only differences
                        editJourney.value!.updated?.push(exp);
                    }
                });
                editJourney.value!.deleted!.poi_ids = filterDeleted();
            } else {
                delete editJourney.value.connected;
                delete editJourney.value.deleted;
                delete editJourney.value.updated;
            }
            const result = await axios.put("/api/journey/", editJourney.value, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return result.data;
        } catch (e) {
            return undefined;
        }
    }

    async function saveJourney(name: string): Promise<JourneyDto | undefined> {
        try {
            const token = await authApp.currentUser?.getIdToken(false);
            editJourney.value!.journey!.title = name;

            const dto: JourneyDto = editJourney.value!.journey!;
            const response = await axios.post("/api/journey/", dto, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data as JourneyDto;
        } catch (e) {
            return undefined;
        }
    }

    async function removeJourney(id: string): Promise<Boolean> {
        try {
            const token = await authApp.currentUser?.getIdToken(false);
            const result = await axios.delete("api/journey/" + id, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (result.data.nodesDeleted > 0) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    }

    //editing
    function addToJourney(experience: ExperienceDto): Boolean {
        try {
            if (!alreadyInJourney(experience)) {
                editJourney.value!.journey!.experiencesConnection!.edges!.push(experience);
            }
            return true;
        } catch (e) {
            return false;
        }
    }

    function removeFromJourney(id: string): ExperienceDto | undefined {
        try {
            const removed = editJourney.value!.journey!.experiencesConnection!.edges!.find(
                (p) => p.node.id == id
            ) as ExperienceDto;
            editJourney.value!.journey!.experiencesConnection!.edges =
                editJourney.value!.journey!.experiencesConnection!.edges!.filter((item) => item.node.id !== id);
            return removed;
        } catch (e) {
            return undefined;
        }
    }

    function alreadyInJourney(expDto: ExperienceDto): Boolean {
        try {
            const result =
                editJourney.value!.journey!.experiencesConnection!.edges!.find(
                    (item) => item.node.id === expDto.node.id
                ) !== undefined;
            return result;
        } catch (e) {
            return false;
        }
    }

    function findExp(poi_id: string, expList: ExperienceDto[]) {
        return expList.find((exp) => exp.node.id === poi_id);
    }

    function filterDeleted() {
        const deleted: string[] = [];
        viewJourney.value!.experiencesConnection?.edges?.forEach((exp) => {
            const node = exp.node as PoiDto;
            if (!findExp(node.id!, editJourney.value!.journey?.experiencesConnection?.edges!)) {
                deleted.push(node.id!);
            }
        });
        return deleted;
    }

    function setJourneyStartEnd(start: AddressDto, end: AddressDto) {
        console.log(start);
        console.log(end);
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
        clear,
        setInitial,
        getInitial
    };
});
