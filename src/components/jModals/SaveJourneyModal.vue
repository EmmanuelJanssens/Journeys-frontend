<template>
    <JourneyModal name="saveJourney">
        <template v-slot:header>
            <h1 class="text-high-contrast-text">Save Journey</h1>
        </template>
        <template v-slot:body>
            <div class="flex flex-col p-4 bg-secondary-light dark:bg-secondary-dark">
                <JourneyInput placeholder="Journey title" v-model="state.title" />
            </div>
        </template>
        <template v-slot:footer>
            <div class="flex justify-end">
                <JourneyButton type="secondary" fill="contrast" @click="save">Save</JourneyButton>
            </div>
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
onMounted(() => {
    console.log(router.currentRoute.value);
    if (mode.value == "new") {
        state.value.title =
            journeyStore.editJourney.journey?.start?.address + " - " + journeyStore.editJourney.journey?.end?.address;
    } else if (mode.value == "existing") {
        state.value.title = journeyStore.editJourney.journey?.title!;
    }
});
async function save() {
    try {
        let saved;
        if (mode.value == "existing") {
            journeyStore.editJourney.journey!.title = state.value.title;
            saved = await journeyStore.updateJourney("deep");
        } else if (mode.value == "new") saved = await journeyStore.saveJourney(state.value.title);
        journeyModalController.close("saveJourney");
        toast.success("Journey saved!", {
            position: POSITION.TOP_CENTER
        });
        if (!saved) throw new Error("Could not save");
        router.push("/logbook/journey/" + saved?.id);
    } catch (e) {
        toast.error("Could not savce your journey", {
            position: POSITION.TOP_CENTER
        });
    }
}
</script>
