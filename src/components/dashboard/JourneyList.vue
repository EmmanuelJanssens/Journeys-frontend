<template>
    <div class="flex flex-col items-center space-y-4">
        <!-- <div class="flex items-center justify-center">
            <select class="select select-primary w-full max-w-xs" ref="sortMode" @change="sort">
                <option disabled selected>Sort by</option>
                <option>Title</option>
                <option>Amount of Experiences</option>
            </select>
            <select class="select select-primary w-full max-w-xs" ref="sortOrder" @change="sort">
                <option disabled selected>Sorting Mode</option>
                <option>ASC</option>
                <option>DESC</option>
            </select>
        </div> -->

        <table class="table w-full">
            <thead>
                <tr>
                    <th>Thumbnail</th>
                    <th>Title</th>
                    <th>Total experiences</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="journey in journeyList?.journeys" v-bind:key="journey.id">
                    <th>
                        <div class="flex items-center space-x-3">
                            <div class="avatar">
                                <div class="mask mask-squircle w-12 h-12">
                                    <img
                                        class="h-24 w-24 object-cover"
                                        v-lazy="{
                                            src: journey.thumbnail,
                                            loading: '/assets/placeholder.png',
                                            error: '/assets/placeholder.png'
                                        }" />img
                                </div>
                            </div>
                        </div>
                    </th>
                    <td>
                        <div class="font-bold">{{ journey.title }}</div>
                        <div class="text sm opacity-50">{{ journey.description }}</div>
                    </td>
                    <td>
                        <div>{{ journey.nExperiences }}</div>
                    </td>
                    <td>
                        <div class="flex space-x-1">
                            <button
                                class="btn btn-primary"
                                @click="
                                    () =>
                                        journeyModalController.open('editJourney', {
                                            props: {
                                                journey: journey
                                            }
                                        })
                                ">
                                <FontAwesomeIcon :icon="faPencil" />
                            </button>
                            <button class="btn btn-error" @click="onDelete(journey)">
                                <FontAwesomeIcon :icon="faTrash" />
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <button v-if="journeyList?.pageInfo?.hasNextPage" class="btn btn-secondary" @click="nextPage">
            <p>More</p>
        </button>
    </div>
</template>
<script lang="ts" setup>
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useUserStore } from "stores/useUserStore";
import { journeyModalController } from "components/UI/Modal/JourneyModalController";
import { drawMyJourneys } from "map/drawOnMap";
import { useJourneyStore } from "stores/useJourneyStore";
import { useToast, POSITION } from "vue-toastification";
import { Journey, PagedJourneys } from "types/JourneyDtos";
import { onMounted, ref } from "vue";

const userStore = useUserStore();
const journeyStore = useJourneyStore();

const toast = useToast();

async function onDelete(journey: Journey) {
    journeyModalController.open("alert", {
        props: {
            title: "Warning",
            message: "This action is irreversible",
            buttons: [
                {
                    text: "OK",
                    handler: async () => {
                        await journeyStore.removeJourney(journey.id!);
                        userStore.removeJourney(journey.id!);
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

const journeyList = ref<PagedJourneys>();

onMounted(async () => {
    await userStore.didLogin();
    if (userStore.state.isLoggedIn) journeyList.value = await userStore.fetchNextPage(5, undefined);
    else journeyModalController.open("login");
});
async function nextPage() {
    const fetched = await userStore.fetchNextPage(5, journeyList.value?.pageInfo?.endCursor!);
    journeyList.value!.pageInfo = fetched.pageInfo;
    journeyList.value!.journeys = journeyList.value?.journeys.concat(...fetched.journeys)!;
}

const sortMode = ref();
const sortOrder = ref();
function sort(event: Event) {
    const target = event.target as HTMLSelectElement;
    const order = sortOrder.value as HTMLSelectElement;

    switch (target.options.selectedIndex) {
        case 1:
            if (order.options.selectedIndex == 2) {
                userStore.myJourneys.journeys.sort((a, b) => {
                    if (a.title! < b.title!) return 1;
                    else if (a.title! > b.title!) return -1;
                    else return 0;
                });
            } else {
                userStore.myJourneys.journeys.sort((a, b) => {
                    if (a.title! < b.title!) return -1;
                    else if (a.title! > b.title!) return 1;
                    else return 0;
                });
            }

            break;
        case 2:
            if (order.options.selectedIndex == 2) {
                userStore.myJourneys.journeys.sort((a, b) => b.nExperiences! - a.nExperiences!);
            } else {
                userStore.myJourneys.journeys.sort((a, b) => a.nExperiences! - b.nExperiences!);
            }
            break;
    }
}
</script>
