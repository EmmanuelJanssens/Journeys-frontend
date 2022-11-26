<template>
    <ion-content>
        <ion-row class="experience-list">
            <ion-col v-if="props.poiList">
                <DynamicScroller :items="props.poiList" :min-item-size="54" style="height: 100%">
                    <template v-slot="{ item, index, active }">
                        <DynamicScrollerItem :item="item" :active="active" :data-index="index">
                            <ion-item button style="width: 100%" @click="emit('poiItemClicked', item)">
                                <ion-thumbnail slot="start">
                                    <ion-img :src="item.thumbnail"> </ion-img>
                                </ion-thumbnail>
                                <ion-label>{{ item.name }}</ion-label>
                                <ion-icon slot="end" :icon="arrowForward"></ion-icon>
                            </ion-item>
                        </DynamicScrollerItem>
                    </template>
                </DynamicScroller>
            </ion-col>
        </ion-row>
    </ion-content>
</template>

<script lang="ts" setup>
import { IonContent, IonRow, IonCol, IonItem, IonThumbnail, IonImg, IonLabel, IonIcon } from "@ionic/vue";
import { arrowForward } from "ionicons/icons";
import { PoiDto } from "types/dtos";

const props = defineProps<{
    poiList?: PoiDto[];
}>();

const emit = defineEmits<{
    (e: "poiItemClicked", poi: PoiDto): void;
}>();
</script>

<style></style>
