<template>
    <div>
        <input
            @focusin="setFocus"
            :value="input"
            @keydown="autocomplete"
            @focusout="focusOut"
            :class="{
                'rounded-lg': predictions.length == 0,
                'rounded-t-lg': predictions.length > 0,
                'transition ease-in-out scale-100 outline-none': !focus,
                'transition ease-in-out scale-105 ': focus,
                'h-12 p-4 sm:w-full focus:border-none bg-secondary-main placeholder-opacity-70 placeholder-high-contrast-text text-high-contrast-text drop-shadow-lg outline-none focus:outline-primary-main': true
            }"
            :placeholder="placeholder"
            ref="text" />
        <div
            v-if="input.length > 0"
            :class="{
                'absolute flex flex-col w-full bg-primary-main z-50 max-h-80 overflow-auto': true,
                'transition ease-in-out scale-100': !focus,
                'transition ease-in-out scale-105': focus
            }">
            <div
                v-for="prediction in predictions"
                v-bind:key="prediction.key"
                @click="select(prediction.value)"
                class="bg-primary-main dark:hover:bg-primary-darker p-2 hover:bg-primary-dark hover:cursor-pointer">
                <p class="">{{ prediction.value }}</p>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from "vue";

const focus = ref(false);
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

const emits = defineEmits<{
    (e: "complete", value: string): void;
    (e: "selected", value: string): void;
    (e: "empty"): void;
    (e: "focus-out"): void;
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

function setFocus(evt: FocusEvent) {
    if (props.focusIn) props.focusIn(evt);
    focus.value = true;
}

function focusOut(evt: FocusEvent) {
    focus.value = false;
}
</script>
