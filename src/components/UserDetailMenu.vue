<template>
    <ion-menu menuId="profileMenu" content-id="main-content" type="overlay" side="end">
        <ion-header>
            <ion-toolbar>
                <ion-title>{{ userStore.userRef.username }}</ion-title>
                <ion-button slot="end" color="secondary" @click="logout">logout</ion-button>
            </ion-toolbar>
        </ion-header>
        <ion-content> </ion-content>
    </ion-menu>
</template>

<script lang="ts" setup>
import { IonMenu, IonHeader, IonTitle, IonToolbar, IonContent, IonButton, menuController } from "@ionic/vue";

import { useUserStore } from "stores/useUserStore";

const userStore = useUserStore();

async function logout() {
    userStore.logout();
    menuController.toggle("profileMenu");
}
</script>
