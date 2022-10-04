<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Login</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="dismissLoginModal()">
                        <ion-icon
                            size="large"
                            src="/src/assets/icon/close-outline.svg" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <section>
            <ion-item class="ion-margin">
                <ion-label position="floating">Username</ion-label>
                <ion-input type="text" v-model="state.userName" />
            </ion-item>
            <ion-text
                class="ion-margin"
                color="danger"
                v-if="v$.userName.$error"
                >{{ v$.userName.$errors[0].$message }}</ion-text
            >
            <span class="separator"></span>
            <ion-item class="ion-margin">
                <ion-label position="floating">Password</ion-label>
                <ion-input type="password" v-model="state.password" />
            </ion-item>
            <ion-text
                class="ion-margin"
                color="danger"
                v-if="v$.password.$error"
                >{{ v$.password.$errors[0].$message }}</ion-text
            >
        </section>
        <ion-footer>
            <ion-toolbar>
                <ion-button slot="end" @click="submitForm()" color="primary"
                    >login</ion-button
                >
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>

<script lang="ts" setup>
import { modalController } from "@ionic/core";
import {
    IonIcon,
    IonPage,
    IonModal,
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
import { required } from "@vuelidate/validators";
import { ref } from "vue";

import { useUserStore } from "stores/useUserStore";

const state = ref({
    userName: "",
    password: ""
});
const rules = {
    userName: { required },
    password: { required }
};

const userStore = useUserStore();

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
                        "Welcome " + userStore.userRef.username,
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
                handler: () => {}
            }
        ]
    });
    await toast.present();
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
</script>

<style></style>
