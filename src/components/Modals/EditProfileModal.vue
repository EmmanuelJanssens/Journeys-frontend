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
            <ion-list v-if="!changePassword && !changeEmail">
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

                <ion-item class="ion-margin">
                    <ion-label>lastName</ion-label>
                    <ion-input type="text" v-model="state.lastName" />
                </ion-item>

                <ion-item class="ion-margin">
                    <ion-label>Citation</ion-label>
                    <ion-input type="text" v-model="state.citation" />
                </ion-item>
            </ion-list>

            <div class="ion-margin flex justify-between" v-if="!changePassword && !changeEmail">
                <ion-button class="w-1/2" @click="changePassword = true"
                    ><ion-icon slot="start" :icon="lockClosedOutline"></ion-icon>Change Password
                </ion-button>
                <ion-button class="w-1/2" @click="changeEmail = true"
                    ><ion-icon slot="start" :icon="mailOpenOutline"></ion-icon>Change email</ion-button
                >
            </div>

            <ion-list v-if="changePassword">
                <ion-item
                    :class="{
                        'ion-margin': true,
                        'ion-invalid': pwd$.password.$error
                    }">
                    <ion-label>New password</ion-label>
                    <ion-input
                        v-model="passwordState.password"
                        placeholder="..."
                        @ion-input="pwd$.password.$validate()"
                        type="password"></ion-input>
                    <ion-note slot="error" v-if="pwd$.password.$error">{{
                        pwd$.password.$errors[0].$message
                    }}</ion-note>
                </ion-item>
                <ion-item
                    :class="{
                        'ion-margin': true,
                        'ion-invalid': pwd$.confirmPwd.$error
                    }">
                    <ion-label>confirm password</ion-label>
                    <ion-input
                        v-model="passwordState.confirmPwd"
                        placeholder="..."
                        @ion-input="pwd$.confirmPwd.$validate()"
                        type="password"></ion-input>
                    <ion-note slot="error" v-if="pwd$.confirmPwd.$error">{{
                        pwd$.confirmPwd.$errors[0].$message
                    }}</ion-note>
                </ion-item>
            </ion-list>

            <ion-list v-if="changeEmail">
                <ion-item
                    :class="{
                        'ion-margin': true,
                        'ion-invalid': email$.$error
                    }">
                    <ion-label>Change email</ion-label>
                    <ion-input placeholder="..."></ion-input>
                    <ion-note slot="error" v-if="email$.$error">{{ email$.$errors[0].$message }}</ion-note>
                </ion-item>
            </ion-list>
            <div class="ion-margin flex justify-between" v-if="changePassword || changeEmail">
                <ion-button
                    class="w-1/2"
                    @click="
                        changePassword = false;
                        changeEmail = false;
                    "
                    >cancel
                </ion-button>
                <ion-button class="w-1/2" @click="changeValues">confirm</ion-button>
            </div>
        </ion-content>
        <ion-footer>
            <ion-toolbar>
                <ion-button v-if="!changePassword && !changeEmail" slot="end" @click="submitForm()" color="primary"
                    >Save</ion-button
                >
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>
<script lang="ts" setup>
import {
    IonList,
    IonButtons,
    IonInput,
    IonIcon,
    IonButton,
    IonTitle,
    IonPage,
    IonContent,
    IonHeader,
    IonFooter,
    IonToolbar,
    IonItem,
    IonLabel,
    IonNote,
    modalController
} from "@ionic/vue";
import { computed, onMounted, ref } from "vue";
import { authApp } from "google/firebase";
import { showToast } from "utils/utils";
import { closeOutline, lockClosedOutline, mailOpenOutline } from "ionicons/icons";
import { email, helpers, minLength, required, sameAs } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";
import { useUserStore } from "stores/useUserStore";
import { updateEmail, updatePassword } from "@firebase/auth";

const changePassword = ref(false);
const changeEmail = ref(false);
const state = ref({
    username: "",
    firstName: "",
    lastName: "",
    citation: "",
    banner: [""]
});

const passwordState = ref({
    password: "",
    confirmPwd: ""
});
const emailState = ref({
    email: ""
});
const pawsswordRef = computed(() => passwordState.value.password);

const rules = {
    username: { minLength: minLength(4) }
};
const pwdRules = {
    password: {
        required,
        minLength: minLength(8),
        containsUppercase: helpers.withMessage("At least one upper case", (value: string) => /[A-Z]/.test(value)),
        numeric: helpers.withMessage("At least one number is needed", (value: string) => /[0-9]/.test(value)),
        special: helpers.withMessage("At least one special character", (value: string) => /[^a-zA-Z\d\s:]/.test(value))
    },
    confirmPwd: {
        required,
        sameAs: sameAs(pawsswordRef)
    }
};
const emailRules = {
    email: { required, email }
};
const v$ = useVuelidate(rules, state);
const pwd$ = useVuelidate(pwdRules, passwordState);
const email$ = useVuelidate(emailState, emailRules);

const userStore = useUserStore();

async function changeValues() {
    const user = authApp.currentUser;
    try {
        if (changePassword.value) {
            pwd$.value.$validate();
            if (!pwd$.value.error) {
                updatePassword(user!, passwordState.value.password);
                changePassword.value = false;
                showToast("Modification saved", "success");
            }
        } else if (changeEmail.value) {
            email$.value.$validate();
            if (!email$.value.$error) {
                updateEmail(user!, emailState.value.email);
                changeEmail.value = false;
                showToast("Modification saved", "success");
            }
        }
    } catch (e) {
        showToast("Failed to save modifications", "danger");
    }
}

onMounted(() => {
    state.value.username = userStore.currentUser?.additional?.username!;
    state.value.citation = userStore.currentUser?.additional?.citation!;
    state.value.banner = userStore.currentUser?.additional?.banner!;
    state.value.firstName = userStore.currentUser?.additional?.firstName!;
    state.value.lastName = userStore.currentUser?.additional?.lastName!;
});

async function submitForm() {
    v$.value.$validate();
    if (!v$.value.$error) {
        const userUdpated = state.value.username != userStore.currentUser?.additional?.username;
        let validUsername = true;
        if (userUdpated) {
            validUsername = await userStore.checkUserName(state.value.username);
        }
        if (validUsername) {
            await userStore.saveUser(state.value);
            modalController.dismiss();
            showToast("Modification successfull", "success");
        } else {
            showToast("Username not available", "danger");
        }
        modalController.dismiss(state.value);
    }
}
</script>
<style scoped lang="less"></style>
