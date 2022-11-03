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
import { IonContent, IonItem, IonThumbnail, IonSpinner, IonImg, IonLabel } from "@ionic/vue";
import { onMounted, onUnmounted, ref } from "vue";

var loaded = ref(false);
const props = defineProps(["journey"]);
const emit = defineEmits(["selected"]);

onUnmounted(() => {
    loaded.value = false;
});
</script>
