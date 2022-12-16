<template>
    <div class="absolute flex flex-col left-0 right-0 top-0 bottom-0 shadow-inner">
        <div class="relative z-10 h-1/3 sm:h-1/3">
            <div class="absolute h-full w-full bg-black bg-opacity-50"></div>

            <div class="absolute navbar z-50">
                <div class="navbar-start">
                    <!-- <img src="/assets/images/logo.png" alt="logo" /> -->
                    <div class="navbar-item">
                        <button class="btn btn-ghost normal-case text-xl"></button>
                    </div>
                </div>
                <div class="navbar-end" v-if="windowSize.width.value > 600">
                    <button
                        v-if="!userStore.state.isLoggedIn"
                        class="btn btn-secondary"
                        @click="journeyModalController.open('login')">
                        LOGIN
                    </button>

                    <button
                        v-if="userStore.state.isLoggedIn"
                        class="btn btn-secondary mr-4"
                        @click="router.push('logbook')">
                        LOGBOOK
                    </button>
                    <button v-if="userStore.state.isLoggedIn" class="btn btn-secondary" @click="userStore.logout">
                        LOGOUT
                    </button>
                </div>
            </div>
            <div class="absolute z-40 items-center justify-center h-full w-full flex flex-col">
                <section class="text-high-contrast-text text-center container">
                    <h1 class="text-7xl sm:text-9xl mb-8 font-thin">JOURNEYS</h1>
                    <!-- <p class="text-xl font-thin">Journal like you never have before</p> -->

                    <div
                        class="flex flex-col sm:flex-row items-center sm:m-16 space-y-4 sm:space-y-0 justify-center"
                        v-if="windowSize.width.value > 600">
                        <div
                            :class="{
                                'grow transition-all ': true,
                                'duration-1000 ease-in-out translate-x-full': !validJourney.start.valid
                            }">
                            <GoogleAutoComplete
                                v-model="validJourney.start.text"
                                placeholder="Start by entering your starting point"
                                :type="['locality']"
                                @selected="setStart"
                                @dirty="
                                    () => {
                                        validJourney.start.valid = false;
                                        poiCount = 0;
                                    }
                                " />
                        </div>
                        <span
                            :class="{
                                'w-1/3 h-1 bg-black hidden sm:block origin-left transition-all ease-in-out ': true,
                                'duration-1000 scale-x-0 opacity-0': !validJourney.start.valid,
                                'duration-1000 scale-x-100  opacity-100': validJourney.start.valid
                            }" />
                        <div
                            :class="{
                                'grow transition-all': true,
                                'duration-1000 -translate-x-24 opacity-0 ': !validJourney.start.valid,
                                'duration-1000 translate-x-0 opacity-100 delay-200': validJourney.start.valid
                            }">
                            <GoogleAutoComplete
                                v-model="validJourney.end.text"
                                placeholder="Now your destination"
                                :type="['locality']"
                                @selected="setEnd"
                                @dirty="
                                    () => {
                                        validJourney.end.valid = false;
                                        poiCount = 0;
                                    }
                                " />
                        </div>

                        <div
                            :class="{
                                'sm:hidden': true,
                                'transition-all -translate-x-60 opacity-0': poiCount == 0,
                                'transition-all translate-x-0 opacity-100': poiCount > 0
                            }">
                            <p>{{ poiCount }} pois found!</p>
                        </div>
                    </div>
                    <div
                        ref="poiCountEl"
                        :class="{
                            '': true,
                            'sm:absolute sm:left-0 sm:w-1/2 hidden sm:block': true,
                            'sm:transition-all sm:-translate-x-full': poiCount == 0,
                            'sm:transition-all sm:translate-x-0': poiCount > 0
                        }">
                        <div
                            class="flex flex-col items-center justify-center space-x-4 rounded-r-md p-2 drop-shadow-lg sm:bg-secondary-light sm:dark:bg-primary-contrast-text sm:flex-row sm:justify-end">
                            <p>{{ poiCount }} pois found!</p>
                            <button class="btn btn-accent" @click="pushLogbook">Start now!</button>
                        </div>
                    </div>
                </section>

                <!-- <div v-if="windowSize.width.value > 400" class="flex justify-end p-4 space-x-4">
                    <button
                        v-if="!userStore.state.isLoggedIn"
                        class="btn btn-secondary"
                        @click="journeyModalController.open('login')">
                        LOGIN
                    </button>

                    <button v-if="userStore.state.isLoggedIn" class="btn btn-secondary" @click="router.push('logbook')">
                        LOGBOOK
                    </button>
                    <button v-if="userStore.state.isLoggedIn" class="btn btn-secondary" @click="userStore.logout">
                        LOGOUT
                    </button>
                </div> -->
            </div>

            <img class="object-cover h-full w-full" src="/assets/images/map.jpeg" alt="header" />
        </div>

        <div class="sm:relative overflow-auto bg-primary-light dark:bg-gray-800 p-4 sm:p-0 z-0">
            <div class="mx-auto container">
                <section class="flex flex-col sm:flex-row items-start">
                    <div class="w-1/2">
                        <h1 class="sm:text-5xl my-6 text-2xl font-bold text-primary-darker dark:text-primary-main">
                            Journal your outings
                        </h1>
                        <p class="mb-4 text-primary-darker dark:text-primary-dark">
                            Use our app to journal your outings . You can also use it to plan your next trip! Your
                            pictures and experiences will be shared with the community anonymously.
                        </p>
                        <p class="mb-4 text-primary-darker dark:text-primary-dark">
                            Can't find what you're looking for? Create a new poi and share it with other users
                        </p>
                    </div>
                    <swiper class="w-full sm:w-80 my-6" :effect="'cards'" :modules="modules" :grab-cursor="true">
                        <swiper-slide class="rounded-2xl shadow-lg">
                            <ExperienceCard
                                class="h-full"
                                mode="preview"
                                :experience="{
                                    date: '2021-05-01',
                                    title: 'At the bar',
                                    description:
                                        'fancy new bar opened in town I had to check it out! I was not deceived',
                                    images: [
                                        'https://images.unsplash.com/photo-1543007630-9710e4a00a20?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1335&q=80'
                                    ]
                                }"
                                :poi="{
                                    name: 'The bar',
                                    location: {
                                        latitude: 45.764043,
                                        longitude: 4.835659
                                    }
                                }" />
                        </swiper-slide>
                        <swiper-slide class="rounded-2xl shadow-lg">
                            <ExperienceCard
                                class="h-full shadow-lg"
                                mode="preview"
                                :experience="{
                                    date: '2021-05-01',
                                    title: 'Eat out',
                                    description: 'Went out eating with some friends',
                                    images: [
                                        'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1335&q=80'
                                    ]
                                }"
                                :poi="{
                                    name: 'Restaurant',
                                    location: {
                                        latitude: 45.764043,
                                        longitude: 4.835659
                                    }
                                }" />
                        </swiper-slide>
                        <swiper-slide class="rounded-2xl shadow-lg">
                            <ExperienceCard
                                class="h-full shadow-lg"
                                mode="preview"
                                :experience="{
                                    date: '2021-05-01',
                                    title: 'Out at the museum',
                                    description:
                                        'Never been to an art museum but I must say the paintings where Awesome ',
                                    images: [
                                        'https://images.unsplash.com/photo-1554907984-15263bfd63bd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
                                    ]
                                }"
                                :poi="{
                                    name: 'Museum',
                                    location: {
                                        latitude: 45.764043,
                                        longitude: 4.835659
                                    }
                                }" />
                        </swiper-slide>
                    </swiper>

                    <!-- <div class="columns-1 md:columns-2 lg:columns-3 -scroll-my-16 space-y-4 gap-x-4">

                        <card-preview
                            description="A fancy new bar opened in town I had to check it out! I was not deceived"
                            image="https://images.unsplash.com/photo-1543007630-9710e4a00a20?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1335&q=80" />
                        <card-preview
                            description="I was hungry and I wanted to discover a new restaurant, good food and friendly people"
                            image="https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1335&q=80" />
                        <card-preview
                            description="Never been to an art museum but I must say the paintings where Awesome"
                            image="https://images.unsplash.com/photo-1554907984-15263bfd63bd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" />
                        <card-preview
                            description="Traditional housings are the best"
                            image="https://images.unsplash.com/photo-1596178196494-c9a3d1b1c151?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1065&q=80" />
                    </div> -->
                </section>
                <section class="sm:py-8">
                    <h1 class="sm:text-5xl my-6 text-2xl font-bold text-primary-darker dark:text-primary-main">
                        Get started now
                    </h1>
                    <div class="flex flex-wrap justify-center">
                        <div class="flex flex-col space-x-4 max-w-xl p-2 justify-center items-center space-y-4">
                            <p class="text-primary-darker dark:text-primary-dark">
                                open your personal logbook and see A list of journeys you have saved.
                            </p>
                            <img
                                class="w-4/5 object-cover rounded-xl drop-shadow-lg"
                                src="/assets/images/features/featureImg1.png"
                                alt="thumbnail" />
                        </div>
                        <div class="flex flex-col space-x-4 max-w-xl p-2 justify-center items-center space-y-4">
                            <p class="text-primary-darker dark:text-primary-dark">
                                Add various activities to your journey, you can save them to edit them later on, or you
                                can immediatly write your story
                            </p>
                            <img
                                class="w-4/5 object-cover rounded-xl drop-shadow-lg"
                                src="/assets/images/features/featureImg3.png"
                                alt="thumbnail" />
                        </div>
                    </div>
                </section>

                <section class="">
                    <div>
                        <p class="sm:w-1/3 p-4 text-primary-darker dark:text-primary-dark">
                            The original product was made by a team of 5 students, but was remade to accomodate further
                            improvements and broaden my knowledge
                        </p>
                        <p class="p-4 text-primary-darker dark:text-primary-dark">
                            Original product on <a href="https://gitlab.com/pdg-journeys/journeys">Gitlab</a>
                            <font-awesome-icon class="ml-1" :icon="faGitlab" />
                        </p>
                    </div>
                </section>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { useWindowSize } from "@vueuse/core";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faGitlab } from "@fortawesome/free-brands-svg-icons";

