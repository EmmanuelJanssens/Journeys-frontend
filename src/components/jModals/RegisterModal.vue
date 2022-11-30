<template>
    <journey-modal
        header="Hello"
        name="register"
        :on-outside-clicked="dismissRegisterModal"
        :on-close="dismissRegisterModal">
        <template v-slot:loading>
            <div v-if="isLoading" class="bg-high-contrast-text h-3">
                <div class="bg-secondary-darker h-full w-full animate-pulse"></div>
            </div>
        </template>
        <template v-slot:body>
            <div class="bg-secondary-light dark:bg-secondary-dark p-4">
                <div class="grid grid-cols-2 gap-4">
                    <JourneyInput
                        placeholder="First Name"
                        v-model="state.firstName"
                        :error="v$.firstName.$error ? v$.firstName.$errors[0].$message as string : ''"
                        @keydown="
                            ifZero(
                                $event,
                                () => v$.firstName.$reset(),
                                () => v$.firstName.$validate()
                            )
                        " />
                    <JourneyInput
                        placeholder="Last Name"
                        v-model="state.lastName"
                        :error="v$.lastName.$error ? v$.lastName.$errors[0].$message as string : ''"
                        @keydown="
                            ifZero(
                                $event,
                                () => v$.lastName.$reset(),
                                () => v$.lastName.$validate()
                            )
                        " />
                    <JourneyInput
                        class="col-span-2"
                        placeholder="username"
                        v-model="state.username"
                        helper="required"
                        :error="v$.username.$error ? v$.username.$errors[0].$message as string : ''"
                        @keydown="
                            ifZero(
                                $event,
                                () => v$.username.$reset(),
                                () => v$.username.$validate()
                            )
                        " />
                    <JourneyInput
                        class="col-span-2"
                        placeholder="Email"
                        v-model="state.email"
                        helper="required"
                        :error="v$.email.$error ? v$.email.$errors[0].$message as string : ''"
                        @keydown="
                            ifZero(
                                $event,
                                () => v$.email.$reset(),
                                () => v$.email.$validate()
                            )
                        " />
                    <JourneyInput
                        class="col-span-2"
                        placeholder="Password"
                        v-model="state.password"
                        :error="v$.password.$error ? v$.password.$errors[0].$message as string : ''"
                        @keydown="
                            ifZero(
                                $event,
                                () => v$.password.$reset(),
                                () => v$.password.$validate()
                            )
                        "
                        type="password" />
                    <JourneyInput
                        class="col-span-2"
                        placeholder="Confirm password"
                        v-model="state.confirmPassword"
                        :error="v$.confirmPassword.$error ? v$.confirmPassword.$errors[0].$message as string : ''"
                        @keydown="
                            ifZero(
                                $event,
                                () => v$.confirmPassword.$reset(),
                                () => v$.confirmPassword.$validate()
                            )
                        "
                        type="password" />
                </div>
            </div>
        </template>
        <template v-slot:footer>
            <div class="flex justify-end">
                <button @click="submitForm">Register</button>
            </div>
        </template>
    </journey-modal>
</template>

<script lang="ts" setup>
import { useVuelidate } from "@vuelidate/core";
import { POSITION, useToast } from "vue-toastification";

import { required, minLength, email, sameAs, helpers } from "@vuelidate/validators";
import { computed, ref } from "vue";

import { useUserStore } from "stores/useUserStore";
import { authApp } from "google/firebase";
import JourneyInput from "components/UI/Input/JourneyInput.vue";
import JourneyModal from "components/UI/Modal/JourneyModal.vue";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";

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
    position: POSITION.TOP_CENTER
};
const rules = {
    username: {
        required,
        minLenght: minLength(5),
        noSpecial: helpers.withMessage("Can only contains letters/numbers and -,_", (value: string) =>
            /^[a-zA-Z0-9-_]+$/.test(value)
        ),
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

function ifZero(event: InputEvent, reset: Function, validate: Function) {
    if ((event.target as HTMLTextAreaElement).value?.length == 0) {
        reset();
    } else {
        validate();
    }
}

async function submitForm() {
    v$.value.$validate();
    if (!v$.value.$error) {
        isLoading.value = true;

        const validUsername = await userStore.checkUserName(state.value.username);
        if (!validUsername) {
            toast.error("User name not available", toastOptions);
            isLoading.value = false;
            return;
        }
        const response = await userStore.register(state.value);
        if (response) {
            dismissRegisterModal();
            toast.success("Welcome " + authApp.currentUser?.displayName, toastOptions);
        } else toast.error("Could not register pleae try again later", toastOptions);
        isLoading.value = false;
    }
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
    journeyModalController.close("register");
    clearModal();
}
</script>

<style></style>