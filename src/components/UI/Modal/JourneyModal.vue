<template>
    <Teleport to="#modal">
        <Transition name="modal">
            <div
                v-if="journeyModalController.isOpen(name)"
                class="absolute flex left-0 top-0 w-screen h-screen bg-black bg-opacity-30 items-center justify-center z-50">
                <div ref="modal" :class="classList">
                    <header class="bg-primary-main dark:bg-primary-dark rounded-t-lg text-high-contrast-text">
                        <div class="flex items-center justify-between">
                            <div class="p-2 mx-2">
                                <slot name="header">
                                    {{ header }}
                                </slot>
                            </div>

                            <div class="p-2 mx-2">
                                <slot name="close">
                                    <button @click="onClose ? onClose() : close()">
                                        <font-awesome-icon :icon="faClose" />
                                    </button>
                                </slot>
                            </div>
                        </div>
                        <div v-if="loading">
                            <div class="relative bg-primary-light h-2">
                                <div class="absolute bg-secondary-main dark:bg-gray-800 h-full w-1/3 load" />
                            </div>
                        </div>
                    </header>
                    <section class="h-full bg-secondary-light dark:bg-gray-800">
                        <slot name="body"> Default body </slot>
                    </section>
                    <footer class="bg-primary-main dark:bg-primary-dark rounded-b-lg">
                        <div class="p-2 mx-2 text-high-contrast-text">
                            <slot name="footer">
                                <button>OK</button>
                            </slot>
                        </div>
                    </footer>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { onClickOutside } from "@vueuse/core";
import { computed, onMounted, ref } from "vue";

import { journeyModalController } from "./JourneyModalController";

const modal = ref();

// onOutsideClicked?: Function;
//     onClose?: Function;
//     header?: string;
//     name: string;
//     size?: {
//         w: string;
//         h: string;
//     };

const props = defineProps({
    onOutsideClicked: Function,
    onClose: Function,
    loading: {
        type: Boolean,
        default: false
    },
    header: {
        type: String,
        default: "Header"
    },
    name: {
        type: String,
        default: "modal"
    },
    size: {
        type: Object,
        default: () => ({
            w: {
                type: String,
                default: "w-1/2"
            },
            h: {
                type: String,
                default: "h-1/3"
            }
        })
    }
});

const classList = computed(() => "flex flex-col max-w-2xl rounded-lg " + props.size.w + " " + props.size.h);
function close() {
    journeyModalController.close(props.name);
}

onClickOutside(modal, () => {
    if (props.onOutsideClicked) {
        props.onOutsideClicked();
    } else {
        journeyModalController.close(props.name);
    }
});

onMounted(() => {
    (modal.value as HTMLElement).classList.add("animate-appear");
});
</script>

<style scoped>
.bg-dim {
    background-color: rgba(0, 0, 0, 0.5);
}

@keyframes left-right {
    0% {
        transform: translateX(0px);
    }
    50% {
        transform: translateX(200%);
    }
}
.load {
    animation: left-right 1.5s ease-in-out infinite;
}
</style>
