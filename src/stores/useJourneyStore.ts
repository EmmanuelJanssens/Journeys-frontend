import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { authApp } from "google/firebase";
import { getMidPoint, getRadius } from "utils/utils";
import { LngLat } from "mapbox-gl";
import imagekit from "config/imageKit";
import { BatchExperience } from "types/experience/batch-experience.dto";
import { CreateExperience, Experience, UpdateExperience } from "types/experience/experience";
import { Journey, UpdateJourney, CreateJourney } from "types/journey/journey";

export const useJourneyStore = defineStore("journey", () => {
    //journey state used accross the application
    const journeyToView = ref<Journey>();

    //used when editing a journey
    const journeyToEdit = ref<{
        journey: CreateJourney;
        experiences: BatchExperience;
    }>({
        journey: {
            id: "",
            title: "",
            description: "",
            visibility: "public",
            start: { longitude: 0, latitude: 0 },
            end: { longitude: 0, latitude: 0 }
        },
        experiences: new BatchExperience([])
    });

    //
    const state = ref({
        journeyIsFetching: false,
        journeyIsSaving: false,
        journeyIsDeleting: false,
        journeyIsEditing: false,
        journeyIsCreating: false,
        journeyIsLoading: false
    });

    function updateExperienceData(experience: UpdateExperience | CreateExperience) {
        let index = journeyToEdit.value.experiences.connected.findIndex((exp) => exp.id === experience.id);

        if (index >= 0) {
            journeyToEdit.value.experiences.connected[index] = experience as CreateExperience;
        } else if (index < 0) {
            index = journeyToEdit.value.experiences.updated.findIndex((exp) => exp.id === experience.id);
            if (index >= 0) {
                journeyToEdit.value.experiences.updated[index] = experience as UpdateExperience;
                console.log(experience);
            }
        }
        state.value.journeyIsEditing = true;
    }

    function deleteExperienceData(experienceId: string) {
        const index = journeyToEdit.value.experiences.connected.findIndex((exp) => exp.id === experienceId);
        if (index < 0) return;

        journeyToEdit.value.experiences.connected.splice(index, 1);
        state.value.journeyIsEditing = true;
    }

    async function patchJourney(journeyId: string, update: UpdateJourney) {
        const token = await authApp.currentUser?.getIdToken();
        state.value.journeyIsSaving = true;

        const response = await axios.patch(`/api/journey/${journeyId}`, update, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        state.value.journeyIsSaving = false;
        return response.data as Journey;
    }
    /**
     * API call to create a journey
     * @returns  {Promise<Journey>} the created journey
     */
    async function postJourney() {
        //get token
        const token = await authApp.currentUser?.getIdToken();

        state.value.journeyIsCreating = true;
        const createDto = {
            ...journeyToEdit.value.journey,
            experiences: journeyToEdit.value.experiences.connected
        };
        const response = await axios.post("/api/journey", createDto, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        state.value.journeyIsCreating = false;
        state.value.journeyIsEditing = false;

        const journey = response.data as Journey;
        const uploadTasks = journey.experiences.map(async (exp) => {
            return exp.images.map(async (img) => {
                const response = await fetch(img.url);
                const blob = await response.blob();
                return await uploadImage(blob, exp.id, img.id, journey.id);
            });
        });
        return {
            journey,
            uploadTasks
        };
    }
    async function patchExperiences() {
        const token = await authApp.currentUser?.getIdToken();

        state.value.journeyIsSaving = true;
        const dto = {
            connected: journeyToEdit.value.experiences.connected,
            updated: journeyToEdit.value.experiences.updated,
            deleted: journeyToEdit.value.experiences.deleted
        };
        const response = await axios.patch(`/api/experience/edit/${journeyToEdit.value.journey.id}`, dto, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const { created, updated } = response.data;

        //upload images
        created.forEach((experience: Experience) => {
            experience.images.forEach(async (img) => {
                if (img.url?.includes("blob")) {
                    const response = await fetch(img.url);
                    const blob = await response.blob();
                    await uploadImage(blob, experience.id, img.id, journeyToView.value!.id);
                }
            });
        });
        updated.forEach((experience: Experience) => {
            experience.images.forEach(async (img) => {
                if (img.url?.includes("blob")) {
                    const response = await fetch(img.url);
                    const blob = await response.blob();
                    await uploadImage(blob, experience.id, img.id, journeyToView.value!.id);
                }
            });
        });

        //update journey
        journeyToView.value!.experiences = [...created];
        updated.forEach((experience: Experience) => {
            const index = journeyToView.value!.experiences.findIndex((exp) => exp.id === experience.id);
            if (index >= 0) {
                journeyToView.value!.experiences[index] = experience;
            }
        });
        state.value.journeyIsSaving = false;
        state.value.journeyIsEditing = false;
        return {
            journey: journeyToView.value
        };
    }

    async function deleteJourney(journeyId: string) {
        const token = await authApp.currentUser?.getIdToken();
        state.value.journeyIsDeleting = true;
        const response = await axios.delete(`/api/journey/${journeyId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        state.value.journeyIsDeleting = false;
        return response.data as Journey;
    }

    async function patchExperience(update: UpdateExperience) {
        const token = await authApp.currentUser?.getIdToken();
        state.value.journeyIsSaving = true;
        const response = await axios.patch(`/api/experience/${update.id}`, update, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        state.value.journeyIsSaving = false;
        const experience = response.data as Experience;
        experience.images.forEach(async (img) => {
            console.log(img);
            if (img.url?.includes("blob")) {
                console.log(img);

                const response = await fetch(img.url);
                const blob = await response.blob();
                await uploadImage(blob, experience.id, img.id, journeyToView.value!.id);
            }
        });
        const result: Experience = {
            ...experience,
            poi: update.poi!
        };

        //for immediate feedback
        journeyToView.value!.experiences = journeyToView.value!.experiences.map((exp) => {
            if (exp.id === experience.id) return result;
            return exp;
        });

        return result;
    }

    async function deleteExperience(experienceId: string) {
        const token = await authApp.currentUser?.getIdToken();
        state.value.journeyIsDeleting = true;
        const response = await axios.delete(`/api/experience/${experienceId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        state.value.journeyIsDeleting = false;

        journeyToView.value!.experiences = journeyToView.value?.experiences.filter((exp) => exp.id !== experienceId)!;
        return response.data as Experience;
    }
    /**
     * Get a journey by id with all its experiences
     * @param journeyId
     * @returns {Promise<Journey>} the journey
     */
    async function fetchJourney(journeyId: string) {
        state.value.journeyIsFetching = true;
        const response = await axios.get(`/api/journey/${journeyId}/experiences`);

        const journey = response.data as Journey;
        journeyToView.value = journey;
        state.value.journeyIsFetching = false;
        return journey;
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
                            url: res.url,
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
                        url: image.data.original as string,
                        thumbnail: image.data.thumbnail as string
                    };
                } else {
                    throw new Error("Image upload failed");
                }
            });
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
        journeyToView,
        journeyToEdit,
        updateExperienceData,
        deleteExperienceData,
        fetchJourney,
        postJourney,
        patchExperiences,
        patchJourney,
        deleteJourney,
        patchExperience,
        deleteExperience,
        journeyToGeojson,
        state
    };
});
