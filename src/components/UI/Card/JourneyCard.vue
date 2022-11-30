<template>
    <div
        class="rounded-lg flex flex-col space-y-4 w-[300px] bg-secondary-light dark:bg-secondary-dark drop-shadow-xl max-w-xs origin-center"
        ref="card">
        <div class="top-0 p-3 bg-primary-main dark:primar w-full rounded-t-xl">
            <div class="flex space-x-4 justify-between">
                <p class="text-center text-white">
                    <slot name="header"> </slot>
                </p>
            </div>
        </div>
        <div class="px-4">
            <div class="text-opacity-80 text-gray-600">
                <slot name="subtitle"></slot>
            </div>
        </div>
        <slot name="body"></slot>
        <!-- <div>
            class="px-4">
            <div class="text-opacity-80 text-gray-600">
                <p><slot name="subtitle"></slot></p>
            </div>
        </div>

        <div>
            <slot name="image"></slot>
        </div>
        <div class="bottom-0 p-4 w-full rounded-xl opacity-70 max-h-36 overflow-auto">
            <p class="text-center text-primary-darker">
                <slot name="description">description</slot>
            </p>
        </div> -->
        <div class="flex justify-end bg-primary-main rounded-b-lg">
            <slot name="footer">
                <JourneyButton fill="none">Add</JourneyButton>
            </slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { rand } from "@vueuse/shared";
import JourneyButton from "components/UI/Button/JourneyButton.vue";
import { onMounted, ref } from "vue";

const card = ref();
const props = defineProps<{
    pos?: {
        x: number;
        y: number;
    };
}>();
onMounted(() => {
    if (props.pos) {
        const el = card.value as HTMLDivElement;
        el.classList.add("animate-pop");
        const rect = el.getBoundingClientRect();

        el.style.left = props.pos!.x + 150 + "px";
        el.style.top = props.pos!.y - 200 + "px";
    }
});
</script>
