<template>
    <div class="relative">
        <textarea
            :rows="rows"
            :value="modelValue"
            class="w-full p-4 focus:border-none bg-secondary-main dark:bg-primary-main placeholder-opacity-70 placeholder-high-contrast-text text-high-contrast-text drop-shadow-lg outline-none focus:outline-primary-main transform transition-all focus:scale-105 rounded-lg"
            :placeholder="placeholder"
            :type="type"
            @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)" />
        <p v-if="!error || error.length == 0" class="mx-2 text-primary-darker">
            {{ helper }}
        </p>
        <p class="mx-2 text-red-600">
            {{ error }}
        </p>
    </div>
</template>
<script setup lang="ts">
defineProps<{
    placeholder?: string;
    modelValue?: string;
    helper?: string;
    error?: string;
    type?: string;
    rows?: number;
}>();
const emit = defineEmits(["update:modelValue", "focus-in", "focus-out", "key-down"]);
</script>
<style></style>
