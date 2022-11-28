<template>
    <div v-if="props.poiList" class="overflow bg-primary-light h-screen group">
        <DynamicScroller :items="props.poiList" :min-item-size="54" style="height: 100%">
            <template v-slot="{ item, index, active }">
                <DynamicScrollerItem :item="item" :active="active" :data-index="index">
                    <div
                        class="flex space-x-0 p-2 items-center justify-between hover:cursor-pointer hover:bg-primary-darker hover:bg-opacity-30"
                        @click="emit('poiItemClicked', item)">
                        <div class="flex space-x-2">
                            <img class="object-cover w-16 h-16 rounded-lg" :src="item.thumbnail" />
                            <p class="p-2 truncate">{{ item.name }}</p>
                        </div>
                        <FontAwesomeIcon :icon="faEye" />
                    </div>
                </DynamicScrollerItem>
            </template>
        </DynamicScroller>
    </div>
</template>

<script lang="ts" setup>
import { PoiDto } from "types/dtos";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

const props = defineProps<{
    poiList?: PoiDto[];
}>();

const emit = defineEmits<{
    (e: "poiItemClicked", poi: PoiDto): void;
}>();
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
