<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Register</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="dismissRegisterModal()">
                        <ion-icon size="large" :icon="closeOutline" />
                    </ion-button>
                </ion-buttons>
                <ion-progress-bar v-if="isLoading" :type="'indeterminate'"></ion-progress-bar>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-grid>
                <ion-row>
                    <ion-col>
                        <ion-item
                            :class="{
                                'ion-margin': true,
                                'ion-invalid': v$.firstName.$error
                            }">
                            <ion-label position="floating">First Name</ion-label>
                            <ion-input
                                type="text"
                                v-model="state.firstName"
                                @ion-input="async () => await v$.firstName.$validate()"
                                @ion-change="ifZero($event, () => v$.firstName.$reset())" />
                            <ion-note v-if="v$.firstName.$error" slot="error">{{
                                v$.firstName.$errors[0].$message
                            }}</ion-note>
                        </ion-item>
                    </ion-col>
                    <ion-col>
                        <ion-item
                            :class="{
                                'ion-margin': true,
                                'ion-invalid': v$.lastName.$error
                            }">
                            <ion-label position="floating">lastName</ion-label>
                            <ion-input
                                type="text"
                                v-model="state.lastName"
                                @ion-input="async () => await v$.lastName.$validate()"
                                @ion-change="ifZero($event, () => v$.lastName.$reset())" />
                            <ion-note v-if="v$.lastName.$error" slot="error">{{
                                v$.lastName.$errors[0].$message
                            }}</ion-note>
                        </ion-item>
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <ion-item
                            :class="{
                                'ion-margin': true,
                                'ion-invalid': v$.username.$error
                            }">
                            <ion-label position="floating">Username</ion-label>
                            <ion-input
                                type="text"
                                v-model="state.username"
                                @ion-input="async () => await v$.username.$validate()"
                                @ion-change="ifZero($event, () => v$.username.$reset())" />
                            <ion-note v-if="v$.username.$error" slot="error">{{
                                v$.username.$errors[0].$message
                            }}</ion-note>
                        </ion-item>
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <ion-item
                            :class="{
                                'ion-margin': true,
                                'ion-invalid': v$.email.$error
                            }">
                            <ion-label position="floating">E-mail</ion-label>
                            <ion-input
                                type="text"
                                v-model="state.email"
                                @ion-input="() => v$.email.$validate()"
                                @ion-change="ifZero($event, () => v$.email.$reset())" />
                            <ion-note v-if="v$.email.$error" slot="error">{{ v$.email.$errors[0].$message }}</ion-note>
                        </ion-item>
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <ion-item
                            :class="{
                                'ion-margin': true,
                                'ion-invalid': v$.password.$error
                            }">
                            <ion-label position="floating">Password</ion-label>
                            <ion-input
                                type="password"
                                v-model="state.password"
                                @ion-input="() => v$.password.$validate()"
                                @ion-change="ifZero($event, () => v$.password.$reset())" />
                            <ion-note v-if="v$.password.$error" slot="error">{{
                                v$.password.$errors[0].$message
                            }}</ion-note>
                        </ion-item>
                    </ion-col>
                    <ion-col>
                        <ion-item
                            :class="{
                                'ion-margin': true,
                                'ion-invalid': v$.confirmPassword.$error
                            }">
                            <ion-label position="floating">Confirm password</ion-label>
                            <ion-input
                                type="password"
                                v-model="state.confirmPassword"
                                @ion-input="() => v$.confirmPassword.$validate()"
                                @ion-change="ifZero($event, () => v$.confirmPassword.$reset())" />
                            <ion-note v-if="v$.confirmPassword.$error" slot="error">{{
                                v$.confirmPassword.$errors[0].$message
                            }}</ion-note>
                        </ion-item>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
        <ion-footer>
            <ion-toolbar>
                <ion-buttons slot="end">
                    <ion-button @click="modalController.dismiss()" color="secondary">cancel</ion-button>
                    <ion-button @click="submitForm()" slot="end">Register</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>

<script lang="ts" setup>
import { InputCustomEvent, modalController } from "@ionic/core";
import {
    IonProgressBar,
    IonIcon,
    IonNote,
    IonPage,
    IonGrid,
    IonCol,
    IonRow,
    IonInput,
    IonButton,
    IonItem,
    IonLabel,
    IonHeader,
    IonToolbar,
    IonContent,
    IonTitle,
    toastController,
    IonText,
    IonButtons,
    IonFooter
} from "@ionic/vue";
import { useVuelidate } from "@vuelidate/core";
import { required, minLength, email, sameAs, helpers } from "@vuelidate/validators";
import { computed, ref } from "vue";

import { useUserStore } from "stores/useUserStore";
import { closeOutline } from "ionicons/icons";
import { showToast } from "utils/utils";
import { authApp } from "google/firebase";

const state = ref({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
});
const passwordRef = computed(() => state.value.password);

const rules = {
    username: {
        required,
        minLenght: minLength(5),
        unique: helpers.withMessage("Not available", (value: string) => true)
    },
    firstName: {},
    lastName: {},
    email: { required, email },
    password: {
        required,
        minLength: minLength(8),
        containsUppercase: helpers.withMessage("At least one upper case", (value: string) => /[A-Z]/.test(value)),
        numeric: helpers.withMessage("At least one number is needed", (value: string) => /[0-9]/.test(value)),
        special: helpers.withMessage("At least one special character", (value: string) => /[^a-zA-Z\d\s:]/.test(value))
    },
    confirmPassword: { sameAs: sameAs(passwordRef) }
};

const userStore = useUserStore();
const isLoading = ref(false);
const v$ = useVuelidate(rules, state);

function ifZero(event: InputCustomEvent, reset: Function) {
    if (event.detail.value?.length == 0) {
        reset();
    }
}

async function submitForm() {
    v$.value.$validate();
    if (!v$.value.$error) {
        isLoading.value = true;

        const validUsername = await userStore.checkUserName(state.value.username);
        if (!validUsername) {
            showToast("Authentication error", "danger");
            isLoading.value = false;
            return;
        }
        const response = await userStore.register(state.value);
        if (response) {
            dismissRegisterModal();
            showToast("Welcome " + authApp.currentUser?.displayName, "success");
        } else showToast("Authentication error", "danger");
        isLoading.value = false;
    }
}

function clearModal() {
    state.value.username = "";
    state.value.password = "";
    v$.value.$reset();
}

function dismissRegisterModal() {
    modalController.dismiss();
    clearModal();
}
</script>

<style></style>
