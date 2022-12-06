<template>
    <journey-modal
        :header="'Edit ' + props.journey?.title"
        name="editJourney"
        :loading="isLoading"
        :size="{
            w: 'w-1/2  min-w-max',
            h: 'h/1/3'
        }">
        <template #body>
            <div class="bg-secondary-light dark:bg-gray-800 p-4 flex flex-col h-full">
                <div class="flex space-x-2 flex-wrap max-w-3xl">
                    <div v-for="img in images" :key="img.url">
                        <button class="relative" @click="setThumbnail(img.url)">
                            <img
                                v-lazy="{ src: img.url, loading: '/assets/placeholder.png' }"
                                class="object-cover w-24 h-24 rounded-lg border-2 border-primary-darker p-1" />
                            <font-awesome-icon
                                v-if="img.active == 'checked'"
                                class="absolute top-0 right-0 text-green-400"
                                :icon="faCheckCircle" />
                        </button>
                    </div>
                </div>
                <div class="flex flex-col space-y-4 h-full">
                    <journey-input v-model="state.title" placeholder="Title" />
                    <journey-textarea v-model="state.description" :rows="6" placeholder="description" />
                </div>
            </div>
        </template>
        <template #footer>
            <div class="flex justify-end">
                <button @click="save">Save</button>
            </div>
        </template>
    </journey-modal>
</template>
<script lang="ts" setup>
import { useJourneyStore } from "stores/useJourneyStore";
import { useUserStore } from "stores/useUserStore";
import { onMounted, ref } from "vue";
import JourneyModal from "components/UI/Modal/JourneyModal.vue";
import JourneyInput from "components/UI/Input/JourneyInput.vue";
import JourneyTextarea from "components/UI/Input/JourneyTextarea.vue";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { POSITION, useToast } from "vue-toastification";
import { Journey } from "types/JourneyDtos";

const userStore = useUserStore();
const journeyStore = useJourneyStore();
const toast = useToast();
const props = defineProps<{
    journey?: Journey;
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
    journeyStore.journey = (await journeyStore.getJourney(props.journey?.id!))!;
    selectedThumbnail.value = props.journey?.thumbnail;
    images.value = [];
    journeyStore.journey.experiences?.forEach((experience) => {
        experience.data.images?.forEach((image) => {
            if (image == journeyStore.journey?.thumbnail) {
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
        title: journeyStore.journey.title!,
        description: journeyStore.journey.description!,
        selectedThumbnail: journeyStore.journey.thumbnail!
    };
});

async function setThumbnail(url: string) {
    selectedThumbnail.value = url;
    setActive(url);
}
async function save() {
    isLoading.value = true;
    if (journeyStore.journey) {
        journeyStore.journey.title = state.value.title;
        journeyStore.journey.description = state.value.description;
        journeyStore.journey.id = props.journey?.id;
        journeyStore.journey.thumbnail = selectedThumbnail.value;
        delete journeyStore.journey!.experiences;
        const res = await journeyStore.updateJourneyDetails();
        if (!res) {
            toast.error("Could not save your modifications", {
                position: POSITION.BOTTOM_RIGHT
            });
            return;
        }
        const edited = userStore.myJourneys?.find((journey) => journey.id == props.journey?.id);
        if (edited) {
            edited.title = journeyStore.journey.title;
            edited.description = journeyStore.journey.description;
            edited.thumbnail = journeyStore.journey?.thumbnail;
            journeyModalController.close("editJourney");
            toast.success("Saved your modifications!", {
                position: POSITION.BOTTOM_RIGHT
            });
        }
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
