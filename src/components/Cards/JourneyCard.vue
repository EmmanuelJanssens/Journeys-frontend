<template>
    <ion-card>
        <ion-card-header>
            <ion-toolbar color="none">
                <ion-card-title>{{ props.journey.title }}</ion-card-title>
                <ion-buttons slot="end">
                    <ion-button @click="goToJourney(props.journey.id!)">
                        <ion-icon :icon="eyeOutline" slot="icon-only"></ion-icon>
                    </ion-button>
                    <ion-button @click="onEdit">
                        <ion-icon :icon="pencilOutline" slot="icon-only"></ion-icon>
                    </ion-button>
                    <ion-button @click="onDelete">
                        <ion-icon :icon="trashBinOutline" slot="icon-only"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-card-header>
        <ion-img v-if="props.journey.thumbnail" class="thumbnail" :src="props.journey.thumbnail"></ion-img>
        <ion-img
            v-else
            class="thumbnail"
            src="https://firebasestorage.googleapis.com/v0/b/journeys-v2/o/images%2Fplaceholder.png?alt=media"></ion-img>
        <section class="content ion-margin">
            <ion-text>
                {{ props.journey.description }}
            </ion-text>
        </section>
    </ion-card>
</template>

<script lang="ts" setup>
import {
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonImg,
    IonIcon,
    IonText,
    popoverController,
    modalController,
    alertController
} from "@ionic/vue";
import EditJourneyModal from "components/Modals/EditJourneyModal.vue";
import { eyeOutline, pencilOutline, trashBinOutline } from "ionicons/icons";
import { useJourneyStore } from "stores/useJourneyStore";
import { useUserStore } from "stores/useUserStore";
import { JourneyDto } from "types/dtos";
import { showToast } from "utils/utils";

const props = defineProps<{
    journey: JourneyDto;
}>();

const emit = defineEmits(["headerClicked", "upated"]);
const useJourney = useJourneyStore();
const useUser = useUserStore();
async function onEdit() {
    const modal = await modalController.create({
        component: EditJourneyModal,
        componentProps: props,
        keyboardClose: false
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data && data.status === "success") emit("upated");
}

async function onDelete() {
    popoverController.dismiss();

    const alert = await alertController.create({
        header: "Warning",
        subHeader: "You are about to delete this journey, this action is action is irreversible",
        message: "Do you wish to proceed?",
        buttons: [
            {
                text: "Yes",
                role: "proceed",
                handler: async () => {
                    await useJourney.removeJourney(props.journey.id!);
                    useUser.removeJourney(props.journey.id!);
                    showToast("Journey deleted", "success");
                    emit("upated");
                }
            },
            "No"
        ]
    });
    await alert.present();
}
async function goToJourney(id: string) {
    emit("headerClicked", id);
}
</script>
<style scoped lang="less">
.thumbnail {
    height: 200px;
}
ion-card-header {
    cursor: pointer;
}
ion-card {
    max-height: 400px;
    min-height: 400px;
    display: flex;
    flex-direction: column;
}
.content {
    overflow: auto;
}
</style>
