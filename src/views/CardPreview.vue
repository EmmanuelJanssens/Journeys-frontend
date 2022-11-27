<template>
    <div class="relative flex flex-col md:drop-shadow">
        <img class="object-cover rounded-3xl" :src="image" />
        <div class="absolute bottom-0">
            <div class="bg-black opacity-80 rounded-b-3xl p-4">
                <p class="text-white">{{ description }}</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
defineProps<{
    image: string;
    description: string;
}>();
</script>
<style></style>
