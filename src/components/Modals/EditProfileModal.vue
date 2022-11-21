<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Register</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="modalController.dismiss()">
                        <ion-icon size="large" :icon="closeOutline" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-grid>
                <ion-row>
                    <ion-col>
                        <ion-list>
                            <ion-item class="ion-margin">
                                <ion-label>First Name</ion-label>
                                <ion-input type="text" v-model="state.firstName" />
                            </ion-item>
                            <ion-text class="ion-margin" color="danger" v-if="v$.firstName.$error">{{
                                v$.firstName.$errors[0].$message
                            }}</ion-text>
                            <ion-item class="ion-margin">
                                <ion-label>lastName</ion-label>
                                <ion-input type="text" v-model="state.lastName" />
                            </ion-item>
                            <ion-item class="ion-margin">
                                <ion-label>Username</ion-label>
                                <ion-input type="text" v-model="state.username" />
                            </ion-item>
                            <ion-item class="ion-margin">
                                <ion-label>E-mail</ion-label>
                                <ion-input type="text" v-model="state.email" />
                            </ion-item>
                            <ion-item class="ion-margin">
                                <ion-label>Citation</ion-label>
                                <ion-input type="text" v-model="state.citation" />
                            </ion-item>
                        </ion-list>

                        <ion-text class="ion-margin" color="danger" v-if="v$.lastName.$error">{{
                            v$.lastName.$errors[0].$message
                        }}</ion-text>
                    </ion-col>
                </ion-row>
                <!--
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
                                        :icon="closeOutline"
                                        @click="removeImage(image.url)"></ion-icon>
                                </div>

                                <ion-button class="add-image" @click="selectImage" slot="icon-only">
                                    <ion-icon size="large" :icon="addOutline"> </ion-icon>
                                </ion-button>
                            </div> </ion-item
                    ></ion-col>
                </ion-row> -->
            </ion-grid>
        </ion-content>
        <ion-footer>
            <ion-toolbar>
                <ion-button slot="end" @click="submitForm()" color="primary">Save</ion-button>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>
<script lang="ts" setup>
import {
    IonList,
    IonButtons,
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
import { computed, onMounted, ref } from "vue";
import { FilePicker } from "@capawesome/capacitor-file-picker";
import { storageRef } from "google/storage";
import { ref as fref, uploadBytesResumable, getDownloadURL, deleteObject, UploadTask } from "firebase/storage";
import { showToast } from "utils/utils";
import { addOutline, closeOutline } from "ionicons/icons";
import { email, minLength, required, sameAs } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";
import { popoverController } from "@ionic/core";
import { useUserStore } from "stores/useUserStore";

const userStore = useUserStore();
const state = ref({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    citation: "",
    banner: [""]
});
const rules = {
    username: { required, minLength: minLength(4) },
    firstName: { required },
    lastName: { required },
    email: { required, email }
};

const v$ = useVuelidate(rules, state);

const description = ref();
const title = ref();
const journeyStore = useJourneyStore();

const files = ref<Array<any>>([]);
const uploading = ref(false);

let images = ref<
    {
        url: string;
        isFs: boolean;
    }[]
>([]);

onMounted(() => {
    state.value.username = userStore.userRef.username!;
    state.value.firstName = userStore.userRef.firstName!;
    state.value.lastName = userStore.userRef.lastName!;
    state.value.email = userStore.userRef.email!;
    state.value.citation = userStore.userRef.citation!;
    state.value.banner = userStore.userRef.banner!;
});

async function submitForm() {
    v$.value.$validate();
    if (!v$.value.$error) {
        if (state.value.username != userStore.userRef.username) {
            const validUsername = await userStore.checkUserName(state.value.username);
            if (validUsername) {
                modalController.dismiss(state.value);
            } else {
                showToast("Username not available", "danger");
            }
        } else {
            modalController.dismiss(state.value);
        }
    }
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
    const deleted = userStore.userRef.banner?.filter((img) => !images.value.find((search) => img == search.url));
    uploading.value = true;
    await deleted?.forEach(async (img) => {
        const imgRef = fref(storageRef.storage, img);
        await deleteObject(imgRef);
    });
    if (files.value.length > 0) {
        await files.value.forEach(async (f) => {
            const id = (f.url as string).slice((f.url as string).lastIndexOf("/") + 1);
            const imageRef = fref(storageRef, userStore.userRef.username + "/" + id);
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
