<template>
    <ion-app>
        <user-detail-menu />
        <ion-router-outlet content-id="main-content" />
    </ion-app>
</template>

<script lang="ts" setup>
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import { onBeforeMount } from "vue";

import UserDetailMenu from "./components/UserDetailMenu.vue";
import { useUserStore } from "./stores/useUserStore";

const userStore = useUserStore();
function readFromStorage() {
    if (localStorage.getItem("user")) {
        const userRef = JSON.parse(localStorage.getItem("user")!).user;
        const token = JSON.parse(localStorage.getItem("user")!).token;
        userStore.$patch({
            token: token,
            userRef: {
                userName: userRef.userName,
                email: userRef.email,
                firstName: userRef.firstName,
                lastName: userRef.lastName
            },
            loggedIn: true
        });
    }
}

onBeforeMount(() => {
    readFromStorage();
});
</script>
