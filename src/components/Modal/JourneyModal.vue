<template>
    <Teleport to="#modal">
        <Transition name="modal">
            <div
                class="fixed flex justify-center items-center left-00 top-0 w-screen h-screen z-[9000] bg-dim"
                v-if="journeyModalController.isOpen()">
                <div class="relative z-[9999]" ref="modal">
                    <div
                        class="' flex flex-col bg-primary-main dark:bg-primary-dark mx-auto justify-between max-w-3xl'">
                        <header class="">
                            <div class="flex items-center justify-between">
                                <div class="p-2 mx-2">
                                    <slot name="header"> {{ header }} </slot>
                                </div>

                                <div class="p-2 mx-2">
                                    <slot name="close"
                                        ><button @click="journeyModalController.close()">
                                            <font-awesome-icon :icon="faClose" /></button
                                    ></slot>
                                </div>
                            </div>
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
import { ref } from "vue";

import { journeyModalController } from "./JourneyModalController";
import { onClickOutside } from "@vueuse/core";

const modal = ref();
onClickOutside(modal, () => {
    journeyModalController.close();
});

defineProps<{
    header?: string;
}>();
</script>

<style scoped>
.bg-dim {
    background-color: rgba(0, 0, 0, 0.5);
}

.modal-enter-active,
.modal-leave-active {
    transition: all 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
    transform: scale(1.1);
}
</style>
