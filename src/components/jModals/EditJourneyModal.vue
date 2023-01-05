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
                    <div v-for="img in images" :key="img.image.id">
                        <button class="relative" @click="setThumbnail(img.image.id)">
                            <img
                                v-lazy="{ src: img.image.thumbnail, loading: '/assets/placeholder.png' }"
                                class="object-cover w-24 h-24 rounded-lg border-2 border-primary-darker p-1"
                                alt="thumbnail" />
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
import { JourneyImage } from "types/image/image";
import { Journey } from "types/journey/journey";
const userStore = useUserStore();
const journeyStore = useJourneyStore();
const toast = useToast();
const props = defineProps<{
    journey?: Journey;
}>();

const state = ref<{
    title?: string;
    description?: string;
    thumbnail?: string;
    visibility?: "public" | "private";
}>({});

const images = ref<
    {
        image: JourneyImage;
        active: string;
    }[]
>();
const isLoading = ref(false);
const selectedThumbnail = ref();
function setActive(img: string) {
    images.value?.forEach((image) => {
        if (image.image.id == img) {
            image.active = "checked";
        } else {
            image.active = "unchecked";
        }
    });
}

onMounted(async () => {
    selectedThumbnail.value = props.journey?.thumbnail;
    images.value = [];
    props.journey!.thumbnails?.forEach((img) => {
        if (img.id == props.journey!.thumbnail?.id) {
            images.value?.push({
                image: img,
                active: "checked"
            });
        } else {
            images.value?.push({
                image: img,
                active: "unchecked"
            });
        }
    });

    state.value = {
        title: props.journey?.title!,
        description: props.journey?.description!,
        thumbnail: props.journey?.thumbnail ? props.journey?.thumbnail?.id : "",
        visibility: props.journey?.visibility!
    };
});

async function setThumbnail(id: string) {
    state.value.thumbnail = id;
    setActive(id);
}
async function save() {
    isLoading.value = true;

    const res = await journeyStore.patchJourney(props.journey?.id!, state.value);
    if (!res) {
        toast.error("Could not save your modifications", {
            position: POSITION.BOTTOM_RIGHT
        });
        return;
    }
    const edited = userStore.myJourneys?.find((journey) => journey.id == props.journey?.id);
    if (edited) {
        edited.title = res.title;
        edited.description = res.description;
        edited.thumbnail = res.thumbnail;
        journeyModalController.close("editJourney");
        toast.success("Saved your modifications!", {
            position: POSITION.BOTTOM_RIGHT
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
