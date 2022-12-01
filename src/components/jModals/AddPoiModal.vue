<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <JourneyModal
        name="createPoi"
        :loading="isLoading"
        :size="{
            w: 'w-1/2',
            h: 'h-1/3'
        }">
        <template v-slot:header> Add a poi </template>
        <template v-slot:body>
            <div class="flex flex-col space-y-4 p-4 items-center">
                <GoogleAutoComplete
                    class="w-full"
                    :text="input"
                    placeholder="Address"
                    @selected="set"
                    :type="['geocode']" />
                <img
                    class="object-scale-down w-1/2 h-[200px] bg-no-repeat"
                    v-lazy="{ src: url, loading: '/assets/placeholder.png', error: '/assets/placeholder.png' }" />
                <JourneyInput class="w-full" v-model="poiName" placeholder="give it a name" />
                <JourneyButton @click="save">Confirm</JourneyButton>
            </div>
        </template>
        <template v-slot:footer>
            <div class="flex justify-end"></div>
        </template>
    </JourneyModal>
</template>
<script lang="ts" setup>
import GoogleAutoComplete from "components/JAutocomplete/GoogleAutoComplete.vue";
import JourneyButton from "components/UI/Button/JourneyButton.vue";
import JourneyInput from "components/UI/Input/JourneyInput.vue";
import JourneyModal from "components/UI/Modal/JourneyModal.vue";
import { getGeocodedData } from "google/googleGeocoder";
import { usePoiStore } from "stores/usePoiStore";
import { AddressDto, PoiDto } from "types/dtos";
import { ref } from "vue";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";
import { Feature } from "geojson";
const input = ref("");
const url = ref("");
const poiName = ref("");
const address = ref<AddressDto>();

const isLoading = ref(false);

async function set(res: string) {
    isLoading.value = true;
    address.value = await getGeocodedData(res);
    const coords = [address.value.longitude, address.value.latitude];
    const marker: Feature = {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: coords
        },
        properties: {}
    };

    const encoded = encodeURIComponent(JSON.stringify(marker));

    url.value = `https://api.mapbox.com/styles/v1/heymanuel/clawunauz000814nsgx6d2fjx/static/geojson(${encoded})/${address.value.longitude},${address.value.latitude},15/300x200?access_token=pk.eyJ1IjoiaGV5bWFudWVsIiwiYSI6ImNsOXR1Zm5tbDFlYm8zdXRmaDRwY21qYXoifQ.3A8osuJSSk3nzULihiAOPg`;

    isLoading.value = false;
}

const poiStore = usePoiStore();
async function save() {
    isLoading.value = true;

    const poi: PoiDto = {
        location: {
            longitude: address.value?.longitude!,
            latitude: address.value?.latitude!
        },
        name: poiName.value
    };

    try {
        await poiStore.addPoi(poi);
        journeyModalController.close("createPoi");
    } catch (e) {
        //
    }
    isLoading.value = false;
}
</script>
<style></style>
