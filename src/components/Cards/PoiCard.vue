<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <ion-content>
        <ion-card-header>
            <ion-card-title>{{ (props.poi as PoiDto).name }}</ion-card-title>
            <ion-card-subtitle>{{ title }}</ion-card-subtitle>
        </ion-card-header>
        <swiper @transitionEnd="setTitle" :slides-per-view="1" v-if="poiDetail?.journeysConnection?.edges?.length! > 0">
            <swiper-slide v-for="item in poiDetail?.journeysConnection.edges" v-bind:key="item.node.id">
                <ExperienceSlide v-if="item.images.length > 0" :exp="item" :thumbnail="item.images[0]" />
                <ExperienceSlide v-else :exp="item" :thumbnail="props.poi.thumbnail!" />
            </swiper-slide>
        </swiper>
        <ExperienceSlide
            v-else
            :exp="empty"
            thumbnail="https://firebasestorage.googleapis.com/v0/b/journeys-v2/o/images%2Fplaceholder.png?alt=media" />
        <ion-item>
            <ion-button @click="addToJourney(props.poi)" fill="clear" slot="end" size="default">
                <ion-icon :icon="addOutline"> </ion-icon>
            </ion-button>
        </ion-item>
    </ion-content>
</template>

<script lang="ts" setup>
import {
    IonIcon,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonButton,
    IonImg,
    popoverController
} from "@ionic/vue";

import { Swiper, SwiperSlide } from "swiper/vue";

import axios from "axios";
import { onMounted, ref } from "vue";

import { useJourneyStore } from "stores/useJourneyStore";
import { ExperienceDto, PoiDto } from "types/dtos";
import { usePoiStore } from "stores/usePoiStore";
import ExperienceSlide from "components/ExperienceSlide.vue";
import { addOutline } from "ionicons/icons";

const props = defineProps<{
    poi: PoiDto;
}>();
const poiDetail = ref<PoiDto>();
const useJourney = useJourneyStore();
const poiStore = usePoiStore();

const title = ref<string>("");

const empty: ExperienceDto = {
    description: "Nothing here yet",
    title: "Be the first to post",
    order: 0,
    date: "",
    images: [],
    node: {}
};
onMounted(async () => {
    poiDetail.value = await poiStore.getPoiExperiences(props.poi);
    title.value = poiDetail.value?.journeysConnection?.edges[0]?.title!;
    if (!title.value && !poiDetail.value?.journeysConnection?.edges) title.value = "Be the first";
});
function addToJourney(poi: PoiDto) {
    if (poi.thumbnail != undefined) delete poi.thumbnail;
    const experience: ExperienceDto = {
        title: "",
        date: new Date().toISOString(),
        description: "",
        images: [],
        order: useJourney.editJourney.journey!.experiencesConnection?.edges?.length!,
        node: poi
    };
    useJourney.addToJourney(experience);
    popoverController.dismiss({ poi });
}
onMounted(async () => {
    await axios.get(`/api/poi/${props.poi.id}/experiences`);
});

function setTitle(e: any) {
    title.value = poiDetail.value?.journeysConnection.edges[e.activeIndex].title!;
    //title.value = str;
}
</script>
<style lang="less">
ion-popover {
    &::part(content) {
        min-width: 400px;
    }
}
</style>
