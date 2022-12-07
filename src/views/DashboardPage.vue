<template>
    <div class="absolute flex flex-col left-0 right-0 top-0 bottom-0 shadow-inne bg-primary space-y-4">
        <div class="relative bg-opacity-20 bg-black z-0 bg-cover h-96">
            <img src="/assets/images/banner/mountains.jpg" class="object-cover h-full w-full absolute -z-10" />
            <div
                class="flex z-50 justify-center space-x-4 items-center h-full text-high-contrast-text text-center sm:text-left">
                <h1 class="text-xl sm:text-6xl">{{ userStore.state.currentUser }}</h1>

                <FontAwesomeIcon
                    class="btn btn-circle btn-secondary btn-outline btn-sm"
                    :icon="faPencil"
                    @click="openUpdateUserModal" />
            </div>
        </div>
        <div class="mx-auto w-full h-full overflow-auto">
            <div class="flex flex-col justify-center items-center space-y-4">
                <div class="stats shadow">
                    <div class="stat">
                        <div class="stat-figure text-primary">
                            <FontAwesomeIcon :icon="faEarth" />
                        </div>
                        <div class="stat-title">Total Journeys</div>
                        <div class="stat-value text-primary">{{ userStore.myStats.journeys }}</div>
                        <div class="stat-desc">Go out and explore</div>
                    </div>
                    <div class="stat">
                        <div class="stat-figure text-primary">
                            <FontAwesomeIcon :icon="faMap" />
                        </div>
                        <div class="stat-title">Total experiences</div>
                        <div class="stat-value text-primary">{{ userStore.myStats.experiences }}</div>
                        <div class="stat-desc">Share your experiences!</div>
                    </div>
                    <div class="stat">
                        <div class="stat-figure text-primary">
                            <FontAwesomeIcon :icon="faLocationPin" />
                        </div>
                        <div class="stat-title">Poi Contributions</div>
                        <div class="stat-value text-primary">{{ userStore.myStats.pois }}</div>
                        <div class="stat-desc">Thank you for contributing!</div>
                    </div>
                </div>
                <div>
                    <button class="btn btn-secondary gap-2" @click="() => router.push('/logbook')">
                        <FontAwesomeIcon :icon="faEarth" />Logbook
                    </button>
                </div>
                <div class="tabs">
                    <a class="tab tab-bordered tab-active" @click="openTab('journeys')" ref="journeysTab">Journeys</a>
                    <a class="tab tab-bordered" @click="openTab('pois')" ref="poisTab">Points of interest</a>
                </div>

                <RouterView v-slot="{ Component }">
                    <Transition name="fade" mode="out-in">
                        <Component :is="Component" />
                    </Transition>
                </RouterView>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useUserStore } from "stores/useUserStore";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faEarth, faLocationPin, faMap, faPencil } from "@fortawesome/free-solid-svg-icons";
import router from "router/router";
import { defineAsyncComponent, defineComponent, onMounted, ref, watch } from "vue";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";
import { authApp } from "google/firebase";

const userStore = useUserStore();
const totalExperiences = ref(0);
watch(
    () => userStore.myJourneys.journeys,
    (newVal) => {
        totalExperiences.value = 0;
        newVal.forEach((journey) => {
            totalExperiences.value += journey.nExperiences ? journey.nExperiences : 0;
        });
    }
);

onMounted(async () => {
    await userStore.didLogin();

    userStore.myJourneys?.journeys?.forEach((journey) => {
        totalExperiences.value += journey.nExperiences ? journey.nExperiences : 0;
    });

    await userStore.fetchMyStats();

    journeyModalController.create(
        "updateUser",
        defineAsyncComponent(() => import("components/jModals/UpdateUserModal.vue"))
    );
});

const journeysTab = ref();
const poisTab = ref();
async function openTab(tab: string) {
    if (tab == "journeys") {
        router.push("/dashboard");
        (journeysTab.value as HTMLElement).classList.add("tab-active");
        (poisTab.value as HTMLElement).classList.remove("tab-active");
    } else if (tab == "pois") {
        router.push("/dashboard/pois");
        (journeysTab.value as HTMLElement).classList.remove("tab-active");
        (poisTab.value as HTMLElement).classList.add("tab-active");
    }
}

function openUpdateUserModal() {
    journeyModalController.open("updateUser");
}
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
