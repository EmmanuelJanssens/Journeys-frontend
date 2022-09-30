<!-- eslint-disable vue/valid-v-for -->
<template>
    <ion-page>
        <JourneysHeader />
        <ion-content>
            <ion-grid class="full-page">
                <ion-row class="full-page">
                    <ion-col class="side ion-hide-md-down"> side </ion-col>
                    <ion-col>
                        <ion-grid class="full-page content">
                            <ion-content>
                                <ion-row class="">
                                    <ion-toolbar color="secondary">
                                        <ion-buttons slot="end">
                                            <ion-button slot="primary">
                                                create
                                            </ion-button>
                                        </ion-buttons>
                                        <ion-buttons slot="start">
                                            <ion-button>cards</ion-button>
                                            <ion-button>list</ion-button>
                                            <ion-button>order</ion-button>
                                        </ion-buttons>
                                    </ion-toolbar>
                                </ion-row>
                                <ion-row class="mid-page">
                                    <swiper
                                        :slides-per-view="4"
                                        :space-between="30"
                                        :pagination="{ clickable: true }"
                                        navigation
                                        lazy
                                        :modules="modules">
                                        <swiper-slide
                                            v-for="item in useJourney.userJourneysRef">
                                            <JourneyCard
                                                :journey="item"
                                                class="card" />
                                        </swiper-slide>
                                    </swiper>
                                </ion-row>
                                <ion-row class="mid-page"> Pois </ion-row>
                            </ion-content>
                        </ion-grid>
                    </ion-col>
                    <ion-col class="side ion-hide-sm-down"> second </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-page>
</template>
<script lang="ts" setup>
import {
    IonPage,
    IonContent,
    IonGrid,
    IonCol,
    IonRow,
    IonButton,
    IonToolbar,
    IonButtons,
    onIonViewWillEnter
} from "@ionic/vue";
import JourneysHeader from "../components/JourneysHeader.vue";
import JourneyCard from "../components/JourneyCard.vue";
import { useJourneyStore } from "../stores/useJourneyStore";
import { onMounted, ref } from "vue";
import { useUserStore } from "../stores/useUserStore";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Navigation, Lazy } from "swiper";

// Import Swiper and modules
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

const useJourney = useJourneyStore();
const useUser = useUserStore();
const modules = ref([Pagination, Navigation, Lazy]);

onIonViewWillEnter(() => {
    useJourney.fetchJourneysFromUser(useUser.userRef.userName);
});
</script>
<style>
.side {
    min-width: 200px;
    max-width: 600px;
}
.full-page {
    height: 100%;
}
.mid-page {
    height: 45%;
    overflow-y: auto;
    flex-wrap: nowrap;
}
.swiper {
    padding: 10px;
}
.red {
    background-color: red;
}
.blue {
    background-color: blue;
}
.green {
    background-color: green;
}
.yellow {
    background-color: yellow;
}
</style>
