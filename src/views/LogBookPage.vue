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
                        <!--<ion-header class="sticky">
                           <ion-toolbar color="secondary">
                                <ion-buttons slot="start">
                                    <ion-button @click="fetchJourneys()">
                                        <ion-icon src="/src/assets/icon/return-up-back-outline.svg" slot="icon-only">
                                        </ion-icon>
                                    </ion-button>
                                </ion-buttons>
                                <ion-title> Points of interest </ion-title>
                                <ion-buttons slot="end">
                                    <ion-button>
                                        <ion-icon src="/src/assets/icon/filter-outline.svg" slot="icon-only">
                                        </ion-icon>
                                    </ion-button>
                                </ion-buttons>
                            </ion-toolbar>
                            <ion-toolbar>
                                <ion-searchbar @ionChange="filterPois" debounce="500"> </ion-searchbar>
                            </ion-toolbar>
                        </ion-header>-->
                        <ion-content>
                            <ion-row
                                v-if="(mode == modes.edition || mode == modes.editJourney) && filteredPois"
                                class="experience-list">
                                <ion-col>
                                    <DynamicScroller :items="filteredPois" :min-item-size="54" style="height: 100%">
                                        <template v-slot="{ item, index, active }">
                                            <DynamicScrollerItem :item="item" :active="active" :data-index="index">
                                                <ion-item button style="width: 100%" @click="panTo(item)">
                                                    <ion-thumbnail slot="start">
                                                        <ion-img :src="item.thumbnail"> </ion-img>
                                                    </ion-thumbnail>
                                                    <ion-label>{{ item.name }}</ion-label>
                                                </ion-item>
                                            </DynamicScrollerItem>
                                        </template>
                                    </DynamicScroller>
                                </ion-col>
                            </ion-row>
                        </ion-content>
                    </ion-col>
                    <ion-col ref="mapCol">
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
                                    <ion-fab-button>
                                        <ion-icon
                                            size="default"
                                            src="/src/assets/icon/trash-bin-outline.svg"></ion-icon>
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
                                    <ion-fab-button>
                                        <ion-icon
                                            size="default"
                                            src="/src/assets/icon/trash-bin-outline.svg"></ion-icon>
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

                        <section v-if="mode == modes.logbook" class="journeys-slides">
                            <swiper
                                :slides-per-view="slidesPerView"
                                :initial-slide="userStore.myJourneys?.length"
                                :pagination="{ clickable: true }"
                                lazy
                                :modules="modules"
                                class="journeys"
                                :center-insufficient-slides="true"
                                ref="slides">
                                <swiper-slide v-for="item in userStore.myJourneys">
                                    <JourneyCard
                                        :journey="item"
                                        class="journey-card ion-margin"
                                        @header-clicked="showExperiences(item.id!)" />
                                </swiper-slide>
                            </swiper>
                        </section>
                    </ion-col>
                    <ion-col
                        v-if="mode == modes.viewJourney || mode == modes.edition || mode == modes.editJourney"
                        class="side ion-hide-sm-down"
                        ref="experiencesCol">
                        <ion-content>
                            <ion-row class="experience-list">
                                <ion-col
                                    v-if="
                                        mode == modes.viewJourney &&
                                        journeyStore.viewJourney &&
                                        journeyStore.viewJourney.experiences &&
                                        journeyStore.viewJourney.experiences.length > 0
                                    ">
                                    <DynamicScroller
                                        v-if="journeyStore.viewJourney.experiences.length > 0"
                                        :items="journeyStore.viewJourney.experiences"
                                        :min-item-size="54"
                                        style="height: 100%">
                                        <template v-slot="{ item, index, active }">
                                            <DynamicScrollerItem
                                                :item="item as ExperienceDto"
                                                :active="active"
                                                :data-index="index">
                                                <ExperienceCard
                                                    :experience="item"
                                                    :journey="journeyStore.viewJourney.id"
                                                    @updated="showExperiences(journeyStore.viewJourney.id!)" />
                                            </DynamicScrollerItem>
                                        </template>
                                    </DynamicScroller>
                                </ion-col>
                                <ion-col v-else-if="mode === modes.edition || mode == modes.editJourney">
                                    <MapJourneySidebar
                                        :start="journeyStore.editJourney.journey?.start"
                                        :end="journeyStore.editJourney.journey?.end"
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
    IonImg,
    IonThumbnail,
    IonItem,
    IonLabel,
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

