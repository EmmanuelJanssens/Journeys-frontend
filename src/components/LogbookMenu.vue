<template>
    <div
        ref="menu"
        class="flex flex-col bg-primary-light dark:bg-gray-800 w-16 h-full transition-all shadow-inner"
        @transitionend="resize">
        <button
            :class="{
                'w-full p-2 text-primary-darker dark:text-primary-main': true,
                'text-left': isOpen
            }"
            @click="toggle">
            <FontAwesomeIcon v-if="!isOpen" :size="'2x'" :icon="faBars" /><FontAwesomeIcon
                v-if="isOpen"
                :size="'2x'"
                :icon="faXmark" />
        </button>
        <img
            :class="{
                'rounded-full p-1': !isOpen,
                'rounded-full p-4': isOpen
            }"
            src="/assets/placeholder.png" />

        <div class="flex flex-col whitespace-pre-wrap text-primary-darker h-full">
            <JourneyItem :button="homeButton" :collapsed="!isOpen" />
            <JourneyItem :button="viewProfileButton" :collapsed="!isOpen" />
            <JourneyItem :button="logbookButton" :collapsed="!isOpen" />
            <JourneyItem :button="addPoiButton" :collapsed="!isOpen" />
            <JourneyItem :button="addJourneyButton" :collapsed="!isOpen" :custom="true" :visible="addVisible" />
            <JourneyItem :button="editJourneyButton" :collapsed="!isOpen" :visible="editVisible" />
            <JourneyItem :button="saveJourneyButton" :collapsed="!isOpen" :visible="saveVisible" />
            <JourneyItem class="last:mt-auto" :button="logoutButton" :collapsed="!isOpen" :visible="true" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed, ref } from "vue";
import { mapInstance } from "map/JourneysMap";
import {
    faBars,
    faXmark,
    faSave,
    faAdd,
    faBookAtlas,
    faCircleUser,
    faLocationDot,
    faHome,
    faSignOut,
    IconDefinition,
    faPencil
} from "@fortawesome/free-solid-svg-icons";
import { authApp } from "google/firebase";
import router from "router/router";
import { journeyModalController } from "./UI/Modal/JourneyModalController";
import { useJourneyStore } from "stores/useJourneyStore";
import JourneyItem from "./UI/Item/JourneyItem.vue";

const menu = ref();
const isOpen = ref(false);

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
    text: "View my Profile",
    icon: faCircleUser as IconDefinition,
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
    text: "Add a Point of interest",
    icon: faLocationDot,
    handler: () => {
        journeyModalController.open("createPoi");
    }
});

const addVisible = computed(() => {
    return router.currentRoute.value.name == "logbook" || router.currentRoute.value.name == "view";
});
const addJourneyButton = ref({
    text: "Add a journey",
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
async function resize() {
    (await mapInstance.getMap()).resize();
}
async function toggle() {
    const el = menu.value as HTMLElement;
    if (el.classList.contains("w-16")) {
        el.classList.add("w-96");
        el.classList.remove("w-16");
    } else if (el.classList.contains("w-96")) {
        el.classList.remove("w-96");
        el.classList.add("w-16");
    }
    isOpen.value = !isOpen.value;
}
</script>
