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
                                                    @header-clicked="showExperiences(item.id!)" />
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
import mapboxgl from "mapbox-gl";
import GeoJSON from "geojson";
const slidesPerView = ref(3);
const useUser = useUserStore();
const useJourney = useJourneyStore();
const isLoading = ref(true);
const modules = ref([Pagination, Navigation, Lazy]);
const markers: mapboxgl.Marker[] = [];
var coords = Array<number[]>();

const slides = ref();
let map = ref<mapboxgl.Map>();

let statisticsCol = ref<typeof IonCol>();
let experiencesCol = ref();
let mapCol = ref();
let isLoaded = ref(false);

onIonViewWillEnter(async () => {
    isLoaded.value = false;
    window.addEventListener("resize", updateView);

    await useUser.fetchMyJourneys();
    updateView();

    const apiKey = import.meta.env.VITE_MAPTILER_API_KEY;

    mapboxgl.accessToken =
        "pk.eyJ1IjoiaGV5bWFudWVsIiwiYSI6ImNsOXR1Zm5tbDFlYm8zdXRmaDRwY21qYXoifQ.3A8osuJSSk3nzULihiAOPg";
    if (!map.value) {
        map.value = new mapboxgl.Map({
            container: "Map",
            style: `https://api.maptiler.com/maps/voyager/style.json?key=${apiKey}`,
            zoom: 3,
            center: [30, 50],
            projection: {
                name: "globe"
            }
        });
        load_once(map.value);
    } else {
        map.value?.resize();
    }
    map.value?.once("render", () => {
        map.value?.resize();
    });

    map.value.on("sourcedata", (e) => {
        if (e.isSourceLoaded && e.sourceId === "journeys" && e.sourceDataType == "metadata") isLoading.value = false;
        else if (e.isSourceLoaded && e.sourceId === "route") isLoading.value = false;
    });
});

