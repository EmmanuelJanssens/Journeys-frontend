<!-- eslint-disable vue/valid-v-for -->
<template>
    <div class="absolute top-0 right-0 left-0 w-screen h-screen">
        <!-- <TheJourneysHeader class="z-50" /> -->
        <div class="flex h-full w-full">
            <ThePoiListSidebar
                v-if="poiStore.poisBetween && poiStore.poisBetween.length > 0"
                @poi-item-clicked="panTo"
                :poiList="poiStore.poisBetween"
                class="w-[400px] h-full" />

            <div class="w-full h-full">
                <JourneyMap
                    class="bg-secondary-light w-full h-full"
                    :mode="mode"
                    @loaded="fetchJourneys"
                    @marker-dragged="onMarkerDragend"
                    @poi-clicked="onPoiClicked"
                    @ready="setLoading(false)">
                </JourneyMap>
            </div>
            <LogbookMenu :buttons="menuButtons" />
            <TheJourneysSlider
                class="absolute w-full bottom-10 p-4"
                v-if="mode == modes.logbook"
                @header-clicked="showExperiences" />
        </div>
    </div>
</template>
<script lang="ts">
export default {
    name: "LogbookPage"
};
</script>
<script lang="ts" setup>
// Import Swiper and modules
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import PoiCard from "components/Cards/PoiCard.vue";
import { defineAsyncComponent, onActivated, onMounted, ref } from "vue";

import { useUserStore } from "stores/useUserStore";
import { usePoiStore } from "stores/usePoiStore";
import { useJourneyStore } from "stores/useJourneyStore";

import { AddressDto, getAddressCoordinates, PoiDto } from "types/dtos";

import { reverseGeocode, getLocalityAndCountry, getGeocodedData } from "google/googleGeocoder";
import { authApp } from "google/firebase";

import { MapMouseEvent, LngLat } from "mapbox-gl";
import { getMidPoint, getRadius } from "utils/utils";

import JourneyMap from "components/TheJourneyMap.vue";

import LogbookMenu from "components/LogbookMenu.vue";
import MapJourneySidebar from "components/TheJourneyEditSidebar.vue";
import ThePoiListSidebar from "components/ThePoiListSidebar.vue";
import TheJourneysSlider from "components/TheJourneysSlider.vue";
import TheJourneyExperienceList from "components/TheJourneyExperienceList.vue";
import ThePoiSearchbar from "components/ThePoiSearchbar.vue";

import { mapInstance } from "map/JourneysMap";

import { journeyModalController } from "components/Modal/JourneyModalController";
import {
    faAdd,
    faBookAtlas,
    faCircleUser,
    faEarth,
    faLocationDot,
    faHome,
    faPencil,
    IconDefinition
} from "@fortawesome/free-solid-svg-icons";
import router from "router/router";

const menuButtons = ref([
    {
        text: "View my Profile",
        icon: faCircleUser as IconDefinition,
        handler: () => {
            console.log("View my Profile");
        }
    },
    {
        text: "Create a Journey",
        icon: faBookAtlas as IconDefinition,
        handler: async () => {
            journeyModalController.open("createJourney");

            const result = await journeyModalController.didClose("createJourney");

            if (result) {
                mode.value = modes.edition;
                journeyStore.editJourney.journey = {};
                journeyStore.editJourney.journey!.experiencesConnection = { edges: [] };
                fetchPois(result.data);
            }
        }
    },
    {
        text: "Add an Experience",
        icon: faAdd as IconDefinition,
        handler: () => {
            console.log("Add an Experience");
        }
    },
    {
        text: "Add a Point of interest",
        icon: faLocationDot as IconDefinition,
        handler: () => {
            console.log("Add a Point of interest");
        }
    },
    {
        text: "Explore arround Me",
        icon: faEarth as IconDefinition,
        handler: () => {
            console.log("Explore arround Me");
        }
    },
    {
        text: "Home",
        icon: faHome as IconDefinition,
        handler: () => {
            router.push("home");
        }
    }
]);
const modes = {
    logbook: "logbook",
    exploration: "exploration",
    edition: "edition",
    viewJourney: "viewJourney",
    editJourney: "editJourney"
};

const isLoading = ref(true);

const userStore = useUserStore();
const journeyStore = useJourneyStore();
const poiStore = usePoiStore();

const mode = ref(modes.logbook);

const fabList = ref();
function toggleFab() {
    const el = fabList.value as HTMLElement;
    if (el.classList.contains("invisible")) {
        el.classList.remove("invisible");
        el.classList.add("visible");
    } else if (el.classList.contains("visible")) {
        el.classList.remove("visible");
        el.classList.add("invisible");
    }
}
authApp.onAuthStateChanged((user) => {
    if (user) {
        if (mode.value == modes.logbook) fetchJourneys();
    }
});

