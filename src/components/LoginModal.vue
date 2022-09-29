<template>
    <ion-modal ref="modal" trigger="open-login-modal">
        <ion-header>
            <ion-toolbar>
                <ion-title>Login</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content class="journey-login-modal">
            <ion-grid>
                <ion-row>
                    <ion-col>
                        <ion-item>
                            <ion-label :color="userError" position="floating"
                                >Username</ion-label
                            >
                            <ion-input
                                type="text"
                                v-model="state.userName"
                                :ionFocus="clearForm()" />
                        </ion-item>
                        <ion-text color="danger" v-if="v$.userName.$error">{{
                            v$.userName.$errors[0].$message
                        }}</ion-text>
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <ion-item>
                            <ion-label
                                :color="passwordError"
                                position="floating"
                                >Password</ion-label
                            >
                            <ion-input
                                type="password"
                                v-model="state.password" />
                        </ion-item>
                        <ion-text color="danger" v-if="v$.password.$error">{{
                            v$.password.$errors[0].$message
                        }}</ion-text>
                    </ion-col>
                </ion-row>
                <ion-row class="ion-justify-content-around ion-margin-top">
                    <ion-col size="2">
                        <ion-button @click="submitForm()" color="primary"
                            >login</ion-button
                        >
                    </ion-col>
                    <ion-col size="2">
                        <ion-button
                            @click="dismissLoginModal()"
                            color="secondary"
                            >cancel</ion-button
                        >
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-modal>
</template>

<script lang="ts" setup>
import { modalController } from "@ionic/core";
import {
    IonModal,
    IonInput,
    IonGrid,
    IonCol,
    IonRow,
    IonButton,
    IonItem,
    IonLabel,
    IonHeader,
    IonToolbar,
    IonContent,
    IonTitle,
    toastController,
    IonText
} from "@ionic/vue";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { ref } from "vue";

import { useUserStore } from "../stores/useUserStore";

const state = ref({
    userName: "",
    password: ""
});
const rules = {
    userName: { required },
    password: { required }
};

var userError = ref("primary");
var passwordError = ref("primary");

const userStore = useUserStore();

const modal = ref<typeof IonModal>();

const v$ = useVuelidate(rules, state);

function submitForm() {
    v$.value.$validate();
    if (!v$.value.$error) {
        userStore
            .login(state.value.userName, state.value.password)
            .then((response) => {
                if (response == true) {
                    dismissLoginModal();
                    showToast(
                        "Welcome " + userStore.userRef.userName,
                        "success"
                    );
                } else {
                    showToast("Authentication error", "danger");
                }
            });
    }
}

async function showToast(message: string, color: string) {
    const toast = await toastController.create({
        message: message,
        duration: 5000,
        position: "bottom",
        color: color,
        buttons: [
            {
                text: "Dismiss",
                role: "cancel",
                handler: () => clearModal()
            }
        ]
    });
    await toast.present();
}

function clearForm() {
    userError.value = "primary";
    passwordError.value = "primary";
}
function clearModal() {
    state.value.userName = "";
    state.value.password = "";
    v$.value.$reset();
}

function dismissLoginModal() {
    modalController.dismiss();
    clearModal();
}

userStore.$subscribe((mutation) => {
    mutation.type;
    mutation.storeId;
    localStorage.setItem(
        "user",
        JSON.stringify({
            user: userStore.userRef,
            token: userStore.token
        })
    );
});
</script>

<style>
ion-modal {
    --width: 500px;
    --height: 300px;
}
</style>
