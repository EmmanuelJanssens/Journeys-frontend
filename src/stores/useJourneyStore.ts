import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { AddressDto, ExperienceDto, JourneyDto, PoiDto, UpdateJourneyDto } from "types/dtos";
import { authApp, storageRef } from "google/firebase";
import { getMidPoint, getRadius } from "utils/utils";
import { LngLat, LngLatLike } from "mapbox-gl";
import { ref as fref, uploadBytesResumable, getDownloadURL, deleteObject, UploadTask } from "firebase/storage";
export const useJourneyStore = defineStore("journey", () => {
    const editJourney = ref<JourneyDto>({});
    const updateDto = ref<UpdateJourneyDto>({});

    const initial = ref<{
        start: string;
        end: string;
    }>();

    const isDirty = ref(false);

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
    async function getJourney(id: string): Promise<JourneyDto | undefined> {
        const result = await axios.get("api/journey/" + id);
        return result.data;
    }
    function getJourneyMidPoint(journey: JourneyDto): {
        center: LngLat;
        radius: number;
    } {
        const start = new LngLat(journey.start?.longitude!, journey.start?.latitude!);
        const end = new LngLat(journey.end?.longitude!, journey.end?.latitude!);
        const center = getMidPoint(start, end);

        const radius = getRadius(start, end);
        return { center: new LngLat(center.lng, center.lat), radius };
    }
    async function removeExperience(expDto: ExperienceDto): Promise<JourneyDto | undefined> {
        const token = await authApp.currentUser?.getIdToken(false);
        const delExp = {
            poi: {
                id: expDto.node.id
            },
            journey: {
                id: editJourney.value.id
            }
        };
        const response = await axios.patch("api/journey/experience", delExp, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        editJourney.value.experiencesConnection!.edges?.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        return (await response.data) as JourneyDto;
    }

    async function updateExperience(experience: ExperienceDto): Promise<JourneyDto | undefined> {
        const token = await authApp.currentUser?.getIdToken(false);
        const response = await axios.put("api/journey/experience", experience, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        editJourney.value.experiencesConnection!.edges?.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        return response.data as JourneyDto;
    }

    function setExperienceData(experience: ExperienceDto) {
        editJourney.value?.experiencesConnection?.edges?.forEach((exp) => {
            if (exp.node.id == experience.node.id) {
                exp = experience;
            }
        });
        editJourney.value.experiencesConnection!.edges?.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        isDirty.value = true;
    }

    async function updateJourney(mode: string): Promise<JourneyDto | undefined> {
        const token = await authApp.currentUser?.getIdToken(false);
        const result = await axios.patch("/api/journey/", editJourney.value, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return result.data;
    }

    async function updateJourneyExperiences() {
        const token = await authApp.currentUser?.getIdToken(false);

        editJourney.value.experiencesConnection?.edges?.forEach(async (experience) => {
            uploadImages(experience.imagesEditing!, experience.node.id!, editJourney.value.id!);
            delete experience.editing;
            delete experience.imagesEditing;
            delete experience.journey;
        });

        updateDto.value?.connected?.forEach(async (experience) => {
            uploadImages(experience.imagesEditing!, experience.node.id!, editJourney.value.id!);
            delete experience.editing;
            delete experience.imagesEditing;
            delete experience.journey;
        });
        const result = await axios.put("/api/journey/experiences/" + editJourney.value?.id, updateDto.value, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        isDirty.value = false;
        return result.data as JourneyDto;
    }

    async function saveJourney(name: string): Promise<JourneyDto | undefined> {
        const token = await authApp.currentUser?.getIdToken(false);
        editJourney.value.title = name;

        editJourney.value.experiencesConnection?.edges?.forEach(async (experience) => {
            uploadImages(experience.imagesEditing!, experience.node.id!, editJourney.value.id!);
            delete experience.editing;
            delete experience.imagesEditing;
            delete experience.journey;
        });
        updateDto.value?.connected?.forEach(async (experience) => {
            uploadImages(experience.imagesEditing!, experience.node.id!, editJourney.value.id!);
            delete experience.editing;
            delete experience.imagesEditing;
            delete experience.journey;
        });
        const response = await axios.post("/api/journey/", editJourney.value!, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        isDirty.value = false;

        return response.data as JourneyDto;
    }

    async function removeJourney(id: string): Promise<Boolean> {
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
    }

    //editing
    function addToJourney(experience: ExperienceDto): Boolean {
        if (!alreadyInJourney(experience)) {
            editJourney.value!.experiencesConnection!.edges!.push(experience);
            updateDto.value?.connected?.push(experience);
            isDirty.value = true;
        }
        return true;
    }

    function removeFromJourney(id: string): void {
        updateDto.value.deleted?.poi_ids.push(id);
        editJourney.value.experiencesConnection!.edges = editJourney.value.experiencesConnection!.edges!.filter(
            (item) => item.node.id !== id
        );
        editJourney.value.experiencesConnection!.edges.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        isDirty.value = true;
    }

    function setDirty(dirty: boolean) {
        isDirty.value = dirty;
    }
    function alreadyInJourney(expDto: ExperienceDto): Boolean {
        const result =
            editJourney.value!.experiencesConnection!.edges!.find((item) => item.node.id === expDto.node.id) !==
            undefined;
        return result;
    }

    function setJourneyStartEnd(start: AddressDto, end: AddressDto) {
        editJourney.value.start = {
            placeId: start.placeId,
            address: start.address,
            latitude: start.latitude,
            longitude: start.longitude
        };
        editJourney.value.end = {
            placeId: end.placeId,
            address: end.address,
            latitude: end.latitude,
            longitude: end.longitude
        };
    }

    function init() {
        updateDto.value = {
            connected: [],
            deleted: { poi_ids: [] },
            updated: []
        };
    }
    function clear() {
        editJourney.value = {};
        init();
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

    function uploadImages(
        images: {
            file: any;
            url: string;
        }[],
        exp: string,
        journey: string
    ) {
        const taskList: UploadTask[] = [];

        if (!images || images.length == 0) return undefined;

        images.forEach(async (image) => {
            const id = image.url.slice(image.url.lastIndexOf("/")) + 1;
            const imageRef = fref(storageRef, editJourney.value.id + "/" + exp + "/" + id);
            const metadata = {
                contentType: image.file.mimeType,
                customMetadata: {
                    exp: exp,
                    journey: journey
                }
            };
            taskList.push(uploadBytesResumable(imageRef, image.file.blob, metadata));
        });

        Promise.all(taskList).then(async (tasks) => {
            await tasks.forEach(async (task) => {
                if (task.state == "success") {
                    if (task.metadata.customMetadata?.exp && task.metadata.customMetadata?.journey) {
                        const token = await authApp.currentUser?.getIdToken(false);
                        const url = await getDownloadURL(task.ref);
                        try {
                            await axios.put(
                                "api/journey/experience/image",
                                {
                                    journey: task.metadata.customMetadata.journey,
                                    poi: task.metadata.customMetadata.exp,
                                    url: url
                                },
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`
                                    }
                                }
                            );
                            if (editJourney.value.id == task.metadata.customMetadata.journey) {
                                editJourney.value.experiencesConnection?.edges?.forEach((exp) => {
                                    if (exp.node.id == task.metadata.customMetadata?.exp) {
                                        exp.images.push(url);
                                    }
                                });
                            }
                        } catch (e) {
                            //
                        }
                    }
                }
            });
        });
    }
    return {
        editJourney,
        updateDto,
        addToJourney,
        getJourneyMidPoint,
        journeyToGeojson,
        updateExperience,
        removeExperience,
        removeFromJourney,
        removeJourney,
        saveJourney,
        updateJourney,
        updateJourneyExperiences,
        alreadyExists: alreadyInJourney,
        setJourneyStartEnd,
        getJourney,
        clear,
        init,
        isDirty,
        setInitial,
        getInitial,
        setExperienceData,
        uploadImages
    };
});
