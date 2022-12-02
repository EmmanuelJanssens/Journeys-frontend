<template>
    <div class="flex flex-col space-y-4 bg-secondary-light dark:bg-gray-800 rounded-xl drop-shadow-xl">
        <div class="top-0 p-3 bg-primary-main dark:bg-primary-dark w-full rounded-t-xl">
            <div class="flex space-x-4 justify-between">
                <p class="text-center text-white">
                    {{ journey.title }}
                </p>
                <div class="flex space-x-4">
                    <button class="text-white transform hover:scale-110" @click="onEdit">
                        <font-awesome-icon :icon="faPencil" class="text-white" />
                    </button>

                    <button class="text-white transform hover:scale-110" @click="goToJourney(props.journey.id!)">
                        <font-awesome-icon :icon="faEye" class="text-white" />
                    </button>
                    <button class="text-white transform hover:scale-110" @click="onDelete">
                        <font-awesome-icon :icon="faTrash" class="text-white" />
                    </button>
                </div>
            </div>
        </div>
        <div class="p-4">
            <img v-if="journey.thumbnail" class="rounded-xl object-cover h-52 w-full" :src="journey.thumbnail" />
            <img v-else class="rounded-xl object-cover h-52 w-full" src="/assets/placeholder.png" />
        </div>
        <div
            v-if="journey.description && journey.description.length > 0"
            class="bottom-0 p-4 w-full rounded-xl opacity-70 max-h-36 overflow-auto break-before-all">
            <p class="text-center text-primary-darker">
                {{ journey.description }}
            </p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useJourneyStore } from "stores/useJourneyStore";
import { useUserStore } from "stores/useUserStore";

import { faPencil, faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";
import { POSITION, useToast } from "vue-toastification";
import router from "router/router";
import { drawMyJourneys } from "map/drawOnMap";
import { Journey } from "types/JourneyDtos";

const toast = useToast();

const props = defineProps<{
    journey: Journey;
}>();

const journeyStore = useJourneyStore();
const userStore = useUserStore();

async function onEdit() {
    journeyModalController.open("editJourney", {
        props: {
            journey: props.journey
        }
    });
}

async function onDelete() {
    journeyModalController.open("alert", {
        props: {
            title: "Warning",
            message: "This action is irreversible",
            buttons: [
                {
                    text: "OK",
                    handler: async () => {
                        await journeyStore.removeJourney(props.journey.id!);
                        userStore.removeJourney(props.journey.id!);
                        journeyModalController.close("alert");
                        toast.success("Journey deleted", {
                            position: POSITION.TOP_CENTER
                        });
                        drawMyJourneys();
                    }
                },
                {
                    text: "CANCEL",
                    handler: async () => {
                        journeyModalController.close("alert");
                    }
                }
            ]
        }
    });
}
async function goToJourney(id: string) {
    router.push("logbook/journey/" + id);
}
</script>
<style scoped lang="less">
.thumbnail {
    height: 200px;
}
ion-card-header {
    cursor: pointer;
}
ion-card {
    max-height: 400px;
    min-height: 400px;
    display: flex;
    flex-direction: column;
}
.content {
    overflow: auto;
}
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
