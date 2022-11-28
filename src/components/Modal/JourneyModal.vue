<template>
    <Teleport to="#modal">
        <Transition name="modal" @transitionstart="test">
            <div
                class="fixed flex justify-center items-center left-00 top-0 w-screen h-screen z-[9000] bg-dim"
                v-if="journeyModalController.isOpen(name)">
                <div class="relative z-[9999] animate-appear" @animationend="test" ref="modal">
                    <div
                        class="flex flex-col bg-primary-main dark:bg-primary-dark mx-auto justify-between max-w-3xl rounded-xl">
                        <header class="">
                            <div class="flex items-center justify-between">
                                <div class="p-2 mx-2">
                                    <slot name="header"> {{ header }} </slot>
                                </div>

                                <div class="p-2 mx-2">
                                    <slot name="close"
                                        ><button @click="onClose ? onClose() : close()">
                                            <font-awesome-icon :icon="faClose" /></button
                                    ></slot>
                                </div>
                            </div>
                            <slot name="loading"></slot>
                        </header>
                        <section class="grow">
                            <slot name="body">Default body</slot>
                        </section>
                        <footer class="">
                            <div class="p-2 mx-2">
                                <slot name="footer"><button>OK</button></slot>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { onMounted, ref } from "vue";

import { journeyModalController } from "./JourneyModalController";
import { onClickOutside } from "@vueuse/core";

const modal = ref();

const emit = defineEmits(["onOpen"]);
const props = defineProps<{
    onOutsideClicked?: Function;
    onClose?: Function;
    header?: string;
    name: string;
}>();

function close() {
    journeyModalController.close(props.name);
    // (modal.value as HTMLElement).classList.remove("animate-appear");
    // (modal.value as HTMLElement).classList.add("animate-disappear");
}
function test() {
    console.log("foashfasdifhsadifh");
}
onClickOutside(modal, () => {
    if (props.onOutsideClicked) {
        props.onOutsideClicked();
    } else {
        journeyModalController.close(props.name);
    }
    // (modal.value as HTMLElement).classList.remove("animate-appear");
    // (modal.value as HTMLElement).classList.add("animate-disappear");
});

onMounted(() => {});
</script>

<style scoped>
.bg-dim {
    background-color: rgba(0, 0, 0, 0.5);
}
</style>
