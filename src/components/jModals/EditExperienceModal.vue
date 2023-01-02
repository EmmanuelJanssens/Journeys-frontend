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
                    <div v-for="img in images" :key="img.id">
                        <div class="relative w-24 h-24 rounded-lg">
                            <img
                                class="object-cover w-24 h-24 rounded-lg border-2 border-primary-darker p-1"
                                alt="thumbnail"
                                :src="img.thumbnail" />
                            <FontAwesomeIcon
                                class="absolute top-0 right-1 text-red-600 cursor-pointer"
                                :icon="faClose"
                                size="lg"
                                @click="removeImage(img.id)" />
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
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faClose, faAdd } from "@fortawesome/free-solid-svg-icons";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";
import JourneyModal from "components/UI/Modal/JourneyModal.vue";
import JourneyInput from "components/UI/Input/JourneyInput.vue";
import JourneyTextarea from "components/UI/Input/JourneyTextarea.vue";
import { POSITION, useToast } from "vue-toastification";
import { drawJourney, drawPoisBetween } from "map/drawOnMap";
import router from "router/router";
import { Experience, Image, PointOfInterest } from "types/JourneyDtos";
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
const images = ref<Image[]>([]);
const removedImages = ref<string[]>([]);

const toast = useToast();
onMounted(() => {
    if (props.mode == "edit") {
        currentData.value = {
            experience: props.experience,
            poi: props.poi
        };
        currentData.value!.experience = props.experience as Experience;
        images.value = props.experience.images as Image[];
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
        images.value = props.experience.images as Image[];

        if (currentData.value.experience.title) state.value.title = currentData.value.experience.title;
        if (currentData.value.experience.description)
            state.value.description = currentData.value.experience.description;

        state.value.selectedDate = currentData.value?.experience.date;
    }
});

async function selectImage() {
    const result = await FilePicker.pickFiles({
        multiple: true
    });
    result.files.forEach((file) => {
        const url = URL.createObjectURL(file.blob!);
        images.value.push({
            id: file.name,
            original: url,
            thumbnail: url
        });
    });
}

function removeImage(image: string) {
    images.value = images.value.filter((img) => img.id != image);
    removedImages.value.push(image);
}

async function save() {
    if (props.mode == "edit") {
        if (currentData.value && currentData.value.experience) {
            currentData.value!.experience!.title = state.value.title;
            currentData.value!.experience!.date = state.value.selectedDate;
            currentData.value!.experience!.description = state.value.description;
            currentData.value.experience.images = [];
            const addedImages: string[] = [];
            images.value.forEach((image) => {
                if (image.original.includes("blob")) addedImages.push(image.original);
            });
            // currentData.value!.experience!.journey = { id: journeyStore.journey.journey?.id };
            journeyStore.setExperienceData(
                currentData.value.experience,
                currentData.value.poi,
                addedImages,
                removedImages.value
            );
        }
        journeyModalController.close("editExperience");
    } else {
        if (currentData.value) {
            try {
                currentData.value!.experience!.title = state.value.title;
                currentData.value!.experience!.date = state.value.selectedDate;
                currentData.value!.experience!.description = state.value.description;
                const addedImages: string[] = [];
                images.value.forEach((image) => {
                    if (image.original.includes("blob")) addedImages.push(image.original);
                });
                await journeyStore.updateSingleExperienceFromJourney(
                    currentData.value.experience,
                    addedImages,
                    removedImages.value
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