import JourneyCard from "components/Cards/JourneyCard.vue";
import PoiCard from "components/Cards/PoiCard.vue";
import ExperienceCard from "components/Cards/ExperienceCard.vue";
import CreateJourneyModal from "components/Modals/CreateJourneyModal.vue";
import { JourneyMapCapacitor } from "journeys-capacitor-mapbox";

import { ref, watch } from "vue";

import { useUserStore } from "stores/useUserStore";
import { usePoiStore } from "stores/usePoiStore";
import { useJourneyStore } from "stores/useJourneyStore";

import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Navigation, Lazy } from "swiper";

import { ExperienceDto, PoiDto } from "types/dtos";

import { GeocodedData } from "types/journeys";
import JourneyMap from "components/JourneyMap.vue";
import mapboxgl, { LngLat, MapMouseEvent } from "mapbox-gl";
import { reverseGeocode, getLocalityAndCountry } from "google/googleGeocoder";

import MapJourneySidebar from "components/MapJourneySidebar.vue";
import SaveJourneyModal from "components/Modals/SaveJourneyModal.vue";
import LoginModal from "components/Modals/LoginModal.vue";
import RegisterModal from "components/Modals/RegisterModal.vue";
import { getMidPoint, openModal, getRadius } from "utils/utils";

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
const modules = ref([Pagination, Navigation, Lazy]);
const slides = ref();

watch(
    () => userStore.loggedIn,
    (newValue) => {
        if (newValue) {
            if (mode.value == modes.logbook) fetchJourneys();
        } else {
            journeyStore.clearMapView();
        }
    }
);

onIonViewDidEnter(() => {
    if (!userStore.IsLoggedIn()) {
        openJourneyCreationModal();
    }
});

onIonViewWillLeave(() => {
    window.removeEventListener("resize", updateView);
});

onIonViewWillEnter(async () => {
    window.addEventListener("resize", updateView);
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
    journeyStore.clearData();
    poiStore.clear();
    //TODO check if alright
    mode.value = modes.editJourney;
    journeyStore.editJourney.journey! = JSON.parse(JSON.stringify(journeyStore.viewJourney));
    await fetchPois({
        start: {
            address: journeyStore.editJourney.journey?.start?.address!,
            coordinates: new LngLat(
                journeyStore.editJourney.journey?.start?.longitude!,
                journeyStore.editJourney.journey?.start?.latitude!
            )
        },
        end: {
            address: journeyStore.editJourney.journey?.end?.address!,
            coordinates: new LngLat(
                journeyStore.editJourney.journey?.end?.longitude!,
                journeyStore.editJourney.journey?.end?.latitude!
            )
        }
    });
}

async function fetchPois(data: { start: GeocodedData; end: GeocodedData }) {
    setLoading(true);
    const radius = getRadius(data.start.coordinates, data.end.coordinates);
    const mid = getMidPoint(data.start.coordinates, data.end.coordinates);
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
                address: result.postal_code + " " + result.locality + ", " + result.country,
                latitude: pos.lat,
                longitude: pos.lng
            };
        } else if (marker == "journey_end") {
            journeyStore.editJourney.journey!.end = {
                address: result.postal_code + " " + result.locality + ", " + result.country,
                latitude: pos.lat,
                longitude: pos.lng
            };
        }
    }
    await fetchPois({
        start: {
            address: journeyStore.editJourney.journey?.start?.address!,
            coordinates: new mapboxgl.LngLat(
                journeyStore.editJourney.journey?.start?.longitude!,
                journeyStore.editJourney.journey?.start?.latitude!
            )
        },
        end: {
            address: journeyStore.editJourney.journey?.end?.address!,
            coordinates: new mapboxgl.LngLat(
                journeyStore.editJourney.journey?.end?.longitude!,
                journeyStore.editJourney.journey?.end?.latitude!
            )
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
    poiStore.clear();
    mode.value = modes.viewJourney;
    journeyStore.viewJourney = await journeyStore.getJourney(id);
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
        journeyStore.editJourney.journey!.experiences = [];

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
<style lang="scss">
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

.swiper-slide {
    text-align: left;
    font-size: 18px;
    /* Center slide text vertically */
    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    -webkit-align-items: center;
    align-items: center;
}

.experience-list {
    overflow-y: auto;
}

.journey-card {
    min-width: 300px;
    max-width: 350px;

    min-height: 400px;
    max-height: 450px;

    height: 90%;
    width: 100%;
}

.journeys {
    min-height: 300px;
    height: 100%;
    width: 100%;
}

.journeys-slides {
    position: absolute;
    bottom: 20px;
    height: 35%;
    max-height: 450px;
    min-height: 400px;
    width: 100%;
    z-index: 999;
}

.sticky {
    position: absolute;
}
</style>
