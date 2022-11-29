<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <journey-modal :header="'Edit '" name="editExperience">
        <template v-slot:loading>
            <div v-if="isLoading" class="bg-high-contrast-text h-3">
                <div class="bg-secondary-darker h-full w-full animate-pulse"></div>
            </div>
            <div v-if="isLoading" class="bg-high-contrast-text h-3">
                <div class="bg-secondary-darker h-full w-full animate-pulse"></div>
            </div>
        </template>
        <template v-slot:body>
            <div class="bg-secondary-light p-4 flex flex-col h-full">
                <div class="flex flex-col space-y-4 h-full">
                    <journey-input placeholder="Title" v-model="state.title" />
                    <!-- <journey-input placeholder="Date" v-model="state.selectedDate" /> -->
                    <DatePicker v-model="state.selectedDate" />
                    <journey-textarea :rows="6" placeholder="description" v-model="state.description" />
                </div>
                <div class="flex space-x-2 flex-wrap max-w-3xl">
                    <div v-for="img in images" v-bind:key="img.url">
                        <button class="relative">
                            <img
                                class="object-cover w-24 h-24 rounded-lg border-2 border-primary-darker p-1"
                                :src="img.url" />
                            <font-awesome-icon
                                class="absolute top-0 right-0 text-green-400"
                                :icon="faClose"
                                @click="removeImage(img.url)" />
                        </button>
                    </div>
                    <button class="relative w-24 h-24 rounded-lg bg-green-200" @click="selectImage">
                        <font-awesome-icon class="" :icon="faAdd" size="4x" />
                    </button>
                </div>
            </div>
        </template>
        <template v-slot:footer>
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
import { ref as fref, uploadBytesResumable, getDownloadURL, deleteObject, UploadTask } from "firebase/storage";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faClose, faAdd } from "@fortawesome/free-solid-svg-icons";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";
import JourneyModal from "components/UI/Modal/JourneyModal.vue";
import JourneyInput from "components/UI/Input/JourneyInput.vue";
import JourneyTextarea from "components/UI/Input/JourneyTextarea.vue";
import { POSITION, useToast } from "vue-toastification";
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
    currentData.value = {
        experience: props.experience as ExperienceDto,
        journey: journeyStore.viewJourney
    };
    currentData.value!.experience = props.experience as ExperienceDto;

    state.value.title = currentData.value?.experience.title;
    currentData.value?.experience.images.forEach((image) => {
        images.value?.push({
            url: image,
            isFs: true
        });
    });
    state.value.selectedDate = currentData.value?.experience.date;
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
        images.value = images.value?.filter((img) => image != img.url)!;
    }
}

const taskList = Array<UploadTask>();
async function save() {
    const deleted = currentData.value?.experience?.images.filter(
        (img) => !images.value.find((search) => img == search.url)
    );
    isLoading.value = true;
    await deleted?.forEach(async (img) => {
        const imgRef = fref(storageRef.storage, img);
        await deleteObject(imgRef);
    });
    if (files.value.length > 0) {
        await files.value.forEach(async (f) => {
            const id = (f.url as string).slice((f.url as string).lastIndexOf("/") + 1);
            const imageRef = fref(
                storageRef,
                journeyStore.viewJourney.id + "/" + currentData.value!.experience?.node.id + "/" + id
            );
            const metadata = {
                contentType: f.file.mimeType
            };
            taskList.push(uploadBytesResumable(imageRef, f.file.blob, metadata));
        });
    }
    var error = false;
    const uploaded: string[] = [];
    for (const task of taskList) {
        const res = await task;
        const url = await getDownloadURL(task.snapshot.ref);
        uploaded.push(url);
        if (res.state == "error") {
            error = true;
        }
    }
    if (error) {
        uploaded.forEach((img) => {
            const imgRef = fref(storageRef.storage, img);
            deleteObject(imgRef);
        });
        isLoading.value = false;
        toast.error("An error occured while uploading your image try again", {
            position: POSITION.TOP_CENTER
        });
    } else {
        currentData.value!.experience!.images = currentData.value!.experience!.images.filter((img) =>
            images.value.find((search) => img == search.url)
        );
        currentData.value!.experience!.images = currentData.value!.experience!.images.concat(...uploaded);
        currentData.value!.experience!.title = state.value.title;
        currentData.value!.experience!.date = state.value.selectedDate;
        currentData.value!.experience!.description = state.value.description;
        currentData.value!.experience!.journey = { id: journeyStore.viewJourney.id };
        await journeyStore.updateExperience(currentData.value!.experience!);
        journeyModalController.close("editExperience");
        toast.success("Your modifications were successfuly saved", {
            position: POSITION.TOP_CENTER
        });
        isLoading.value = false;
    }
}
</script>
<style scoped lang="less"></style>
