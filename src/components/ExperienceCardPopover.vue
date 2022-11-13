<template>
    <ion-list>
        <ion-item button @click="onEdit">edit</ion-item>
        <ion-item button @click="onDelete">delete</ion-item>
    </ion-list>
</template>
<script lang="ts" setup>
import { IonItem, IonList, popoverController, alertController, modalController } from "@ionic/vue";
import { useJourneyStore } from "stores/useJourneyStore";
import { ExperienceDto } from "types/dtos";
import { showToast } from "utils/utils";
import EditExperienceModal from "./Modals/EditExperienceModal.vue";

const props = defineProps<{
    journey: string;
    experience: ExperienceDto;
}>();

const journeyStore = useJourneyStore();

async function onEdit() {
    const experience = props.experience as ExperienceDto;
    experience.journey = {
        id: props.journey
    };

    popoverController.dismiss();
    const modal = await modalController.create({
        component: EditExperienceModal,
        componentProps: {
            experience: {
                experience: experience.experience
            }
        },
        keyboardClose: false
    });

    await modal.present();
}

async function onDelete() {
    const exp = props.experience as ExperienceDto;
    exp.journey = {
        id: props.journey
    };
    popoverController.dismiss();

    const alert = await alertController.create({
        header: "Warning",
        subHeader: "You are about to delete this experience, this action is irreversible",
        message: "Do you wish to proceed?",
        buttons: [
            {
                text: "Yes",
                role: "proceed",
                handler: async () => {
                    await journeyStore.removeExperience(exp);
                    journeyStore.editJourney.journey!.experiences =
                        journeyStore.editJourney.journey!.experiences!.filter((el) => el.poi.id != exp.poi.id);
                    showToast("Experience deleted", "success");
                }
            },
            "No"
        ]
    });
    await alert.present();
}
</script>
