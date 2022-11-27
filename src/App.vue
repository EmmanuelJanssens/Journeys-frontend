<template>
    <section>
        <router-view v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
                <component :is="Component" />
            </Transition>
        </router-view>
        <login-modal />
        <register-modal />
    </section>
</template>

<script lang="ts" setup>
// import { IonApp, IonRouterOutlet, IonContent, modalController } from "@ionic/vue";
import DisclaimerModal from "components/Modals/DisclaimerModal.vue";
import LoginModal from "components/Modals/LoginModal.vue";
import RegisterModal from "components/Modals/RegisterModal.vue";
import { RouterView } from "vue-router";
import { authApp } from "google/firebase";
import { onMounted } from "vue";

onMounted(async () => {
    //     const disclaimer = localStorage.getItem("disclaimer");
    //     if (disclaimer != null && disclaimer == "true") {
    //         return;
    //     } else {
    //         const modal = await modalController.create({
    //             component: DisclaimerModal
    //         });
    //         await modal.present();
    //         const { data, role } = await modal.onDidDismiss();
    //         if (data?.doNotShowagain) {
    //             localStorage.setItem("disclaimer", data?.doNotShowagain);
    //         }
    //     }
});
</script>

<style>
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease-out;
}
</style>
