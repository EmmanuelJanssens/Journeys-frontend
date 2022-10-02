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
                                            <ion-button
                                                slot="primary"
                                                @click="
                                                    openJourneyCreationModal
                                                ">
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
                                <ion-row class="mid-page" ref="slides">
                                    <swiper
                                        :slides-per-view="slidesPerView"
                                        :space-between="10"
                                        :initial-slide="
                                            useUser.myJourneys?.length
                                        "
                                        :pagination="{ clickable: true }"
                                        navigation
                                        lazy
                                        :modules="modules">
                                        <swiper-slide
                                            v-for="item in useUser.myJourneys">
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
                    <ion-col class="side ion-hide-sm-down"> </ion-col>
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
    onIonViewWillEnter,
    modalController,
    onIonViewDidLeave
} from "@ionic/vue";
import JourneysHeader from "components/JourneysHeader.vue";
import JourneyCard from "components/JourneyCard.vue";
import { ref } from "vue";
import { useUserStore } from "stores/useUserStore";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Navigation, Lazy } from "swiper";

// Import Swiper and modules
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import CreateJourneyModalVue from "components/Modals/CreateJourneyModal.vue";

const slidesPerView = ref(0);
const useUser = useUserStore();
const modules = ref([Pagination, Navigation, Lazy]);

const slides = ref();
onIonViewDidLeave(() => {
    window.removeEventListener("resize", updateView);
});
onIonViewWillEnter(() => {
    window.addEventListener("resize", updateView);
    useUser.fetchMyJourneys().then((response) => {
        if (response) {
            updateView();
        }
    });
});

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
                slidesPerView.value = Math.floor(width / 400);
            }
        }
    }
}
async function openJourneyCreationModal() {
    const modal = await modalController.create({
        component: CreateJourneyModalVue
    });
    modal.present();
}
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
    width: 100%;
    height: 100%;
}

.swiper-slide {
    text-align: center;
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
</style>
