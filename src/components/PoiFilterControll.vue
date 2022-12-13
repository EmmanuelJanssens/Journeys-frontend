<template>
    <div class="dropdown" ref="filters">
        <button class="btn btn-primary" tabindex="0"><FontAwesomeIcon :icon="filterButton.icon" size="2x" /></button>
        <div tabindex="0" class="dropdown-content bg-secondary p-2 shadow rounded-lg w-96 mt-4">
            <label class="flex items-center space-x-4 cursor-pointer">
                <span> keep open </span>
                <input type="checkbox" class="checkbox" ref="filterKeepOpen" />
            </label>
            <p>
                <label for="radius">Radius of: {{ currentRadius }} km</label>
            </p>
            <input id="radius" type="range" min="0" max="20" value="0" class="range range-primary" ref="radiusRange" />
            <!-- <p>
                <label for="order">Sort by</label>
            </p>
            <p>
                <label for="tags">Tags</label>
            </p>
            <div class="flex w-full flex-wrap space-x-2 overflow-y-auto max-h-40" ref="tagListContainer">
                <div v-for="tag in poiStore.tagList" v-bind:key="tag.type" class="cursor-pointer">
                    <div class="badge badge-outline rounded-lg" @click="toggleTag($event, tag)">{{ tag.type }}</div>
                </div>
            </div> -->
        </div>
    </div>
</template>
<script setup lang="ts">
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useMutationObserver } from "@vueuse/core";
import { drawPoisBetween } from "map/drawOnMap";
import { useJourneyStore } from "stores/useJourneyStore";
import { usePoiStore } from "stores/usePoiStore";
import { ref } from "vue";
const filterButton = ref({
    text: "Filter",
    icon: faFilter,
    handler: () => {
        //
    }
});

const filters = ref();
const filterKeepOpen = ref();
useMutationObserver(
    filterKeepOpen,
    (mutations) => {
        for (const mutation of mutations) {
            const checked = (mutation.target as HTMLInputElement).checked;
            if (checked) {
                (filters.value as HTMLElement).classList.add("dropdown-open");
            } else {
                (filters.value as HTMLElement).classList.remove("dropdown-open");
            }
        }
    },
    {
        attributes: true
    }
);

const radiusRange = ref();
const currentRadius = ref(0);
const journeyStore = useJourneyStore();
const poiStore = usePoiStore();
let timeout: any;
useMutationObserver(
    radiusRange,
    async (mutations) => {
        clearTimeout(timeout);
        const mid = journeyStore.getJourneyMidPoint(journeyStore.journey);
        const val = Number((mutations[0].target as HTMLInputElement).value);
        currentRadius.value = val;
        timeout = setTimeout(async () => {
            await poiStore.searchBetween(mid.center.lat, mid.center.lng, mid.radius + val * 1000);
            drawPoisBetween(false);
        }, 500);
    },
    { attributes: true }
);

const activeTags = ref<Map<string, boolean>>();
activeTags.value = new Map();
function toggleTag(event: Event, id: any) {
    const target = event.target as HTMLElement;
    const active = target.classList.contains("badge-accent");

    if (active) {
        target.classList.remove("badge-accent");
        target.classList.add("badge-outline");
        activeTags.value?.delete(target.textContent!);
    } else {
        target.classList.remove("badge-outline");
        target.classList.add("badge-accent");
        activeTags.value?.set(target.textContent!, true);
    }
}
</script>
