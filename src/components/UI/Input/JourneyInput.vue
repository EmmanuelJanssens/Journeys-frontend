<template>
    <div class="relative">
        <input
            :value="modelValue"
            class="input w-full input-secondary bg-secondary text-white placeholder-base-100"
            :placeholder="placeholder"
            :type="type"
            @input="keyDown" />
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
}>();
const emit = defineEmits(["update:modelValue", "focus-in", "focus-out", "key-down", "enter-pressed"]);

function keyDown(event: Event) {
    emit("update:modelValue", (event.target as HTMLTextAreaElement).value);
}
</script>
<style></style>
