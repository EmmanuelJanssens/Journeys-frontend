<template>
    <div class="flex flex-col bg-primary-light w-16 h-full transition-all shadow-inner" ref="menu">
        <div>
            <button
                @click="toggle"
                :class="{
                    'w-full p-2 text-primary-darker': true,
                    'text-left': isOpen
                }">
                <FontAwesomeIcon :size="'2x'" v-if="!isOpen" :icon="faBars" /><FontAwesomeIcon
                    :size="'2x'"
                    v-if="isOpen"
                    :icon="faXmark" />
            </button>
            <img
                :class="{
                    'rounded-full p-1': !isOpen,
                    'rounded-full p-4': isOpen
                }"
                src="/assets/placeholder.png" />

            <div class="flex flex-col whitespace-pre-wrap text-primary-darker">
                <div
                    v-for="button in buttons"
                    @click="button.handler"
                    v-bind:key="button.text"
                    :class="{
                        ' group hover:bg-btn-dark hover:bg-opacity-30 hover:cursor-pointer  ': true,
                        ' border-b-2 border-b-primary-main flex items-center space-x-8 p-4': isOpen,
                        hidden: !button.visible,
                        ' py-2 text-center': !isOpen
                    }">
                    <FontAwesomeIcon
                        :icon="button.icon"
                        size="2x"
                        class="hover:cursor-pointer transition-all group-hover:scale-125" />
                    <button v-if="isOpen">{{ button.text }}</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faBars, faXmark, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { ref } from "vue";

const props = defineProps(["buttons"]);
const menu = ref();
const isOpen = ref(false);

function toggle() {
    const el = menu.value as HTMLElement;
    if (el.classList.contains("w-16")) {
        el.classList.add("w-96");
        el.classList.remove("w-16");
    } else if (el.classList.contains("w-96")) {
        el.classList.remove("w-96");
        el.classList.add("w-16");
    }
    isOpen.value = !isOpen.value;
}
</script>
