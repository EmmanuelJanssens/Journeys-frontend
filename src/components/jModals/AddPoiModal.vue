<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <JourneyModal
        name="createPoi"
        :loading="isLoading"
        :size="{
            w: 'w-1/2',
            h: 'h-auto'
        }">
        <template v-slot:header> Add a poi </template>
        <template v-slot:body>
            <div class="flex flex-col space-y-4 p-4 items-center justify-start">
                <GoogleAutoComplete
                    class="w-full"
                    v-model="state.address"
                    placeholder="Address"
                    @selected="setLocation"
                    @dirty="reset"
                    :type="['geocode']" />
                <p v-if="v$.address.$error" class="text-error">{{ v$.address.$errors[0].$message }}</p>

                <img
                    class="object-cover w-1/2 h-[200px] rounded-lg shadow-lg"
                    v-lazy="{ src: state.url, loading: '/assets/placeholder.png', error: '/assets/placeholder.png' }" />
                <JourneyInput class="w-full" v-model="state.name" placeholder="Name" />
                <p v-if="v$.name.$error" class="text-error">{{ v$.name.$errors[0].$message }}</p>

                <form @submit.prevent="addTag" class="self-start flex items-center space-x-2">
                    <JourneyInput class="w-full" v-model="state.tag" placeholder="Tag" />
                    <div
                        class="badge badge-primary cursor-pointer space-x-2"
                        v-for="tag in tags"
                        v-bind:key="tag"
                        @click="removeTag(tag)">
                        <FontAwesomeIcon :icon="faClose" />
                        <p>{{ tag }}</p>
                    </div>
                </form>
                <p v-if="v$.tag.$error" class="text-error">{{ v$.tag.$errors[0].$message }}</p>
                <JourneyButton @click="save">Confirm</JourneyButton>
            </div>
        </template>
        <template v-slot:footer>
            <div class="flex justify-end"></div>
        </template>
    </JourneyModal>
</template>
<script lang="ts" setup>
import GoogleAutoComplete from "components/jAutocomplete/GoogleAutoComplete.vue";
import JourneyButton from "components/UI/Button/JourneyButton.vue";
import JourneyInput from "components/UI/Input/JourneyInput.vue";
import JourneyModal from "components/UI/Modal/JourneyModal.vue";
import { getGeocodedData } from "google/googleGeocoder";
import { usePoiStore } from "stores/usePoiStore";
import { AddressDto } from "types/dtos";
import { ref } from "vue";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";
import { Feature } from "geojson";
import { PointOfInterest } from "types/JourneyDtos";
import { POSITION, useToast } from "vue-toastification";
import router from "router/router";
import { useJourneyStore } from "stores/useJourneyStore";
import { getRadius } from "utils/utils";
import { LngLat } from "mapbox-gl";
import { mapInstance } from "map/JourneysMap";
import { drawPoisBetween } from "map/drawOnMap";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import { maxLength, alpha, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { uuidv4 } from "@firebase/util";

//setup vuelidate
const state = ref({
    address: "",
    name: "",
    tag: "",
    url: ""
});
const rules = ref({
    tag: { maxLength: maxLength(10), alpha },
    address: { required },
    name: { required },
    url: { required }
});
const v$ = useVuelidate(rules, state);

const address = ref<AddressDto>();
const isLoading = ref(false);

function reset() {
    state.value.url = "";
}
async function setLocation(res: string) {
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

    state.value.url = `https://api.mapbox.com/styles/v1/heymanuel/clawunauz000814nsgx6d2fjx/static/geojson(${encoded})/${address.value.longitude},${address.value.latitude},15/300x200?access_token=pk.eyJ1IjoiaGV5bWFudWVsIiwiYSI6ImNsOXR1Zm5tbDFlYm8zdXRmaDRwY21qYXoifQ.3A8osuJSSk3nzULihiAOPg`;
    console.log(state.value.address);
    isLoading.value = false;
}

const poiStore = usePoiStore();
const journeyStore = useJourneyStore();
const toast = useToast();
async function save() {
    v$.value.$validate();
    if (v$.value.$error) {
        return;
    }
    isLoading.value = true;

    const poi: PointOfInterest = {
        id: uuidv4(),
        location: {
            longitude: address.value?.longitude!,
            latitude: address.value?.latitude!
        },
        name: state.value.name,
        tags: tags.value
    };

    try {
        const added = await poiStore.addPoi(poi);
        journeyModalController.close("createPoi");
        if (router.currentRoute.value.name == "edit") {
            if (added?.location.latitude) {
                const mid = journeyStore.getJourneyMidPoint(journeyStore.journey);
                const addedDist = getRadius(mid.center, new LngLat(added.location.longitude, added.location.latitude));
                if (addedDist * 2 < mid.radius) {
                    poiStore.poisBetween.push(added);
                    await drawPoisBetween();
                    mapInstance.flyTo(added.location.longitude, added.location.latitude, 16);
                }
            }
        }
        toast.success("Your poi was added!", {
            position: POSITION.BOTTOM_RIGHT
        });
    } catch (e) {
        toast.error("Could not add your poi", {
            position: POSITION.BOTTOM_RIGHT
        });
    }
    isLoading.value = false;
}

const tags = ref<string[]>([]);
function addTag() {
    if (state.value.tag.length > 0) {
        v$.value.tag.$validate();
        console.log(v$.value.$errors);
        if (!v$.value.tag.$error) {
            if (tags.value.length < 6) {
                const found = tags.value.find((val) => state.value.tag == val);
                if (!found) {
                    tags.value.push(state.value.tag);
                    console.log(tags.value);
                }
            }
            state.value.tag = "";
        }
    }
}
function removeTag(toRemove: string) {
    tags.value = tags.value.filter((tag) => tag != toRemove);
}
</script>
<style></style>
