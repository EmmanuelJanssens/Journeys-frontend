<template>
    <ion-app>
        <user-detail-menu />
        <journeys-header />
        <ion-content>
            <ion-router-outlet content-id="main-content" />
        </ion-content>
    </ion-app>
</template>

<script lang="ts" setup>
import { IonApp, IonRouterOutlet, IonContent, IonSplitPane, getPlatforms } from "@ionic/vue";
import UserDetailMenu from "components/TheUserDetailMenu.vue";
import JourneysHeader from "components/TheJourneysHeader.vue";
import { useUserStore } from "stores/useUserStore";
import { onBeforeMount } from "vue";
const userStore = useUserStore();
async function readFromStorage() {
    if (localStorage.getItem("user")) {
        const userRef = JSON.parse(localStorage.getItem("user")!).user;
        const token = JSON.parse(localStorage.getItem("user")!).token;

        userStore.$patch({
            token: token,
            userRef: {
                username: userRef.username,
                email: userRef.email,
                firstName: userRef.firstName,
                lastName: userRef.lastName
            },
            loggedIn: true
        });
        if (await userStore.refreshToken()) {
            userStore.refreshInterval = setInterval(userStore.startRefreshInterval, 24000);
        }
    }
}

onBeforeMount(() => {
    readFromStorage();
});
</script>
