<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <div class="relative min-h-[400] sm:min-h-full">
        <p class="text-2xl p-4 sm:text-5xl text-center" ref="title">{{ props.title }}</p>
        <div class="p-4 sm:flex sm:flex-col-reverse sm:items-center">
            <div class="max-w-4xl" ref="image">
                <ion-img class="object-contain" :src="props.image" />
            </div>
            <p class="p-4 max-w-4xl" ref="description">
                {{ props.description }}
            </p>
        </div>
    </div>
</template>
<script setup lang="ts">
import { IonImg } from "@ionic/vue";
import { MaybeElementRef, useIntersectionObserver } from "@vueuse/core";
import { animationEnterLeft } from "animation/animationTypes";
import { onMounted, ref, defineProps } from "vue";

const props = defineProps<{
    title: string;
    description: string;
    image: string;
}>();

const title = ref();
const description = ref();
const image = ref();

const registerAnimation = (element: MaybeElementRef, animation: string) => {
    useIntersectionObserver(element, ([{ isIntersecting, target }]: any) => {
        if (isIntersecting) {
            target.classList.add(animation);
            return;
        }
        target.classList.remove(animation);
    });
};

onMounted(() => {
    registerAnimation(title, animationEnterLeft);
    registerAnimation(description, animationEnterLeft);
    registerAnimation(image, animationEnterLeft);
});
</script>
<style scoped lang="less"></style>
