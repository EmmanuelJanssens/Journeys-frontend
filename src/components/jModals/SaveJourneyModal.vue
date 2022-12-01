<template>
    <JourneyModal name="saveJourney" :loading="isLoading">
        <template v-slot:header>
            <h1 class="text-high-contrast-text">Save Journey</h1>
        </template>
        <template v-slot:body>
            <div class="flex flex-col p-4 bg-secondary-light dark:bg-secondary-dark space-y-4">
                <JourneyInput placeholder="Journey title" v-model="state.title" />
                <div class="flex space-x-4 justify-between">
                    <JourneyButton class="grow" type="primary" fill="fill" @click="quickSave">Quick Save</JourneyButton>
                    <JourneyButton class="grow" type="secondary" fill="fill" @click="redirectionSave"
                        >Save</JourneyButton
                    >
                </div>
            </div>
        </template>
        <template v-slot:footer>
            <span></span>
        </template>
    </JourneyModal>
</template>
<script lang="ts" setup>
import JourneyModal from "components/UI/Modal/JourneyModal.vue";
import JourneyButton from "components/UI/Button/JourneyButton.vue";
import JourneyInput from "components/UI/Input/JourneyInput.vue";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";
import { POSITION, useToast } from "vue-toastification";
import { useJourneyStore } from "stores/useJourneyStore";
import { computed, onMounted, ref } from "vue";
import router from "router/router";

const state = ref({
    title: ""
});
const toast = useToast();
const journeyStore = useJourneyStore();
const mode = computed(() => router.currentRoute.value.query.mode);
const isLoading = ref(false);
onMounted(() => {
    console.log(router.currentRoute.value);
    if (mode.value == "new") {
        state.value.title = journeyStore.editJourney.start?.address + " - " + journeyStore.editJourney.end?.address;
    } else if (mode.value == "existing") {
        state.value.title = journeyStore.editJourney.title!;
    }
});

async function quickSave() {
    try {
        const saved = await save();
        journeyModalController.close("saveJourney");
    } catch (e) {
        console.log(e);
        toast.error("Could not savce your journey", {
            position: POSITION.TOP_CENTER
        });
    }
}

async function redirectionSave() {
    try {
        const saved = await save();
        journeyModalController.close("saveJourney", {
            data: {
                journey: saved?.id
            }
        });
        router.push("/logbook/journey/" + saved!.id);
    } catch (e) {
        console.log(e);

        toast.error("Could not savce your journey", {
            position: POSITION.TOP_CENTER
        });
    }
}
async function save() {
    isLoading.value = true;
    try {
        let saved;
        if (mode.value == "existing") {
            journeyStore.editJourney.title = state.value.title;
            saved = await journeyStore.updateJourneyExperiences();
            toast.success("Journey saved!", {
                position: POSITION.TOP_CENTER
            });
            isLoading.value = false;

            return saved;
        } else if (mode.value == "new") saved = await journeyStore.saveJourney(state.value.title);
    } catch (e) {
        throw Error(e);
    }
    isLoading.value = false;
}
</script>