import { useUserStore } from "stores/useUserStore";
import { usePoiStore } from "stores/usePoiStore";
import { getMidPoint, getRadius } from "utils/utils";

import { getGeocodedData } from "google/googleGeocoder";

import router from "router/router";

import { LngLat } from "mapbox-gl";
import { AddressDto } from "types/dtos";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";

import GoogleAutoComplete from "components/jAutocomplete/GoogleAutoComplete.vue";
import CardPreview from "components/CardPreview.vue";
import ExperienceCard from "components/jCards/ExperienceCard.vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { EffectCards } from "swiper";
import "swiper/css";

import "swiper/css/effect-cards";
let userStore = useUserStore();
let poiStore = usePoiStore();

const poiCount = ref(0);
const poiCountEl = ref();

const modules = ref([EffectCards]);

function pushLogbook() {
    const start = JSON.stringify({
        latitude: geocoded.start.latitude,
        longitude: geocoded.start.longitude
    });
    const end = JSON.stringify({
        latitude: geocoded.end.latitude,
        longitude: geocoded.end.longitude
    });

    let routeParams = `/edit?mode=new&start=${geocoded.start.address}&startLoc=${start}&end=${geocoded.end.address}&endLoc=${end}`;
    routeParams = encodeURI(routeParams);
    router.push(routeParams);
}

