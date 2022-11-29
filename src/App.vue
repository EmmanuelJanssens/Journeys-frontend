<template>
    <section>
        <router-view v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
                <keep-alive include="LogbookPage">
                    <component :is="Component" />
                </keep-alive>
            </Transition>
        </router-view>

        <component :is="journeyModalController.getOpen()" v-bind="journeyModalController.getProps()" />
    </section>
</template>

<script lang="ts" setup>
// import { IonApp, IonRouterOutlet, IonContent, modalController } from "@ionic/vue";
import DisclaimerModal from "components/Modals/DisclaimerModal.vue";
import { RouterView } from "vue-router";
import { defineAsyncComponent, onMounted, ref } from "vue";
import { journeyModalController } from "components/Modal/JourneyModalController";

onMounted(async () => {
    journeyModalController.create(
        "login",
        defineAsyncComponent(() => import("components/Modals/LoginModal.vue"))
    );

    journeyModalController.create(
        "register",
        defineAsyncComponent(() => import("components/Modals/RegisterModal.vue"))
    );
    journeyModalController.create(
        "alert",
        defineAsyncComponent(() => import("components/Modals/AlertModal.vue"))
    );
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

<style scoped>
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease-out;
}
</style>
