<template>
    <JourneyModal header="alert" name="alert" class="w-24">
        <template #header>
            <div class="">
                {{ title }}
            </div>
        </template>
        <template #body>
            <div class="p-4 bg-secondary-light">
                {{ message }}
            </div>
        </template>
        <template #footer>
            <div class="flex justify-end space-x-4">
                <div v-for="button in buttons" :key="button.text">
                    <button @click="button.handler()">
                        {{ button.text }}
                    </button>
                </div>
            </div>
        </template>
    </JourneyModal>
</template>
<script setup lang="ts">
import JourneyModal from "components/UI/Modal/JourneyModal.vue";

defineProps<{
    title: string;
    message: string;
    buttons: {
        text: string;
        handler: () => {
            //
        };
    }[];
}>();
</script>
