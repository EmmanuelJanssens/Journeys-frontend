<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Edit Experience</ion-title>
                <ion-progress-bar
                    v-if="uploading"
                    type="indeterminate"></ion-progress-bar>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-grid>
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
                            <ion-label position="stacked"
                                >Description</ion-label
                            >
                            <ion-textarea
                                :value="props.experience.experience.description"
                                v-model="description">
                            </ion-textarea>
                        </ion-item>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
        <ion-footer>
            <ion-toolbar>
                <ion-button slot="end" color="secondary"> cancel </ion-button>
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
    modalController
} from "@ionic/vue";
import { useJourneyStore } from "stores/useJourneyStore";
import { useUserStore } from "stores/useUserStore";
import { ExperienceDto } from "types/dtos";
import { ref } from "vue";
import { FilePicker } from "@capawesome/capacitor-file-picker";
import { storageRef } from "google/storage";
import {
    ref as fref,
    uploadBytesResumable,
    getDownloadURL
} from "firebase/storage";
const description = ref();
const useJourney = useJourneyStore();
const useUser = useUserStore();
const props = defineProps(["experience"]);
const files = ref<Array<any>>([]);
const uploading = ref(false);

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
    let exp = props.experience as ExperienceDto;

    if (description.value == undefined || description.value == null)
        description.value = props.experience.experience.description;
    else exp.experience.description = description.value;

    await files.value.forEach(async (f) => {
        uploading.value = true;
        const id = (f.url as string).slice(
            (f.url as string).lastIndexOf("/") + 1
        );
        const imageRef = fref(
            storageRef,
            exp.journey!.id + "/" + exp.poi.id + "/" + id
        );
        const metadata = {
            contentType: f.file.mimeType
        };

        const task = uploadBytesResumable(imageRef, f.file.blob, metadata);
        task.on(
            "state_changed",
            (snapshot) => {
                const progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
                    if (exp.experience.images == null)
                        exp.experience.images = [];
                    exp.experience.images.push(downloadUrl);
                    await useJourney.updateExperience(exp);
                    modalController.dismiss();
                    uploading.value = false;
                });
            }
        );
    });
}
</script>
<style scoped>
ion-thumbnail {
    min-width: 200px;
    min-height: 200px;
}
</style>