// onIonViewDidEnter(() => {
//     if (!userStore.isLoggedIn) {
//         openJourneyCreationModal();
//     }
// });

onMounted(async () => {
    if (userStore.isLoggedIn) await fetchJourneys();

    journeyModalController.create(
        "editJourney",
        defineAsyncComponent({
            loader: () => import("components/Modals/EditJourneyModal.vue")
        })
    );

    journeyModalController.create(
        "createJourney",
        defineAsyncComponent({
            loader: () => import("components/Modals/CreateJourneyModal.vue")
        })
    );
});
async function geocode(start: string, end: string) {
    const geocodedStart = await getGeocodedData(start);
    const geocodedEnd = await getGeocodedData(end);

    if (geocodedStart.error === undefined && geocodedEnd.error === undefined) {
        return {
            start: geocodedStart,
            end: geocodedEnd
        };
    } else {
        return undefined;
    }
}

onActivated(async () => {
    const data = journeyStore.getInitial();
    if (data) {
        const addresses = await geocode(data.start, data.end);
        if (addresses) {
            mode.value = modes.edition;
            journeyStore.editJourney.journey = {};
            journeyStore.editJourney.journey!.experiencesConnection = { edges: [] };
            fetchPois(addresses);
        }
    }
});
function SwitchMode(newMode: string) {
    mode.value = newMode;
}
async function panTo(poi: PoiDto) {
    mapInstance.getMap()?.flyTo({
        center: [poi.location!.longitude, poi.location!.latitude],
        zoom: 20
    });
}

function setLoading(loading: boolean) {
    isLoading.value = loading;
}

async function fetchJourneys() {
    setLoading(true);
    mode.value = modes.logbook;
    if (userStore.isLoggedIn) {
        await userStore.fetchMyJourneys();
    } else {
        journeyStore.clear();
        poiStore.clear();
        setLoading(false);
    }
}

const filteredPois = ref<PoiDto[]>();

async function editJourney() {
    mode.value = modes.editJourney;
    //TODO check if alright
    journeyStore.editJourney.journey! = JSON.parse(JSON.stringify(journeyStore.viewJourney));
    await fetchPois({
        start: {
            placeId: journeyStore.editJourney.journey?.start?.placeId!,
            address: journeyStore.editJourney.journey?.start?.address!,
            longitude: journeyStore.editJourney.journey?.start?.longitude!,
            latitude: journeyStore.editJourney.journey?.start?.latitude!
        },
        end: {
            placeId: journeyStore.editJourney.journey?.end?.placeId!,
            address: journeyStore.editJourney.journey?.end?.address!,
            longitude: journeyStore.editJourney.journey?.end?.longitude!,
            latitude: journeyStore.editJourney.journey?.end?.latitude!
        }
    });
}

async function fetchPois(data: { start: AddressDto; end: AddressDto }) {
    setLoading(true);
    console.log(data);
    const radius = getRadius(getAddressCoordinates(data.start), getAddressCoordinates(data.end));
    const mid = getMidPoint(getAddressCoordinates(data.start), getAddressCoordinates(data.end));
    journeyStore.setJourneyStartEnd(data.start, data.end);
    await poiStore.searchBetween(mid.lat, mid.lng, radius);
    filteredPois.value = poiStore.poisBetween;
}

async function onMarkerDragend(pos: LngLat, marker: string) {
    setLoading(true);
    const response = await reverseGeocode(pos.lat, pos.lng);
    const result = getLocalityAndCountry(response!);
    if (result.country != undefined && result.locality != undefined) {
        if (marker == "journey_start") {
            journeyStore.editJourney.journey!.start = {
                placeId: result.placeId,
                address: result.locality + ", " + result.country,
                latitude: pos.lat,
                longitude: pos.lng
            };
        } else if (marker == "journey_end") {
            journeyStore.editJourney.journey!.end = {
                placeId: result.placeId,
                address: result.locality + ", " + result.country,
                latitude: pos.lat,
                longitude: pos.lng
            };
        }
    }
    await fetchPois({
        start: journeyStore.editJourney.journey?.start!,
        end: journeyStore.editJourney.journey?.end!
    });
}

async function onPoiClicked(poi: PoiDto, e: MapMouseEvent) {
    // const popover = await popoverController.create({
    //     component: PoiCard,
    //     componentProps: { poi: poi },
    //     event: e.originalEvent,
    //     size: "auto",
    //     reference: "event",
    //     side: "top",
    //     alignment: "center"
    // });
    // await popover.present();
}

