<template>
    <ion-app>
        <ion-content>
            <ion-router-outlet />
        </ion-content>
    </ion-app>
</template>

<script lang="ts" setup>
import { IonApp, IonRouterOutlet, IonContent, IonModal, modalController } from "@ionic/vue";
import DisclaimerModal from "components/Modals/DisclaimerModal.vue";

import { useUserStore } from "stores/useUserStore";
import { onBeforeMount, onMounted } from "vue";
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
            userStore.refreshInterval = setInterval(userStore.startRefreshInterval, 240000);
        }
    }
}

onBeforeMount(() => {
    readFromStorage();
});

onMounted(async () => {
    const disclaimer = localStorage.getItem("disclaimer") == "true";

    if (!disclaimer) {
        const modal = await modalController.create({
            component: DisclaimerModal
        });

        await modal.present();

        const { data, role } = await modal.onDidDismiss();
        console.log(data.doNotShowagain);
        if (data?.doNotShowagain) {
            localStorage.setItem("disclaimer", data?.doNotShowagain);
        }
    }
});
</script>
