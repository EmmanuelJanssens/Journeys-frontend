<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Edit Experience {{ currentData?.poi.name }}</ion-title>
                <ion-progress-bar v-if="uploading" type="indeterminate"></ion-progress-bar>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-grid>
                <ion-row class="gallery ion-justify-content-center">
                    <ion-thumbnail v-for="image in currentData?.experience.images" v-bind:key="image">
                        <ion-img :src="image"></ion-img>
                    </ion-thumbnail>
                </ion-row>
                <ion-row>
                    <ion-button @click="selectImage"> Add Images </ion-button>
                </ion-row>
                <ion-row>
                    <ion-thumbnail v-for="file in files" v-bind:key="file">
                        <ion-img :src="file.url"></ion-img>
                    </ion-thumbnail>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <ion-item>
                            <ion-label position="stacked">Description</ion-label>
                            <ion-textarea
                                :value="currentData?.experience.description"
                                v-model="description"
                                wrap="soft"
                                :rows="10">
                            </ion-textarea>
                        </ion-item>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
        <ion-footer>
            <ion-toolbar>
                <ion-button slot="end" color="secondary" @click="() => modalController.dismiss()"> cancel </ion-button>
                <ion-button slot="end" @click="save"> Save </ion-button>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>
<script lang="ts" setup>
import {
    IonProgressBar,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonTitle,
    IonPage,
    IonContent,
    IonHeader,
    IonFooter,
    IonToolbar,
    IonItem,
    IonLabel,
    IonImg,
    IonThumbnail,
    IonInput,
    IonTextarea,
    modalController,
    onIonViewWillEnter,
    onIonViewDidEnter
} from "@ionic/vue";
import { useJourneyStore } from "stores/useJourneyStore";
import { useUserStore } from "stores/useUserStore";
import { ExperienceDto } from "types/dtos";
import { onMounted, ref } from "vue";
import { FilePicker } from "@capawesome/capacitor-file-picker";
import { storageRef } from "google/storage";
import { ref as fref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { showToast } from "utils/utils";

const description = ref();
const useJourney = useJourneyStore();
const props = defineProps(["experience", "journey"]);
const emit = defineEmits(["saved"]);
const files = ref<Array<any>>([]);
const uploading = ref(false);
let currentData = ref<ExperienceDto>();

onMounted(() => {
    console.log(props);
    currentData.value = props.experience as ExperienceDto;
});

async function selectImage() {
    const result = await FilePicker.pickFiles({
        multiple: true
    });
    result.files.forEach((file) => {
        files.value.push({
            file: file,
            url: URL.createObjectURL(file.blob!)
        });
    });
}
async function save() {
    if (files.value.length > 0) {
        await files.value.forEach(async (f) => {
            uploading.value = true;
            const id = (f.url as string).slice((f.url as string).lastIndexOf("/") + 1);
            const imageRef = fref(
                storageRef,
                currentData.value!.journey!.id + "/" + currentData.value!.poi.id + "/" + id
            );
            const metadata = {
                contentType: f.file.mimeType
            };

            const task = uploadBytesResumable(imageRef, f.file.blob, metadata);
            task.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    switch (snapshot.state) {
                        case "paused":
                            break;
                        case "running":
                            break;
                        case "success":
                            break;
                    }
                },
                (error) => {
                    //TODO send error message
                    //TODO remove successfully uploaded image
                },
                () => {
                    getDownloadURL(task.snapshot.ref).then(async (downloadUrl) => {
                        if (currentData.value!.experience.images == null) currentData.value!.experience.images = [];
                        currentData.value!.experience.images.push(downloadUrl);
                        currentData.value!.experience.description = description.value;
                        await useJourney.updateExperience(currentData.value!);

                        modalController.dismiss({ status: "success" });
                        uploading.value = false;
                        showToast("Modification saved", "success");
                        emit("saved");
                    });
                }
            );
        });
    } else if (description.value != currentData.value!.experience.description) {
        currentData.value!.experience.description = description.value;
        await useJourney.updateExperience(currentData.value!);
        modalController.dismiss({ status: "success" });
        uploading.value = false;
        showToast("Modification saved", "success");
        emit("saved");
    }
}
</script>
<style scoped>
.gallery {
    max-height: 200px;
    overflow-y: auto;
}
ion-thumbnail {
    min-width: 100px;
    min-height: 100px;
}
</style>
