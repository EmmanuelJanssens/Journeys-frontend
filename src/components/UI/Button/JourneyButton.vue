<template>
    <div>
        <button
            :class="{
                'btn w-full': true,
                'btn-primary': type == 'primary',
                'btn-secondary': type == 'secondary',
                'btn-warning': type == 'warning',
                'btn-error': type == 'error',
                'btn-accent': type == 'accent',
                'btn-info': type == 'info',
                'btn-circle': type == 'circle'
            }">
            <slot />
        </button>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";

const props = defineProps({
    type: {
        type: String,
        validator(value: string) {
            return ["primary", "secondary", "warning", "error", "accent", "info"].includes(value);
        },
        default: "primary"
    },
    fill: {
        type: String,
        default: "fill"
    }
});

const state = ref({
    outlined: false,
    fill: "fill",
    type: "primary"
});

onMounted(() => {
    if (props.type) state.value.type = props.type;
    if (props.fill) state.value.fill = props.fill;
});
</script>
