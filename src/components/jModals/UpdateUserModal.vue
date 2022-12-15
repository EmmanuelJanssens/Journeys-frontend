<template>
    <journey-modal
        header="Hello"
        name="updateUser"
        :loading="isLoading"
        :size="{
            w: 'max-w-4xl'
        }"
        :on-outside-clicked="dismissRegisterModal"
        :on-close="dismissRegisterModal">
        <template #header>
            <h1 class="text-btn-contrast-text">Update your information</h1>
        </template>

        <template #body>
            <div class="bg-secondary-light dark:bg-gray-800 p-8 h-full">
                <div>
                    <div v class="grid grid-cols-2 gap-4" v-if="!security.email && !security.password">
                        <JourneyInput v-model="state.firstName" placeholder="First Name" />
                        <JourneyInput v-model="state.lastName" placeholder="Last Name" />
                        <JourneyInput
                            v-model="state.username"
                            class="col-span-2"
                            placeholder="username"
                            :error="v$.username.$error ? v$.username.$errors[0].$message as string : ''"
                            @keydown="
                                ifZero(
                                    $event,
                                    () => v$.username.$reset(),
                                    () => v$.username.$validate()
                                )
                            " />
                        <button
                            class="btn btn-primary"
                            @click="
                                () => {
                                    security.password = true;
                                    security.email = false;
                                }
                            ">
                            Change password
                        </button>
                        <!-- <JourneyButton
                            @click="
                                () => {
                                    security.password = false;
                                    security.email = true;
                                }
                            "
                            >Change email</JourneyButton
                        > -->
                    </div>

                    <div class="flex flex-col space-y-4" v-if="security.password">
                        <JourneyInput
                            v-model="state.password"
                            class="col-span-2"
                            placeholder="Password"
                            :error="v$.password.$error ? v$.password.$errors[0].$message as string : ''"
                            type="password"
                            @keydown="
                                ifZero(
                                    $event,
                                    () => v$.password.$reset(),
                                    () => v$.password.$validate()
                                )
                            " />
                        <JourneyInput
                            v-model="state.confirmPassword"
                            class="col-span-2"
                            placeholder="Confirm password"
                            :error="v$.confirmPassword.$error ? v$.confirmPassword.$errors[0].$message as string : ''"
                            type="password"
                            @keydown="
                                ifZero(
                                    $event,
                                    () => v$.confirmPassword.$reset(),
                                    () => v$.confirmPassword.$validate()
                                )
                            " />
                    </div>
                    <!-- <div v-else-if="security.email">
                        <JourneyInput
                            v-model="state.email"
                            class="col-span-2"
                            placeholder="Email"
                            helper="required *this is used to log you in"
                            :error="v$.email.$error ? v$.email.$errors[0].$message as string : ''"
                            @keydown="
                                ifZero(
                                    $event,
                                    () => v$.email.$reset(),
                                    () => v$.email.$validate()
                                )
                            " />
                    </div> -->
                </div>
            </div>
        </template>
        <template #footer>
            <div class="flex justify-end">
                <button class="btn btn-primary" @click="submitForm">Update</button>
            </div>
        </template>
    </journey-modal>
</template>
<script lang="ts" setup>
import useVuelidate from "@vuelidate/core";
import { minLength, helpers, email, sameAs, alphaNum, required, requiredIf } from "@vuelidate/validators";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";
import { authApp } from "google/firebase";
import { useUserStore } from "stores/useUserStore";
import { onMounted, computed, ref } from "vue";
import { POSITION, useToast } from "vue-toastification";

import JourneyInput from "components/UI/Input/JourneyInput.vue";
import JourneyModal from "components/UI/Modal/JourneyModal.vue";
import { GoogleAuthProvider, reauthenticateWithPopup, updatePassword, updateProfile } from "@firebase/auth";
const state = ref({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
});

const passwordRef = computed(() => state.value.password);

const toast = useToast();
const toastOptions = {
    position: POSITION.BOTTOM_RIGHT
};

const rules = {
    username: {
        minLenght: minLength(3),
        noSpecial: helpers.withMessage("Can only contains letters/numbers and -,_", (value: string) =>
            /^[a-zA-Z0-9-_]+$/.test(value)
        ),
        unique: helpers.withMessage("Not available", () => true)
    },

    password: {
        required,
        minLength: minLength(8),
        containsUppercase: helpers.withMessage("At least one upper case", (value: string) => /[A-Z]/.test(value)),
        numeric: helpers.withMessage("At least one number is needed", (value: string) => /[0-9]/.test(value)),
        special: helpers.withMessage("At least one special character", (value: string) => /[^a-zA-Z\d\s:]/.test(value))
    },
    confirmPassword: { sameAs: sameAs(passwordRef), requiredIf: () => state.value.password.length > 8 }
};

const userStore = useUserStore();
const isLoading = ref(false);
const v$ = useVuelidate(rules, state);

function ifZero(event: InputEvent, reset: Function, validate: Function) {
    if ((event.target as HTMLTextAreaElement).value?.length == 0) {
        reset();
    } else {
        validate();
    }
}

onMounted(() => {
    state.value.username = userStore.state.userData.username;
    state.value.firstName = userStore.state.userData.firstname;
    state.value.lastName = userStore.state.userData.lastname;
});

async function submitForm() {
    v$.value.$validate();
    if (!v$.value.username.$error && authApp.currentUser?.displayName != state.value.username) {
        isLoading.value = true;
        try {
            await userStore.saveUser({
                firstName: state.value.firstName,
                lastName: state.value.lastName,
                username: state.value.username
            });
            updateProfile(authApp.currentUser!, {
                displayName: state.value.username
            });
            userStore.state.userData.username = state.value.username;

            dismissRegisterModal();
            toast.success("Modification saved ", toastOptions);

            isLoading.value = false;
        } catch (e) {
            toast.error("Could not register please try again later", toastOptions);
            isLoading.value = false;
        }
    }
    if (security.value.password) {
        if (!v$.value.password.$error && !v$.value.confirmPassword.$error) {
            if (authApp.currentUser?.providerId == "firebase") {
                const user = await reauthenticateWithPopup(authApp.currentUser, new GoogleAuthProvider());
                if (user.user) {
                    try {
                        updatePassword(authApp.currentUser!, state.value.password);
                        dismissRegisterModal();
                        toast.success("Password updated", toastOptions);
                    } catch (e) {
                        toast.error("An error occured", toastOptions);
                    }
                }
            }
        }
    }
    // if (security.value.email) {
    //     if (!v$.value.email.$error) {
    //         updatePassword(authApp.currentUser!, state.value.password);
    //         dismissRegisterModal();
    //         toast.success("Email updated", toastOptions);
    //     }
    // }
}

function clearModal() {
    state.value.username = "";
    state.value.password = "";
    state.value.confirmPassword = "";
    state.value.email = "";
    state.value.firstName = "";
    state.value.lastName = "";
    v$.value.$reset();
}

function dismissRegisterModal() {
    journeyModalController.close("updateUser");
    clearModal();
}

const security = ref({
    password: false,
    email: false
});
</script>
