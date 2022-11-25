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
                        <ion-item
                            :class="{
                                'ion-margin': true,
                                'ion-invalid': v$.username.$error
                            }">
                            <ion-label>Username</ion-label>
                            <ion-input type="text" v-model="state.username" />
                            <ion-note v-if="v$.username.$error" slot="error">{{ v$.username.$errors[0] }}</ion-note>
                        </ion-item>
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
                            <ion-label>Citation</ion-label>
                            <ion-input type="text" v-model="state.citation" />
                        </ion-item>

                        <ion-text class="ion-margin" color="danger" v-if="v$.lastName.$error">{{
                            v$.lastName.$errors[0].$message
                        }}</ion-text>
                    </ion-col>
                </ion-row>
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
    IonNote,
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
import { authApp, storageRef } from "google/firebase";
import { ref as fref, uploadBytesResumable, getDownloadURL, deleteObject, UploadTask } from "firebase/storage";
import { showToast } from "utils/utils";
import { addOutline, closeOutline } from "ionicons/icons";
import { email, minLength, required, sameAs } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";
import { popoverController } from "@ionic/core";
import { useUserStore } from "stores/useUserStore";

const state = ref({
    username: "",
    firstName: "",
    lastName: "",
    citation: "",
    banner: [""]
});
const rules = {
    username: { required, minLength: minLength(4) },
    firstName: { required },
    lastName: { required }
};
const v$ = useVuelidate(rules, state);

const userStore = useUserStore();

let images = ref<
    {
        url: string;
        isFs: boolean;
    }[]
>([]);

onMounted(() => {});

async function submitForm() {
    v$.value.$validate();
    if (!v$.value.$error) {
        if (state.value.username != authApp.currentUser?.displayName) {
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
</script>
<style scoped lang="less"></style>
