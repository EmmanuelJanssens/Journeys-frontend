<template>
    <div>
        <table class="table w-full">
            <thead>
                <tr>
                    <th>Thumbnail</th>
                    <th>Name</th>
                    <th>Total experiences</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="poi in poiList" v-bind:key="poi.id">
                    <th>
                        <div class="flex items-center space-x-3">
                            <div class="avatar">
                                <div class="mask mask-squircle w-12 h-12">
                                    <img
                                        class="h-24 w-24 object-cover"
                                        v-lazy="{
                                            src: poi.thumbnail,
                                            loading: '/assets/placeholder.png',
                                            error: '/assets/placeholder.png'
                                        }" />img
                                </div>
                            </div>
                        </div>
                    </th>
                    <td>
                        <div class="font-bold">{{ poi.name }}</div>
                    </td>
                    <td>
                        <div>{{ poi.nExperiences }}</div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<script lang="ts" setup>
import { useUserStore } from "stores/useUserStore";
import { onMounted, ref } from "vue";

const userStore = useUserStore();

const poiList = ref();

onMounted(async () => {
    poiList.value = await userStore.fetchMyPois();
});
</script>
