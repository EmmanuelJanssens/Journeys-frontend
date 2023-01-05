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
                <PoiFilterControll />

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
            <div>
                <div class="flex justify-center items-center space-x-4">
                    <!-- <button class="btn btn-primary group" @click="homeButton.handler">
                        <FontAwesomeIcon :icon="homeButton.icon" size="2x" class="group-hover:pr-2" />
                        <p
                            class="origin-left transition-all scale-x-0 hidden group:hover:block group-hover:scale-x-100 group-hover:block delay-100">
                            {{ homeButton.text }}
                        </p>
                    </button> -->
                    <button
                        class="btn btn-primary group"
                        @click="userProfileButton.handler"
                        v-if="userStore.state.isLoggedIn">
                        <FontAwesomeIcon :icon="userProfileButton.icon" size="2x" class="group-hover:pr-2" />
                        <p
                            class="origin-left transition-all scale-x-0 hidden group:hover:block group-hover:scale-x-100 group-hover:block delay-100">
                            {{ userProfileButton.text }}
                        </p>
                    </button>
                    <button
                        class="btn btn-primary group"
                        @click="logbookButton.handler"
                        v-if="userStore.state.isLoggedIn">
                        <FontAwesomeIcon :icon="logbookButton.icon" size="2x" class="group-hover:pr-2" />
                        <p
                            class="origin-left transition-all scale-x-0 hidden group:hover:block group-hover:scale-x-100 group-hover:block delay-100">
                            {{ logbookButton.text }}
                        </p>
                    </button>
                    <button
                        class="btn btn-primary group"
                        @click="addJourneyButton.handler"
                        v-if="router.currentRoute.value.name != 'edit'">
                        <FontAwesomeIcon :icon="addJourneyButton.icon" size="2x" class="group-hover:pr-2" />
                        <p
                            class="origin-left transition-all scale-x-0 hidden group:hover:block group-hover:scale-x-100 group-hover:block delay-100">
                            {{ addJourneyButton.text }}
                        </p>
                    </button>
                    <button
                        class="btn btn-primary group"
                        @click="addPoiButton.handler"
                        v-if="userStore.state.isLoggedIn">
                        <FontAwesomeIcon :icon="addPoiButton.icon" size="2x" class="group-hover:pr-2" />
                        <p
                            class="origin-left transition-all scale-x-0 hidden group:hover:block group-hover:scale-x-100 group-hover:block delay-100">
                            {{ addPoiButton.text }}
                        </p>
                    </button>
                    <button
                        ref="editBtn"
                        :class="{
                            'btn btn-secondary transition-all origin-left ': true,
                            'transform  duration-300 opacity-100 scale-x-100': route == 'view',
                            'transform  duration-300 opacity-0 scale-x-0 hidden': route != 'view'
                        }"
                        @click="editJourneyButton.handler">
                        <FontAwesomeIcon :icon="editJourneyButton.icon" size="2x" />
                    </button>

                    <button
                        :class="{
                            ' btn btn-secondary transition-all origin-left': true,
                            ' animate-pulse transform  duration-300 opacity-100 scale-x-100':
                                journeyStore.state.journeyIsEditing,
                            'transform  duration-300 opacity-0 scale-x-0 hidden': !journeyStore.state.journeyIsEditing
                        }"
                        @click="saveJourneyButton.handler">
                        <FontAwesomeIcon :icon="saveJourneyButton.icon" size="2x" />
                    </button>
                </div>
                <progress
                    v-if="
                        userStore.state.fetchingMyJourneys ||
                        poiStore.state.poisAreLoading ||
                        poiStore.state.poiIsLoading
                    "
                    class="progress progress-secondary w-full"></progress>
            </div>

            <div class="flex w-full justify-end">
                <button v-if="userStore.state.isLoggedIn" @click="logoutButton.handler" class="btn btn-primary group">
                    <FontAwesomeIcon :icon="logoutButton.icon" size="2x" class="group-hover:pr-2" />
                    <p
                        class="origin-left transition-all scale-x-0 hidden group:hover:block group-hover:scale-x-100 group-hover:block delay-100">
                        {{ logoutButton.text }}
                    </p>
                </button>
                <button v-else @click="signInButton.handler" class="btn btn-primary group">
                    <FontAwesomeIcon :icon="signInButton.icon" size="2x" class="group-hover:pr-2" />
                    <p
                        class="origin-left transition-all scale-x-0 hidden group:hover:block group-hover:scale-x-100 group-hover:block delay-100">
                        {{ signInButton.text }}
                    </p>
                </button>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed, ref, watch } from "vue";
import { mapInstance } from "map/JourneysMap";
import {
    faSignIn,
    faFilter,
    faUserCircle,
    faSave,
    faAdd,
    faBookAtlas,
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
import PoiFilterControll from "./PoiFilterControll.vue";
import { useUserStore } from "stores/useUserStore";

const route = computed(() => router.currentRoute.value.name);

const journeyStore = useJourneyStore();

const signInButton = ref({
    text: "Sign in",
    icon: faSignIn,
    slot: "signin",
    handler: async () => {
        journeyModalController.open("login");
    }
});

const logoutButton = ref({
    text: "Logout",
    icon: faSignOut,
    slot: "logout",
    handler: async () => {
        await authApp.signOut();
        router.push("/home");
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

const addJourneyButton = ref({
    text: "New Journey",
    icon: faAdd,
    handler: async () => {
        journeyModalController.open("createJourney");

        const result = await journeyModalController.didClose("createJourney");

        if (result) {
            const start = JSON.stringify(result.data.startLoc);
            const end = JSON.stringify(result.data.endLoc);

            let routeParams = `/edit?mode=new&start=${result.data.start}&startLoc=${start}&end=${result.data.end}&endLoc=${end}`;
            routeParams = encodeURI(routeParams);
            router.push(routeParams);
        }
    }
});

const editJourneyButton = ref({
    text: "Edit Journey",
    icon: faPencil,
    handler: () => {
        if (router.currentRoute.value.name == "view") {
            router.push("/edit?id=" + journeyStore.journeyToView!.id + "&mode=existing");
        }
    }
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

const userProfileButton = ref({
    text: "Profile",
    icon: faUserCircle,
    handler: async () => {
        router.push("/dashboard");
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
    // poiStore.poisBetween
    //     .filter((poi) => poi.name.toLocaleLowerCase().includes(value.toLocaleLowerCase()))
    //     .forEach((poi) => {
    //         filtered.push({
    //             value: poi.name,
    //             key: poi.id!,
    //             additional: poi.location
    //         });
    //     });
    predictions.value = filtered;
}

function flyTo(
    pred: string,
    additional: {
        longitude: number;
        latitude: number;
    }
) {
    predictions.value = [];
    mapInstance.flyTo(additional.longitude, additional.latitude, 16);
}

function clear() {
    predictions.value = [];
}

const userStore = useUserStore();
</script>
