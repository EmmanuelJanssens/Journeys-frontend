<template>
    <ion-page class="absolute flex flex-col left-0 right-0 top-0 bottom-0 shadow-inner">
        <div class="relative">
            <img src="/assets/images/banner/mountains.jpg" class="object-cover h-full w-full absolute z-10" />

            <div class="container mx-auto">
                <div class="absolute z-50 w-full container">
                    <div class="flex justify-end p-4 space-x-4">
                        <button
                            v-if="!userStore.isLoggedIn"
                            class="text-secondary-light"
                            @click="openModal(RegisterModal)">
                            CREATE AN ACCOUNT
                        </button>
                        <button
                            v-if="!userStore.isLoggedIn"
                            class="text-high-contrast-text"
                            @click="openModal(LoginModal)">
                            LOGIN
                        </button>
                        <button
                            v-if="userStore.isLoggedIn"
                            class="text-high-contrast-text"
                            @click="router.push('logbook')">
                            LOGBOOk <font-awesome-icon :icon="faBookAtlas" />
                        </button>
                        <button v-if="userStore.isLoggedIn" class="text-high-contrast-text" @click="onPopOver">
                            PROFILE <font-awesome-icon :icon="faCaretDown" />
                        </button>
                    </div>
                </div>
                <section class="relative sm:h-96 z-20 text-high-contrast-text">
                    <h1 class="text-4xl sm:text-9xl">Journeys</h1>
                    <p>It's not always about the destination</p>
                </section>
            </div>
        </div>

        <div class="relative overflow-auto bg-primary-light dark:bg-primary-dark">
            <div class="static mx-auto container">
                <div clas="flex flex-col">
                    <section class="sm:py-8">
                        <div class="">
                            <h1 class="sm:text-5xl my-6">Discover activities</h1>
                        </div>

                        <p>No mather where you go there will always be a beginning and an end</p>

                        <div class="flex flex-col sm:flex-row items-center sm:m-16 justify-center">
                            <div class="relative grow">
                                <google-auto-complete
                                    :text="validJourney.start.text"
                                    placeholder="Start"
                                    @selected="setStart"
                                    @dirty="validJourney.start.valid = false" />
                            </div>
                            <span class="w-1/3 h-1 bg-black hidden sm:block"></span>
                            <div class="relative grow">
                                <google-auto-complete
                                    :text="validJourney.end.text"
                                    placeholder="End"
                                    @selected="setEnd"
                                    @dirty="validJourney.end.valid = false" />
                            </div>
                        </div>
                        <div class="sm:absolute sm:left-0 sm:w-1/2 border-l-" ref="poiCountEl">
                            <div
                                class="flex flex-col items-center justify-center space-x-4 rounded-r-md p-2 drop-shadow-lg bg-secondary-light dark:bg-secondary-dark sm:flex-row sm:justify-end sm:relative">
                                <p>{{ poiCount }} pois found!</p>
                                <button
                                    class="bg-primary-main dark:bg-primary-dark p-4 rounded-lg text-secondary-btn-contrast-text shadow-inner hover:bg-btn-dark dark:hover:bg-btn-darker transition-all ease-in transform hover:scale-110">
                                    Start now!
                                </button>
                            </div>
                        </div>
                    </section>
                    <section v-if="isPlatform('desktop')" class="relative sm:py-8">
                        <h1 class="sm:text-5xl my-6">Journal your outings</h1>
                        <p class="sm:w-2/5 mb-4">
                            You may have done some things in between that you found interesting and want to keep them
                            with you and maybe share them with others.
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
                    <section v-else class="p-4 sm:py-8">
                        <swiper class="h-full container w-80" :modules="modules" :effect="'cards'" :loop="true">
                            <swiper-slide>
                                <card-preview
                                    class="h-full"
                                    image="https://images.unsplash.com/photo-1501555088652-021faa106b9b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1173&q=80"
                                    description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam egestas odio sodales lorem suscipit blandit. Nulla faucibus metus vel nisi consequat, non varius ipsum finibus." />
                            </swiper-slide>
                            <swiper-slide>
                                <card-preview
                                    class="h-full"
                                    description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam egestas odio sodales lorem suscipit blandit. Nulla faucibus metus vel nisi consequat, non varius ipsum finibus."
                                    image="https://images.unsplash.com/photo-1543007630-9710e4a00a20?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1335&q=80" />
                            </swiper-slide>
                            <swiper-slide>
                                <card-preview
                                    class="h-full"
                                    description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam egestas odio sodales lorem suscipit blandit. Nulla faucibus metus vel nisi consequat, non varius ipsum finibus."
                                    image="https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1335&q=80" />
                            </swiper-slide>
                            <swiper-slide>
                                <card-preview
                                    class="h-full"
                                    description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam egestas odio sodales lorem suscipit blandit. Nulla faucibus metus vel nisi consequat, non varius ipsum finibus."
                                    image="https://images.unsplash.com/photo-1554907984-15263bfd63bd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" />
                            </swiper-slide>
                            <swiper-slide>
                                <card-preview
                                    class="h-full"
                                    description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam egestas odio sodales lorem suscipit blandit. Nulla faucibus metus vel nisi consequat, non varius ipsum finibus."
                                    image="https://images.unsplash.com/photo-1596178196494-c9a3d1b1c151?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1065&q=80" />
                            </swiper-slide>
                        </swiper>
                    </section>
                    <section class="relative sm:py-8">
                        <h1 class="sm:text-5xl my-6">Get started now</h1>
                        <div class="flex flex-wrap justify-center">
                            <div class="flex space-x-4 max-w-xl p-2">
                                <p class="w-48">
                                    open your personal logbook and see A list of journeys you have saved.
                                </p>
                                <img class="w-2/3 rounded-xl drop-shadow-lg" src="assets/placeholder.png" />
                            </div>
                            <div class="flex space-x-4 max-w-xl p-2">
                                <p class="w-48">
                                    Add various activities to your journey, and save them to edit later on
                                </p>
                                <img class="w-2/3 r rounded-xl drop-shadow-lg" src="assets/placeholder.png" />
                            </div>
                        </div>
                    </section>
                    <section class="relative sm:py-8">
                        <div class="flex flex-col items-center space-y-4">
                            <p class="text-center w-96">
                                Trouble finding an activity? No problem, A simple search is at your disposition and as a
                                last resort you can even add your own activities to the vast dataset
                            </p>
                            <div>
                                <img
                                    class="object-cover w-[900px] h-[600px] rounded-3xl"
                                    src="assets/placeholder.png" />
                            </div>
                        </div>
                    </section>

                    <section class="relative">
                        <div>
                            <p>
                                Original product on <a href="https://gitlab.com/pdg-journeys/journeys">Gitlab</a>
                                <font-awesome-icon class="ml-1" :icon="faGitlab" />
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </ion-page>
</template>

