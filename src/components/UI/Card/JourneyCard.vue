<template>
    <div
        ref="card"
        class="rounded-lg flex flex-col space-y-4 w-[300px] bg-secondary-light dark:text-primary-main drop-shadow-xl max-w-xs origin-center">
        <div class="top-0 p-3 bg-primary-main dark:primar w-full rounded-t-xl">
            <div class="flex space-x-4 justify-between">
                <p class="text-center text-white">
                    <slot name="header" />
                </p>
            </div>
        </div>
        <div class="px-4">
            <div class="text-opacity-80 text-gray-600">
                <slot name="subtitle" />
            </div>
        </div>
        <slot name="body" />
        <div class="flex justify-end bg-primary-main rounded-b-lg">
            <slot name="footer">
                <button class="btn btn-primary btn-outline">Add</button>
            </slot>
        </div>
    </div>
</template>

<script setup lang="ts">
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
        el.style.left = props.pos!.x - el.getBoundingClientRect().x + "px";
        el.style.top = props.pos!.y - el.getBoundingClientRect().y + "px";
    }
});
</script>
