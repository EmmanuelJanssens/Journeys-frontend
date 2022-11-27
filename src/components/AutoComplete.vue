<template>
    <div>
        <input
            @focusin="focusIn"
            :value="input"
            @keydown="autocomplete"
            class="rounded-lg h-12 p-4 sm:w-full focus:border-none bg-secondary-main placeholder-opacity-70 placeholder-high-contrast-text text-high-contrast-text drop-shadow-lg"
            :placeholder="placeholder"
            ref="text" />
        <div v-if="input.length > 0" class="absolute flex flex-col w-full bg-primary-main z-50 max-h-80 overflow-auto">
            <div
                v-for="prediction in predictions"
                v-bind:key="prediction.key"
                @click="select(prediction.value)"
                class="bg-primary-main p-2 hover:bg-primary-dark hover:cursor-pointer">
                <p class="">{{ prediction.value }}</p>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
    focusIn?: (payload: FocusEvent) => void;
    input: string;
    placeholder?: string;
    debounce: number;
    predictions: {
        value: string;
        key: string | number | any;
    }[];
}>();

const text = ref();

// const input = ref<string>();
// const text = ref<string>();
const emits = defineEmits<{
    (e: "complete", value: string): void;
    (e: "selected", value: string): void;
    (e: "empty"): void;
}>();

let timeout: any;
function autocomplete() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        emits("complete", text.value.value);
    }, props.debounce);
}

function select(value: string) {
    emits("selected", value);
}
</script>
