<!-- eslint-disable vue/valid-v-for -->
<template>
    <ion-page id="main-content">
        <ion-loading v-if="isLoading" />
        <ion-content>
            <ion-grid class="full-page">
                <ion-row class="full-page">
                    <ion-col
                        v-bind:class="{ side: true, 'ion-hide-md-down': true, 'ion-hide': isLoaded }"
                        ref="statisticsCol">
                    </ion-col>
                    <ion-col ref="mapCol">
                        <ion-grid class="full-page slides ion-no-margin ion-no-padding">
                            <ion-content>
                                <ion-row class="">
                                    <ion-toolbar color="secondary">
                                        <ion-buttons slot="start">
                                            <ion-button
                                                @click="
                                                    () => {
                                                        setData();
                                                    }
                                                ">
                                                <ion-icon
                                                    src="src/assets/icon/return-up-back-outline.svg"
                                                    slot="icon-only"></ion-icon>
                                            </ion-button>
                                        </ion-buttons>
                                        <ion-buttons slot="end">
                                            <ion-button @click="openJourneyCreationModal">
                                                <ion-icon
                                                    src="src/assets/icon/add-outline.svg"
                                                    slot="icon-only"></ion-icon>
                                            </ion-button>
                                            <ion-button>
                                                <ion-icon
                                                    src="src/assets/icon/filter-outline.svg"
                                                    slot="icon-only"></ion-icon>
                                            </ion-button>
                                            <ion-button>
                                                <ion-icon
                                                    src="src/assets/icon/search-outline.svg"
                                                    slot="icon-only"></ion-icon>
                                            </ion-button>
                                        </ion-buttons>
                                    </ion-toolbar>
                                </ion-row>
                                <ion-row class="map-section" ref="slides">
                                    <section id="Map" class="full-page">
                                        <swiper
                                            :slides-per-view="slidesPerView"
                                            :initial-slide="useUser.myJourneys?.length"
                                            :pagination="{ clickable: true }"
                                            lazy
                                            :modules="modules"
                                            class="journeys">
                                            <swiper-slide v-for="item in useUser.myJourneys">
                                                <JourneyCard
                                                    :journey="item"
                                                    class="journey-card ion-margin"
                                                    @header-clicked="showExperiences(item.id!)"
                                                    @upated="setData" />
                                            </swiper-slide>
                                        </swiper>
                                    </section>
                                </ion-row>
                            </ion-content>
                        </ion-grid>
                    </ion-col>
                    <ion-col
                        v-bind:class="{ side: true, 'ion-hide-sm-down': true, 'ion-hide': isLoaded }"
                        ref="experiencesCol">
                        <ion-grid class="full-page ion-no-margin ion-no-padding">
                            <ion-content>
                                <ion-row>
                                    <ion-toolbar color="secondary">
                                        <ion-title> Experiences </ion-title>
                                        <ion-buttons slot="end">
                                            <ion-button>
                                                <ion-icon src="/src/assets/icon/filter-outline.svg" slot="icon-only">
                                                </ion-icon>
                                            </ion-button>
                                        </ion-buttons>
                                    </ion-toolbar>
                                    <ion-toolbar>
                                        <ion-searchbar> </ion-searchbar>
                                    </ion-toolbar>
                                </ion-row>
                                <ion-row class="experience-list">
                                    <ion-col
                                        v-if="
                                            useJourney.viewJourney &&
                                            useJourney.viewJourney.experiences &&
                                            useJourney.viewJourney.experiences.length > 0
                                        ">
                                        <DynamicScroller
                                            :items="useJourney.viewJourney.experiences"
                                            :min-item-size="54"
                                            style="height: 100%">
                                            <template v-slot="{ item, index, active }">
                                                <DynamicScrollerItem
                                                    :item="item as ExperienceDto"
                                                    :active="active"
                                                    :data-index="index">
                                                    <ExperienceCard
                                                        :experience="item"
                                                        :journey="useJourney.viewJourney.id"
                                                        @updated="showExperiences(useJourney.viewJourney.id!)" />
                                                </DynamicScrollerItem>
                                            </template>
                                        </DynamicScroller>
                                    </ion-col>
                                </ion-row>
                            </ion-content>
                        </ion-grid>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-page>
</template>
<script lang="ts" setup>
import {
    IonSpinner,
    IonLoading,
    IonIcon,
    IonPage,
    IonContent,
    IonGrid,
    IonCol,
    IonRow,
    IonButton,
    IonToolbar,
    IonButtons,
    modalController,
    onIonViewDidLeave,
    IonItem,
    IonSearchbar,
    IonTitle,
    IonLabel,
    IonThumbnail,
    IonImg,
    onIonViewDidEnter,
    onIonViewWillEnter,
    onIonViewWillLeave
} from "@ionic/vue";
import JourneyCard from "components/Cards/JourneyCard.vue";
import { ref } from "vue";
import { useUserStore } from "stores/useUserStore";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Navigation, Lazy } from "swiper";
import ExperienceCard from "components/Cards/ExperienceCard.vue";
// Import Swiper and modules
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import CreateJourneyModalVue from "components/Modals/CreateJourneyModal.vue";

