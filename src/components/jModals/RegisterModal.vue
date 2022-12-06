<template>
    <journey-modal
        header="Hello"
        name="register"
        :loading="isLoading"
        :size="{
            w: 'max-w-4xl'
        }"
        :on-outside-clicked="dismissRegisterModal"
        :on-close="dismissRegisterModal">
        <template #header>
            <h1 class="text-btn-contrast-text">Register</h1>
        </template>

        <template #body>
            <div class="bg-secondary-light dark:bg-gray-800 p-8 h-full">
                <div class="grid grid-cols-2 gap-4">
                    <JourneyInput
                        v-model="state.firstName"
                        placeholder="First Name"
                        :error="v$.firstName.$error ? v$.firstName.$errors[0].$message as string : ''"
                        @keydown="
                            ifZero(
                                $event,
                                () => v$.firstName.$reset(),
                                () => v$.firstName.$validate()
                            )
                        " />
                    <JourneyInput
                        v-model="state.lastName"
                        placeholder="Last Name"
                        :error="v$.lastName.$error ? v$.lastName.$errors[0].$message as string : ''"
                        @keydown="
                            ifZero(
                                $event,
                                () => v$.lastName.$reset(),
                                () => v$.lastName.$validate()
                            )
                        " />
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
            </div>
        </template>
        <template #footer>
            <div class="flex justify-end">
                <JourneyButton type="secondary" fill="contrast" @click="submitForm"> Register </JourneyButton>
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
import JourneyButton from "components/UI/Button/JourneyButton.vue";

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
        minLenght: minLength(5),
        noSpecial: helpers.withMessage("Can only contains letters/numbers and -,_", (value: string) =>
            /^[a-zA-Z0-9-_]+$/.test(value)
        ),
        unique: helpers.withMessage("Not available", () => true)
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
