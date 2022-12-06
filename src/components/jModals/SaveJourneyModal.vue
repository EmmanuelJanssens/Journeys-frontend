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
                    <JourneyButton class="grow" type="primary" fill="fill" @click="quickSave">
                        Quick Save
                    </JourneyButton>
                    <JourneyButton class="grow" type="secondary" fill="fill" @click="redirectionSave">
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

async function quickSave() {
    try {
        await save();
        journeyModalController.close("saveJourney");
        toast.success("Journey saved!", {
            position: POSITION.BOTTOM_RIGHT
        });
    } catch (e) {
        toast.error("Could not save your journey", {
            position: POSITION.BOTTOM_RIGHT
        });
    }
    isLoading.value = false;
}

async function redirectionSave() {
    try {
        const saved = await save();
        journeyModalController.close("saveJourney", {
            data: {
                journey: saved?.id
            }
        });
        toast.success("Journey saved!", {
            position: POSITION.BOTTOM_RIGHT
        });
        router.push("/logbook/journey/" + saved!.id);
    } catch (e) {
        toast.error("Could not save your journey", {
            position: POSITION.BOTTOM_RIGHT
        });
    }
    isLoading.value = false;
}
async function save() {
    isLoading.value = true;
    try {
        let saved;
        if (mode.value == "existing") {
            journeyStore.journey.title = state.value.title;
            journeyStore.journey.visibility = "public";
            saved = await journeyStore.updateExperiencesFromJourney();
            isLoading.value = false;

            Promise.all(saved.uploadTask)
                .then((tast) => {
                    if (tast != undefined && tast.length > 0) {
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

            return saved.journey;
        } else if (mode.value == "new") {
            saved = await journeyStore.saveJourneyWithExperiences(state.value.title);
            userStore.myJourneys?.push(saved.journey);
            Promise.all(saved.uploadTask)
                .then((tast) => {
                    if (tast.length > 0) {
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

            return saved.journey;
        } else {
            throw Error("error");
        }
    } catch (e) {
        throw Error(e);
    }
}
</script>
