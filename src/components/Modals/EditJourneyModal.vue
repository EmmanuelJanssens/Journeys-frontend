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
                            <ion-label position="stacked">
                                JourneyTitle
                            </ion-label>
                            <ion-input
                                type="text"
                                value="Journey name" /> </ion-item
                    ></ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <ion-item>
                            <ion-label position="stacked"
                                >Description</ion-label
                            >
                            <ion-textarea value="Description"> </ion-textarea>
                        </ion-item>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
        <ion-footer>
            <ion-toolbar>
                <ion-button slot="end" color="secondary"> cancel </ion-button>
                <ion-button slot="end"> Save </ion-button>
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
    IonTextarea
} from "@ionic/vue";
</script>
