<!-- eslint-disable vue/valid-v-for -->
<template>
    <ion-page id="main-content">
        <ion-content>
            <ion-grid class="full-page">
                <ion-row class="full-page">
                    <ion-col class="side ion-hide-md-down experience-list">
                        <DynamicScroller
                            :items="useUser.myExperiences"
                            :min-item-size="54"
                            style="height: 100%">
                            <template v-slot="{ item, index, active }">
                                <DynamicScrollerItem
                                    :item="item"
                                    :active="active"
                                    :data-index="index">
                                    <ion-item button @click="editJourney(item)">
                                        <ion-thumbnail slot="start">
                                            <ion-img
                                                v-if="
                                                    item.experience.images
                                                        .length > 0
                                                "
                                                :src="
                                                    item.experience.images[0]
                                                ">
                                            </ion-img>
                                            <ion-img
                                                v-else
                                                src="src/assets/placeholder.png">
                                            </ion-img>
                                        </ion-thumbnail>
                                        <ion-label>
                                            <h3>
                                                {{ item.poi.name }}
                                            </h3>
                                            <p>{{ item.journey.title }}</p>
                                            <p>
                                                {{
                                                    item.experience.description
                                                }}
                                            </p>
                                        </ion-label>
                                    </ion-item>
                                </DynamicScrollerItem>
                            </template>
                        </DynamicScroller>
                    </ion-col>
                    <ion-col>
                        <ion-grid
                            class="full-page slides ion-no-margin ion-no-padding">
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
                                                class="journey-card ion-margin" />
                                        </swiper-slide>
                                    </swiper>
                                </ion-row>
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
    onIonViewDidLeave,
    IonItem,
    IonList,
    IonLabel,
    IonThumbnail,
    IonImg
} from "@ionic/vue";
import JourneyCard from "components/Cards/JourneyCard.vue";
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
import { useJourneyStore } from "stores/useJourneyStore";
import editExperienceModal from "components/Modals/editExperienceModal.vue";
import { openModal } from "utils/utils";
import { ExperienceDto } from "types/dtos";

const slidesPerView = ref(3);
const useUser = useUserStore();
const useJourney = useJourneyStore();

const modules = ref([Pagination, Navigation, Lazy]);

const slides = ref();
onIonViewDidLeave(() => {
    window.removeEventListener("resize", updateView);
});
onIonViewWillEnter(async () => {
    window.addEventListener("resize", updateView);
    await useUser.fetchMyJourneys();
    updateView();
    await useUser.fetchMyExperiences();
});

function editJourney(exp: ExperienceDto) {
    openModal(editExperienceModal, { experience: exp });
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
                slidesPerView.value = Math.floor(width / 400);
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
</script>
<style>
.side {
    min-width: 200px;
    max-width: 400px;
}
.full-page {
    height: 100%;
}
.mid-page {
    height: 50%;
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
    height: 100%;
    overflow-y: auto;
    flex-wrap: nowrap;
}

.journey-card {
    min-width: 300px;
    min-height: 400px;
    height: 90%;
    width: 30%;
}
</style>
