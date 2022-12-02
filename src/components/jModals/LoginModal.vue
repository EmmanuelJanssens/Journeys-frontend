<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <journey-modal
        header="Login"
        name="login"
        :loading="isLoading"
        :size="{
            w: 'w-1/4 min-w-max',
            h: 'h-1/3'
        }">
        <template #body>
            <div class="h-full bg-secondary-light dark:bg-gray-800 p-4 flex items-center justify-center">
                <div class="flex flex-col space-y-4 justify-center">
                    <JourneyInput v-model="state.email" placeholder="Email" />
                    <JourneyInput v-model="state.password" placeholder="Password" type="password" />
                    <div class="flex justify-between space-x-4">
                        <JourneyButton class="grow" type="primary" fill="fill" @click="submitForm">
                            LOGIN
                        </JourneyButton>
                        <JourneyButton class="grow" type="secondary" fill="outlined" @click="openRegister">
                            REGISTER
                        </JourneyButton>
                    </div>
                    <JourneyLabel class="text-center" color="text-primary-dark" size="text-lg">
                        Login with
                    </JourneyLabel>
                    <div class="w-14 h-14">
                        <JourneyButton type="primary" fill="fill" @click="openProviderSignin">
                            <font-awesome-icon :icon="faGoogle" />
                        </JourneyButton>
                    </div>
                </div>
            </div>
        </template>
        <template #footer>
            <div class="flex justify-end" />
        </template>
    </journey-modal>
</template>

<script lang="ts" setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { onMounted, ref } from "vue";
import { useUserStore } from "stores/useUserStore";
import { authApp } from "google/firebase";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";
import JourneyModal from "components/UI/Modal/JourneyModal.vue";
import JourneyInput from "components/UI/Input/JourneyInput.vue";
import { POSITION, useToast } from "vue-toastification";
import JourneyButton from "components/UI/Button/JourneyButton.vue";
import JourneyLabel from "components/UI/Label/JourneyLabel.vue";

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
        dismissLoginModal();
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

function openRegister() {
    journeyModalController.close("login");
    journeyModalController.open("register");
}
async function submitForm() {
    v$.value.$validate();
    isLoading.value = true;

    if (!v$.value.$error) {
        const response = await userStore.login(state.value.email, state.value.password);
        if (response == true) {
            dismissLoginModal();
            toast.success("Welcome " + authApp.currentUser?.displayName, {
                position: POSITION.TOP_CENTER
            });
        } else {
            toast.error("Error login in", {
                position: POSITION.TOP_CENTER
            });
        }
    }
    isLoading.value = false;
}

function clearModal() {
    state.value.email = "";
    state.value.password = "";
    v$.value.$reset();
}

function dismissLoginModal() {
    journeyModalController.close("login");
    clearModal();
}

onMounted(() => {});
</script>

<style></style>
