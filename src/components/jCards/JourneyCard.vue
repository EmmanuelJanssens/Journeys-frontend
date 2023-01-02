<template>
    <div class="card w-auto bg-base-100 shadow-xl max-w-xs">
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
        <div class="card-body">
            <figure>
                <img
                    class="rounded-xl object-cover h-52 w-full shadow-lg"
                    v-lazy="{
                        src: journey.thumbnail?.thumbnail,
                        loading: '/assets/placeholder.png',
                        error: '/assets/placeholder.png'
                    }"
                    alt="thumbnail" />
            </figure>

            <div
                v-if="journey.description && journey.description.length > 0"
                class="bottom-0 p-4 w-full rounded-xl opacity-70 max-h-36 overflow-auto break-before-all">
                <p class="text-center text-primary-darker">
                    {{ journey.description }}
                </p>
            </div>
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
                            position: POSITION.BOTTOM_RIGHT
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
