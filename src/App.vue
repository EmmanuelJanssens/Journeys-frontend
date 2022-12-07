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
import { RouterView } from "vue-router";
import { defineAsyncComponent, onBeforeMount, onMounted } from "vue";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";

onBeforeMount(() => {});
onMounted(async () => {
    journeyModalController.create(
        "login",
        defineAsyncComponent(() => import("components/jModals/LoginModal.vue"))
    );
    journeyModalController.create(
        "register",
        defineAsyncComponent(() => import("components/jModals/RegisterModal.vue"))
    );
    journeyModalController.create(
        "alert",
        defineAsyncComponent(() => import("components/jModals/AlertModal.vue"))
    );
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
