<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <div class="flex flex-row overflow-auto">
        <div v-for="feature in features" v-bind:key="feature.title" class="h-full">
            <ion-card-header>
                <ion-card-title>{{ feature.title }}</ion-card-title>
                <ion-card-content>
                    <ion-img v-motion-slide-top class="h-64 p-2" :src="feature.image" />
                    <p v-motion-fade class="h-40 p-2">
                        {{ feature.description }}
                    </p>
                </ion-card-content>
            </ion-card-header>
        </div>
    </div>
</template>
<script setup lang="ts">
import { IonImg, IonCardTitle, IonCardHeader, IonCardContent } from "@ionic/vue";
import { defineProps } from "vue";
defineProps<{
    features: { title: string; description: string; image: string }[];
    mobile: boolean;
}>();
</script>
<style scoped lang="less"></style>