import { useJourneyStore } from "stores/useJourneyStore";
import { ExperienceDto } from "types/dtos";
import { Journeys } from "../map/JourneysMap";

import mapboxgl from "mapbox-gl";
import GeoJSON, { Geometry } from "geojson";

const slidesPerView = ref(3);
const useUser = useUserStore();
const useJourney = useJourneyStore();
const isLoading = ref(true);
const modules = ref([Pagination, Navigation, Lazy]);

const slides = ref();

let statisticsCol = ref<typeof IonCol>();
let experiencesCol = ref();
let mapCol = ref();
let isLoaded = ref(false);

onIonViewWillEnter(async () => {
    await useUser.fetchMyJourneys();
    updateView();

    Journeys.loadMap("Map");
    if (Journeys.JourneysMap.isStyleLoaded()) {
        setData();
    }
    Journeys.JourneysMap.on("sourcedata", (e) => {
        if (e.isSourceLoaded && e.sourceId === Journeys.MapLayer.journey_list && e.sourceDataType == "metadata")
            isLoading.value = false;
        else if (e.isSourceLoaded && e.sourceId === Journeys.MapLayer.journey_route) isLoading.value = false;
    });
    Journeys.JourneysMap.once("load", () => {
        setData();
        Journeys.JourneysMap.resize();
    });

    Journeys.JourneysMap.once("style.load", () => {
        Journeys.JourneysMap.setFog({});
    });
});

onIonViewWillLeave(() => {
    window.removeEventListener("resize", updateView);
});
onIonViewDidLeave(() => {
    Journeys.clear_map(true);
});

function setData() {
    useJourney.viewJourney = {};
    Journeys.clear_map(false);
    const geoJSONJourney: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: []
    };
    const connections: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: []
    };
    useUser.myJourneys?.forEach((journey) => {
        geoJSONJourney.features.push(useJourney.journeyToGeojson(journey)[0]);
        geoJSONJourney.features.push(useJourney.journeyToGeojson(journey)[1]);
        connections.features.push({
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [journey.start?.longitude!, journey.start?.latitude!],
                    [journey.end?.longitude!, journey.end?.latitude!]
                ]
            },
            properties: {
                title: journey.title
            }
        });
    });

    Journeys.addSource(Journeys.MapLayer.journey_list, geoJSONJourney);
    Journeys.addSource(Journeys.MapLayer.journey_route, connections);
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
            if (useUser.myJourneys?.length! < 4) {
                slidesPerView.value = useUser.myJourneys?.length!;
            } else {
                slidesPerView.value = Math.floor(width / 300);
            }
        }
    }
    console.log(slidesPerView.value + " 2");
}
async function openJourneyCreationModal() {
    const modal = await modalController.create({
        component: CreateJourneyModalVue
    });
    modal.present();
}

async function showExperiences(id: string) {
    if (useJourney.viewJourney.id !== id) useJourney.viewJourney = await useJourney.getJourney(id);

    Journeys.clear_source(Journeys.MapLayer.journey_experiences);
    Journeys.clear_source(Journeys.MapLayer.journey_route);
    Journeys.clear_source(Journeys.MapLayer.journey_list);

    const experiences: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: []
    };
    useJourney.viewJourney.experiences?.forEach((exp) => {
        experiences.features.push({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [exp.poi.location.longitude, exp.poi.location.latitude]
            },
            properties: exp.experience,
            id: exp.poi.id
        });
    });
    Journeys.addSource(Journeys.MapLayer.journey_experiences, experiences, useJourney.viewJourney);

    const coords = Array<number[]>();

    coords.push([useJourney.viewJourney.start?.longitude!, useJourney.viewJourney.start?.latitude!]);
    experiences.features.forEach((element) => {
        coords.push((element.geometry as GeoJSON.Point).coordinates);
    });
    coords.push([useJourney.viewJourney.end?.longitude!, useJourney.viewJourney.end?.latitude!]);

    const route: GeoJSON.Feature = {
        type: "Feature",
        properties: {},
        geometry: {
            type: "LineString",
            coordinates: coords
        }
    };
    Journeys.addSource(Journeys.MapLayer.journey_route, route);

    const center = Journeys.getMidPoint(
        new mapboxgl.LngLat(useJourney.viewJourney.start?.longitude!, useJourney.viewJourney.start?.latitude!),
        new mapboxgl.LngLat(useJourney.viewJourney.end?.longitude!, useJourney.viewJourney.end?.latitude!)
    );
    Journeys.JourneysMap.easeTo({
        animate: true,
        duration: 3000,
        center: [center.lng, center.lat],
        zoom: 10
    });
}
</script>
<style>
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
    height: 90%;
    overflow-y: auto;
    flex-wrap: nowrap;
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
    height: 90%;
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
    position: absolute;
    bottom: 10px;
    min-height: 300px;
    height: 40%;
    width: 100%;
}

.marker {
    display: block;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    padding: 0;
}
</style>
