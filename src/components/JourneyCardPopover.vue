<template>
    <ion-list>
        <ion-item button @click="onEdit">edit</ion-item>
        <ion-item button @click="onDelete">delete</ion-item>
    </ion-list>
</template>
<script lang="ts" setup>
import { IonItem, IonList, popoverController, alertController, modalController } from "@ionic/vue";
import EditJourneyModal from "components/Modals/EditJourneyModal.vue";
import { useJourneyStore } from "stores/useJourneyStore";
import { useUserStore } from "stores/useUserStore";
import { JourneyDto } from "types/dtos";
import { showToast } from "utils/utils";

const props = defineProps<{
    journey: JourneyDto;
}>();

const useJourney = useJourneyStore();
const useUser = useUserStore();

async function onEdit() {
    popoverController.dismiss();
    const modal = await modalController.create({
        component: EditJourneyModal,
        keyboardClose: false
    });

    await modal.present();
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
                }
            },
            "No"
        ]
    });
    await alert.present();
}
</script>
