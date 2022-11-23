<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <div class="relative sm:h-full" v-motion="parentMotion">
        <p class="text-2xl p-4 sm:text-5xl" v-motion="titleMotion">Journaling</p>
        <div class="p-4 sm:flex sm:flex-col sm:items-center">
            <p class="p-4 max-w-4xl" v-motion="textMotion">
                {{ description }}
            </p>
            <div class="max-w-4xl" v-motion="imageMotion">
                <img class="object-contain" :src="image" />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { defineProps } from "vue";
defineProps(["parentMotion", "titleMotion", "textMotion", "imageMotion", "description", "image"]);
</script>
<style scoped lang="less"></style>
