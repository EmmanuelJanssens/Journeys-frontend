<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <journey-modal
        :header="'Edit '"
        name="editExperience"
        :loading="isLoading"
        :size="{
            w: 'w-1/2 min-w-fit',
            h: ' '
        }">
        <template #loading>
            <div v-if="isLoading" class="bg-high-contrast-text h-3">
                <div class="bg-secondary-darker h-full w-full animate-pulse" />
            </div>
            <div v-if="isLoading" class="bg-high-contrast-text h-3">
                <div class="bg-secondary-darker h-full w-full animate-pulse" />
            </div>
        </template>
        <template #body>
            <div class="bg-secondary-light dark:bg-gray-800 p-4 flex flex-col h-full">
                <div class="flex flex-col space-y-4 h-full">
                    <journey-input v-model="state.title" placeholder="Title" />
                    <!-- <journey-input placeholder="Date" v-model="state.selectedDate" /> -->
                    <DatePicker v-model="state.selectedDate" />
                    <journey-textarea v-model="state.description" :rows="4" placeholder="description" />
                </div>
                <div class="flex space-x-2 flex-wrap max-w-3xl p-4 items-center overflow-auto">
                    <div
                        class="relative w-24 h-24 rounded-lg bg-primary flex justify-center items-center cursor-pointer btn btn-primary"
                        @click="selectImage">
                        <FontAwesomeIcon class="" :icon="faAdd" size="4x" />
                    </div>
                    <div v-for="img in images" :key="img.url">
                        <div class="relative w-24 h-24 rounded-lg">
                            <img
                                class="object-cover w-24 h-24 rounded-lg border-2 border-primary-darker p-1"
                                alt="thumbnail"
                                :src="img.url" />
                            <FontAwesomeIcon
                                class="absolute top-0 right-1 text-red-600 cursor-pointer"
                                :icon="faClose"
                                size="lg"
                                @click="removeImage(img.url)" />
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <template #footer>
            <div class="flex justify-end">
                <button @click="save">Save</button>
            </div>
        </template>
    </journey-modal>
</template>
<script lang="ts" setup>
import { useJourneyStore } from "stores/useJourneyStore";
import { onMounted, ref } from "vue";
import { FilePicker } from "@capawesome/capacitor-file-picker";
import { storageRef } from "google/firebase";
import { ref as fref, deleteObject } from "firebase/storage";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faClose, faAdd } from "@fortawesome/free-solid-svg-icons";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";
import JourneyModal from "components/UI/Modal/JourneyModal.vue";
import JourneyInput from "components/UI/Input/JourneyInput.vue";
import JourneyTextarea from "components/UI/Input/JourneyTextarea.vue";
import { POSITION, useToast } from "vue-toastification";
import { drawJourney, drawPoisBetween } from "map/drawOnMap";
import router from "router/router";
import { Experience, PointOfInterest } from "types/JourneyDtos";
const state = ref({
    description: "",
    title: "",
    files: [],
    selectedDate: ""
});

const journeyStore = useJourneyStore();
const props = defineProps<{
    experience: Experience;
    poi: PointOfInterest;
    mode: "edit" | "view";
}>();
const files = ref<Array<any>>([]);
const isLoading = ref(false);
let currentData = ref<{
    experience: Experience;
    poi: PointOfInterest;
}>();
let images = ref<
    {
        url: string;
        isFs: boolean;
    }[]
>([]);

