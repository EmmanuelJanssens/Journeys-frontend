<template>
    <ion-item button @click="() => emit('selected')">
        <ion-thumbnail slot="start">
            <ion-img src="src/assets/placeholder.png" @ionImgDidLoad="() => (loaded = true)"> </ion-img>
        </ion-thumbnail>
        <ion-label>
            <h3>
                {{ props.journey.title }}
            </h3>
            <p>
                {{ props.journey.description }}
            </p>
        </ion-label>
    </ion-item>
</template>

<script lang="ts" setup>
import { IonItem, IonThumbnail, IonImg, IonLabel } from "@ionic/vue";
import { JourneyDto } from "types/dtos";
import { onUnmounted, ref } from "vue";

var loaded = ref(false);
const props = defineProps<{
    journey: JourneyDto;
}>();
const emit = defineEmits<{
    (e: "selected"): void;
}>();

onUnmounted(() => {
    loaded.value = false;
});
</script>
