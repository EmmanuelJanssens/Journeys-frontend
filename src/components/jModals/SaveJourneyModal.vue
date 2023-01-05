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
                    <button class="btn btn-primary grow" @click="saveMode('quick')">Quick Save</button>
                    <button class="btn btn-secondary grow" @click="saveMode('redirect')">Save</button>
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
import JourneyInput from "components/UI/Input/JourneyInput.vue";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";
import { POSITION, useToast } from "vue-toastification";
import { useJourneyStore } from "stores/useJourneyStore";
import { computed, onMounted, ref } from "vue";
import router from "router/router";
import { useUserStore } from "stores/useUserStore";
import { Journey } from "types/journey/journey";

const state = ref({
    title: ""
});
const toast = useToast();
const journeyStore = useJourneyStore();
const userStore = useUserStore();
const mode = computed(() => router.currentRoute.value.query.mode);
const isLoading = ref(false);

onMounted(() => {
    state.value.title = journeyStore.journeyToEdit.journey.title!;
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
                journey: (saved?.journey as Journey).id
            }
        });
        toast.success("Journey saved!", {
            position: POSITION.BOTTOM_RIGHT
        });
        if (mode == "redirect") {
            console.log(saved.journey);
            router.push("/logbook/journey/" + (saved?.journey as Journey).id);
        }
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
        journeyStore.journeyToEdit.journey.title = state.value.title;
        journeyStore.journeyToEdit.journey.visibility = "public";
        saved = await journeyStore.patchExperiences();
    } else if (mode.value == "new") {
        saved = await journeyStore.postJourney();
        // userStore.myJourneys?.push(saved.journey);
    }
    isLoading.value = false;
    return saved;
}
</script>
