<template>
    <div v-if="visible" class="flex flex-col whitespace-pre-wrap text-primary-darker dark:text-primary-main">
        <div
            :key="button.text"
            :class="{
                ' group hover:bg-btn-dark hover:bg-opacity-30 hover:cursor-pointer ': true,
                ' border-b-2 border-b-primary-main flex items-center space-x-8 p-4': !collapsed,
                ' py-2 text-center': collapsed
            }"
            @click="button.handler">
            <FontAwesomeIcon
                :icon="button.icon"
                size="2x"
                class="hover:cursor-pointer transition-all group-hover:scale-125" />
            <button v-if="!collapsed">{{ button.text }}</button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

defineProps({
    button: {
        type: Object,
        default: () => ({})
    },
    collapsed: Boolean,
    visible: {
        type: Boolean,
        default: true
    }
});
</script>
