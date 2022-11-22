<template>
    <ion-page>
        <ion-header class="ion-no-border ion-no-margin">
            <TheJourneysHeader class="toolbar" />
            <div class="banner-content center">
                <div id="info">
                    <p></p>
                    <span>
                        <ion-text
                            ><h1 class="title white">
                                {{ userStore.userRef.username?.toLocaleUpperCase() }}
                            </h1></ion-text
                        >
                        <ion-text
                            ><p class="white">{{ userStore.userRef.citation }}</p></ion-text
                        >
                    </span>
                    <ion-button color="tertiary" @click="openEdit">Edit your profile</ion-button>
                </div>
            </div>
            <swiper
                class="image-carrousel"
                :modules="modules"
                :autoplay="{
                    delay: 5000,
                    disableOnInteraction: true
                }">
                <span class="overlay"></span>
                <swiper-slide>
                    <ion-img src="assets/images/banner/mountains.jpg" class="banner-img" />
                </swiper-slide>
                <swiper-slide>
                    <ion-img src="assets/images/banner/mountains2.jpg" class="banner-img" />
                </swiper-slide>
            </swiper>
        </ion-header>
        <ion-content class="main-body">
            <div class="center w1000">
                <ion-grid>
                    <ion-row>
                        <ion-col size="2"> </ion-col>
                        <ion-col></ion-col>
                    </ion-row>
                    <ion-row>
                        <ion-col size="3">
                            <ion-list>
                                <ion-item button @click="toggle('statitsics')">
                                    <ion-label>Statistics</ion-label>
                                    <ion-icon :icon="chevronForwardOutline"></ion-icon>
                                </ion-item>
                                <ion-item button @click="toggle('security')">
                                    <ion-label>Privacy and security</ion-label>
                                    <ion-icon :icon="chevronForwardOutline"></ion-icon>
                                </ion-item>
                            </ion-list>
                        </ion-col>
                        <ion-col v-if="currentContent == 'statitsics'">
                            <ion-card>
                                <ion-card-header>
                                    <ion-card-title>Here are your statistics</ion-card-title>
                                </ion-card-header>
                                <ion-card-content>
                                    <p>Total number of journeys {{ userStore.userRef.journeysAggregate?.count }}</p>
                                    <p>Total number of experiences {{ nExperiences }}</p>
                                </ion-card-content>
                            </ion-card>
                        </ion-col>
                        <ion-col v-else-if="currentContent == 'security'">
                            <ion-list>
                                <ion-item
                                    :class="{
                                        'ion-margin': true
                                    }">
                                    <ion-label>Make profile public</ion-label>
                                    <ion-toggle
                                        :checked="userStore.userRef.public!"
                                        @ion-change="togglePublic"></ion-toggle>
                                </ion-item>
                                <ion-item
                                    :class="{
                                        'ion-margin': true
                                    }">
                                    <ion-label position="stacked">Old password</ion-label>
                                    <ion-input type="password" v-model="state.oldPassword"></ion-input>
                                </ion-item>
                                <ion-item
                                    :class="{
                                        'ion-margin': true,
                                        'ion-invalid': v$.newPassword.$error
                                    }">
                                    <ion-label position="stacked">new password</ion-label>
                                    <ion-input
                                        type="password"
                                        v-model="state.newPassword"
                                        @ion-input="v$.newPassword.$validate()"
                                        @ion-change="ifZero($event, () => v$.newPassword.$reset())"></ion-input>
                                    <ion-note v-if="v$.newPassword.$error" slot="error">{{
                                        v$.newPassword.$errors[0].$message
                                    }}</ion-note>
                                </ion-item>
                                <ion-item
                                    :class="{
                                        'ion-margin': true,
                                        'ion-invalid': v$.confirmPassword.$error
                                    }">
                                    <ion-label position="stacked">confirm password</ion-label>
                                    <ion-input
                                        type="password"
                                        v-model="state.confirmPassword"
                                        @ion-input="v$.confirmPassword.$validate()"
                                        @ion-change="ifZero($event, () => v$.confirmPassword.$reset())"></ion-input>
                                    <ion-note v-if="v$.confirmPassword.$error" slot="error">{{
                                        v$.confirmPassword.$errors[0].$message
                                    }}</ion-note>
                                </ion-item>
                                <ion-buttons
                                    :class="{
                                        'ion-margin': true
                                    }">
                                    <ion-button @click="securityUpdate()" color="secondary" fill="solid">
                                        Confirm changes</ion-button
                                    >
                                </ion-buttons>
                            </ion-list>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts" setup>
import {
    IonNote,
    IonInput,
    IonToggle,
    IonIcon,
    IonText,
    IonContent,
    IonPage,
    IonImg,
    IonButton,
    IonHeader,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonLabel,
    IonList,
    onIonViewDidEnter,
    IonCard,
    IonCardContent,
    IonCardHeader,
    alertController,
    IonCardSubtitle,
    IonCardTitle,
    IonButtons,
    ToggleCustomEvent,
    InputCustomEvent
} from "@ionic/vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay } from "swiper";

import "swiper/less";
import TheJourneysHeader from "components/TheJourneysHeader.vue";
import { computed, ref, watch } from "vue";
import { useUserStore } from "stores/useUserStore";
import { chevronForwardOutline } from "ionicons/icons";
import EditProfileModal from "components/Modals/EditProfileModal.vue";
import { openModal, showToast } from "utils/utils";
import LoginModal from "components/Modals/LoginModal.vue";
import router from "router/router";
import { required, minLength, sameAs, helpers } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";

const modules = ref([Autoplay]);
const userStore = useUserStore();
const nExperiences = ref(0);
const currentContent = ref("statitsics");

