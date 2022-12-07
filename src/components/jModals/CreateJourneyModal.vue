<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <JourneyModal
        header="Create a new Journey"
        name="createJourney"
        :loading="isLoading"
        :size="{
            w: 'w-full',
            h: 'h-[250px]'
        }">
        <template #body>
            <div
                class="flex flex-row space-x-4 p-4 justify-between items-center bg-secondary-light dark:bg-gray-800 h-full">
                <GoogleAutoComplete
                    class="grow"
                    :text="validJourney.start.text"
                    placeholder="Start"
                    @selected="setStart"
                    @dirty="validJourney.start.valid = false" />
                <GoogleAutoComplete
                    class="grow"
                    :text="validJourney.start.text"
                    placeholder="End"
                    @selected="setEnd"
                    @dirty="validJourney.end.valid = false" />
            </div>
        </template>

        <template #footer>
            <div class="flex justify-end">
                <JourneyButton type="secondary" fill="contrast" @click="gotoJourneyMap"> Create </JourneyButton>
            </div>
        </template>
    </JourneyModal>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import JourneyModal from "components/UI/Modal/JourneyModal.vue";
import GoogleAutoComplete from "components/jAutocomplete/GoogleAutoComplete.vue";
import { getGeocodedData } from "google/googleGeocoder";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";
import JourneyButton from "components/UI/Button/JourneyButton.vue";

const validJourney = ref({
    start: {
        text: "",
        valid: false
    },
    end: {
        text: "",
        valid: false
    }
});

const isLoading = ref(false);
function setStart(value: string) {
    isLoading.value = false;
    validJourney.value.start.text = value;
    validJourney.value.start.valid = true;
}
function setEnd(value: string) {
    isLoading.value = false;
    validJourney.value.end.text = value;
    validJourney.value.end.valid = true;
}

async function gotoJourneyMap() {
    if (validJourney.value.start.valid && validJourney.value.end.valid) {
        const geocodedStart = await getGeocodedData(validJourney.value.start.text);
        const geocodedEnd = await getGeocodedData(validJourney.value.end.text);
        const start = {
            latitude: geocodedStart.latitude,
            longitude: geocodedStart.longitude
        };
        const end = {
            latitude: geocodedEnd.latitude,
            longitude: geocodedEnd.longitude
        };
        if (geocodedStart.error === undefined && geocodedEnd.error === undefined) {
            journeyModalController.close("createJourney", {
                data: {
                    startLoc: start,
                    endLoc: end,
                    start: geocodedStart.address,
                    end: geocodedEnd.address
                }
            });
        }
    }
}
</script>

<style scoped></style>
