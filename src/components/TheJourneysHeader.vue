<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <div class="flex justify-end p-4 space-x-4 bg-secondary-main dark:bg-secondary-dark">
        <router-link to="home">HOME</router-link>
        <router-link to="logbook">LOGBOOK</router-link>
        <router-link to="profile">PROFILE</router-link>
    </div>
</template>

<script lang="ts" setup>
import { useUserStore } from "stores/useUserStore";
import ProfilePopover from "./ProfilePopover.vue";
import { showToast } from "utils/utils";
import router from "router/router";
import { openModal } from "utils/utils";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";

const userStore = useUserStore();

// async function onPopOver(e: Event) {
//     const popover = await popoverController.create({
//         component: ProfilePopover,
//         alignment: "start",
//         event: e,
//         reference: "trigger",
//         size: "auto"
//     });
//     await popover.present();

//     const data = await popover.onDidDismiss();
//     if (data.data == "logout") {
//         await userStore.logout();
//         router.push("home");
//         showToast("goodbye", "success");
//     }
// }
</script>

<style scoped>
ion-toolbar {
    --background: transparent;
}
</style>