const state = ref({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
});

const passwordRef = computed(() => state.value.newPassword);
const rules = {
    newPassword: {
        minLength: minLength(8),
        containsUppercase: helpers.withMessage("At least one upper case", (value: string) => /[A-Z]/.test(value)),
        numeric: helpers.withMessage("At least one number is needed", (value: string) => /[0-9]/.test(value)),
        special: helpers.withMessage("At least one special character", (value: string) => /[^a-zA-Z\d\s:]/.test(value))
    },
    confirmPassword: {
        sameAs: sameAs(passwordRef)
    }
};
const v$ = useVuelidate(rules, state);

function ifZero(event: InputCustomEvent, reset: Function) {
    if (event.detail.value?.length == 0) {
        reset();
    }
}
async function securityUpdate() {
    if (!v$.value.$error) {
        if (
            (state.value.confirmPassword.length == 0 && state.value.newPassword.length == 0,
            state.value.oldPassword.length == 0)
        ) {
            const res = await userStore.saveUser(userStore.userRef, userStore.userRef.username!);
            if (res) {
                showToast("Modification saved", "success");
            } else {
                showToast("Could not save modifications", "danger");
            }
        } else {
            const alert = await alertController.create({
                header: "Warning",
                subHeader: "You will have to reconnect",
                message: "Do you wish to proceed?",
                buttons: [
                    {
                        text: "Yes",
                        role: "proceed",
                        handler: async () => {
                            const res = await userStore.updatePassword({
                                oldPassword: state.value.oldPassword,
                                newPassword: state.value.newPassword,
                                public: userStore.userRef.public!
                            });
                            if (res) {
                                await userStore.logout();
                                router.push("home");
                                await openModal(LoginModal);
                                showToast("Modifications  saved", "success");
                                state.value.newPassword = "";
                                state.value.oldPassword = "";
                                state.value.confirmPassword = "";
                                v$.value.$reset();
                            } else {
                                showToast("Error saving", "danger");
                                state.value.newPassword = "";
                                state.value.oldPassword = "";
                                state.value.confirmPassword = "";
                                v$.value.$reset();
                            }
                        }
                    },
                    {
                        text: "No",
                        handler: async () => {
                            showToast("Modifications not saved", "success");
                            state.value.newPassword = "";
                            state.value.oldPassword = "";
                            state.value.confirmPassword = "";
                            v$.value.$reset();
                        }
                    }
                ]
            });
            await alert.present();
        }
    }
}
function toggle(content: string) {
    currentContent.value = content;
}

function togglePublic(e: ToggleCustomEvent) {
    userStore.userRef.public = e.detail.checked;
}
watch(
    () => userStore.userRef,
    () => {
        let val = 0;

        nExperiences.value = userStore.userRef.journeysConnection?.edges.reduce((acc, n) => {
            return acc + n.node.experiencesAggregate.count;
        }, val)!;
    }
);

async function openEdit() {
    const modal = await openModal(EditProfileModal);

    const res = await modal.onDidDismiss();
    if (res.data != null) {
        if (res.data.username != userStore.userRef.username) {
            const alert = await alertController.create({
                header: "Warning",
                subHeader: "You will have to reconnect",
                message: "Do you wish to proceed?",
                buttons: [
                    {
                        text: "Yes",
                        role: "proceed",
                        handler: async () => {
                            const response = await userStore.saveUser(res.data, userStore.userRef.username!);
                            if (response != null) {
                                await userStore.logout();
                                router.push("home");
                                await openModal(LoginModal);
                                if (response != null) {
                                    showToast("Modification saved", "success");
                                } else {
                                    showToast("Error", "danger");
                                }
                            }
                        }
                    },
                    {
                        text: "No",
                        handler: async () => {
                            showToast("Modifications not saved", "success");
                        }
                    }
                ]
            });
            await alert.present();
        } else {
            const response = await userStore.saveUser(res.data, userStore.userRef.username!);
            if (response != null) {
                if (response != null) {
                    showToast("Modification saved", "success");
                } else {
                    showToast("Error", "danger");
                }
            }
        }
        let val = 0;
        await userStore.fetchMyProfile();
        nExperiences.value = userStore.userRef.journeysConnection?.edges.reduce((acc, n) => {
            return acc + n.node.experiencesAggregate.count;
        }, val)!;
    }
}
onIonViewDidEnter(async () => {
    await userStore.fetchMyProfile();
});
</script>

<style scoped lang="less">
ion-content {
    --padding-top: 64px;
}

.white {
    color: white;
}

.toolbar {
    //position: absolute;
}
.banner-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.overlay {
    pointer-events: none;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: black;
    opacity: 30%;
    z-index: 9999;
}
.active {
    background-color: red;
}
.rectangle {
    height: 2px;
    width: 120px;
    background-color: white;
}

.body {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 100%;
}
ion-header {
    height: 540;
}
.title {
    font-size: 5em;
}
.w1000 {
    width: 1000px;
}
.w800 {
    width: 800px;
}
.w300 {
    width: 300px;
}
.w400 {
    width: 400px;
}
.w500 {
    width: 500px;
}
.center {
    position: absolute;

    left: 0px;
    right: 0px;

    margin-left: auto;
    margin-right: auto;
}
.banner-content {
    width: 600px;
    height: 100%;

    z-index: 2;

    #info {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        height: 80%;

        span {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-around;
        }
    }

    .tabs {
        bottom: 40px;
        #tab-buttons {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
        }
    }
}
.image-carrousel {
    z-index: 1;
    //position: absolute;
    width: 100%;
    height: 540px;
}
</style>
