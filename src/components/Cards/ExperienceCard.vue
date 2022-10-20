<template>
    <ion-card>
        <ion-card-header>
            <ion-toolbar color="none">
                <ion-card-title>{{ props.experience.poi.name }}</ion-card-title>
                <ion-buttons slot="end">
                    <ion-button @click="onPopover">
                        <ion-icon
                            size="large"
                            src="/src/assets/icon/ellipsis-vertical-outline.svg"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
            <ion-card-subtitle>{{
                props.experience.experience.date
            }}</ion-card-subtitle>
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
            <swiper-slide
                v-for="image in props.experience.experience.images"
                v-bind:key="image">
                <ion-img :src="image"></ion-img>
            </swiper-slide>
        </swiper>

        <section class="content ion-margin">
            {{ props.experience.experience.description }}
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
    popoverController
} from "@ionic/vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { ref } from "vue";

import { Navigation, Lazy, Pagination, Autoplay } from "swiper";
import ExperienceCardPopover from "components/ExperienceCardPopover.vue";
const props = defineProps(["experience", "journey"]);
const modules = ref([Navigation, Lazy, Pagination, Autoplay]);

async function onPopover(e: Event) {
    console.log(props);
    const popover = await popoverController.create({
        component: ExperienceCardPopover,
        componentProps: props,
        event: e,
        size: "auto",
        reference: "event",
        side: "left",
        alignment: "bottom"
    });
    await popover.present();
}
</script>

<style scoped>
ion-card {
    max-height: 100%;
    display: flex;
    flex-direction: column;
}
.content {
    overflow: auto;
}
</style>
