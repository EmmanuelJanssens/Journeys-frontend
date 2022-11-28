<template>
    <div class="relative w-80 h-96 bg-white rounded-xl drop-shadow-xl">
        <div class="top-0 p-3 bg-primary-main dark:primar w-full rounded-t-xl opacity-50">
            <div class="flex space-x-4 justify-between">
                <p class="text-center text-white">{{ journey.title }}</p>
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
        <div class="h-full w-full p-4">
            <img class="rounded-xl object-cover h-1/3 w-full" v-if="journey.thumbnail" :src="journey.thumbnail" />
            <img class="rounded-xl object-cover h-1/3 w-full" v-else src="/assets/placeholder.png" />
        </div>

        <div
            v-if="journey.description && journey.description.length > 0"
            class="absolute bottom-0 p-4 bg-black w-full rounded-xl opacity-70 max-h-36 overflow-auto">
            <p class="text-center text-white">{{ journey.description }}</p>
        </div>
        <div></div>
    </div>
</template>

<script lang="ts" setup>
import EditJourneyModal from "components/Modals/EditJourneyModal.vue";
import { useJourneyStore } from "stores/useJourneyStore";
import { useUserStore } from "stores/useUserStore";
import { JourneyDto } from "types/dtos";
import { showToast } from "utils/utils";

import { faPencil, faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { journeyModalController } from "components/Modal/JourneyModalController";

const props = defineProps<{
    journey: JourneyDto;
}>();

const emit = defineEmits(["headerClicked", "upated"]);
const useJourney = useJourneyStore();
const useUser = useUserStore();
async function onEdit() {
    journeyModalController.open("editJourney", {
        props: {
            journey: props.journey
        }
    });
    // const modal = await modalController.create({
    //     component: EditJourneyModal,
    //     componentProps: props,
    //     keyboardClose: false
    // });
    // await modal.present();
    // const { data } = await modal.onDidDismiss();
    // if (data && data.status === "success") emit("upated");
}

async function onDelete() {
    // popoverController.dismiss();
    // const alert = await alertController.create({
    //     header: "Warning",
    //     subHeader: "You are about to delete this journey, this action is action is irreversible",
    //     message: "Do you wish to proceed?",
    //     buttons: [
    //         {
    //             text: "Yes",
    //             role: "proceed",
    //             handler: async () => {
    //                 await useJourney.removeJourney(props.journey.id!);
    //                 useUser.removeJourney(props.journey.id!);
    //                 showToast("Journey deleted", "success");
    //                 emit("upated");
    //             }
    //         },
    //         "No"
    //     ]
    // });
    // await alert.present();
}
async function goToJourney(id: string) {
    emit("headerClicked", id);
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
    background: #000;
    border-radius: 100%;
}

::-webkit-scrollbar-thumb {
    background: #393812;
    -webkit-border-radius: 1ex;
    -webkit-box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.75);
}

::-webkit-scrollbar-corner {
    background: #000;
}
</style>
