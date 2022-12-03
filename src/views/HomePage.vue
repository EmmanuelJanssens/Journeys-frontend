<template>
    <div class="absolute flex flex-col left-0 right-0 top-0 bottom-0 shadow-inner">
        <div class="relative h-full bg-opacity-10 bg-header bg-cover z-0">
            <img src="/assets/images/banner/banner.png" class="hero object-cover h-full w-full absolute -z-10" />
            <!-- <svg
                class="absolute w-full left-0 rig"
                viewBox="0 0 1200 120"
                width="100%"
                data-name="Layer 1"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none">
                <path
                    d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                    opacity=".25"
                    class="fill-gray-800l"></path>
                <path
                    d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
                    opacity=".5"
                    class="fill-gray-800"></path>
                <path
                    d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
                    class="fill-gray-800"></path>
            </svg> -->

            <div class="flex container mx-auto z-50">
                <section class="text-high-contrast-text text-center sm:text-left">
                    <h1 class="text-7xl sm:text-9xl">Journeys</h1>
                    <p>It's not always about the destination</p>
                </section>
                <div class="z-50 w-full">
                    <div class="flex justify-end p-4 space-x-4">
                        <JourneyButton
                            v-if="!userStore.isLoggedIn"
                            type="secondary"
                            fill="fill"
                            @click="journeyModalController.open('login')">
                            LOGIN
                        </JourneyButton>

                        <JourneyButton
                            v-if="userStore.isLoggedIn"
                            type="secondary"
                            fill="fill"
                            @click="router.push('logbook')">
                            LOGBOOK
                        </JourneyButton>
                        <JourneyButton
                            v-if="userStore.isLoggedIn"
                            type="secondary"
                            fill="fill"
                            @click="userStore.logout">
                            LOGOUT
                        </JourneyButton>
                    </div>
                </div>
            </div>
        </div>

        <div class="sm:relative overflow-auto bg-primary-light dark:bg-gray-800 p-4 sm:p-0">
            <div class="mx-auto container">
                <section class="sm:py-8 space-y-4">
                    <h1
                        ref="title"
                        :class="{
                            'text-2xl font-bold sm:text-5xl my-6 text-primary-main': true
                        }">
                        Discover activities
                    </h1>

                    <p class="text-primary-darker dark:text-primary-dark">
                        From one point to another there will always be something to do, discover immediatly by entering
                        your starting point and destination
                    </p>

                    <div class="flex flex-col sm:flex-row items-center sm:m-16 space-y-4 sm:space-y-0 justify-center">
                        <div class="grow">
                            <GoogleAutoComplete
                                :text="validJourney.start.text"
                                placeholder="Start"
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
                                'w-1/3 h-1 bg-black hidden sm:block origin-left': true,
                                'transition-all ease-out scale-x-0 opacity-0': !validJourney.start.valid,
                                'transition-all ease-in scale-x-100 duration-200 opacity-100': validJourney.start.valid
                            }" />
                        <div
                            :class="{
                                ' grow ': true,
                                'transition-all ease-out -translate-x-24 opacity-0 ': !validJourney.start.valid,
                                'transition-all ease-in translate-x-0 opacity-100 delay-200': validJourney.start.valid
                            }">
                            <GoogleAutoComplete
                                :text="validJourney.end.text"
                                placeholder="End"
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
                            <JourneyButton @click="pushLogbook"> Start now! </JourneyButton>
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
                            <JourneyButton type="secondary" @click="pushLogbook"> Start now! </JourneyButton>
                        </div>
                    </div>
                </section>

                <section class="sm:py-8">
                    <h1 class="sm:text-5xl my-6 text-2xl font-bold text-primary-darker dark:text-primary-main">
                        Journal your outings
                    </h1>
                    <p class="sm:w-2/5 mb-4 text-primary-darker dark:text-primary-dark">
                        You may have done some things that you found interesting to keep in your memories and maybe
                        share them with others.
                    </p>
                    <div class="columns-1 md:columns-2 lg:columns-3 -scroll-my-16 space-y-4 gap-x-4">
                        <card-preview
                            image="https://images.unsplash.com/photo-1501555088652-021faa106b9b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1173&q=80"
                            description="I went for a little hike in the mountains not far from where I am, beutifull landscape as always" />
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
                    </div>
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
                                src="/assets/images/features/featureImg1.png" />
                        </div>
                        <div class="flex flex-col space-x-4 max-w-xl p-2 justify-center items-center space-y-4">
                            <p class="text-primary-darker dark:text-primary-dark">
                                Add various activities to your journey, and save them to edit later on
                            </p>
                            <img
                                class="w-4/5 object-cover rounded-xl drop-shadow-lg"
                                src="/assets/images/features/featureImg3.png" />
                        </div>
                    </div>
                </section>
                <!-- <section class="sm:py-8">
                        <div class="flex flex-col items-center space-y-4">
                            <p class="text-center w-96 text-primary-darker">
                                Trouble finding an activity? No problem, A simple search is at your disposition and as a
                                last resort you can even add your own activities to the vast dataset
                            </p>
                            <div>
                                <img
                                    class="object-cover w-[900px] h-[600px] rounded-3xl"
                                    src="/assets/placeholder.png" />
                            </div>
                        </div>
                    </section> -->

                <section class="">
                    <div>
                        <p class="w-1/3 p-4 text-primary-darker dark:text-primary-dark">
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

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faGitlab } from "@fortawesome/free-brands-svg-icons";

