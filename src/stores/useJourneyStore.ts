import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { authApp, storageRef } from "google/firebase";
import { getMidPoint, getRadius } from "utils/utils";
import { LngLat } from "mapbox-gl";
import { ref as fref, uploadBytesResumable, getDownloadURL, deleteObject, UploadTask } from "firebase/storage";
import { Experience, Journey, Locality, PointOfInterest, UpdateJourneyDto } from "types/JourneyDtos";
import { uuidv4 } from "@firebase/util";

export const useJourneyStore = defineStore("journey", () => {
    const journey = ref<Journey>({
        experiences: []
    });

    const updateJourneyDto = ref<UpdateJourneyDto>({
        connected: [],
        journey: {},
        deleted: [],
        updated: []
    });

    const state = ref({
        joureyIsLoading: false,
        journeyIsDirty: false,
        journeyIsNew: false
    });

    function addToJourneyLocal(experience: Experience, poi: PointOfInterest) {
        if (!alreadyInJourneyLocal(poi)) {
            const toAdd = {
                data: experience,
                poi: poi
            };
            journey.value.experiences?.push(toAdd);
            updateJourneyDto.value?.connected?.push(toAdd);
            state.value.journeyIsDirty = true;
        }
    }
    function removeFromJourneyLocal(poi_id: string): void {
        if (journey.value.experiences) {
            updateJourneyDto.value.deleted?.push(poi_id);
            journey.value.experiences = journey.value.experiences.filter((experience) => experience.poi.id != poi_id);
            journey.value.experiences?.sort(
                (a, b) => new Date(a.data.date).getTime() - new Date(b.data.date).getTime()
            );
            state.value.journeyIsDirty = true;
        }
    }

    function alreadyInJourneyLocal(poi: PointOfInterest): Boolean {
        const result = journey.value.experiences?.find((experience) => experience.poi.id === poi.id) !== undefined;
        return result;
    }

    function init() {
        updateJourneyDto.value = {
            connected: [],
            deleted: [],
            updated: []
        };

        journey.value = {
            experiences: []
        };

        updateJourneyDto.value = {
            connected: [],
            journey: {},
            deleted: [],
            updated: []
        };

        state.value = {
            joureyIsLoading: false,
            journeyIsDirty: false,
            journeyIsNew: false
        };
    }

    //----API CALLS----

    async function getJourney(id: string): Promise<Journey | undefined> {
        const result = await axios.get("/api/journey/" + id);
        return result.data;
    }

    function getJourneyMidPoint(journey: Journey): {
        center: LngLat;
        radius: number;
    } {
        const start = new LngLat(journey.start?.longitude!, journey.start?.latitude!);
        const end = new LngLat(journey.end?.longitude!, journey.end?.latitude!);
        const center = getMidPoint(start, end);

        const radius = getRadius(start, end);
        return { center: new LngLat(center.lng, center.lat), radius };
    }

    async function removeSingleExperienceFromJourney(poi_id: string): Promise<Journey | undefined> {
        const token = await authApp.currentUser?.getIdToken(false);
        const url = "/api/journey/" + journey.value.id! + "/experience/" + poi_id;
        const response = await axios.delete(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        journey.value.experiences?.sort((a, b) => new Date(a.data.date).getTime() - new Date(b.data.date).getTime());

        return response.data as Journey;
    }

    async function updateSingleExperienceFromJourney(
        experience: Experience,
        poi: string
    ): Promise<Journey | undefined> {
        const token = await authApp.currentUser?.getIdToken(false);
        const url = "/api/journey/" + journey.value.id + "/experience/" + poi;
        const response = await axios.put(url, experience, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        journey.value.experiences?.sort((a, b) => new Date(a.data.date).getTime() - new Date(b.data.date).getTime());

        return response.data as Journey;
    }

    function setExperienceData(experience: Experience, poi: PointOfInterest) {
        const idx = journey.value.experiences?.findIndex((exp) => exp.poi.id == poi.id);

        let updateIdx = -1;
        if (updateJourneyDto.value.updated) {
            updateIdx = updateJourneyDto.value.updated?.findIndex((exp) => exp.poi.id == poi.id);
            if (updateIdx < 0) {
                //create if not exsist
                updateJourneyDto.value.updated.push({
                    data: experience,
                    poi: poi
                });
            } else {
                //update otherwise
                updateJourneyDto.value.updated[updateIdx] = {
                    data: experience,
                    poi: poi
                };
            }
        } else {
            //only if our update dto is not initialized/ == undefined
            updateJourneyDto.value.updated = [];
            updateJourneyDto.value.updated.push({
                data: experience,
                poi: poi
            });
        }

        //for immediate feedback
        if (idx && idx > 0 && journey.value.experiences) {
            journey.value.experiences[idx].data = experience;
            journey.value.experiences?.sort(
                (a, b) => new Date(a.data.date).getTime() - new Date(b.data.date).getTime()
            );
        }
        state.value.journeyIsDirty = true;
    }

    async function updateJourneyDetails(): Promise<Journey | undefined> {
        const token = await authApp.currentUser?.getIdToken(false);
        const result = await axios.patch("/api/journey/", journey.value, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return result.data;
    }

    async function updateExperiencesFromJourney() {
        const uploading: Array<Promise<void> | undefined> = [];
        const token = await authApp.currentUser?.getIdToken(false);

        journey.value.experiences?.forEach((experience) => {
            if (experience.data.imagesToUpload && experience.data.imagesToUpload.length > 0) {
                uploading.push(uploadImages(experience.data.imagesToUpload, experience.poi.id!, journey.value.id!));
            }
            delete experience.data.imagesToUpload;
        });

        updateJourneyDto.value?.connected?.forEach(async (experience) => {
            if (experience.data.imagesToUpload && experience.data.imagesToUpload.length > 0) {
                uploading.push(uploadImages(experience.data.imagesToUpload!, experience.poi.id!, journey.value.id!));
            }
            delete experience.data.imagesToUpload;
        });
        const url = `/api/journey/${journey.value.id}/experiences`;
        updateJourneyDto.value.journey = journey.value;

        const response = await axios.put(url, updateJourneyDto.value, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        state.value.journeyIsDirty = false;
        return {
            journey: response.data as Journey,
            uploadTask: uploading
        };
    }

    async function saveJourneyWithExperiences(name: string) {
        const token = await authApp.currentUser?.getIdToken(false);
        const uploading: Array<Promise<void> | undefined> = [];

        journey.value.title = name;
        journey.value.visibility = "public";
        journey.value.id = uuidv4();
        journey.value.experiences?.forEach((experience) => {
            if (experience.data.imagesToUpload && experience.data.imagesToUpload.length > 0) {
                uploading.push(uploadImages(experience.data.imagesToUpload, experience.poi.id!, journey.value.id!));
            }
            delete experience.data.imagesToUpload;
        });
        const response = await axios.post("/api/journey/", journey.value!, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        state.value.journeyIsDirty = false;
        return {
            journey: response.data as Journey,
            uploadTask: uploading
        };
    }

    async function removeJourney(id: string): Promise<Boolean> {
        const token = await authApp.currentUser?.getIdToken(false);
        const result = await axios.delete("/api/journey/" + id, {
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

    function setJourneyStartEnd(start: Locality, end: Locality) {
        journey.value.start = start;
        journey.value.end = end;
    }

    function uploadImages(
        images: {
            file: any;
            url: string;
        }[],
        exp: string,
        journey_id: string
    ) {
        const taskList: UploadTask[] = [];
        if (images.length > 0) {
            if (!images || images.length == 0) return undefined;

            images.forEach(async (image) => {
                const id = image.url.slice(image.url.lastIndexOf("/")) + 1;
                const imageRef = fref(storageRef, journey.value.id + "/" + exp + "/" + id);
                const metadata = {
                    contentType: image.file.mimeType,
                    customMetadata: {
                        exp: exp,
                        journey: journey_id
                    }
                };
                taskList.push(uploadBytesResumable(imageRef, image.file.blob, metadata));
            });

            return Promise.all(taskList).then((tasks) => {
                tasks.forEach(async (task) => {
                    if (task.state == "success") {
                        if (task.metadata.customMetadata?.exp && task.metadata.customMetadata?.journey) {
                            const token = await authApp.currentUser?.getIdToken(false);
                            const url = await getDownloadURL(task.ref);
                            try {
                                await axios.put(
                                    `/api/journey/${task.metadata.customMetadata.journey}/experience/${task.metadata.customMetadata.exp}/image`,
                                    {
                                        url: url
                                    },
                                    {
                                        headers: {
                                            Authorization: `Bearer ${token}`
                                        }
                                    }
                                );
                                if (journey.value.id == task.metadata.customMetadata.journey) {
                                    journey.value.experiences?.forEach((experience) => {
                                        if (experience.poi.id == task.metadata.customMetadata?.exp) {
                                            experience.data.images?.push(url);
                                        }
                                    });
                                }
                            } catch (e) {
                                const imgRef = fref(storageRef.storage, url);
                                deleteObject(imgRef);
                            }
                        }
                    }
                });
            });
        }
        return undefined;
    }

    function journeyToGeojson(journey: Journey): GeoJSON.Feature[] {
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
        journey,
        state,
        addToJourneyLocal,
        getJourneyMidPoint,
        journeyToGeojson,
        updateSingleExperienceFromJourney,
        removeSingleExperienceFromJourney,
        removeFromJourneyLocal,
        removeJourney,
        saveJourneyWithExperiences,
        updateJourneyDetails,
        updateExperiencesFromJourney,
        setJourneyStartEnd,
        getJourney,
        init,
        setExperienceData,
        uploadImages
    };
});
