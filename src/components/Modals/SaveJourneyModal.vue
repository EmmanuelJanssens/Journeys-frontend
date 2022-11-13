<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title> Save your journey </ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="dismissModal">
                        <ion-icon size="large" src="/src/assets/icon/close-outline.svg"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <section class="modal-content">
                <div class="form-field">
                    <ion-item class="ion-margin">
                        <ion-label position="stacked"> Journey Title </ion-label>
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
    </ion-page>
</template>
<script lang="ts" setup>
import { useJourneyStore } from "stores/useJourneyStore";
import {
    IonItem,
    IonInput,
    IonLabel,
    IonPage,
    IonHeader,
    IonTitle,
    IonButton,
    IonButtons,
    IonToolbar,
    IonContent,
    IonFooter,
    IonIcon,
    modalController,
    alertController
} from "@ionic/vue";
import { onMounted, ref } from "vue";
import { useUserStore } from "stores/useUserStore";
const title = ref();
const journeyStore = useJourneyStore();
const userStore = useUserStore();

const props = defineProps(["mode"]);

onMounted(() => {
    if (props.mode) title.value = journeyStore.editJourney.journey?.title;
});
function dismissModal() {
    modalController.dismiss("dismiss", "discarded");
}

async function saveJourney() {
    if (!userStore.IsLoggedIn()) {
        throw new Error("User is not logged in");
    }
    if (
        journeyStore.editJourney.journey?.start?.address!.length! <= 0 ||
        journeyStore.editJourney.journey?.end?.address!.length! <= 0
    ) {
        let alert = await alertController.create({
            header: "Error",
            message: "Your journey is not valid, Some values may be missing",
            buttons: ["Dismiss"]
        });
        alert.present();
    } else {
        var journeyId: string;
        if (props.mode == "editJourney") {
            journeyStore.editJourney.journey!.title = title.value;
            journeyId = await journeyStore.updateJourney();
            console.log("updated");
        } else {
            journeyId = await journeyStore.saveJourney(title.value);
        }

        const alert = await alertController.create({
            header: "Notification",
            message: "Your journey was saved successfuly",
            backdropDismiss: false,
            buttons: [
                {
                    text: "View",
                    role: "view",
                    handler: () => {
                        modalController.dismiss(journeyId, "view");
                    }
                },
                {
                    text: "Stay",
                    role: "stay",
                    handler: () => {
                        modalController.dismiss(null, "stay");
                    }
                }
            ]
        });
        await alert.present();
    }
}
</script>