async function showExperiences(id: string) {
    setLoading(true);
    mode.value = modes.viewJourney;
    await journeyStore.getJourney(id);
}

async function openJourneyCreationModal() {
    // const modal = await modalController.create({
    //     component: CreateJourneyModal
    // });
    // modal.present();
    // const result = await modal.onDidDismiss();
    // if (result.role == "create") {
    //     mode.value = modes.edition;
    //     journeyStore.editJourney.journey = {};
    //     journeyStore.editJourney.journey!.experiencesConnection = { edges: [] };
    //     fetchPois(result.data);
    // }
}
async function openAddPoiAlert() {
    // const alert = await alertController.create({
    //     header: "Right click on the map to add a Poi",
    //     buttons: [
    //         "cancel",
    //         {
    //             text: "Ok",
    //             handler: async () => {
    //                 alertController.dismiss(null, "ok");
    //             }
    //         }
    //     ]
    // });
    // await alert.present();
    // const { role } = await alert.onDidDismiss();
    // if (role != "ok") {
    //     SwitchMode(modes.editJourney);
    // }
}

async function showAlertIfNotLoggedin() {
    // const alert = await alertController.create({
    //     message: "To Continue with this action pleas login with your account or register a new Account",
    //     header: "Connect with your account",
    //     buttons: [
    //         {
    //             text: "Login",
    //             role: "Login",
    //             handler: () => {
    //                 alertController.dismiss();
    //                 openModal(LoginModal);
    //             }
    //         },
    //         {
    //             text: "Register",
    //             role: "Register",
    //             handler: () => {
    //                 alertController.dismiss();
    //                 openModal(RegisterModal);
    //             }
    //         }
    //     ]
    // });
    // await alert.present();
}

// async function showAlert(message: string, buttons?: (AlertButton | string)[]) {
//     // let alert = await alertController.create({
//     //     header: "Error",
//     //     message: message,
//     //     buttons: buttons
//     // });
//     // alert.present();
// }

async function saveJourney(data: { journeyTitle: string }) {
    // const title = data.journeyTitle as string;
    // if (
    //     journeyStore.editJourney.journey?.start?.address!.length! <= 0 ||
    //     journeyStore.editJourney.journey?.end?.address!.length! <= 0 ||
    //     title.length <= 0
    // ) {
    //     showAlert("Your journey is not valid, Some values may be missing", ["Dismiss"]);
    // } else {
    //     var journeyId: string;
    //     if (mode.value == "editJourney") {
    //         journeyStore.editJourney.journey!.title = title;
    //         journeyId = (await journeyStore.updateJourney("deep"))?.id!;
    //     } else {
    //         journeyId = (await journeyStore.saveJourney(title))?.id!;
    //     }
    //     if (journeyId) {
    //         const alert = await alertController.create({
    //             header: "Notification",
    //             message: "Your journey was saved successfuly",
    //             backdropDismiss: false,
    //             buttons: [
    //                 {
    //                     text: "View",
    //                     role: "view",
    //                     handler: () => {
    //                         showExperiences(journeyId);
    //                     }
    //                 },
    //                 {
    //                     text: "Stay",
    //                     role: "stay",
    //                     handler: () => {
    //                         popoverController.dismiss(null, "stay");
    //                     }
    //                 }
    //             ]
    //         });
    //         alert.present();
    //     } else {
    //         const alert = await alertController.create({
    //             header: "Notification",
    //             message: "An error occured while saving your journey",
    //             backdropDismiss: false,
    //             buttons: ["ok"]
    //         });
    //         alert.present();
    //     }
    // }
}

async function openJourneySaveModal() {
    //     if (!userStore.isLoggedIn) {
    //         showAlertIfNotLoggedin();
    //     } else {
    //         const mainAlert = await alertController.create({
    //             header: "Give your journey a name",
    //             inputs: [
    //                 {
    //                     label: "Title",
    //                     name: "journeyTitle",
    //                     id: "journeyTitle",
    //                     value: journeyStore.editJourney.journey?.title ? journeyStore.editJourney.journey.title : "",
    //                     placeholder: "title"
    //                 }
    //             ],
    //             buttons: [
    //                 {
    //                     text: "Save",
    //                     handler: async (data) => saveJourney(data)
    //                 },
    //                 {
    //                     text: "Cancel",
    //                     handler: () => {
    //                         popoverController.dismiss();
    //                     }
    //                 }
    //             ]
    //         });
    //         await mainAlert.present();
    //     }
}
</script>
<style lang="less" scoped></style>
