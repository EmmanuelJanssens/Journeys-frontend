<template>
    <ion-modal trigger="open-save-journey-modal">
        <ion-header>
            <ion-toolbar>
                <ion-title> Save your journey </ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="dismissModal">
                        <ion-icon
                            size="large"
                            src="/src/assets/icon/close-outline.svg"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <section class="modal-content">
                <div class="form-field">
                    <ion-item class="ion-margin">
                        <ion-label position="floating">
                            Journey Title
                        </ion-label>
                        <ion-input type="text" v-model="title"> </ion-input>
                    </ion-item>
                </div>
            </section>
        </ion-content>
        <ion-footer>
            <ion-toolbar>
                <ion-button slot="end" @click="saveJourney"> save </ion-button>
            </ion-toolbar>
        </ion-footer>
    </ion-modal>
</template>
<script lang="ts" setup>
import { useJourneyStore } from "../stores/useJourneyStore";
import {
    IonItem,
    IonInput,
    IonLabel,
    IonModal,
    IonHeader,
    IonTitle,
    IonButton,
    IonButtons,
    IonToolbar,
    IonContent,
    IonFooter,
    IonIcon,
    modalController
} from "@ionic/vue";
import { ref } from "vue";
const title = ref();
const useJourney = useJourneyStore();
function dismissModal() {
    modalController.dismiss();
}

function saveJourney() {
    useJourney.saveJourney(title.value);
}
</script>
