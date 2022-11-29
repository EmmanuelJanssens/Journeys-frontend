<template>
    <journey-modal :header="'Edit ' + props.journey?.title" name="editJourney">
        <template v-slot:loading>
            <div v-if="isLoading" class="bg-high-contrast-text h-3">
                <div class="bg-secondary-darker h-full w-full animate-pulse"></div>
            </div>
            <div v-if="isLoading" class="bg-high-contrast-text h-3">
                <div class="bg-secondary-darker h-full w-full animate-pulse"></div>
            </div>
        </template>
        <template v-slot:body>
            <div class="bg-secondary-light p-4 flex flex-col h-full">
                <div class="flex space-x-2 flex-wrap max-w-3xl">
                    <div v-for="img in images" v-bind:key="img.url">
                        <button class="relative" @click="setThumbnail(img.url)">
                            <img
                                class="object-cover w-24 h-24 rounded-lg border-2 border-primary-darker p-1"
                                v-lazy="{ src: img.url, loading: '/assets/placeholder.png' }" />
                            <font-awesome-icon
                                v-if="img.active == 'checked'"
                                class="absolute top-0 right-0 text-green-400"
                                :icon="faCheckCircle" />
                        </button>
                    </div>
                </div>
                <div class="flex flex-col space-y-4 h-full">
                    <journey-input placeholder="Title" v-model="state.title" />
                    <journey-textarea :rows="6" placeholder="description" v-model="state.description" />
                </div>
            </div>
        </template>
        <template v-slot:footer>
            <div class="flex justify-end">
                <button @click="save">Save</button>
            </div>
        </template>
    </journey-modal>
</template>
<script lang="ts" setup>
import { useJourneyStore } from "stores/useJourneyStore";
import { useUserStore } from "stores/useUserStore";
import { JourneyDto } from "types/dtos";
import { onMounted, ref } from "vue";
import JourneyModal from "components/UI/Modal/JourneyModal.vue";
import JourneyInput from "components/UI/Input/JourneyInput.vue";
import JourneyTextarea from "components/UI/Input/JourneyTextarea.vue";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { POSITION, useToast } from "vue-toastification";

const userStore = useUserStore();
const journeyStore = useJourneyStore();
const toast = useToast();
const props = defineProps<{
    journey?: JourneyDto;
}>();

const state = ref({
    title: "",
    description: "",
    selectedThumbnail: ""
});

const images = ref<
    {
        url: string;
        active: string;
    }[]
>();
const isLoading = ref(false);
const selectedThumbnail = ref();
function setActive(img: string) {
    images.value?.forEach((image) => {
        if (image.url == img) {
            image.active = "checked";
        } else {
            image.active = "unchecked";
        }
    });
}

onMounted(async () => {
    await journeyStore.getJourney(props.journey?.id!);
    journeyStore.editJourney.journey = journeyStore.viewJourney;
    selectedThumbnail.value = props.journey?.thumbnail;
    images.value = [];
    journeyStore.editJourney.journey.experiencesConnection?.edges?.forEach((exp) => {
        exp.images.forEach((image) => {
            if (image == journeyStore.editJourney.journey?.thumbnail) {
                images.value?.push({
                    url: image,
                    active: "checked"
                });
            } else {
                images.value?.push({
                    url: image,
                    active: "unchecked"
                });
            }
        });
    });
    state.value = {
        title: journeyStore.editJourney.journey.title!,
        description: journeyStore.editJourney.journey.description!,
        selectedThumbnail: journeyStore.editJourney.journey.thumbnail!
    };
});

async function setThumbnail(url: string) {
    selectedThumbnail.value = url;
    setActive(url);
}
async function save() {
    isLoading.value = true;
    journeyStore.editJourney.journey!.title = state.value.title;
    journeyStore.editJourney.journey!.description = state.value.description;
    journeyStore.editJourney.journey!.id = props.journey?.id;
    journeyStore.editJourney.journey!.thumbnail = selectedThumbnail.value;

    const res = await journeyStore.updateJourney("");
    if (!res) {
        toast.error("Could not save your modifications", {
            position: POSITION.TOP_CENTER
        });
        return;
    }
    const edited = userStore.myJourneys?.find((journey) => journey.id == props.journey?.id);
    if (edited) {
        edited.title = journeyStore.editJourney.journey!.title;
        edited.description = journeyStore.editJourney.journey!.description;
        edited.thumbnail = journeyStore.editJourney.journey?.thumbnail;
        journeyModalController.close("editJourney");
        toast.success("Saved your modifications!", {
            position: POSITION.TOP_CENTER
        });
    }

    isLoading.value = false;
}
</script>
<style scoped lang="less">
.images {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
}
.checked {
    background-color: var(--ion-color-success);
}
.unchecked {
    background-color: var(--ion-color-medium);
}
.image-item {
    position: relative;
    padding: 8px;
    margin: 5px;
    border-radius: 10%;
    border: solid;
    border-color: var(--ion-color-primary);
    border-width: 1px;
    & ion-icon {
        border-radius: 50%;
        position: absolute;
        top: 2px;
        right: 2px;
        cursor: pointer;
    }
    & ion-img {
        border-radius: 10%;
    }
}
</style>
