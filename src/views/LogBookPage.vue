<!-- eslint-disable vue/valid-v-for -->
<template>
    <ion-page>
        <ion-header>
            <TheJourneysHeader />
        </ion-header>
        <ion-loading v-if="isLoading" />
        <ion-content>
            <ion-grid class="full-page ion-no-padding">
                <ion-row class="full-page">
                    <ion-col
                        v-if="mode == modes.edition || mode == modes.exploration || mode == modes.editJourney"
                        class="side ion-hide-md-down">
                        <ThePoiListSidebar :poi-list="filteredPois" @poi-item-clicked="panTo" />
                    </ion-col>
                    <ion-col ref="mapCol">
                        <ThePoiSearchbar
                            @poi-item-clicked="panTo"
                            v-if="mode == modes.edition || mode == modes.exploration || mode == modes.editJourney" />
                        <ion-content>
                            <ion-fab v-if="mode == modes.logbook" slot="fixed" vertical="top" horizontal="end">
                                <ion-fab-button @click="openJourneyCreationModal">
                                    <ion-icon size="large" :icon="addOutline"></ion-icon>
                                </ion-fab-button>
                            </ion-fab>
                            <ion-fab v-else-if="mode == modes.viewJourney" slot="fixed" vertical="top" horizontal="end">
                                <ion-fab-button>
                                    <ion-icon size="large" :icon="gridOutline"></ion-icon>
                                </ion-fab-button>
                                <ion-fab-list>
                                    <ion-fab-button @click="editJourney">
                                        <ion-icon size="default" :icon="pencilOutline"></ion-icon>
                                    </ion-fab-button>
                                    <ion-fab-button @click="fetchJourneys">
                                        <ion-icon size="default" :icon="returnUpBackOutline"></ion-icon>
                                    </ion-fab-button>
                                </ion-fab-list>
                            </ion-fab>
                            <ion-fab
                                v-else-if="mode == modes.edition || mode == modes.editJourney"
                                slot="fixed"
                                vertical="top"
                                horizontal="end">
                                <ion-fab-button>
                                    <ion-icon size="large" :icon="gridOutline"></ion-icon>
                                </ion-fab-button>
                                <ion-fab-list>
                                    <ion-fab-button @click="openAddPoiAlert">
                                        <ion-icon size="default" :icon="addOutline"></ion-icon>
                                    </ion-fab-button>
                                    <ion-fab-button @click="openJourneySaveModal">
                                        <ion-icon size="default" :icon="saveOutline"></ion-icon>
                                    </ion-fab-button>
                                    <ion-fab-button @click="fetchJourneys">
                                        <ion-icon size="default" :icon="returnUpBackOutline"></ion-icon>
                                    </ion-fab-button>
                                </ion-fab-list>
                            </ion-fab>

                            <JourneyMap
                                :mode="mode"
                                @loaded="fetchJourneys"
                                @marker-dragged="onMarkerDragend"
                                @poi-clicked="onPoiClicked"
                                @ready="setLoading(false)" />
                        </ion-content>

                        <TheJourneysSlider
                            class="journeys-slides"
                            v-if="mode == modes.logbook"
                            @header-clicked="showExperiences" />
                    </ion-col>
                    <ion-col
                        v-if="mode == modes.viewJourney || mode == modes.edition || mode == modes.editJourney"
                        class="side ion-hide-sm-down"
                        ref="experiencesCol">
                        <ion-content>
                            <ion-row class="experience-list">
                                <ion-col>
                                    <TheJourneyExperienceList
                                        v-if="
                                        mode == modes.viewJourney &&
                                        journeyStore.viewJourney?.experiencesConnection?.edges?.length! > 0
                                    "
                                        @updated="showExperiences" />
                                    <MapJourneySidebar
                                        v-else-if="mode === modes.edition || mode == modes.editJourney"
                                        :start="journeyStore.editJourney.journey?.start!"
                                        :end="journeyStore.editJourney.journey?.end!"
                                        mode="edit"
                                /></ion-col>
                            </ion-row>
                        </ion-content>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-page>
