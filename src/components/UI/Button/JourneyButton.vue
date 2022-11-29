<template>
    <div>
        <button
            :class="{
                'active:scale-125 p-2': true,
                'w-full h-full rounded-lg shadow-inner transition-all ease-in-out hover:scale-110': true,
                'bg-btn-main   dark:bg-btn-dark text-btn-contrast-text  ': fill == 'fill' && type == 'primary',
                'border border-primary-main dark:border-primary-dark text-primary-main ':
                    fill == 'outlined' && type == 'primary',
                'bg-opacity-0 text-primary-main dark:text-primary-dark': fill == 'none' && type == 'primary',

                'bg-secondary-btn-main dark:bg-secondary-dark  text-btn-contrast-text':
                    fill == 'fill' && type == 'secondary',
                'border border-secondary-light dark:border-secondary-dark text-secondary-main':
                    fill == 'outlined' && type == 'secondary',
                'bg-opacity-0 text-secondary-main dark:text-secondary-dark': fill == 'none' && type == 'secondary',
                'text-btn-contrast-text': fill == 'contrast'
            }">
            <slot></slot>
        </button>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";

const props = defineProps({
    type: {
        type: String,
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
