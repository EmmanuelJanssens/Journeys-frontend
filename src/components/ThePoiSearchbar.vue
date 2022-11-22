<!-- eslint-disable vue/no-multiple-template-root -->
<template>
    <div class="search-wrapper">
        <ion-searchbar class="ion-no-padding" @ion-change="filterPois" :debounce="500" :value="search"></ion-searchbar>
        <div class="search ion-no-padding" v-if="filtered?.length! > 0">
            <ion-list>
                <ion-item v-for="poi in filtered" button v-bind:key="poi.id" @click="emitClick(poi)">
                    <ion-label>
                        {{ poi.name }}
                    </ion-label>
                </ion-item>
            </ion-list>
            <ion-item button @click="addPoiModal">
                <ion-label>
                    <ion-icon :icon="helpOutline"></ion-icon>
                    <ion-text class="google" color="medium"> Not finding what you're looking for?</ion-text>
                </ion-label>
            </ion-item>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { async } from "@firebase/util";
import { alertController, modalController } from "@ionic/core";
import { IonSearchbar, IonList, IonLabel, IonItem, SearchbarCustomEvent, IonIcon, IonText } from "@ionic/vue";
import { helpOutline } from "ionicons/icons";

import { usePoiStore } from "stores/usePoiStore";
import { PoiDto } from "types/dtos";
import { ref } from "vue";

const poiStore = usePoiStore();
const filtered = ref<PoiDto[]>();
const search = ref();

const emit = defineEmits<{
    (e: "poiItemClicked", poi: PoiDto): void;
}>();

function filterPois(event: SearchbarCustomEvent) {
    if (event.detail.value?.length! > 3) {
        filtered.value = poiStore.poisBetween?.filter((el) =>
            el.name!.toLocaleLowerCase().includes(event.detail.value!.toLocaleLowerCase())
        );
    } else {
        filtered.value = [];
    }
}

function emitClick(poi: PoiDto) {
    search.value = "";
    filtered.value = [];
    emit("poiItemClicked", poi);
}

async function addPoiModal() {
    const alert = await alertController.create({
        header: "Right click on the map to add a Poi",
        buttons: [
            "cancel",
            {
                text: "Ok",
                handler: async () => {
                    search.value = "";
                    filtered.value = [];
                    alertController.dismiss(null, "ok");
                }
            }
        ]
    });
    await alert.present();
}
</script>
<style lang="less" scoped>
.search-wrapper {
    position: absolute;
    top: 10px;
    left: 0px;
    right: 0px;
    min-height: 40px;
    min-width: 400px;
    width: 400px;

    margin-left: auto;
    margin-right: auto;

    z-index: 999;
}

.search {
    overflow-y: auto;
    position: absolute;
    max-height: 300px;
    z-index: 999;
    width: 100%;
}
</style>
