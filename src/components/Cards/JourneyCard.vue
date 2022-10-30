<template>
    <ion-card>
        <ion-card-header>
            <ion-toolbar color="none">
                <ion-card-title @click="goToJourney(props.journey.id)">{{ props.journey.title }}</ion-card-title>
                <ion-buttons slot="end">
                    <ion-button>
                        <ion-icon src="/src/assets/icon/eye-outline.svg" slot="icon-only"></ion-icon>
                    </ion-button>
                    <ion-button @click="onPopover">
                        <ion-icon src="/src/assets/icon/ellipsis-vertical-outline.svg" slot="icon-only"></ion-icon>
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
    popoverController
} from "@ionic/vue";
import JourneyCardPopover from "components/JourneyCardPopover.vue";
import { useJourneyStore } from "stores/useJourneyStore";

const props = defineProps(["journey"]);

const emit = defineEmits(["headerClicked"]);
async function onPopover(e: Event) {
    console.log(props);
    const popover = await popoverController.create({
        component: JourneyCardPopover,
        componentProps: props,
        event: e,
        size: "auto",
        reference: "event",
        side: "left",
        alignment: "bottom"
    });
    await popover.present();
}
async function goToJourney(id: string) {
    console.log(id);
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
