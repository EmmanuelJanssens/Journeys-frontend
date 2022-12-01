<template>
    <h1 :class="classList">
        <slot />
    </h1>
</template>
<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps({
    color: {
        type: String,
        default: "text-high-contrast-text"
    },
    size: {
        type: String,
        default: "text-xl"
    }
});

const classList = computed(() => "p-4 " + props.color + " " + props.size + " ");
</script>
