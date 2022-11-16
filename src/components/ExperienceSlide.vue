<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <ion-card-content>
        <ion-grid>
            <ion-row>
                <ion-col>
                    <ion-img :src="props.thumbnail"></ion-img>
                </ion-col>
            </ion-row>
            <ion-row>
                <ion-col>
                    <section class="content ion-margin">
                        {{ props.exp.description }}
                    </section>
                </ion-col>
            </ion-row>
        </ion-grid>
    </ion-card-content>
</template>
<script lang="ts" setup>
import { IonImg, IonGrid, IonRow, IonCol, IonCardContent } from "@ionic/vue";
import { ExperienceDto, PoiDto } from "types/dtos";
import { onMounted } from "vue";

const props = defineProps<{
    exp: ExperienceDto;
    thumbnail: string;
}>();

onMounted(() => {});
</script>
<style lang="less" scoped>
ion-img {
    height: 200px;
}
.content {
    height: 100%;
    max-height: 200px;
    overflow-y: auto;
}
</style>
