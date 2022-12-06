<template>
    <div class="flex flex-col items-center space-y-4">
        <!-- <div
            class="card card-side bg-base-100 shadow-lg w-96"
            v-for="journey in userStore.myJourneys"
            v-bind:key="journey.id">
            <figure>
                <img
                    class="h-24 w-24 object-cover"
                    v-lazy="{
                        src: journey.thumbnail,
                        loading: '/assets/placeholder.png',
                        error: '/assets/placeholder.png'
                    }" />
            </figure>
            <div class="card-body">
                <h2 class="card-title">{{ journey.title }}</h2>
                <p>{{ journey.description }}</p>
                <div class="card-actions justify-end">
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
                </div>
            </div>
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
                <tr v-for="journey in userStore.myJourneys?.journeys" v-bind:key="journey.id">
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
        <button v-if="userStore.myJourneys.pageInfo?.hasNextPage" class="btn btn-secondary" @click="nextPage">
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
import { Journey } from "types/JourneyDtos";

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

async function nextPage() {
    await userStore.fetchMyJourneys(userStore.myJourneys.pageInfo?.endCursor);
}
</script>
