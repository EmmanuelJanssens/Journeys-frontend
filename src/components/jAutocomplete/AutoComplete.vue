<template>
    <div class="relative">
        <JourneyInput
            ref="text"
            v-model="input"
            :class="{
                'rounded-lg': predictions.length == 0,
                'rounded-t-lg ': predictions.length > 0
            }"
            :placeholder="placeholder"
            @focusin="setFocus"
            @keydown="autocomplete"
            @focusout="focusOut" />

        <div
            v-if="input.length > 0"
            :class="{
                'absolute flex flex-col bg-primary-main dark:bg-gray-700 w-full  items-start  max-h-80 overflow-auto z-50': true,

                'transition ease-in-out duration-100 opacity-0': predictions.length == 0,
                'transition ease-in-out duration-100 opacity-100': predictions.length > 0
            }"
            ref="predListRef">
            <JourneyItem
                v-for="prediction in predictions"
                :button="{
                    text: prediction.value,
                    icon: icon
                }"
                :collapsed="false"
                :key="prediction.key"
                class="bg-primary-main dark:bg-primary-darker border-none w-full dark:hover:bg-primary-darker p-2 hover:cursor-pointer"
                @click="select(prediction.value, prediction.additional)" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import JourneyItem from "components/UI/Item/JourneyItem.vue";
import { onClickOutside } from "@vueuse/core";
import JourneyInput from "components/UI/Input/JourneyInput.vue";
const focus = ref(false);
const props = defineProps<{
    focusIn?: (payload: FocusEvent) => void;
    icon: any;
    modelValue?: string;
    placeholder?: string;
    debounce: number;
    predictions: {
        value: string;
        key: string | number | any;
        additional?: any;
    }[];
}>();

const text = ref();
const input = ref("");
const emits = defineEmits<{
    (e: "complete", value: string): void;
    (e: "selected", value: string, additional?: any): void;
    (e: "empty"): void;
    (e: "focus-out"): void;
    (e: "update:modelValue", value: string): void;
}>();

const predListRef = ref();

onClickOutside(predListRef, () => {
    emits("focus-out");
});

let timeout: any;
function autocomplete() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        emits("complete", input.value);
        emits("update:modelValue", input.value);
    }, props.debounce);
}

function select(value: string, additional?: any) {
    input.value = value;
    emits("selected", value, additional);
}

function setFocus(evt: FocusEvent) {
    if (props.focusIn) props.focusIn(evt);
    focus.value = true;
}

function focusOut() {
    focus.value = false;
}
</script>
<style scoped>
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