import { useUserStore } from "stores/useUserStore";
import { usePoiStore } from "stores/usePoiStore";
import { getMidPoint, getRadius } from "utils/utils";

import GoogleAutoComplete from "components/jAutocomplete/GoogleAutoComplete.vue";
import CardPreview from "./CardPreview.vue";

import { getGeocodedData } from "google/googleGeocoder";

import router from "router/router";

import { LngLat } from "mapbox-gl";
import { AddressDto } from "types/dtos";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";
import { useJourneyStore } from "stores/useJourneyStore";
import JourneyButton from "components/UI/Button/JourneyButton.vue";

let userStore = useUserStore();
let poiStore = usePoiStore();
let journeyStore = useJourneyStore();

const poiCount = ref(0);
const poiCountEl = ref();

function pushLogbook() {
    journeyStore.journey = {
        start: {
            latitude: geocoded.start.latitude,
            longitude: geocoded.start.longitude
        },
        end: {
            latitude: geocoded.end.latitude,
            longitude: geocoded.end.longitude
        }
    };
    journeyStore.journey.experiences = [];
    router.push("/edit?mode=new");
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
</script>
<style scoped lang="less">
::-webkit-scrollbar {
    height: 12px;
    width: 6px;
    background: #dae1db;
}

::-webkit-scrollbar-thumb {
    background: #a6cabd;
    -webkit-border-radius: 1ex;
    -webkit-box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.75);
    border-radius: 5%;
    box-shadow: none;
}

.shape {
    overflow: hidden;
    position: absolute;
}
.shape::before {
    content: "";
    font-family: "shape divider from ShapeDividers.com";
    position: absolute;
    z-index: 3;
    pointer-events: none;
    background-repeat: no-repeat;
    bottom: -0.1vw;
    left: -0.1vw;
    right: -0.1vw;
    top: -0.1vw;
    background-size: 90px 109%;
    background-position: 100% 50%;
    background-image: url('data:image/svg+xml;charset=utf8, <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2.17 35.28" preserveAspectRatio="none"><path d="M1.67 0c-.55 3.07.41 9.27 0 16.14-.4 6.88-.58 13.75.1 19.14h.4V0z" fill="%23fbd8c2"/><path d="M1.16 0c-.8 3.17.4 7.29.56 10.04C1.89 12.8.25 19.3.42 22.71c.16 3.43.84 4.65.86 7.05.03 2.4-.88 5.52-.88 5.52h1.77V0z" opacity=".5" fill="%23fbd8c2"/><path d="M.31 0c.84 2.56.3 7.68.43 11.79.12 4.1.61 6.86.28 9.58-.33 2.73-1.18 5.61-1 8.61.19 3 .82 4.73.84 5.3h1.2V0z" opacity=".5" fill="%23fbd8c2"/></svg>');
}

::-webkit-scrollbar-corner {
    background: #000;
}

.hero {
    -webkit-mask: url("/assets/images/layered-peaks-haikei.svg");
    max-width: 100%;
}
</style>
