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
                    :text="input"
                    placeholder="Address"
                    @selected="set"
                    :type="['geocode']" />
                <img
                    class="object-cover w-1/2 h-[200px] rounded-lg shadow-lg"
                    v-lazy="{ src: url, loading: '/assets/placeholder.png', error: '/assets/placeholder.png' }" />
                <JourneyInput class="w-full" v-model="poiName" placeholder="Name" />

                <form @submit.prevent="addTag" class="self-start flex items-center space-x-2">
                    <JourneyInput class="w-full" v-model="poiTag" placeholder="Tag" />
                    <div
                        class="badge badge-primary cursor-pointer space-x-2"
                        v-for="tag in tags"
                        v-bind:key="tag"
                        @click="removeTag(tag)">
                        <FontAwesomeIcon :icon="faClose" />
                        <p>{{ tag }}</p>
                    </div>
                </form>
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
import { map } from "@firebase/util";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
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
const journeyStore = useJourneyStore();
const toast = useToast();
async function save() {
    isLoading.value = true;

    const poi: PointOfInterest = {
        location: {
            longitude: address.value?.longitude!,
            latitude: address.value?.latitude!
        },
        name: poiName.value,
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

const poiTag = ref("");
const tags = ref<string[]>([]);

function addTag() {
    if (tags.value.length < 6) {
        const found = tags.value.find((val) => poiTag.value == val);
        if (!found) {
            tags.value.push(poiTag.value);
            console.log(tags.value);
        }
    }
    poiTag.value = "";
}
function removeTag(toRemove: string) {
    tags.value = tags.value.filter((tag) => tag != toRemove);
}
</script>
<style></style>
