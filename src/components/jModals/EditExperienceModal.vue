<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <journey-modal
        :header="'Edit '"
        name="editExperience"
        :loading="isLoading"
        :size="{
            w: 'w-1/2 min-w-fit',
            h: 'h-1/3'
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
            <div class="bg-secondary-light p-4 flex flex-col h-full">
                <div class="flex flex-col space-y-4 h-full">
                    <journey-input v-model="state.title" placeholder="Title" />
                    <!-- <journey-input placeholder="Date" v-model="state.selectedDate" /> -->
                    <DatePicker v-model="state.selectedDate" />
                    <journey-textarea v-model="state.description" :rows="6" placeholder="description" />
                </div>
                <div class="flex space-x-2 flex-wrap max-w-3xl p-4 items-center">
                    <JourneyButton class="relative w-24 h-24 rounded-lg bg-green-200" @click="selectImage">
                        <font-awesome-icon class="" :icon="faAdd" size="4x" />
                    </JourneyButton>
                    <div v-for="img in images" :key="img.url">
                        <JourneyButton class="relative" fill="none">
                            <img
                                class="object-cover w-24 h-24 rounded-lg border-2 border-primary-darker p-1"
                                :src="img.url" />
                            <font-awesome-icon
                                class="absolute top-0 right-1 text-red-600"
                                :icon="faClose"
                                size="lg"
                                @click="removeImage(img.url)" />
                        </JourneyButton>
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
import { ExperienceDto, JourneyDto, PoiDto } from "types/dtos";
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
import JourneyButton from "components/UI/Button/JourneyButton.vue";
const state = ref({
    description: "",
    title: "",
    files: [],
    selectedDate: ""
});

const journeyStore = useJourneyStore();
const props = defineProps<{
    experience: ExperienceDto;
}>();
const files = ref<Array<any>>([]);
const isLoading = ref(false);
let currentData = ref<{
    experience: ExperienceDto;
    journey: JourneyDto;
}>();
let images = ref<
    {
        url: string;
        isFs: boolean;
    }[]
>([]);

const toast = useToast();
onMounted(() => {
    if (props.experience.editing) {
        currentData.value = {
            experience: props.experience as ExperienceDto,
            journey: journeyStore.editJourney
        };
        currentData.value!.experience = props.experience as ExperienceDto;

        state.value.title = currentData.value?.experience.title;
        state.value.description = currentData.value.experience.description;
        currentData.value!.experience.imagesEditing?.forEach((img) => {
            images.value.push(img);
        });

        state.value.selectedDate = currentData.value?.experience.date;
    } else {
        currentData.value = {
            experience: props.experience as ExperienceDto,
            journey: journeyStore.editJourney
        };
        currentData.value!.experience = props.experience as ExperienceDto;

        state.value.title = currentData.value?.experience.title;
        state.value.description = currentData.value.experience.description;
        currentData.value?.experience.images.forEach((image) => {
            images.value?.push({
                url: image,
                isFs: true
            });
        });

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
    }
}

async function save() {
    if (currentData.value?.experience.editing) {
        currentData.value!.experience!.title = state.value.title;
        currentData.value!.experience!.date = state.value.selectedDate;
        currentData.value!.experience!.description = state.value.description;
        // currentData.value!.experience!.journey = { id: journeyStore.editJourney.journey?.id };
        currentData.value.experience.imagesEditing = currentData.value.experience.imagesEditing?.concat(...files.value);
        journeyStore.setExperienceData(currentData.value.experience);
        journeyModalController.close("editExperience");
    } else {
        const deleted = currentData.value?.experience?.images.filter(
            (img) => !images.value.find((search) => img == search.url)
        );
        isLoading.value = true;
        await deleted?.forEach(async (img) => {
            const imgRef = fref(storageRef.storage, img);
            await deleteObject(imgRef);
        });

        try {
            journeyStore
                .uploadImages(files.value, (props.experience.node as PoiDto).id!, journeyStore.editJourney.id!)
                ?.then(() => {
                    toast.info("Your images where uploaded you can now view them !", {
                        position: POSITION.BOTTOM_RIGHT
                    });
                })
                .catch(() => {
                    toast.error("TAn error occured when uploading your images :(", {
                        position: POSITION.TOP_CENTER
                    });
                });
            currentData.value!.experience!.images = currentData.value!.experience!.images.filter((img) =>
                images.value.find((search) => img == search.url)
            );
            currentData.value!.experience!.title = state.value.title;
            currentData.value!.experience!.date = state.value.selectedDate;
            currentData.value!.experience!.description = state.value.description;
            await journeyStore.updateExperience(currentData.value!.experience!);
            journeyModalController.close("editExperience");
            toast.success("Your modifications were successfuly saved", {
                position: POSITION.TOP_CENTER
            });
        } catch (e) {
            toast.error("Could not save your modifications", {
                position: POSITION.TOP_CENTER
            });
        }

        isLoading.value = false;
    }
    if (router.currentRoute.value.name == "edit") {
        drawJourney(journeyStore.editJourney);
        drawPoisBetween();
    }
}
</script>
<style scoped lang="less"></style>
