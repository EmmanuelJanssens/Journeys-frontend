import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { authApp, storageRef } from "google/firebase";
import { getMidPoint, getRadius } from "utils/utils";
import { LngLat } from "mapbox-gl";
import { ref as fref, uploadBytesResumable, getDownloadURL, deleteObject, UploadTask } from "firebase/storage";
import { Experience, Journey, Locality, PointOfInterest, UpdateJourneyDto } from "types/JourneyDtos";
import { uuidv4 } from "@firebase/util";
import imagekit from "config/imageKit";

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

    //----API CALLS----

    async function getJourney(id: string): Promise<Journey | undefined> {
        const result = await axios.get("/api/journey/" + id + "/experiences");
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
        const token = await authApp.currentUser?.getIdToken(true);
        const url = "/api/journey/" + journey.value.id! + "/experience/" + poi_id;
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
        poi: string
    ): Promise<Journey | undefined> {
        const token = await authApp.currentUser?.getIdToken(true);
        const url = "/api/experience/" + experience.id;
        const response = await axios.patch(url, experience, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        journey.value.experiences?.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return response.data as Journey;
    }

    function setExperienceData(experience: Experience, poi: PointOfInterest) {
        const idx = journey.value.experiences?.findIndex((exp) => (exp.poi as PointOfInterest)?.id == poi.id);

        let updateIdx = -1;
        if (updateJourneyDto.value.updated) {
            updateIdx = updateJourneyDto.value.updated?.findIndex((exp) => exp.poi.id == poi.id);
            if (updateIdx < 0) {
                //create if not exsist
                updateJourneyDto.value.updated.push({
                    experience: experience,
                    poi: poi
                });
            } else {
                //update otherwise
                updateJourneyDto.value.updated[updateIdx] = {
                    experience: experience,
                    poi: poi
                };
            }
        } else {
            //only if our update dto is not initialized/ == undefined
            updateJourneyDto.value.updated = [];
            updateJourneyDto.value.updated.push({
                experience: experience,
                poi: poi
            });
        }

        //for immediate feedback
        if (idx && idx > 0 && journey.value.experiences) {
            journey.value.experiences[idx] = experience;
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

        journey.value.experiences?.forEach((experience) => {
            if (experience.imagesToUpload && experience.imagesToUpload.length > 0) {
                // uploading.push(
                //     uploadImages(experience.imagesToUpload, (experience.poi as PointOfInterest)?.id!, journey.value.id!)
                // );
            }
            delete experience.imagesToUpload;
        });

        updateJourneyDto.value?.connected?.forEach(async (connected) => {
            if (connected.experience.imagesToUpload && connected.experience.imagesToUpload.length > 0) {
                // uploading.push(
                //     uploadImages(connected.experience.imagesToUpload!, connected.poi.id!, journey.value.id!)
                // );
            }
            delete connected.experience.imagesToUpload;
        });
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
        const uploading: Array<Promise<void> | undefined> = [];

        //save data to database

        journey.value.title = name;
        journey.value.visibility = "public";
        //get url of each image
        journey.value.experiences?.forEach((experience) => {
            experience.images = experience.imagesToUpload?.map((image) => image.url);
        });

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
        journeyResult.experiences?.forEach(async (experience) => {
            console.log(experience);
            if (experience.images && experience.images.length > 0) {
                experience.images.forEach(async (image) => {
                    //get blob
                    console.log(image);
                    console.log(image.original);
                    const blob = await fetch(image.original).then((r) => r.blob());
                    uploadImage(blob, experience.id!, image.id, journeyResult.id!);
                });
            }
            delete experience.imagesToUpload;
        });

        state.value.journeyIsDirty = false;
        return {
            journey: response.data as Journey,
            uploadTask: uploading
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
        return imagekit.upload(
            {
                file: blob,
                fileName: imageId + (blob.type as string).slice(blob.type.lastIndexOf("/")),
                folder: journeyId + "/" + experienceId
            },
            async (err, res) => {
                if (res) {
                    const token = await authApp.currentUser?.getIdToken(true);
                    axios.patch(
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
                }
            }
        );
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
        setExperienceData
    };
});
