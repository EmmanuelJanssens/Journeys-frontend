<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Edit journey</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-grid>
                <ion-row>
                    <ion-col>
                        <ion-item>
                            <ion-label position="stacked"> JourneyTitle </ion-label>
                            <ion-input type="text" :value="props.journey?.title" v-model="title" /> </ion-item
                    ></ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <ion-item>
                            <ion-label position="stacked">Description</ion-label>
                            <ion-textarea :value="props.journey?.description" v-model="description"> </ion-textarea>
                        </ion-item>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
        <ion-footer>
            <ion-toolbar>
                <ion-button slot="end" color="secondary"> cancel </ion-button>
                <ion-button slot="end" @click="save"> Save </ion-button>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>
<script lang="ts" setup>
import {
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonTitle,
    IonPage,
    IonContent,
    IonHeader,
    IonFooter,
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    modalController
} from "@ionic/vue";
import { useJourneyStore } from "stores/useJourneyStore";
import { useUserStore } from "stores/useUserStore";
import { JourneyDto } from "types/dtos";
import { showToast } from "utils/utils";
import { ref } from "vue";

const userStore = useUserStore();
const useJourney = useJourneyStore();

const props = defineProps<{
    journey: JourneyDto;
}>();

const title = ref();
const description = ref();

async function save() {
    useJourney.editJourney.journey = await useJourney.getJourney(props.journey.id!);
    useJourney.editJourney.journey!.title = title.value ? title.value : useJourney.editJourney.journey!.title;
    useJourney.editJourney.journey!.description = description.value
        ? description.value
        : useJourney.editJourney.journey!.description;
    useJourney.editJourney.journey!.id = props.journey.id;

    await useJourney.updateJourney("");

    modalController.dismiss({ status: "success" });

    const edited = userStore.myJourneys?.find((journey) => journey.id == props.journey.id);

    if (edited) {
        edited.title = useJourney.editJourney.journey!.title;
        edited.description = useJourney.editJourney.journey!.description;
    }
    await showToast("Your journey  was successfully updated", "success");
}
</script>
