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
                            <ion-textarea :value="props.journey?.description"> </ion-textarea>
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
import { showToast } from "utils/utils";
import { onMounted, ref } from "vue";

const useJourney = useJourneyStore();
const props = defineProps(["journey"]);
const title = ref();

async function save() {
    const updated = props.journey;
    updated.title = title.value;
    await useJourney.updateJourney(updated);
    modalController.dismiss({ status: "success" });
    await showToast("Your journey  was successfully updated", "success");
}
</script>
