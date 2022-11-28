<template>
    <!-- <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Edit journey</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-grid>
                <ion-row>
                    <ion-col>
                        <ion-item>
                            <ion-label position="fixed">Thumbnail</ion-label>
                            <div class="images">
                                <div class="image-item" v-for="image in images" v-bind:key="image.url">
                                    <ion-thumbnail>
                                        <ion-img :src="image.url" />
                                    </ion-thumbnail>
                                    <ion-icon
                                        :class="image.active"
                                        slot="icon-only"
                                        :icon="checkmarkOutline"
                                        @click="setThumbnail(image.url, $event)"></ion-icon>
                                </div>
                            </div> </ion-item
                    ></ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <ion-item>
                            <ion-label position="stacked"> JourneyTitle </ion-label>
                            <ion-input type="text" :value="props.journey?.title" v-model="title" /> </ion-item
                    ></ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <ion-item>
                            <ion-label position="stacked">Description</ion-label>
                            <ion-textarea :value="props.journey?.description" v-model="description" :auto-grow="true">
                            </ion-textarea>
                        </ion-item>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
        <ion-footer>
            <ion-toolbar>
                <ion-buttons slot="end">
                    <ion-button slot="end" color="secondary" @click="modalController.dismiss()"> cancel </ion-button>
                    <ion-button slot="end" @click="save"> Save </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-footer>
    </ion-page> -->

    <journey-modal header="Edit your journey" name="journey">
        <template v-slot:loading>
            <div v-if="isLoading" class="bg-high-contrast-text h-3">
                <div class="bg-secondary-darker h-full w-full animate-pulse"></div>
            </div>
        </template>
        <template v-slot:body>
            <div class="bg-secondary-light p-4 flex flex-col">
                <journey-input placeholder="Title" />
                <journey-textarea placeholder="description" :value="props.journey?.description" />
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
import JourneyModal from "components/Modal/JourneyModal.vue";
import JourneyInput from "components/Input/JourneyInput.vue";
import JourneyTextarea from "components/Input/JourneyTextarea.vue";
import { journeyModalController } from "components/Modal/JourneyModalController";

const userStore = useUserStore();
const journeyStore = useJourneyStore();

const props = defineProps<{
    journey?: JourneyDto;
}>();

const title = ref();
const description = ref();
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
    // await journeyStore.getJourney(props.journey.id!);
    // journeyModalController.create("journey");
    // journeyStore.editJourney.journey = journeyStore.viewJourney;
    // selectedThumbnail.value = props.journey.thumbnail;
    // images.value = [];
    // journeyStore.editJourney.journey.experiencesConnection?.edges?.forEach((exp) => {
    //     exp.images.forEach((image) => {
    //         if (image == journeyStore.editJourney.journey?.thumbnail) {
    //             images.value?.push({
    //                 url: image,
    //                 active: "checked"
    //             });
    //         } else {
    //             images.value?.push({
    //                 url: image,
    //                 active: "unchecked"
    //             });
    //         }
    //     });
    // });
});

async function setThumbnail(url: string, el: any) {
    selectedThumbnail.value = url;
    setActive(url);
}
async function save() {
    // journeyStore.editJourney.journey!.title = title.value ? title.value : journeyStore.editJourney.journey!.title;
    // journeyStore.editJourney.journey!.description = description.value
    //     ? description.value
    //     : journeyStore.editJourney.journey!.description;
    // journeyStore.editJourney.journey!.id = props.journey.id;
    // journeyStore.editJourney.journey!.thumbnail = selectedThumbnail.value;
    // await journeyStore.updateJourney("");
    // modalController.dismiss({ status: "success" });
    // const edited = userStore.myJourneys?.find((journey) => journey.id == props.journey.id);
    // if (edited) {
    //     edited.title = journeyStore.editJourney.journey!.title;
    //     edited.description = journeyStore.editJourney.journey!.description;
    //     edited.thumbnail = journeyStore.editJourney.journey?.thumbnail;
    // }
    // await showToast("Your journey  was successfully updated", "success");
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
