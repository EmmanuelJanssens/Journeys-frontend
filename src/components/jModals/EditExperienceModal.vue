<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <journey-modal
        :header="'Edit '"
        name="editExperience"
        :loading="journeyStore.state.journeyIsSaving"
        :size="{
            w: 'w-1/2 min-w-fit',
            h: ' '
        }">
        <template #loading>
            <div v-if="journeyStore.state.journeyIsSaving" class="bg-high-contrast-text h-3">
                <div class="bg-secondary-darker h-full w-full animate-pulse" />
            </div>
            <div v-if="journeyStore.state.journeyIsSaving" class="bg-high-contrast-text h-3">
                <div class="bg-secondary-darker h-full w-full animate-pulse" />
            </div>
        </template>
        <template #body>
            <div class="bg-secondary-light dark:bg-gray-800 p-4 flex flex-col h-full">
                <div class="flex flex-col space-y-4 h-full">
                    <journey-input v-model="state.title" placeholder="Title" />
                    <!-- <journey-input placeholder="Date" v-model="state.selectedDate" /> -->
                    <DatePicker v-model="state.date" />
                    <journey-textarea v-model="state.description" :rows="4" placeholder="description" />
                </div>
                <div class="flex space-x-2 flex-wrap max-w-3xl p-4 items-center overflow-auto">
                    <div
                        class="relative w-24 h-24 rounded-lg bg-primary flex justify-center items-center cursor-pointer btn btn-primary"
                        @click="selectImage">
                        <FontAwesomeIcon class="" :icon="faAdd" size="4x" />
                    </div>
                    <div v-for="img in displayImage" :key="img.id">
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
import { computed, onMounted, ref } from "vue";
import { FilePicker } from "@capawesome/capacitor-file-picker";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faClose, faAdd } from "@fortawesome/free-solid-svg-icons";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";
import JourneyModal from "components/UI/Modal/JourneyModal.vue";
import JourneyInput from "components/UI/Input/JourneyInput.vue";
import JourneyTextarea from "components/UI/Input/JourneyTextarea.vue";
import { POSITION, useToast } from "vue-toastification";
import { UpdateExperience } from "types/experience/experience";
import { JourneyImage } from "types/image/image";

const state = ref<{
    description: string;
    title: string;
    date: string;
    addedImages: string[];
    removedImages: string[];
}>({
    description: "",
    title: "",
    date: "",
    addedImages: [],
    removedImages: []
});

const journeyStore = useJourneyStore();
const props = defineProps<{
    experience: UpdateExperience;
    mode: "edit" | "view";
}>();

const toast = useToast();
const existingImages = ref<JourneyImage[]>([]);
const displayImage = computed(() => {
    return [
        ...(state.value.addedImages
            ? state.value.addedImages.map((img) => {
                  return {
                      id: img,
                      thumbnail: img
                  };
              })
            : []),
        ...(existingImages.value ? existingImages.value : [])
    ];
});

onMounted(() => {
    state.value.title = props.experience.title!;
    state.value.description = props.experience.description!;
    state.value.date = props.experience.date!;
    state.value.addedImages = props.experience.addedImages ? props.experience.addedImages : [];
    existingImages.value = props.experience.images ? props.experience.images : [];
});

async function selectImage() {
    const result = await FilePicker.pickFiles({
        multiple: true
    });
    result.files.forEach((file) => {
        const url = URL.createObjectURL(file.blob!);
        state.value.addedImages.push(url);
    });
}

function removeImage(image: string) {
    if (image.includes("localhost")) {
        state.value.addedImages = state.value.addedImages.filter((img) => img != image);
    } else {
        existingImages.value = existingImages.value.filter((img) => img.id != image);

        state.value.removedImages.push(image);
    }
}

async function save() {
    const updated: UpdateExperience = {
        id: props.experience.id,
        poi: props.experience.poi,
        images: existingImages.value,
        ...state.value
    };

    try {
        if (props.mode == "edit") {
            journeyStore.updateExperienceData(updated);
            journeyModalController.close("editExperience");
        } else {
            journeyStore.patchExperience(updated);
            toast.success("Your modifications were successfuly saved", {
                position: POSITION.BOTTOM_RIGHT
            });
        }
        journeyModalController.close("editExperience");
    } catch (e) {
        toast.error("An error occured", {
            position: POSITION.BOTTOM_RIGHT
        });
    }
}
</script>
<style scoped lang="less"></style>
