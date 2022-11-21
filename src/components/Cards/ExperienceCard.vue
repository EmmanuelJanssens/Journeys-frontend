<template>
    <ion-card>
        <ion-card-header>
            <ion-toolbar color="none">
                <ion-card-title>{{ (props.experience.node as PoiDto).name }}</ion-card-title>
                <ion-card-subtitle>{{ props.experience.title }}</ion-card-subtitle>
                <ion-buttons slot="end">
                    <ion-button @click="onEdit">
                        <ion-icon :icon="pencilOutline" slot="icon-only"></ion-icon>
                    </ion-button>
                    <ion-button @click="onDelete">
                        <ion-icon :icon="trashBinOutline" slot="icon-only"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
            <ion-card-subtitle>{{ new Date(props.experience.date).toDateString() }}</ion-card-subtitle>
        </ion-card-header>
        <swiper
            :slides-per-view="1"
            :initial-slide="0"
            lazy
            :pagination="{
                clickable: true
            }"
            :autoplay="{
                delay: 3000,
                pauseOnMouseEnter: true
            }"
            :loop="true"
            :modules="modules">
            <swiper-slide v-for="image in props.experience.images" v-bind:key="image">
                <ion-img :src="image"></ion-img>
            </swiper-slide>
        </swiper>

        <section class="content ion-margin">
            {{ props.experience.description }}
        </section>
    </ion-card>
</template>

<script lang="ts" setup>
import {
    IonCard,
    IonToolbar,
    IonCardTitle,
    IonCardHeader,
    IonButton,
    IonButtons,
    IonImg,
    IonCardSubtitle,
    IonIcon,
    alertController,
    modalController
} from "@ionic/vue";

import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Lazy, Pagination, Autoplay } from "swiper";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import { ref } from "vue";
import EditExperienceModal from "components/Modals/EditExperienceModal.vue";
import { useJourneyStore } from "stores/useJourneyStore";
import { ExperienceDto, PoiDto } from "types/dtos";
import { showToast } from "utils/utils";
import { pencilOutline, trashBinOutline } from "ionicons/icons";

const props = defineProps<{
    experience: ExperienceDto;
    journey: string;
}>();

const emit = defineEmits<{
    (e: "updated"): void;
}>();

const modules = ref([Navigation, Lazy, Pagination, Autoplay]);
const useJourney = useJourneyStore();

async function onEdit() {
    const experience = props.experience as ExperienceDto;

    const modal = await modalController.create({
        component: EditExperienceModal,
        componentProps: {
            experience
        },
        keyboardClose: false
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data && data.status === "success") {
        emit("updated");
    }
}

async function onDelete() {
    const exp = props.experience as ExperienceDto;

    const alert = await alertController.create({
        header: "Warning",
        subHeader: "You are about to delete this experience, this action is action is irreversible",
        message: "Do you wish to proceed?",
        buttons: [
            {
                text: "Yes",
                role: "proceed",
                handler: async () => {
                    await useJourney.removeExperience(exp);
                    useJourney.viewJourney.experiencesConnection!.edges =
                        useJourney.viewJourney.experiencesConnection?.edges?.filter((el) => el.node.id != exp.node.id);
                    showToast("Experience deleted", "success");
                    emit("updated");
                }
            },
            "No"
        ]
    });
    await alert.present();
}
</script>

<style scoped>
ion-img {
    width: 90%;
    height: 300px;
}
.content {
    height: 100%;
    max-height: 200px;
    overflow-y: auto;
}
</style>
