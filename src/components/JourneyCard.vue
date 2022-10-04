<template>
    <ion-card class="journey-card">
        <ion-card-header>
            <ion-toolbar color="none">
                <ion-card-title @click="goToJourney(props.journey.id)">{{
                    props.journey.title
                }}</ion-card-title>
                <ion-buttons slot="end">
                    <ion-button>
                        <ion-icon
                            size="large"
                            src="/src/assets/icon/ellipsis-vertical-outline.svg"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
            <ion-card-subtitle>Subtitle</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
            <ion-img src="/src/assets/featureImg3.png"></ion-img>
            <p class="desc">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Pellentesque tempus euismod felis, nec hendrerit metus fermentum
                in. Vivamus ante mi, auctor nec augue non, fermentum mollis mi.
                Aenean auctor quam sit amet nibh laoreet, pretium condimentum
                purus maximus. Nam id luctus massa, nec eleifend risus. Integer
                sagittis, neque vel laoreet pharetra, nulla odio pretium erat,
                sed varius sapien ante at nulla. Duis varius mattis tristique.
                Nullam vitae purus ut mi bibendum mattis. In a nisi facilisis,
                scelerisque augue eget, rutrum massa. Etiam sapien nunc, gravida
                vitae leo sed, fringilla accumsan odio. Maecenas ut dui mi.
                Maecenas efficitur metus arcu. Pellentesque ipsum nisl, molestie
                vel nisl id, porttitor vehicula lectus. Integer finibus, justo
                vitae maximus tincidunt, leo est molestie risus, et scelerisque
                sem est id lacus. Nulla facilisi. Duis iaculis fermentum tellus
                et varius. Aenean tempor a ipsum tempor consectetur. Nullam
                ullamcorper vitae odio non suscipit. Sed semper lacus non lectus
                porta pulvinar. Mauris ullamcorper nisl ut sollicitudin aliquam.
                Curabitur blandit enim tincidunt turpis faucibus efficitur. In
                vel nisl id justo feugiat suscipit eget vulputate risus. Integer
                et pretium sapien. Proin id viverra mauris, non aliquet diam.
                Maecenas eget lectus at sapien ultrices aliquam sed rutrum ex.
                Aenean nec quam turpis. Aliquam consequat egestas tellus, eget
                placerat neque mattis sit amet. Quisque lorem est, dapibus quis
                arcu non, egestas fringilla sem. In quam nunc, bibendum et nunc
                id, luctus ullamcorper dolor. Nullam facilisis molestie lacus
                vel hendrerit. Donec rutrum dui sit amet consectetur finibus.
                Mauris vitae volutpat nisi, sit amet sagittis est.
            </p>
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts" setup>
import {
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonImg,
    IonIcon
} from "@ionic/vue";
import router from "router/router";

const props = defineProps(["journey"]);

function goToJourney(id: string) {
    const route = {
        name: "journey",
        params: {
            id: id
        }
    };
    router.push(route);
}
</script>
<style>
.journey-card {
    min-width: 300px;
    width: 30%;
    height: 90%;
    overflow-y: auto;
}

/* width */
::-webkit-scrollbar {
    width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
    background: #f1f1f1;
}

/* Handle */
::-webkit-scrollbar-thumb {
    background: #888;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
    background: #555;
}
</style>
