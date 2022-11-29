<template>
    <JourneyModal header="alert" name="alert" class="w-24">
        <template v-slot:header
            ><div class="">
                {{ title }}
            </div>
        </template>
        <template v-slot:body>
            <div class="p-4 bg-secondary-light">
                {{ message }}
            </div></template
        >
        <template v-slot:footer>
            <div class="flex justify-end space-x-4">
                <div v-for="button in buttons" v-bind:key="button.text">
                    <button @click="button.handler()">{{ button.text }}</button>
                </div>
            </div>
        </template>
    </JourneyModal>
</template>
<script setup lang="ts">
import JourneyModal from "components/Modal/JourneyModal.vue";
import { ref } from "vue";

const props = defineProps<{
    title: string;
    message: string;
    buttons: {
        text: string;
        handler: () => {};
    }[];
}>();
</script>