const validJourney = ref<{
    start: {
        text: string;
        valid: boolean;
    };
    end: {
        text: string;
        valid: boolean;
    };
}>({
    start: {
        text: "",
        valid: false
    },
    end: {
        text: "",
        valid: false
    }
});

let geocoded: {
    start: AddressDto;
    end: AddressDto;
};
function setStart(value: string) {
    validJourney.value.start.text = value;
    validJourney.value.start.valid = true;
}
function setEnd(value: string) {
    validJourney.value.end.text = value;
    validJourney.value.end.valid = true;
}

watch(
    () => validJourney,
    async (valid) => {
        if (valid.value.start.valid && valid.value.end.valid) {
            if (valid.value.start.text.length > 0 && valid.value.end.text.length > 0) {
                const start = await getGeocodedData(valid.value.start.text);
                const end = await getGeocodedData(valid.value.end.text);
                geocoded = {
                    start,
                    end
                };
                const mid = getMidPoint(
                    new LngLat(start.longitude, start.latitude),
                    new LngLat(end.longitude, end.latitude)
                );
                const radius = getRadius(
                    new LngLat(start.longitude, start.latitude),
                    new LngLat(end.longitude, end.latitude)
                );
                poiCount.value = await poiStore.poiCountBetween(mid.lat, mid.lng, radius);
            } else {
                //
            }
        }
    },
    {
        deep: true
    }
);

const windowSize = useWindowSize();
</script>
<style></style>