const toast = useToast();
onMounted(() => {
    if (props.mode == "edit") {
        currentData.value = {
            experience: props.experience,
            poi: props.poi
        };
        currentData.value!.experience = props.experience as Experience;
        currentData.value.experience.images?.forEach((image) => {
            images.value.push({
                isFs: true,
                url: image
            });
        });
        currentData.value.experience.imagesToUpload?.forEach((image) => {
            images.value.push({
                isFs: false,
                url: image.url
            });
            files.value.push({
                url: image.url,
                file: image.file
            });
        });
        if (currentData.value.experience.title) state.value.title = currentData.value.experience.title;
        if (currentData.value.experience.description)
            state.value.description = currentData.value.experience.description;
        state.value.selectedDate = currentData.value?.experience.date;
    } else if (props.mode == "view") {
        currentData.value = {
            experience: props.experience,
            poi: props.poi
        };
        currentData.value!.experience = props.experience as Experience;
        if (currentData.value.experience.title) state.value.title = currentData.value.experience.title;
        if (currentData.value.experience.description)
            state.value.description = currentData.value.experience.description;
        if (currentData.value.experience.images) {
            currentData.value!.experience.images.forEach((img) => {
                images.value.push({
                    isFs: true,
                    url: img
                });
            });
        }
        state.value.selectedDate = currentData.value?.experience.date;
    }
});

async function selectImage() {
    const result = await FilePicker.pickFiles({
        multiple: true
    });
    result.files.forEach((file) => {
        const url = URL.createObjectURL(file.blob!);
        files.value.push({
            file: file,
            url: url
        });
        images.value?.push({
            url: url,
            isFs: false
        });
    });
}

function removeImage(image: string) {
    const img = images.value?.find((img) => image == img.url);
    if (img) {
        images.value = images.value?.filter((img) => image != img.url);
        files.value = files.value.filter((img) => image != img.url);
    }
}

async function save() {
    if (props.mode == "edit") {
        if (currentData.value && currentData.value.experience) {
            currentData.value!.experience!.title = state.value.title;
            currentData.value!.experience!.date = state.value.selectedDate;
            currentData.value!.experience!.description = state.value.description;
            currentData.value.experience.images = [];
            images.value.forEach((img) => {
                if (img.isFs) currentData.value?.experience.images?.push(img.url);
            });
            currentData.value.experience.imagesToUpload = [];
            currentData.value.experience.imagesToUpload = currentData.value.experience.imagesToUpload?.concat(
                ...files.value
            );

            // currentData.value!.experience!.journey = { id: journeyStore.journey.journey?.id };
            journeyStore.setExperienceData(currentData.value.experience, currentData.value.poi);
        }
        journeyModalController.close("editExperience");
    } else {
        if (currentData.value) {
            const deleted = currentData.value?.experience?.images?.filter(
                (img) => !images.value.find((search) => img == search.url)
            );
            isLoading.value = true;
            await deleted?.forEach(async (img) => {
                const imgRef = fref(storageRef.storage, img);
                await deleteObject(imgRef);
            });

            try {
                journeyStore
                    .uploadImages(files.value, props.poi.id!, journeyStore.journey.id!)
                    ?.then(() => {
                        toast.info("Your images where uploaded you can now view them !", {
                            position: POSITION.BOTTOM_RIGHT
                        });
                    })
                    .catch(() => {
                        toast.error("TAn error occured when uploading your images :(", {
                            position: POSITION.BOTTOM_RIGHT
                        });
                    });

                //set deleted images
                if (currentData.value.experience && currentData.value.experience.images) {
                    currentData.value.experience.images = currentData.value.experience.images?.filter((img) =>
                        images.value.find((search) => img == search.url)
                    );
                }

                currentData.value!.experience!.title = state.value.title;
                currentData.value!.experience!.date = state.value.selectedDate;
                currentData.value!.experience!.description = state.value.description;
                await journeyStore.updateSingleExperienceFromJourney(
                    currentData.value.experience,
                    currentData.value.poi.id!
                );
                journeyModalController.close("editExperience");
                toast.success("Your modifications were successfuly saved", {
                    position: POSITION.BOTTOM_RIGHT
                });
            } catch (e) {
                toast.error("Could not save your modifications", {
                    position: POSITION.BOTTOM_RIGHT
                });
            }

            isLoading.value = false;
        }
    }
    drawJourney(journeyStore.journey);

    if (router.currentRoute.value.name == "edit") {
        drawPoisBetween();
    }
}
</script>
<style scoped lang="less"></style>
