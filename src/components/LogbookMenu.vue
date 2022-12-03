<template>
    <div class="absolute top-0 w-full">
        <div class="flex space-x-4 w-full justify-center justify-items-center p-4">
            <div
                :class="{
                    'w-full flex space-x-4 ': true,
                    ' transition-all': true,
                    'transform translate-y-0 duration-200 opacity-100 scale-y-100': route == 'edit',
                    'transform -translate-y-5 duration-200 opacity-0  scale-y-0': route != 'edit'
                }">
                <div class="flex justify-start">
                    <JourneyButton><FontAwesomeIcon :icon="filterButton.icon" size="2x" /></JourneyButton>
                </div>
                <AutoComplete
                    :icon="faLocation"
                    class="w-full"
                    v-model="search"
                    :predictions="predictions"
                    :debounce="100"
                    @selected="flyTo"
                    @complete="filterPois"
                    @focus-out="clear" />
            </div>
            <div class="flex justify-center items-center space-x-4">
                <button class="btn btn-primary group" @click="homeButton.handler">
                    <FontAwesomeIcon :icon="homeButton.icon" size="2x" class="group-hover:pr-2" />
                    <p
                        class="origin-left transition-all scale-x-0 hidden group:hover:block group-hover:scale-x-100 group-hover:block delay-100">
                        {{ homeButton.text }}
                    </p>
                </button>

                <button class="btn btn-primary group" @click="logbookButton.handler">
                    <FontAwesomeIcon :icon="logbookButton.icon" size="2x" class="group-hover:pr-2" />
                    <p
                        class="origin-left transition-all scale-x-0 hidden group:hover:block group-hover:scale-x-100 group-hover:block delay-100">
                        {{ logbookButton.text }}
                    </p>
                </button>
                <button class="btn btn-primary group" @click="addJourneyButton.handler">
                    <FontAwesomeIcon :icon="addJourneyButton.icon" size="2x" class="group-hover:pr-2" />
                    <p
                        class="origin-left transition-all scale-x-0 hidden group:hover:block group-hover:scale-x-100 group-hover:block delay-100">
                        {{ addJourneyButton.text }}
                    </p>
                </button>
                <button class="btn btn-primary group" @click="addPoiButton.handler">
                    <FontAwesomeIcon :icon="addPoiButton.icon" size="2x" class="group-hover:pr-2" />
                    <p
                        class="origin-left transition-all scale-x-0 hidden group:hover:block group-hover:scale-x-100 group-hover:block delay-100">
                        {{ addPoiButton.text }}
                    </p>
                </button>
                <JourneyButton
                    ref="editBtn"
                    :class="{
                        ' transition-all origin-left ': true,
                        'transform  duration-300 opacity-100 scale-x-100': route == 'view',
                        'transform  duration-300 opacity-0 scale-x-0 hidden': route != 'view'
                    }"
                    type="secondary"
                    @click="editJourneyButton.handler"
                    ><FontAwesomeIcon :icon="editJourneyButton.icon" size="2x"
                /></JourneyButton>

                <JourneyButton
                    :class="{
                        ' transition-all origin-left': true,
                        ' animate-pulse transform  duration-300 opacity-100 scale-x-100': journeyStore.isDirty,
                        'transform  duration-300 opacity-0 scale-x-0 hidden': !journeyStore.isDirty
                    }"
                    type="secondary"
                    @click="saveJourneyButton.handler"
                    ><FontAwesomeIcon :icon="saveJourneyButton.icon" size="2x"
                /></JourneyButton>
            </div>
            <div class="flex w-full justify-end">
                <JourneyButton @click="logoutButton.handler"
                    ><FontAwesomeIcon :icon="logoutButton.icon" size="2x"
                /></JourneyButton>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed, ref } from "vue";
