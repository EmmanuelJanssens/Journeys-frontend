<template>
    <div
        ref="poiList"
        class="overflow bg-primary-light : dark:bg-gray-800 w-0 h-screen group transition-all hidden sm:block"
        @transitionend="resize">
        <DynamicScroller :items="props.poiList" :min-item-size="54" style="height: 100%">
            <template #default="{ item, index, active }">
                <DynamicScrollerItem :item="item" :active="active" :data-index="index">
                    <div
                        class="flex space-x-0 p-2 items-center justify-between hover:cursor-pointer hover:bg-primary-darker hover:bg-opacity-30"
                        @click="emit('poiItemClicked', item)">
                        <div class="flex space-x-2">
                            <img class="object-cover w-16 h-16 rounded-lg" :src="item.thumbnail" />
                            <p class="p-2 truncate">
                                {{ item.name }}
                            </p>
                        </div>
                        <FontAwesomeIcon :icon="faEye" />
                    </div>
                </DynamicScrollerItem>
            </template>
        </DynamicScroller>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { mapInstance } from "map/JourneysMap";
import { PointOfInterest } from "types/JourneyDtos";

const poiList = ref();
const isOpen = ref(false);

async function resize() {
    (await mapInstance.getMap()).resize();
}
async function toggle(on: boolean) {
    const el = poiList.value as HTMLElement;
    if (on) {
        el.classList.add("w-96");
        el.classList.remove("w-0");
    } else if (!on) {
        el.classList.remove("w-96");
        el.classList.add("w-0");
    }
    isOpen.value = on;
}

const props = defineProps<{
    poiList?: PointOfInterest[];
}>();

const emit = defineEmits<{
    (e: "poiItemClicked", poi: PointOfInterest): void;
}>();

watch(
    () => props.poiList,
    (newVal) => {
        if (newVal?.length == 0) {
            toggle(false);
        } else toggle(true);
    }
);
</script>

<style>
::-webkit-scrollbar {
    height: 12px;
    width: 12px;
    background: #6c9d89;
}

::-webkit-scrollbar-thumb {
    background: #687a6e;
    -webkit-border-radius: 1ex;
    -webkit-box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.75);
    border-radius: 5%;
    box-shadow: none;
}

::-webkit-scrollbar-corner {
    background: #000;
}
</style>
