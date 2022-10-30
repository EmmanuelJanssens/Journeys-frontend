<template>
    <ion-item button @click="() => emit('selected')">
        <ion-thumbnail slot="start">
            <ion-spinner v-if="loaded == false"></ion-spinner>
            <ion-img
                v-if="props.exp.experience.images.length > 0"
                :src="props.exp.experience.images[0]"
                @ionImgDidLoad="() => (loaded = true)">
            </ion-img>
            <ion-img v-else src="src/assets/placeholder.png" @ionImgDidLoad="() => (loaded = true)"> </ion-img>
        </ion-thumbnail>
        <ion-label>
            <h3>
                {{ props.exp.poi.name }}
            </h3>
            <p>
                {{ props.exp.experience.description }}
            </p>
        </ion-label>
    </ion-item>
</template>

<script lang="ts" setup>
import { IonContent, IonItem, IonThumbnail, IonSpinner, IonImg, IonLabel } from "@ionic/vue";
import { onMounted, onUnmounted, ref } from "vue";

var loaded = ref(false);
const props = defineProps(["exp"]);
const emit = defineEmits(["selected"]);

onUnmounted(() => {
    loaded.value = false;
});
</script>