<script lang="ts" setup>
import { isPlatform, popoverController, IonPage } from "@ionic/vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { EffectCards } from "swiper";
import CardPreview from "./CardPreview.vue";
import { onMounted, ref, watch } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faCaretDown, faBookAtlas } from "@fortawesome/free-solid-svg-icons";
import { faGitlab } from "@fortawesome/free-brands-svg-icons";
import "swiper/css";
import "swiper/css/effect-cards";

import { getMidPoint, getRadius, openModal, showToast } from "utils/utils";
import LoginModal from "components/Modals/LoginModal.vue";
import RegisterModal from "components/Modals/RegisterModal.vue";
import ProfilePopover from "components/ProfilePopover.vue";
import { useUserStore } from "stores/useUserStore";
import router from "router/router";
import GoogleAutoComplete from "components/GoogleAutoComplete.vue";
import { usePoiStore } from "stores/usePoiStore";
import { getGeocodedData } from "google/googleGeocoder";
import { LngLat } from "mapbox-gl";
import { useMotion } from "@vueuse/motion";

const modules = ref([EffectCards]);

const userStore = useUserStore();
const poiStore = usePoiStore();
const poiCount = ref(0);
const poiCountEl = ref();

const validJourney = ref({
    start: {
        text: "",
        valid: false
    },
    end: {
        text: "",
        valid: false
    }
});

watch(
    () => validJourney,
    async (valid) => {
        if (valid.value.start.text.length > 0 && valid.value.end.text.length > 0) {
            const start = await getGeocodedData(valid.value.start.text);
            const end = await getGeocodedData(valid.value.end.text);
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
    },
    {
        deep: true
    }
);

function setStart(value: string) {
    validJourney.value.start.text = value;
    validJourney.value.start.valid = true;
}
function setEnd(value: string) {
    validJourney.value.end.text = value;
    validJourney.value.end.valid = true;
}
async function onPopOver(e: Event) {
    const popover = await popoverController.create({
        component: ProfilePopover,
        alignment: "start",
        event: e,
        reference: "trigger",
        size: "auto"
    });
    await popover.present();

    const data = await popover.onDidDismiss();
    if (data.data == "logout") {
        await userStore.logout();
        router.push("home");
        showToast("goodbye", "success");
    }
}

onMounted(() => {
    console.log();
});
</script>
<style scoped lang="less">
swiper {
    width: 100%;
}

.banner-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.overlay {
    pointer-events: none;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: black;
    opacity: 30%;
    z-index: 20;
}

@keyframes appear {
    0% {
        transform: translate();
        opacity: 1;
    }
    100% {
        transform: translate(-100%);
        opacity: 0;
        width: 0;
        height: 0;
    }
}

.bg {
    background-image: url("../assets/blurry-gradient-haikei.svg");
}

::-webkit-scrollbar {
    height: 12px;
    width: 12px;
    background: #6c9d89;
}

::-webkit-scrollbar-thumb {
    background: #687a6e;
    -webkit-border-radius: 1ex;
    -webkit-box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.75);
    border-radius: 5%;
    box-shadow: none;
}

::-webkit-scrollbar-corner {
    background: #000;
}
</style>
