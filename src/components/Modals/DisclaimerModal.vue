<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <ion-header>
        <ion-toolbar>
            <ion-title> Disclaimer </ion-title>
            <ion-buttons slot="end">
                <ion-button @click="modalController.dismiss()">
                    <ion-icon :icon="closeOutline" slot="icon-only" />
                </ion-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
        <span>
            <p>
                Based on an original project written by a team of 5 students (me included) I decided to rewrite the app,
                with a different stack for learning purpose and further improvements.
            </p>
            <p>
                This app is still in active developpement, therefore any data created will not be permanent. You can
                still see what this app has to offer and follow it's devellopement. That is also in it's way some kind
                of Journey.
            </p>
            <p>
                Any feedback, bug reports, and suggestions can at the time beeing be sent to my
                <a :href="`mailto:${mail}`">email</a>.
            </p>

            <p>
                <ion-icon :icon="warningOutline" /> your profile is private by default go to your profile page to change
                this setting
            </p>
            <ion-list>
                <ion-item>
                    <ion-label
                        ><ion-icon :icon="logoGithub" /> public
                        <a href="https://github.com/EmmanuelJanssens/Journeys" target="_blank"
                            >github repository</a
                        ></ion-label
                    ></ion-item
                >
                <ion-item>
                    <ion-label>
                        <ion-icon :icon="logoGitlab" /> original
                        <a href="https://gitlab.com/pdg-journeys/journeys" target="_blank">gitlab repository</a>
                    </ion-label>
                </ion-item>
                <ion-item class="ion-margin">
                    <ion-label> Do not show again </ion-label>
                    <ion-checkbox ref="doNotShowAgain" :checked="checked" @ion-change="check"></ion-checkbox>
                </ion-item>
            </ion-list>
        </span>
    </ion-content>

    <ion-footer>
        <ion-toolbar>
            <ion-buttons slot="end">
                <ion-button @click="onAgree">I Understand</ion-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-footer>
</template>
<script lang="ts" setup>
import { modalController } from "@ionic/core";
import {
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonList,
    IonCheckbox,
    IonToolbar,
    IonHeader,
    IonFooter,
    IonText,
    IonTitle,
    CheckboxCustomEvent
} from "@ionic/vue";
import { closeOutline, logoGithub, logoGitlab, warningOutline } from "ionicons/icons";
import { ref } from "vue";

const mail = ref("journeys.feedback@gmail.com");

const doNotShowAgain = ref();
const checked = ref(false);
function check(event: CheckboxCustomEvent) {
    checked.value = event.detail.checked;
}
function onAgree() {
    modalController.dismiss({
        doNotShowagain: checked.value
    });
}
</script>
<style lang="less" scoped></style>
