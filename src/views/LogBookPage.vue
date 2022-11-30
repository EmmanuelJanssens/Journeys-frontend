<!-- eslint-disable vue/valid-v-for -->
<template>
    <div class="absolute top-0 right-0 left-0 w-screen h-screen">
        <!-- <TheJourneysHeader class="z-50" /> -->
        <div class="relative flex flex-row-reverse h-full w-full">
            <LogbookMenu :buttons="menuButtons" />

            <div class="w-full h-full">
                <JourneyMap class="relative bg-secondary-light w-full h-full" :mode="mode" @poi-clicked="onPoiClicked">
                    <router-view class="absolute left-0 right-0 bottom-0 p-4 h-2/5" v-slot="{ Component, route }">
                        <Transition name="fade" mode="out-in">
                            <component :is="Component" :key="route.path" />
                        </Transition>
                    </router-view>
                </JourneyMap>
            </div>

            <ThePoiListSidebar
                v-if="poiStore.poisBetween && poiStore.poisBetween.length > 0"
                :poiList="poiStore.poisBetween"
                @poi-item-clicked="flyTo"
                class="w-[400px] h-full" />
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
import { defineAsyncComponent, onActivated, onMounted, ref } from "vue";

import { useUserStore } from "stores/useUserStore";
import { usePoiStore } from "stores/usePoiStore";
import { useJourneyStore } from "stores/useJourneyStore";

import { PoiDto } from "types/dtos";

import { authApp } from "google/firebase";

import { MapMouseEvent } from "mapbox-gl";

import JourneyMap from "components/TheJourneyMap.vue";

import LogbookMenu from "components/LogbookMenu.vue";
import ThePoiListSidebar from "components/ThePoiListSidebar.vue";
import PoiCard from "components/jCards/PoiCard.vue";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";
import { mapInstance } from "map/JourneysMap";
import {
    faSave,
    faAdd,
    faBookAtlas,
    faCircleUser,
    faEarth,
    faLocationDot,
    faHome,
    faSignOut,
    IconDefinition,
    faPencil
} from "@fortawesome/free-solid-svg-icons";
import router from "router/router";

const history = ref<
    {
        name: string;
        props?: any;
    }[]
>([]);
const userStore = useUserStore();
const journeyStore = useJourneyStore();
const poiStore = usePoiStore();

const menuButtons = ref([
    {
        text: "View my Profile",
        icon: faCircleUser as IconDefinition,
        visible: false,
        handler: () => {
            console.log("View my Profile");
        }
    },
    {
        text: "Logbook",
        icon: faBookAtlas as IconDefinition,
        visible: true,
        handler: async () => {
            if (router.currentRoute.value.name != "logbook") {
                router.push("/logbook");
            }
        }
    },
    {
        text: "Add a journey",
        icon: faAdd,
        visible: true,
        handler: async () => {
            journeyModalController.open("createJourney");

            const result = await journeyModalController.didClose("createJourney");

            if (result) {
                mode.value = modes.edition;
                journeyStore.editJourney.journey = {
                    start: result.data.start,
                    end: result.data.end
                };
                journeyStore.editJourney.journey!.experiencesConnection = { edges: [] };
                router.push("/edit?mode=new");
            }
        }
    },
    {
        text: "Add a Point of interest",
        icon: faLocationDot,
        visible: true,
        handler: () => {
            console.log("Add a Point of interest");
        }
    },
    {
        text: "Explore arround Me",
        icon: faEarth,
        visible: true,
        handler: () => {
            console.log(menuButtons.value[0]);

            console.log("Explore arround Me");
        }
    },
    {
        text: "Home",
        icon: faHome,
        visible: true,
        handler: () => {
            router.push("/home");
        }
    },
    {
        text: "Edit Journey",
        icon: faPencil,
        visible: true,
        handler: () => {
            if (router.currentRoute.value.name == "view") {
                router.push("/edit?id=" + journeyStore.viewJourney.id + "&mode=existing");
            }
        }
    },
    {
        text: "Save Journey",
        icon: faSave,
        visible: true,
        handler: async () => {
            journeyModalController.open("saveJourney");

            if (router.currentRoute.value.name == "edit") {
                //const res = await journeyStore.updateJourney("deep");
                //router.push("logbook/journey/" + journeyStore.viewJourney.id);
            }
            const saved = await journeyModalController.didClose("saveJourney");
        }
    },
    {
        text: "Logout",
        icon: faSignOut,
        visible: true,
        handler: async () => {
            await authApp.signOut();
            router.push("/home");
        }
    }
]);
const modes = {
    logbook: "logbook",
    exploration: "exploration",
    edition: "edition",
    viewJourney: "viewJourney",
    editJourney: "editJourney",
    createJourney: "createJourney"
};

const mode = ref(modes.logbook);

onActivated(async () => {});
onMounted(async () => {
    journeyModalController.create(
        "editJourney",
        defineAsyncComponent({
            loader: () => import("components/jModals/EditJourneyModal.vue")
        })
    );

    journeyModalController.create(
        "createJourney",
        defineAsyncComponent({
            loader: () => import("components/jModals/CreateJourneyModal.vue")
        })
    );

    journeyModalController.create(
        "editExperience",
        defineAsyncComponent({
            loader: () => import("components/jModals/EditExperienceModal.vue")
        })
    );

    journeyModalController.create(
        "saveJourney",
        defineAsyncComponent({
            loader: () => import("components/jModals/SaveJourneyModal.vue")
        })
    );
});

function flyTo(poi: PoiDto) {
    mapInstance.flyTo(poi.location?.longitude!, poi.location?.latitude!, 18);
}
function onPoiClicked(poi: PoiDto, e: MapMouseEvent) {
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
<style lang="less" scoped>
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease-out;
}
</style>
