import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { authApp } from "google/firebase";
import { getMidPoint, getRadius } from "utils/utils";
import { LngLat } from "mapbox-gl";
import { Experience, Image, Journey, Locality, PointOfInterest, UpdateJourneyDto } from "types/JourneyDtos";
import imagekit from "config/imageKit";
import IKResponse from "imagekit/dist/libs/interfaces/IKResponse";
import { UploadResponse } from "imagekit/dist/libs/interfaces/UploadResponse";

export const useJourneyStore = defineStore("journey", () => {
    //journey state used accross the application
    const journey = ref<Journey>({
        experiences: []
    });

    //used when editing a journey
    const updateJourneyDto = ref<UpdateJourneyDto>({
        connected: [],
        deleted: [],
        updated: []
    });

    //
    const state = ref({
        joureyIsLoading: false,
        journeyIsDirty: false,
        journeyIsNew: false
    });

    function addToJourneyLocal(experience: Experience, poi: PointOfInterest) {
        if (!alreadyInJourneyLocal(poi)) {
            const toAdd = {
                experience: experience,
                poi: poi
            };
            journey.value.experiences?.push(experience);
            updateJourneyDto.value?.connected?.push(toAdd);
            state.value.journeyIsDirty = true;
            journey.value.experiences?.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }
    }
    function removeFromJourneyLocal(poi_id: string): void {
        if (journey.value.experiences) {
            updateJourneyDto.value.deleted?.push(poi_id);
            journey.value.experiences = journey.value.experiences.filter(
                (experience) => (experience.poi as PointOfInterest)?.id != poi_id
            );
            journey.value.experiences?.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            state.value.journeyIsDirty = true;
        }
    }

    function alreadyInJourneyLocal(poi: PointOfInterest): Boolean {
        const result =
            journey.value.experiences?.find((experience) => (experience.poi as PointOfInterest)?.id === poi.id) !==
            undefined;
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
            deleted: [],
            updated: []
        };

        state.value = {
            joureyIsLoading: false,
            journeyIsDirty: false,
            journeyIsNew: false
        };
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

    //----API CALLS----

    async function getJourney(id: string): Promise<Journey | undefined> {
        const result = await axios.get("/api/journey/" + id + "/experiences");
        return result.data;
    }

    async function removeSingleExperienceFromJourney(experienceId: string): Promise<Journey | undefined> {
        const token = await authApp.currentUser?.getIdToken(true);
        const url = "/api/experience/" + experienceId;
        const response = await axios.delete(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        journey.value.experiences?.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return response.data as Journey;
    }

    async function updateSingleExperienceFromJourney(
        experience: Experience,
        imageAdded?: any[],
        imageDeleted?: any[]
    ): Promise<Journey | undefined> {
        const token = await authApp.currentUser?.getIdToken(true);
        const url = "/api/experience/" + experience.id;
        const dto = {
            ...experience,
            addedImages: imageAdded ? imageAdded : [],
            removedImages: imageDeleted ? imageDeleted : []
        };
        const response = await axios.patch(url, dto, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const updatedExperience = response.data as Experience;
        journey.value.experiences?.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (updatedExperience.images?.length! > 0) {
            updatedExperience.images?.forEach(async (image) => {
                const img = image as Image;
                if (img.original.includes("blob")) {
                    const blob = await fetch(img.original).then((r) => r.blob());
                    uploadImage(blob, experience.id!, img.id, journey.value.id!);
                }
            });
        }
        return response.data as Journey;
    }

    function setExperienceData(
        experience: Experience,
        poi: PointOfInterest,
        imageAdded?: string[],
        imageDeleted?: string[]
    ) {
        let expIdx = updateJourneyDto.value.connected?.findIndex((exp) => exp.poi.id == poi.id);
        //check if experiences is new or already in journey
        if (expIdx > -1) {
            //experience is new
            updateJourneyDto.value.connected[expIdx] = {
                experience: {
                    ...experience,
                    addedImages: imageAdded ? imageAdded : []
                },
                poi: poi
            };
        } else {
            //experience is already in journey and needs to be updated
            expIdx = updateJourneyDto.value.updated?.findIndex((exp) => exp.poi.id == poi.id);
            if (expIdx < 0) {
                //add experience to update list
                updateJourneyDto.value.updated.push({
                    experience: {
                        ...experience,
                        addedImages: imageAdded ? imageAdded : [],
                        removedImages: imageDeleted ? imageDeleted : []
                    },
                    poi: poi
                });
            } else {
                //update experience in update list
                updateJourneyDto.value.updated[expIdx] = {
                    experience: {
                        ...experience,
                        addedImages: imageAdded ? imageAdded : [],
                        removedImages: imageDeleted ? imageDeleted : []
                    },
                    poi: poi
                };
            }
        }

        //for immediate feedback
        if (expIdx > -1) {
            imageAdded?.forEach((image) => {
                (experience.images as Image[])?.push({
                    id: image,
                    original: image,
                    thumbnail: image
                });
            });
            journey.value.experiences[expIdx] = experience;
            journey.value.experiences?.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
        const token = await authApp.currentUser?.getIdToken(true);
        const url = `/api/journey/${journey.value.id}/experiences`;

        const response = await axios.patch(url, updateJourneyDto.value, {
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
        const token = await authApp.currentUser?.getIdToken(true);

        //save data to database

        journey.value.title = name;
        journey.value.visibility = "public";
        journey.value.experiences = updateJourneyDto.value.connected?.map((exp) => exp.experience);

        //save images to upload later
        /**
         * {
         *   file: File,
         *   url: string
         * }[]
         */
        const response = await axios.post("/api/journey/", journey.value!, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const journeyResult = response.data as Journey;
        //then upload files to storage
        const task = journeyResult.experiences?.map((experience) => {
            if (experience.images && experience.images.length > 0) {
                return experience.images.map(async (image) => {
                    const img = image as Image;
                    const blob = await fetch(img.original).then((r) => r.blob());
                    const task = uploadImage(blob, experience.id!, img.id, journeyResult.id!);
                    return task;
                });
            }
        });

        state.value.journeyIsDirty = false;
        return {
            journey: response.data as Journey,
            uploadTask: task
        };
    }

    async function removeJourney(id: string): Promise<Boolean> {
        const token = await authApp.currentUser?.getIdToken(true);
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

    async function uploadImage(blob: any, experienceId: string, imageId: string, journeyId: string) {
        return imagekit
            .upload({
                file: blob,
                fileName: imageId + (blob.type as string).slice(blob.type.lastIndexOf("/")),
                folder: journeyId + "/" + experienceId
            })
            .then(async (res) => {
                if (res) {
                    const token = await authApp.currentUser?.getIdToken(true);
                    const image = await axios.patch(
                        "/api/image/" + imageId,
                        {
                            original: res.url,
                            thumbnail: res.thumbnailUrl
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );
                    return {
                        id: image.data.id as string,
                        original: image.data.original as string,
                        thumbnail: image.data.thumbnail as string
                    };
                } else {
                    throw new Error("Image upload failed");
                }
            });
    }

    /**Upload images for an experience */
    async function uploadImages(blob: any[], experienceId: string) {}
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
        setExperienceData
    };
});
