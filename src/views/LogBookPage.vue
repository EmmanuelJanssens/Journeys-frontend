<!-- eslint-disable vue/valid-v-for -->
<template>
    <ion-page id="main-content">
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
                                    <ion-icon size="large" src="/src/assets/icon/add-outline.svg"></ion-icon>
                                </ion-fab-button>
                            </ion-fab>
                            <ion-fab v-else-if="mode == modes.viewJourney" slot="fixed" vertical="top" horizontal="end">
                                <ion-fab-button>
                                    <ion-icon size="large" src="/src/assets/icon/grid-outline.svg"></ion-icon>
                                </ion-fab-button>
                                <ion-fab-list>
                                    <ion-fab-button @click="editJourney">
                                        <ion-icon size="default" src="/src/assets/icon/pencil-outline.svg"></ion-icon>
                                    </ion-fab-button>
                                    <ion-fab-button @click="fetchJourneys">
                                        <ion-icon
                                            size="default"
                                            src="/src/assets/icon/return-up-back-outline.svg"></ion-icon>
                                    </ion-fab-button>
                                </ion-fab-list>
                            </ion-fab>
                            <ion-fab
                                v-else-if="mode == modes.edition || mode == modes.editJourney"
                                slot="fixed"
                                vertical="top"
                                horizontal="end">
                                <ion-fab-button>
                                    <ion-icon size="large" src="/src/assets/icon/grid-outline.svg"></ion-icon>
                                </ion-fab-button>
                                <ion-fab-list>
                                    <ion-fab-button @click="openJourneySaveModal">
                                        <ion-icon size="default" src="/src/assets/icon/save-outline.svg"></ion-icon>
                                    </ion-fab-button>
                                    <ion-fab-button @click="fetchJourneys">
                                        <ion-icon
                                            size="default"
                                            src="/src/assets/icon/return-up-back-outline.svg"></ion-icon>
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

                        <TheJourneysSlider v-if="mode == modes.logbook" @header-clicked="showExperiences" />
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
    onIonViewWillLeave,
    IonFab,
    IonFabList,
    IonFabButton,
    popoverController,
    onIonViewDidEnter,
    modalController,
    SearchbarCustomEvent,
    onIonViewWillEnter,
    alertController
} from "@ionic/vue";
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
import SaveJourneyModal from "components/Modals/SaveJourneyModal.vue";
import LoginModal from "components/Modals/LoginModal.vue";
import RegisterModal from "components/Modals/RegisterModal.vue";
import { getMidPoint, openModal, getRadius } from "utils/utils";
import ThePoiListSidebar from "components/ThePoiListSidebar.vue";
import TheJourneysSlider from "components/TheJourneysSlider.vue";
import TheJourneyExperienceList from "components/TheJourneyExperienceList.vue";
import ThePoiSearchbar from "components/ThePoiSearchbar.vue";

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

watch(
    () => userStore.loggedIn,
    (newValue, oldValue) => {
        if (newValue && !oldValue) {
            if (mode.value == modes.logbook) fetchJourneys();
        } else {
            //
        }
    }
);

onIonViewDidEnter(() => {
    if (!userStore.IsLoggedIn()) {
        openJourneyCreationModal();
    }
});

async function panTo(poi: PoiDto) {
    const map = await JourneyMapCapacitor.getMap();
    map?.flyTo({
        center: [poi.location.longitude, poi.location.latitude],
        zoom: 20
    });
}

function setLoading(loading: boolean) {
    isLoading.value = loading;
}

async function fetchJourneys() {
    setLoading(true);
    mode.value = modes.logbook;
    await userStore.fetchMyJourneys();
    updateView();
}

const filteredPois = ref<PoiDto[]>();

function filterPois(evt: SearchbarCustomEvent) {
    if (evt.detail.value!.length < 3) {
        filteredPois.value = poiStore.poisBetween;
    } else {
        filteredPois.value = poiStore.poisBetween?.filter((poi) =>
            poi.name.toLocaleLowerCase().includes(evt.detail.value!.toLocaleLowerCase())
        );
    }
}

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
    journeyStore.editJourney.journey!.experiences = [];
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

async function openJourneySaveModal() {
    if (!userStore.IsLoggedIn()) {
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
        const modal = await modalController.create({
            component: SaveJourneyModal,
            componentProps: { mode: mode.value }
        });
        modal.present();

        const result = await modal.onDidDismiss();

        if (result.role == "view") {
            showExperiences(result.data.data);
        }
    }
}
</script>
<style lang="less">
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
