<template>
    <JourneyModal
        name="saveJourney"
        :loading="isLoading"
        :size="{
            w: 'w-1/3',
            h: 'h-1/5'
        }">
        <template #header>
            <h1 class="text-high-contrast-text">Save Journey</h1>
        </template>
        <template #body>
            <div class="flex flex-col p-4 justify-around h-full bg-secondary-light dark:bg-gray-800 space-y-4">
                <JourneyInput v-model="state.title" placeholder="Journey title" />
                <div class="flex space-x-4 justify-between">
                    <JourneyButton class="grow" type="primary" fill="fill" @click="saveMode('quick')">
                        Quick Save
                    </JourneyButton>
                    <JourneyButton class="grow" type="secondary" fill="fill" @click="saveMode('redirect')">
                        Save
                    </JourneyButton>
                </div>
            </div>
        </template>
        <template #footer>
            <span />
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
import { useUserStore } from "stores/useUserStore";

const state = ref({
    title: ""
});
const toast = useToast();
const journeyStore = useJourneyStore();
const userStore = useUserStore();
const mode = computed(() => router.currentRoute.value.query.mode);
const isLoading = ref(false);

onMounted(() => {
    state.value.title = journeyStore.journey.title!;
});

async function saveMode(mode: "quick" | "redirect") {
    if (!userStore.state.isLoggedIn) {
        journeyModalController.close("saveJourney");
        journeyModalController.open("login");
        return;
    }
    const saved = await save();
    if (saved) {
        journeyModalController.close("saveJourney", {
            data: {
                journey: saved?.id
            }
        });
        toast.success("Journey saved!", {
            position: POSITION.BOTTOM_RIGHT
        });
        if (mode == "redirect") router.push("/logbook/journey/" + saved!.id);
    } else {
        toast.error("Could not save your journey", {
            position: POSITION.BOTTOM_RIGHT
        });
    }
    isLoading.value = false;
}

async function save() {
    isLoading.value = true;
    let saved;
    if (mode.value == "existing") {
        journeyStore.journey.title = state.value.title;
        journeyStore.journey.visibility = "public";
        saved = await journeyStore.updateExperiencesFromJourney();
    } else if (mode.value == "new") {
        saved = await journeyStore.saveJourneyWithExperiences(state.value.title);
        userStore.myJourneys?.journeys.push(saved.journey);
    }
    if (saved) {
        Promise.all(saved.uploadTask)
            .then((tasks) => {
                if (tasks != undefined && tasks.length > 0) {
                    toast.info("Your images have been uploaded you can now see them", {
                        position: POSITION.BOTTOM_RIGHT
                    });
                }
            })
            .catch(() => {
                toast.error("Could not upload your images", {
                    position: POSITION.BOTTOM_RIGHT
                });
            });
    }
    isLoading.value = false;
    return saved?.journey;
}
</script>