import { mapInstance } from "map/JourneysMap";
import JourneyButton from "./UI/Button/JourneyButton.vue";
import {
    faFilter,
    faSave,
    faAdd,
    faBookAtlas,
    faCircleUser,
    faLocationDot,
    faHome,
    faSignOut,
    IconDefinition,
    faPencil,
    faLocation
} from "@fortawesome/free-solid-svg-icons";
import { authApp } from "google/firebase";
import router from "router/router";
import { journeyModalController } from "./UI/Modal/JourneyModalController";
import { useJourneyStore } from "stores/useJourneyStore";
import AutoComplete from "./jAutocomplete/AutoComplete.vue";
import { usePoiStore } from "stores/usePoiStore";
import { Locality } from "types/JourneyDtos";
import { useElementVisibility, useMouseInElement } from "@vueuse/core";
import { useVisibility } from "composables/style";

const route = computed(() => router.currentRoute.value.name);

const journeyStore = useJourneyStore();

const logoutButton = ref({
    text: "Logout",
    icon: faSignOut,
    slot: "logout",
    handler: async () => {
        await authApp.signOut();
        router.push("/home");
    }
});
const viewProfileButton = ref({
    text: "Profile",
    icon: faCircleUser as IconDefinition,
    handler: () => {
        //
    }
});

const filterButton = ref({
    text: "Filter",
    icon: faFilter,
    handler: () => {
        //
    }
});
const homeButton = ref({
    text: "Home",
    icon: faHome,
    handler: () => {
        router.push("/home");
    }
});
const logbookButton = ref({
    text: "Logbook",
    icon: faBookAtlas as IconDefinition,
    handler: async () => {
        if (router.currentRoute.value.name != "logbook") {
            router.push("/logbook");
        }
    }
});
const addPoiButton = ref({
    text: "New POI",
    icon: faLocationDot,
    handler: () => {
        journeyModalController.open("createPoi");
    }
});

const addVisible = computed(() => {
    return router.currentRoute.value.name == "logbook" || router.currentRoute.value.name == "view";
});
const addJourneyButton = ref({
    text: "New Journey",
    icon: faAdd,
    handler: async () => {
        journeyModalController.open("createJourney");

        const result = await journeyModalController.didClose("createJourney");

        if (result) {
            journeyStore.journey = {
                start: result.data.start,
                end: result.data.end,
                title: result.data.title
            };
            journeyStore.journey.experiences = [];
            router.push("/edit?mode=new");
        }
    }
});
const editVisible = computed(() => {
    return router.currentRoute.value.name != "edit" && router.currentRoute.value.name == "view";
});
const editJourneyButton = ref({
    text: "Edit Journey",
    icon: faPencil,
    handler: () => {
        if (router.currentRoute.value.name == "view") {
            router.push("/edit?id=" + journeyStore.journey.id + "&mode=existing");
        }
    }
});
const saveVisible = computed(() => {
    return router.currentRoute.value.name == "edit";
});
const saveJourneyButton = ref({
    text: "Save Journey",
    icon: faSave,
    handler: async () => {
        if (router.currentRoute.value.name == "edit") {
            journeyModalController.open("saveJourney");
        }
    }
});

const predictions = ref<
    {
        value: string;
        key: string | number;
    }[]
>([]);
const search = ref("");

const poiStore = usePoiStore();
function filterPois(value: string) {
    const filtered: {
        value: string;
        key: string | number | any;
        additional?: any;
    }[] = [];
    poiStore.poisBetween
        .filter((poi) => poi.name.toLocaleLowerCase().includes(value.toLocaleLowerCase()))
        .forEach((poi) => {
            filtered.push({
                value: poi.name,
                key: poi.id!,
                additional: poi.location
            });
        });
    predictions.value = filtered;
}

function flyTo(pred: string, additional: Locality) {
    predictions.value = [];
    mapInstance.flyTo(additional.longitude, additional.latitude, 16);
}

function clear() {
    predictions.value = [];
}
</script>
