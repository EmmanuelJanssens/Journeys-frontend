<template>
    <ion-card class="experience-card">
        <ion-card-header>
            <ion-toolbar color="none">
                <ion-card-title>{{ props.title }}</ion-card-title>
                <ion-buttons slot="end">
                    <ion-button>
                        <ion-icon
                            size="large"
                            src="/src/assets/icon/ellipsis-vertical-outline.svg"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
            <ion-card-subtitle>{{ props.date }}</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
            <ion-img src="/src/assets/featureImg3.png"></ion-img>
            <p class="desc">
                {{ props.description }}
            </p>
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts" setup>
import {
    IonCard,
    IonToolbar,
    IonCardTitle,
    IonCardHeader,
    IonCardContent,
    IonButton,
    IonButtons,
    IonImg,
    IonCardSubtitle,
    IonIcon
} from "@ionic/vue";

const props = defineProps(["title", "images", "description", "date"]);
</script>

<style>
.experience-card {
    min-width: 300px;
    width: 30%;
    height: 90%;
    overflow-y: auto;
}
</style>
