<template>
    <ion-app>
        <ion-content>
            <ion-router-outlet />
        </ion-content>
    </ion-app>
</template>

<script lang="ts" setup>
import { IonApp, IonRouterOutlet, IonContent, modalController } from "@ionic/vue";
import DisclaimerModal from "components/Modals/DisclaimerModal.vue";
import { onMounted } from "vue";

onMounted(async () => {
    const disclaimer = localStorage.getItem("disclaimer");
    if (disclaimer != null && disclaimer == "true") {
        return;
    } else {
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
