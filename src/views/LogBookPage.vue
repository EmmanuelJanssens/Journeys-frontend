<!-- eslint-disable vue/valid-v-for -->
<template>
    <div class="absolute top-0 right-0 left-0 w-screen h-screen">
        <div class="relative flex h-full w-full">
            <ThePoiListSidebar :poi-list="poiStore.poisBetween" @poi-item-clicked="flyTo" />
            <div class="w-full h-full">
                <JourneyMap class="relative w-full h-full">
                    <LogbookMenu />
                    <router-view v-slot="{ Component, route }" class="absolute left-0 right-0 bottom-0 p-4 h-2/5">
                        <Transition name="fade" mode="out-in">
                            <component :is="Component" :key="route.path" />
                        </Transition>
                    </router-view>
                </JourneyMap>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
export default {
    name: "LogbookPage",
    components: { JourneyButton }
};
</script>
<script lang="ts" setup>
import { defineAsyncComponent, onMounted } from "vue";

import { usePoiStore } from "stores/usePoiStore";

import JourneyMap from "components/TheJourneyMap.vue";

import LogbookMenu from "components/LogbookMenu.vue";
import ThePoiListSidebar from "components/ThePoiListSidebar.vue";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";
import { mapInstance } from "map/JourneysMap";
import { PointOfInterest } from "types/JourneyDtos";
import JourneyButton from "components/UI/Button/JourneyButton.vue";

const poiStore = usePoiStore();

onMounted(async () => {
    journeyModalController.create(
        "editJourney",
        defineAsyncComponent({
            loader: () => import("components/jModals/EditJourneyModal.vue")
        })
    );

    journeyModalController.create(
        "createJourney",
        defineAsyncComponent({
            loader: () => import("components/jModals/CreateJourneyModal.vue")
        })
    );

    journeyModalController.create(
        "editExperience",
        defineAsyncComponent({
            loader: () => import("components/jModals/EditExperienceModal.vue")
        })
    );

    journeyModalController.create(
        "saveJourney",
        defineAsyncComponent({
            loader: () => import("components/jModals/SaveJourneyModal.vue")
        })
    );
    journeyModalController.create(
        "createPoi",
        defineAsyncComponent({
            loader: () => import("components/jModals/AddPoiModal.vue")
        })
    );
});

function flyTo(poi: PointOfInterest) {
    if (poi.location?.longitude && poi.location.latitude)
        mapInstance.flyTo(poi.location?.longitude, poi.location?.latitude, 18);
}
</script>
<style lang="less" scoped>
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease-out;
}
</style>
