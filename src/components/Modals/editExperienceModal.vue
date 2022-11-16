<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title
                    >Edit Experience at
                    <ion-text color="secondary">{{
                        (currentData?.experience?.node as PoiDto)?.name
                    }}</ion-text></ion-title
                >
                <ion-progress-bar v-if="uploading" type="indeterminate"></ion-progress-bar>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-grid>
                <ion-row>
                    <ion-col>
                        <ion-item>
                            <ion-label position="fixed">Title</ion-label>
                            <ion-input
                                v-model="title"
                                @ionInput="title = $event.target.value"
                                :value="title"></ion-input>
                        </ion-item>
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <ion-item>
                            <ion-label>When</ion-label><ion-datetime-button datetime="datetime"></ion-datetime-button>
                        </ion-item>
                    </ion-col>
                </ion-row>

                <ion-row>
                    <ion-col>
                        <ion-item>
                            <ion-label position="fixed">Description</ion-label>
                            <ion-textarea
                                :value="currentData?.experience?.description"
                                v-model="description"
                                wrap="soft"
                                :rows="10">
                            </ion-textarea>
                        </ion-item>
                    </ion-col>
                </ion-row>

                <ion-row>
                    <ion-col>
                        <ion-item>
                            <ion-label position="fixed">Your pictures</ion-label>
                            <div class="images">
                                <div class="image-item" v-for="image in images" v-bind:key="image.url">
                                    <ion-thumbnail>
                                        <ion-img :src="image.url" />
                                    </ion-thumbnail>
                                    <ion-icon
                                        slot="icon-only"
                                        src="src/assets/icon/close-outline.svg"
                                        @click="removeImage(image.url)"></ion-icon>
                                </div>

                                <ion-button class="add-image" @click="selectImage" slot="icon-only">
                                    <ion-icon src="src/assets/icon/add-outline.svg"> </ion-icon>
                                </ion-button>
                            </div> </ion-item
                    ></ion-col>
                </ion-row>
                <ion-row> </ion-row>
            </ion-grid>
        </ion-content>
        <ion-footer>
            <ion-toolbar>
                <ion-button slot="end" color="secondary" @click="() => modalController.dismiss()"> cancel </ion-button>
                <ion-button slot="end" @click="save"> Save </ion-button>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
    <ion-modal :keep-contents-mounted="true">
        <ion-datetime id="datetime" @ion-change="selectDate($event)"></ion-datetime>
    </ion-modal>
</template>
<script lang="ts" setup>
import {
    IonInput,
    IonDatetime,
    IonIcon,
    IonDatetimeButton,
    IonModal,
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
    IonTextarea,
    IonText,
    modalController
} from "@ionic/vue";
import { useJourneyStore } from "stores/useJourneyStore";
import { ExperienceDto, JourneyDto, PoiDto } from "types/dtos";
import { onMounted, ref } from "vue";
import { FilePicker } from "@capawesome/capacitor-file-picker";
import { storageRef } from "google/storage";
import { ref as fref, uploadBytesResumable, getDownloadURL, deleteObject, UploadTask } from "firebase/storage";
import { showToast } from "utils/utils";

const description = ref();
const title = ref();
const journeyStore = useJourneyStore();
const props = defineProps<{
    experience: ExperienceDto;
}>();
const files = ref<Array<any>>([]);
const uploading = ref(false);
let currentData = ref<{
    experience?: ExperienceDto;
    journey?: JourneyDto;
}>({});
let images = ref<
    {
        url: string;
        isFs: boolean;
    }[]
>([]);
let selectedDate = ref<string>();
onMounted(() => {
    currentData.value!.experience = props.experience as ExperienceDto;
    title.value = currentData.value?.experience.title;
    currentData.value?.experience.images.forEach((image) => {
        images.value?.push({
            url: image,
            isFs: true
        });
    });
    currentData.value!.journey = { id: journeyStore.viewJourney.id };

    selectedDate.value = currentData.value?.experience.date;
});

function selectDate(e: any) {
    selectedDate.value = e.detail.value;
}
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
    uploading.value = true;
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
        modalController.dismiss({ status: "error" });
        uploading.value = false;
        showToast("An error occured while uploading your image try again", "danger");
    } else {
        currentData.value!.experience!.images = currentData.value!.experience!.images.filter((img) =>
            images.value.find((search) => img == search.url)
        );
        currentData.value!.experience!.images = currentData.value!.experience!.images.concat(...uploaded);
        currentData.value!.experience!.title = title.value;
        currentData.value!.experience!.date = selectedDate.value!;
        currentData.value!.experience!.description = description.value;
        currentData.value.experience!.journey = { id: journeyStore.viewJourney.id };
        await journeyStore.updateExperience(currentData.value!.experience!);
        modalController.dismiss({ status: "success" });
        showToast("Your modifications were successfuly saved", "success");
        uploading.value = false;
    }
}
</script>
<style scoped lang="less">
ion-thumbnail {
    min-width: 80px;
    min-height: 80px;
}
.image-item {
    position: relative;
    padding: 8px;
    margin: 5px;
    border-radius: 10%;
    border: solid;
    border-color: var(--ion-color-primary);
    border-width: 1px;
    & ion-icon {
        border-radius: 50%;
        background-color: var(--ion-color-danger);
        position: absolute;
        top: 2px;
        right: 2px;
        cursor: pointer;
    }
    & ion-img {
        border-radius: 10%;
    }
}

.images {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
}

.add-image {
    min-width: 90px;
    min-height: 90px;
}
</style>
