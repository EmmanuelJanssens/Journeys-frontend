<template>
    <ion-modal ref="modal" trigger="open-register-modal">
        <ion-header>
            <ion-toolbar>
                <ion-title>Register</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="dismissRegisterModal()">
                        <ion-icon
                            size="large"
                            src="/src/assets/icon/close-outline.svg" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-grid>
                <ion-row>
                    <ion-col>
                        <ion-item class="ion-margin">
                            <ion-label position="floating"
                                >First Name</ion-label
                            >
                            <ion-input type="text" v-model="state.firstName" />
                        </ion-item>
                        <ion-text
                            class="ion-margin"
                            color="danger"
                            v-if="v$.firstName.$error"
                            >{{ v$.firstName.$errors[0].$message }}</ion-text
                        >
                    </ion-col>
                    <ion-col>
                        <ion-item class="ion-margin">
                            <ion-label position="floating">lastName</ion-label>
                            <ion-input type="text" v-model="state.lastName" />
                        </ion-item>
                        <ion-text
                            class="ion-margin"
                            color="danger"
                            v-if="v$.lastName.$error"
                            >{{ v$.lastName.$errors[0].$message }}</ion-text
                        >
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
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
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <ion-item class="ion-margin">
                            <ion-label position="floating">E-mail</ion-label>
                            <ion-input type="text" v-model="state.email" />
                        </ion-item>
                        <ion-text
                            class="ion-margin"
                            color="danger"
                            v-if="v$.email.$error"
                            >{{ v$.email.$errors[0].$message }}</ion-text
                        >
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <ion-item class="ion-margin">
                            <ion-label position="floating">Password</ion-label>
                            <ion-input
                                type="password"
                                v-model="state.password" />
                        </ion-item>
                        <ion-text
                            class="ion-margin"
                            color="danger"
                            v-if="v$.password.$error"
                            >{{ v$.password.$errors[0].$message }}</ion-text
                        >
                    </ion-col>
                    <ion-col>
                        <ion-item class="ion-margin">
                            <ion-label position="floating"
                                >Confirm Password</ion-label
                            >
                            <ion-input
                                type="password"
                                v-model="state.confirmPassword" />
                        </ion-item>
                        <ion-text
                            class="ion-margin"
                            color="danger"
                            v-if="v$.confirmPassword.$error"
                            >{{
                                v$.confirmPassword.$errors[0].$message
                            }}</ion-text
                        >
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
        <ion-footer>
            <ion-toolbar>
                <ion-button slot="end" @click="submitForm()" color="primary"
                    >login</ion-button
                >
            </ion-toolbar>
        </ion-footer>
    </ion-modal>
</template>

<script lang="ts" setup>
import { modalController } from "@ionic/core";
import {
    IonGrid,
    IonCol,
    IonRow,
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
import { required, minLength, email, sameAs } from "@vuelidate/validators";
import { computed, ref } from "vue";

import { useUserStore } from "../stores/useUserStore";

const state = ref({
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
});
const passwordRef = computed(() => state.value.password);
const rules = {
    userName: { required, minLength: minLength(4) },
    firstName: { required },
    lastName: { required },
    email: { required, email },
    password: { required, minLength: minLength(6) },
    confirmPassword: { sameAs: sameAs(passwordRef) }
};

const userStore = useUserStore();

const modal = ref<typeof IonModal>();

const v$ = useVuelidate(rules, state);

function submitForm() {
    v$.value.$validate();
    if (!v$.value.$error) {
        userStore.register(state.value).then((response) => {
            if (response == true) {
                dismissRegisterModal();
                showToast("Welcome " + userStore.userRef.userName, "success");
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

function dismissRegisterModal() {
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

<style></style>