</template>
<script lang="ts" setup>
import {
    IonLoading,
    IonIcon,
    IonPage,
    IonContent,
    IonGrid,
    IonCol,
    IonRow,
    IonFab,
    IonFabList,
    IonFabButton,
    popoverController,
    onIonViewDidEnter,
    modalController,
    IonHeader,
    alertController
} from "@ionic/vue";

import { addOutline, gridOutline, pencilOutline, returnUpBackOutline, saveOutline } from "ionicons/icons";
// Import Swiper and modules
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import PoiCard from "components/Cards/PoiCard.vue";
import CreateJourneyModal from "components/Modals/CreateJourneyModal.vue";
import { JourneyMapCapacitor } from "journeys-capacitor-mapbox";

import { ref, watch } from "vue";

import { useUserStore } from "stores/useUserStore";
import { usePoiStore } from "stores/usePoiStore";
import { useJourneyStore } from "stores/useJourneyStore";

import { AddressDto, getAddressCoordinates, PoiDto } from "types/dtos";

import JourneyMap from "components/TheJourneyMap.vue";
import mapboxgl, { MapMouseEvent } from "mapbox-gl";
import { reverseGeocode, getLocalityAndCountry } from "google/googleGeocoder";

import MapJourneySidebar from "components/TheJourneyEditSidebar.vue";
import LoginModal from "components/Modals/LoginModal.vue";
import RegisterModal from "components/Modals/RegisterModal.vue";
import { getMidPoint, openModal, getRadius } from "utils/utils";
import ThePoiListSidebar from "components/ThePoiListSidebar.vue";
import TheJourneysSlider from "components/TheJourneysSlider.vue";
import TheJourneyExperienceList from "components/TheJourneyExperienceList.vue";
import ThePoiSearchbar from "components/ThePoiSearchbar.vue";
import TheJourneysHeader from "components/TheJourneysHeader.vue";
import { authApp } from "google/firebase";

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

const slidesPerView = ref(3);
const slides = ref();

authApp.onAuthStateChanged((user) => {
    if (user) {
        if (mode.value == modes.logbook) fetchJourneys();
    }
});

onIonViewDidEnter(() => {
    if (!userStore.isLoggedIn) {
        openJourneyCreationModal();
    }
});

