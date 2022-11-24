<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Login</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="dismissLoginModal(false)">
                        <ion-icon size="large" :icon="closeOutline" />
                    </ion-button>
                </ion-buttons>
                <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
            </ion-toolbar>
        </ion-header>
        <section>
            <div class="flex flex-col items-center">
                <div class="w-full">
                    <ion-item class="ion-margin">
                        <ion-label position="floating">Email</ion-label>
                        <ion-input type="text" v-model="state.email" />
                    </ion-item>
                </div>
                <div>
                    <ion-text class="ion-margin" color="danger" v-if="v$.email.$error">{{
                        v$.email.$errors[0].$message
                    }}</ion-text>
                    <ion-text class="ion-margin" color="danger" v-if="v$.email.$error">{{
                        v$.email.$errors[0].$message
                    }}</ion-text>
                </div>

                <div class="w-full">
                    <ion-item class="ion-margin">
                        <ion-label position="floating">Password</ion-label>
                        <ion-input type="password" v-model="state.password" />
                    </ion-item>
                    <ion-text class="ion-margin" color="danger" v-if="v$.password.$error">{{
                        v$.password.$errors[0].$message
                    }}</ion-text>
                </div>

                <div>
                    <ion-button @click="openProviderSignin"
                        ><ion-icon slot="start" :icon="logoGoogle" />Sign in With google</ion-button
                    >
                </div>
            </div>
        </section>
        <ion-footer>
            <ion-toolbar>
                <ion-buttons slot="end">
                    <ion-button @click="modalController.dismiss()" color="secondary">cancel</ion-button>
                    <ion-button @click="submitForm()">login</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>

<script lang="ts" setup>
import { modalController } from "@ionic/core";
import {
    IonProgressBar,
    IonIcon,
    IonPage,
    IonInput,
    IonButton,
    IonItem,
    IonLabel,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonText,
    IonButtons,
    IonFooter
} from "@ionic/vue";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { ref } from "vue";
import { useUserStore } from "stores/useUserStore";
import { showToast } from "utils/utils";
import { closeOutline, logoGoogle } from "ionicons/icons";
import { authApp } from "google/firebase";
import { GoogleAuthProvider, signInWithPopup } from "@firebase/auth";
const state = ref({
    email: "",
    password: ""
});
const rules = {
    email: { required },
    password: { required }
};

const userStore = useUserStore();
const isLoading = ref(false);
const v$ = useVuelidate(rules, state);

async function openProviderSignin() {
    const credentials = await userStore.registerWith("google");
    if (credentials) {
        console.log(credentials);
        dismissLoginModal(true);
        showToast("Welcome " + authApp.currentUser?.displayName, "success");
    } else {
        showToast("Authentication error", "danger");
    }
}
async function submitForm() {
    v$.value.$validate();
    if (!v$.value.$error) {
        isLoading.value = true;
        const response = await userStore.login(state.value.email, state.value.password);
        if (response == true) {
            dismissLoginModal(true);
            showToast("Welcome " + authApp.currentUser?.displayName, "success");
        } else {
            showToast("Authentication error", "danger");
        }
        isLoading.value = false;
    }
}

function clearModal() {
    state.value.email = "";
    state.value.password = "";
    v$.value.$reset();
}

function dismissLoginModal(success: boolean) {
    modalController.dismiss(success);
    clearModal();
}
</script>

<style></style>
