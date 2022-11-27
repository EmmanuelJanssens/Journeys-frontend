<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <journey-modal header="Hello" name="login">
        <template v-slot:loading>
            <div v-if="isLoading" class="bg-high-contrast-text h-3">
                <div class="bg-secondary-darker h-full w-full animate-pulse"></div>
            </div>
        </template>
        <template v-slot:body>
            <div class="bg-secondary-light dark:bg-secondary-dark p-4">
                <div class="flex flex-col space-y-4">
                    <JourneyInput placeholder="Email" v-model="state.email" />
                    <JourneyInput placeholder="Password" v-model="state.password" type="password" />

                    <button
                        @click="openProviderSignin"
                        class="bg-primary-main dark:bg-primary-dark p-4 rounded-lg text-secondary-btn-contrast-text shadow-inner hover:bg-btn-dark dark:hover:bg-btn-darker transition-all ease-in transform hover:scale-110">
                        <font-awesome-icon :icon="faGoogle" />Login with google
                    </button>
                </div>
            </div>
        </template>
        <template v-slot:footer>
            <div class="flex justify-end">
                <button @click="submitForm">Login</button>
            </div>
        </template>
    </journey-modal>
</template>

<script lang="ts" setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { ref } from "vue";
import { useUserStore } from "stores/useUserStore";
import { showToast } from "utils/utils";
import { authApp } from "google/firebase";
import { journeyModalController } from "components/Modal/JourneyModalController";
import JourneyModal from "components/Modal/JourneyModal.vue";
import JourneyInput from "components/Input/JourneyInput.vue";
import { POSITION, useToast } from "vue-toastification";

const toast = useToast();

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
    isLoading.value = true;
    const credentials = await userStore.registerWith("google");
    if (credentials) {
        dismissLoginModal(true);
        journeyModalController.close("login");
        toast.success("Welcome " + authApp.currentUser?.displayName, {
            position: POSITION.TOP_CENTER
        });
    } else {
        await userStore.logout();

        toast.error("Error login in", {
            position: POSITION.TOP_CENTER
        });
    }
    isLoading.value = false;
}

async function submitForm() {
    v$.value.$validate();
    console.log(state.value);
    if (!v$.value.$error) {
        isLoading.value = true;
        const response = await userStore.login(state.value.email, state.value.password);
        if (response == true) {
            dismissLoginModal(true);
            toast.success("Welcome " + authApp.currentUser?.displayName, {
                position: POSITION.TOP_CENTER
            });
        } else {
            toast.error("Error login in", {
                position: POSITION.TOP_CENTER
            });
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
    journeyModalController.close("login");
    clearModal();
}
</script>

<style></style>
