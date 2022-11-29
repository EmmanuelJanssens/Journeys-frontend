<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <JourneyModal header="Create a new Journey" name="createJourney">
        <template v-slot:body>
            <div class="flex flex-row space-x-4 p-4">
                <GoogleAutoComplete
                    :text="validJourney.start.text"
                    placeholder="Start"
                    @selected="setStart"
                    @dirty="validJourney.start.valid = false" />
                <GoogleAutoComplete
                    :text="validJourney.start.text"
                    placeholder="End"
                    @selected="setEnd"
                    @dirty="validJourney.end.valid = false" />
            </div>
        </template>

        <template v-slot:footer>
            <div class="flex justify-end p-2" @click="gotoJourneyMap">
                <button>CREATE</button>
            </div>
        </template>
    </JourneyModal>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import JourneyModal from "components/UI/Modal/JourneyModal.vue";
import GoogleAutoComplete from "components/GoogleAutoComplete.vue";
import { getGeocodedData } from "google/googleGeocoder";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";

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
function setStart(value: string) {
    validJourney.value.start.text = value;
    validJourney.value.start.valid = true;
}
function setEnd(value: string) {
    validJourney.value.end.text = value;
    validJourney.value.end.valid = true;
}

async function gotoJourneyMap() {
    if (validJourney.value.start.valid && validJourney.value.end.valid) {
        const geocodedStart = await getGeocodedData(validJourney.value.start.text);
        const geocodedEnd = await getGeocodedData(validJourney.value.end.text);

        if (geocodedStart.error === undefined && geocodedEnd.error === undefined) {
            journeyModalController.close("createJourney", {
                data: {
                    start: geocodedStart,
                    end: geocodedEnd
                }
            });
        }
    }
}
</script>

<style scoped>
ion-button {
    z-index: 999;
}
</style>