function SwitchMode(newMode: string) {
    mode.value = newMode;
}
async function panTo(poi: PoiDto) {
    const map = await JourneyMapCapacitor.getMap();
    map?.flyTo({
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
    updateView();
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
    const radius = getRadius(getAddressCoordinates(data.start), getAddressCoordinates(data.end));
    const mid = getMidPoint(getAddressCoordinates(data.start), getAddressCoordinates(data.end));
    journeyStore.setJourneyStartEnd(data.start, data.end);
    await poiStore.searchBetween(mid.lat, mid.lng, radius);
    filteredPois.value = poiStore.poisBetween;
}

async function onMarkerDragend(pos: mapboxgl.LngLat, marker: string) {
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

async function onPoiClicked(poi: PoiDto, e: MapMouseEvent) {
    const popover = await popoverController.create({
        component: PoiCard,
        componentProps: { poi: poi },
        event: e.originalEvent,
        size: "auto",
        reference: "event",
        side: "top",
        alignment: "center"
    });
    await popover.present();
}

async function showExperiences(id: string) {
    setLoading(true);
    mode.value = modes.viewJourney;
    await journeyStore.getJourney(id);
}

function updateView() {
    if (slides.value != null) {
        const width = slides.value.$el.clientWidth;
        if (width < 800) {
            slidesPerView.value = 1;
        } else if (width < 1100) {
            slidesPerView.value = 2;
        } else if (width < 1500) {
            slidesPerView.value = 3;
        } else {
            if (userStore.myJourneys?.length! < 4) {
                slidesPerView.value = userStore.myJourneys?.length!;
            } else {
                slidesPerView.value = Math.floor(width / 300);
            }
        }
    }
}

async function openJourneyCreationModal() {
    const modal = await modalController.create({
        component: CreateJourneyModal
    });
    modal.present();

    const result = await modal.onDidDismiss();

    if (result.role == "create") {
        mode.value = modes.edition;
        journeyStore.editJourney.journey = {};
        journeyStore.editJourney.journey!.experiencesConnection = { edges: [] };

        fetchPois(result.data);
    }
}
async function openAddPoiAlert() {
    const alert = await alertController.create({
        header: "Right click on the map to add a Poi",
        buttons: [
            "cancel",
            {
                text: "Ok",
                handler: async () => {
                    alertController.dismiss(null, "ok");
                }
            }
        ]
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role != "ok") {
        SwitchMode(modes.editJourney);
    }
}
async function openJourneySaveModal() {
    if (!userStore.isLoggedIn) {
        const alert = await alertController.create({
            message: "To Continue with this action pleas login with your account or register a new Account",
            header: "Connect with your account",
            buttons: [
                {
                    text: "Login",
                    role: "Login",
                    handler: () => {
                        alertController.dismiss();
                        openModal(LoginModal);
                    }
                },
                {
                    text: "Register",
                    role: "Register",
                    handler: () => {
                        alertController.dismiss();
                        openModal(RegisterModal);
                    }
                }
            ]
        });
        (await alert).present();
    } else {
        const mainAlert = await alertController.create({
            header: "Give your journey a name",
            inputs: [
                {
                    label: "Title",
                    name: "journeyTitle",
                    id: "journeyTitle",
                    value: journeyStore.editJourney.journey?.title ? journeyStore.editJourney.journey.title : "",
                    placeholder: "title"
                }
            ],
            buttons: [
                {
                    text: "Save",
                    handler: async (data) => {
                        const title = data.journeyTitle as string;
                        if (
                            journeyStore.editJourney.journey?.start?.address!.length! <= 0 ||
                            journeyStore.editJourney.journey?.end?.address!.length! <= 0 ||
                            title.length <= 0
                        ) {
                            let alert = await alertController.create({
                                header: "Error",
                                message: "Your journey is not valid, Some values may be missing",
                                buttons: ["Dismiss"]
                            });
                            alert.present();
                        } else {
                            var journeyId: string;
                            if (mode.value == "editJourney") {
                                journeyStore.editJourney.journey!.title = title;
                                journeyId = (await journeyStore.updateJourney("deep"))?.id!;
                            } else {
                                journeyId = (await journeyStore.saveJourney(title))?.id!;
                            }
                            if (journeyId) {
                                const alert = await alertController.create({
                                    header: "Notification",
                                    message: "Your journey was saved successfuly",
                                    backdropDismiss: false,
                                    buttons: [
                                        {
                                            text: "View",
                                            role: "view",
                                            handler: () => {
                                                showExperiences(journeyId);
                                            }
                                        },
                                        {
                                            text: "Stay",
                                            role: "stay",
                                            handler: () => {
                                                popoverController.dismiss(null, "stay");
                                            }
                                        }
                                    ]
                                });
                                alert.present();
                            } else {
                                const alert = await alertController.create({
                                    header: "Notification",
                                    message: "An error occured while saving your journey",
                                    backdropDismiss: false,
                                    buttons: ["ok"]
                                });
                                alert.present();
                            }
                        }
                    }
                },
                {
                    text: "Cancel",
                    handler: () => {
                        popoverController.dismiss();
                    }
                }
            ]
        });
        await mainAlert.present();
    }
}
</script>
<style lang="less" scoped>
.journeys-slides {
    position: absolute;
    width: 80%;
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    bottom: 20px;
    z-index: 999;
}
.side {
    min-width: 200px;
    max-width: 400px;
}
.full-page {
    height: 100%;
    width: 100%;
}

.map-section {
    height: 95%;
}
.mid-page {
    height: 45%;
    overflow-y: auto;
}

.experience-list {
    overflow-y: auto;
}
</style>
