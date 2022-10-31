<template>
    <ion-card>
        <ion-card-header>
            <ion-toolbar color="none">
                <ion-card-title>{{ props.journey.title }}</ion-card-title>
                <ion-buttons slot="end">
                    <ion-button @click="goToJourney(props.journey.id)">
                        <ion-icon src="/src/assets/icon/eye-outline.svg" slot="icon-only"></ion-icon>
                    </ion-button>
                    <ion-button @click="onEdit">
                        <ion-icon src="/src/assets/icon/pencil-outline.svg" slot="icon-only"></ion-icon>
                    </ion-button>
                    <ion-button @click="onDelete">
                        <ion-icon src="/src/assets/icon/trash-bin-outline.svg" slot="icon-only"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
            <ion-card-subtitle>Subtitle</ion-card-subtitle>
        </ion-card-header>
        <ion-img src="/src/assets/featureImg3.png"></ion-img>

        <section class="content ion-margin">
            <ion-text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque tempus euismod felis, nec
                hendrerit metus fermentum in. Vivamus ante mi, auctor nec augue non, fermentum mollis mi. Aenean auctor
                quam sit amet nibh laoreet, pretium condimentum purus maximus. Nam id luctus massa, nec eleifend risus.
                Integer sagittis, neque vel laoreet pharetra, nulla odio pretium erat, sed varius sapien ante at nulla.
                Duis varius mattis tristique. Nullam vitae purus ut mi bibendum mattis. In a nisi facilisis, scelerisque
                augue eget, rutrum massa. Etiam sapien nunc, gravida vitae leo sed, fringilla accumsan odio. Maecenas ut
                dui mi. Maecenas efficitur metus arcu. Pellentesque ipsum nisl, molestie vel nisl id, porttitor vehicula
                lectus. Integer finibus, justo vitae maximus tincidunt, leo est molestie risus, et scelerisque sem est
                id lacus. Nulla facilisi. Duis iaculis fermentum tellus et varius. Aenean tempor a ipsum tempor
                consectetur. Nullam ullamcorper vitae odio non suscipit. Sed semper lacus non lectus porta pulvinar.
                Mauris ullamcorper nisl ut sollicitudin aliquam. Curabitur blandit enim tincidunt turpis faucibus
                efficitur. In vel nisl id justo feugiat suscipit eget vulputate risus. Integer et pretium sapien. Proin
                id viverra mauris, non aliquet diam. Maecenas eget lectus at sapien ultrices aliquam sed rutrum ex.
                Aenean nec quam turpis. Aliquam consequat egestas tellus, eget placerat neque mattis sit amet. Quisque
                lorem est, dapibus quis arcu non, egestas fringilla sem. In quam nunc, bibendum et nunc id, luctus
                ullamcorper dolor. Nullam facilisis molestie lacus vel hendrerit. Donec rutrum dui sit amet consectetur
                finibus. Mauris vitae volutpat nisi, sit amet sagittis est.
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
import { useJourneyStore } from "stores/useJourneyStore";
import { useUserStore } from "stores/useUserStore";
import { showToast } from "utils/utils";
const props = defineProps(["journey"]);
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
                    await useJourney.removeJourney(props.journey.id);
                    useUser.removeJourney(props.journey.id);
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
<style scoped>
ion-card-header {
    cursor: pointer;
}
ion-card {
    max-height: 100%;
    display: flex;
    flex-direction: column;
}
.content {
    overflow: auto;
}
</style>