onIonViewWillLeave(() => {
    useJourney.viewJourney = {};
    window.removeEventListener("resize", updateView);
});
onIonViewDidLeave(() => {
    if (map.value) {
        if (markers.length > 0) markers.forEach((marker) => marker.remove());

        var src = map.value.getSource("route") as mapboxgl.GeoJSONSource;
        if (src) {
            map.value.removeLayer("route");
            map.value.removeSource("route");
        }
        map.value.setZoom(3);
        coords = [];
    }
});
async function load_once(map: mapboxgl.Map) {
    map.once("load", () => {
        const geoJSONJourney: GeoJSON.FeatureCollection = {
            type: "FeatureCollection",
            features: []
        };
        useUser.myJourneys?.forEach((journey) => {
            geoJSONJourney.features.push(useJourney.journeyToGeojson(journey)[0]);
            geoJSONJourney.features.push(useJourney.journeyToGeojson(journey)[1]);
        });

        map?.addSource("journeys", {
            type: "geojson",
            data: geoJSONJourney,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50
        });

        map?.addLayer({
            id: "clusters",
            type: "circle",
            source: "journeys",
            filter: ["has", "point_count"],
            paint: {
                "circle-color": ["step", ["get", "point_count"], "#FFBA93", 100, "#FFECE0", 750, "#CC9676"],
                "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40]
            }
        });
        map?.addLayer({
            id: "cluster-count",
            type: "symbol",
            source: "journeys",
            filter: ["has", "point_count"],
            layout: {
                "text-field": "{point_count_abbreviated}",
                "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                "text-size": 12
            }
        });

        map?.addLayer({
            id: "unclustered-point",
            type: "circle",
            source: "journeys",
            filter: ["!", ["has", "point_count"]],
            paint: {
                "circle-color": "#FFBA93",
                "circle-radius": 6,
                "circle-stroke-width": 1,
                "circle-stroke-color": "#fff"
            }
        });
        map.resize();
        map?.setFog({});
    });
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
    isLoading.value = true;
    var src = map.value?.getSource("route") as mapboxgl.GeoJSONSource;
    if (src) {
        map.value?.removeLayer("route");
        map.value?.removeSource("route");
    }
    if (markers.length > 0) markers.forEach((marker) => marker.remove());
    console.log(id);
    if (useJourney.viewJourney.id !== id) useJourney.viewJourney = await useJourney.getJourney(id);
    coords = [];
    const exps: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: []
    };
    useJourney.viewJourney.experiences?.forEach((exp) => {
        exps.features.push({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [exp.poi.location.longitude, exp.poi.location.latitude]
            },
            properties: exp.experience,
            id: exp.poi.id
        });
    });
    console.log(useJourney.viewJourney);

    exps.features.forEach((exp) => {
        const el = document.createElement("div");
        el.className = "marker";
        if (exp.properties!.images.length > 0) el.style.backgroundImage = `url(${exp.properties!.images[0]})`;
        else
            el.style.backgroundImage =
                "url(https://firebasestorage.googleapis.com/v0/b/journeys-v2/o/images%2Fplaceholder.png?alt=media&token=c921b603-8028-42d4-a7a3-7b186f427c98)";
        el.style.backgroundSize = "100%";
        el.style.backgroundColor = "black";
        el.style.width = "30px";
        el.style.height = "30px";
        markers.push(
            new mapboxgl.Marker(el)
                .setLngLat(
                    new mapboxgl.LngLat(
                        (exp.geometry as GeoJSON.Point).coordinates[0],
                        (exp.geometry as GeoJSON.Point).coordinates[1]
                    )
                )
                .addTo(map.value!)
        );
    });

    coords.push([useJourney.viewJourney.start?.longitude!, useJourney.viewJourney.start?.latitude!]);
    exps.features.forEach((element) => {
        coords.push((element.geometry as GeoJSON.Point).coordinates);
    });
    coords.push([useJourney.viewJourney.end?.longitude!, useJourney.viewJourney.end?.latitude!]);

    map.value?.addSource("route", {
        type: "geojson",
        data: {
            type: "Feature",
            properties: {},
            geometry: {
                type: "LineString",
                coordinates: coords
            }
        }
    });
    map.value?.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
            "line-join": "round",
            "line-cap": "round"
        },
        paint: {
            "line-color": "#555",
            "line-width": 2
        }
    });

    const center = getMidPoint(
        new mapboxgl.LngLat(useJourney.viewJourney.start?.longitude!, useJourney.viewJourney.start?.latitude!),
        new mapboxgl.LngLat(useJourney.viewJourney.end?.longitude!, useJourney.viewJourney.end?.latitude!)
    );
    map.value?.easeTo({
        animate: true,
        duration: 3000,
        center: [center.lng, center.lat],
        zoom: 10
    });
}

function getMidPoint(start: mapboxgl.LngLat, end: mapboxgl.LngLat) {
    const lat1 = (start.lat * Math.PI) / 180;
    const lon1 = (start.lng * Math.PI) / 180;
    const X1 = Math.cos(lat1) * Math.cos(lon1);
    const Y1 = Math.cos(lat1) * Math.sin(lon1);
    const Z1 = Math.sin(lat1);

    const lat2 = (end.lat * Math.PI) / 180;
    const lon2 = (end.lng * Math.PI) / 180;
    const X2 = Math.cos(lat2) * Math.cos(lon2);
    const Y2 = Math.cos(lat2) * Math.sin(lon2);
    const Z2 = Math.sin(lat2);

    const x = (X1 + X2) / 2;
    const y = (Y1 + Y2) / 2;
    const z = (Z1 + Z2) / 2;

    var lon = Math.atan2(y, x);
    var hyp = Math.sqrt(x * x + y * y);
    var lat = Math.atan2(z, hyp);
    lat = (lat * 180) / Math.PI;
    lon = (lon * 180) / Math.PI;

    return {
        lat: lat,
        lng: lon
    };
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
